// backend/test/api/sale/sale-transaction.controller.test.ts

import { jest } from '@jest/globals';
import { createMockCtx, createMockStrapi } from '../../helpers/mock-strapi';

let mockStrapi: any;

// Mock the '@strapi/strapi' module used inside the controller file
jest.mock('@strapi/strapi', () => ({
  factories: {
    /**
     * Mock implementation of Strapi's factories.createCoreController
     *
     * In Strapi v4/v5, controllers are usually created like:
     *   factories.createCoreController('api::sale.sale', ({ strapi }) => ({ ...customMethods }))
     *
     * Here we intercept that call and:
     *  - if a factory function is provided, we call it with our own `{ strapi: mockStrapi }`
     *    so the controller will use our mocked Strapi instance.
     *  - if no factory function is provided, we just return an empty object.
     */
    createCoreController: (_uid: string, factoryFn?: any) =>
      factoryFn ? factoryFn({ strapi: mockStrapi }) : {},
    /**
     * Mock implementation of createCoreService.
     * For these tests we don't need custom service logic, so it just returns an empty object.
     */
    createCoreService: () => ({}),
  },
}));

/**
 * Helper function that loads the controller module in an isolated Jest module context.
 *
 * - jest.isolateModules ensures that the require(...) happens in a fresh, isolated module registry.
 * - This avoids cross-test pollution of module-level state.
 * - Inside the controller file, when it imports '@strapi/strapi' and calls factories.createCoreController,
 *   our jest.mock above will be used and `mockStrapi` will be injected into the controller.
 */
const loadController = () => {
  let controller: any;
  jest.isolateModules(() => {
    // We just require the controller; it will be created using the mocked factories
    controller = require('../../../src/api/sale/controllers/sale-transaction').default;
  });
  return controller;
};

describe('CRITICAL: Sale transaction controller', () => {
  it('creates sale and updates stock in a transaction', async () => {
    /**
     * Mock "sale" document service for Strapi Document API.
     * This represents what strapi.documents('api::sale.sale') will return.
     */
    const saleDoc = {
      // Simulate successful creation of a sale document, returning an object with id and total.
      create: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 1, total: 50 }),
    };

    /**
     * Mock "product" document service.
     * This represents what strapi.documents('api::product.product') will return.
     */
    const productDoc = {
      // findFirst returns a product document with a given stock and a documentId used for updates.
      findFirst: jest.fn<() => Promise<any>>().mockResolvedValue({
        documentId: 'doc-1',
        stock: 5,
      }),
      // update will be observed in expectations to ensure stock gets updated properly.
      update: jest.fn<() => Promise<any>>().mockResolvedValue({}),
    };

    /**
     * Create a mock Strapi instance where:
     * - strapi.documents('api::sale.sale') returns saleDoc
     * - strapi.documents('api::product.product') returns productDoc
     *
     * For any other uid, it returns an empty object.
     */
    mockStrapi = createMockStrapi({
      documents: jest.fn((uid: string) => {
        if (uid === 'api::sale.sale') return saleDoc;
        if (uid === 'api::product.product') return productDoc;
        return {};
      }),
    });

    // Load the controller after mockStrapi is set, so factories.createCoreController can use it.
    const controller = loadController();

    /**
     * Create a fake Koa/Strapi ctx object with a request body payload
     * that simulates a sale transaction coming from the client.
     */
    const ctx = createMockCtx({
      request: {
        body: {
          data: {
            customer_name: 'Alice',
            invoice_number: 'INV-001',
            customer_email: 'a@example.com',
            customer_phone: '123',
            date: '2025-01-01',
            notes: 'Note',
            // Single product in the sale: product ID 10, quantity 2, price 10
            products: [{ product: 10, quantity: 2, price: 10 }],
            subtotal: 20,
            discount_amount: 0,
            tax_amount: 0,
            total: 20,
          },
        },
      },
    });

    // Call the controller method under test
    await controller.createSaleTransaction(ctx);

    /**
     * ASSERTIONS
     */

    // 1. Ensure that the controller used a database transaction
    //    (createMockStrapi sets db.transaction as a jest.fn).
    expect(mockStrapi.db.transaction).toHaveBeenCalled();

    // 2. Ensure that saleDoc.create was called to create the sale document.
    expect(saleDoc.create).toHaveBeenCalled();

    // 3. Ensure that productDoc.update was called with the correct new stock.
    //    Initial stock: 5, quantity sold: 2 => new stock should be 3.
    expect(productDoc.update).toHaveBeenCalledWith({
      documentId: 'doc-1',
      data: { stock: 3 },
    });

    // 4. Ensure that the response body on ctx is set to the correct success payload.
    expect(ctx.body).toEqual({
      data: { id: 1, total: 50 },
      meta: { success: true },
    });
  });

  it('throws when stock is insufficient', async () => {
    /**
     * Mock "sale" document for a second scenario.
     * This time we only care that create is called; the stock failure should happen later.
     */
    const saleDoc = {
      create: jest.fn<() => Promise<any>>().mockResolvedValue({ id: 2 }),
    };

    /**
     * Mock "product" document where stock is too low for the requested quantity.
     * stock: 1, but the request will ask for quantity: 3
     */
    const productDoc = {
      findFirst: jest.fn<() => Promise<any>>().mockResolvedValue({
        documentId: 'doc-2',
        stock: 1,
      }),
      update: jest.fn(), // We expect this NOT to be called in this test
    };

    // Create mockStrapi with the new sale and product document implementations
    mockStrapi = createMockStrapi({
      documents: jest.fn((uid: string) => {
        if (uid === 'api::sale.sale') return saleDoc;
        if (uid === 'api::product.product') return productDoc;
        return {};
      }),
    });

    // Load controller with current mockStrapi
    const controller = loadController();

    // Create a ctx where products array requests more quantity than stock available
    const ctx = createMockCtx({
      request: {
        body: {
          data: {
            products: [{ product: 20, quantity: 3, price: 10 }], // requested 3, but only 1 in stock
            subtotal: 30,
            discount_amount: 0,
            tax_amount: 0,
            total: 30,
          },
        },
      },
    });

    /**
     * Since stock is insufficient, createSaleTransaction is expected to throw an Error
     * with the message: 'Insufficient stock for product with ID 20'.
     *
     * We wrap it with `expect(...).rejects.toThrow(...)` because it's an async function.
     */
    await expect(controller.createSaleTransaction(ctx)).rejects.toThrow(
      'Insufficient stock for product with ID 20'
    );

    // Ensure that the controller logged the error via strapi.log.error
    expect(mockStrapi.log.error).toHaveBeenCalled();

    // Ensure that productDoc.update was NEVER called since the transaction
    // should abort before trying to update stock.
    expect(productDoc.update).not.toHaveBeenCalled();
  });
});
