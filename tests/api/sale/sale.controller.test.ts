// backend/test/api/sale/sale.controler.test.ts

import { jest } from '@jest/globals';
import { createMockCtx, createMockStrapi } from '../../helpers/mock-strapi';

let mockStrapi: any;

// Mock the '@strapi/strapi' module used inside the controller
jest.mock('@strapi/strapi', () => ({
  factories: {
    // Mock implementation of factories.createCoreController
    createCoreController: (uid: string, factoryFn?: any) => {
      // If controller is defined with a factory function (custom controller)
      if (factoryFn) {
        // Call the factory function and inject the current mockStrapi instance
        // This simulates Strapi passing `{ strapi }` to the controller factory
        return factoryFn({ strapi: mockStrapi });
      }
      // Fallback behavior if no factory function is provided:
      // Provide a default controller with a simple "find" method
      return {
        async find(ctx: any) {
          // Call the mocked entityService.findMany on mockStrapi
          const result = await mockStrapi.entityService.findMany(uid, ctx?.query);
          // Set the result as the response body
          ctx.body = result;
          return result;
        },
      };
    },
    // Mock implementation of factories.createCoreService
    // For these tests we don't need any specific behavior, so return an empty object
    createCoreService: () => ({}),
  },
}));

// Helper to load the controller with a fresh mockStrapi instance
const loadController = () => {
  let controller: any;
  // isolateModules ensures that the module is loaded in a fresh module scope
  // This avoids cross-test pollution of module-level state
  jest.isolateModules(() => {
    // Create a new mock strapi instance for this load
    mockStrapi = createMockStrapi();
    // Require the sale controller module, which will use the mocked '@strapi/strapi'
    controller = require('../../../src/api/sale/controllers/sale').default;
  });
  return controller;
};

describe('CRITICAL: Sale controller', () => {
  describe('getSummary', () => {
    it('returns parsed summary for valid period', async () => {
      // Build a fake query builder that simulates Knex-like behavior
      const connectionBuilder = {
        // whereBetween and select are chainable methods returning "this"
        whereBetween: jest.fn().mockReturnThis() as any,
        select: jest.fn().mockReturnThis() as any,
        // first() returns a promise resolving to a fake aggregated result
        first: jest.fn<() => Promise<any>>().mockResolvedValue({
          count: '2',          // all values are strings as they often come from SQL
          total_sales: '100.5',
          total_tax: '10.5',
          total_discount: '5.0',
          total_revenue: '106.0',
        }),
      };

      // Create a custom mockStrapi for this specific test
      mockStrapi = createMockStrapi({
        db: {
          // Mock metadata.get to return a fake table description
          metadata: { get: jest.fn().mockReturnValue({ tableName: 'sales' }) },
          // Mock db.connection to return our custom connectionBuilder
          connection: Object.assign(jest.fn(() => connectionBuilder), {
            // raw just returns the input as-is in this mock
            raw: jest.fn((value: unknown) => value),
          }),
        },
      });

      // Load the controller with this customized mockStrapi
      let controller: any;
      jest.isolateModules(() => {
        controller = require('../../../src/api/sale/controllers/sale').default;
      });

      // Create a mock ctx with route params: { period: 'week' }
      const ctx = createMockCtx({ params: { period: 'week' } });

      // Call the controller method under test
      const result = await controller.getSummary(ctx);

      // Assert that the controller parsed and mapped DB results correctly
      // from string fields to numeric fields and proper property names
      expect(result.data).toMatchObject({
        period: 'week',
        count: 2,
        totalSales: 100.5,
        totalTax: 10.5,
        totalDiscount: 5,
        totalRevenue: 106,
      });

      // Ensure that the query builder methods were actually used
      expect(connectionBuilder.whereBetween).toHaveBeenCalled();
      expect(connectionBuilder.select).toHaveBeenCalled();
      expect(connectionBuilder.first).toHaveBeenCalled();
    });

    it('returns badRequest for invalid period', async () => {
      // Load the controller using the helper, which also sets up a fresh mockStrapi
      const controller = loadController();

      // Create a mock ctx with an invalid period
      const ctx = createMockCtx({ params: { period: 'invalid' } });

      // Call the controller method
      const result = await controller.getSummary(ctx);

      // Expect the controller to use ctx.badRequest (implemented in createMockCtx)
      // and set HTTP status to 400
      expect(ctx.status).toBe(400);
      // The return value is the body set by badRequest: { error: '...' }
      expect(result).toEqual({ error: 'Invalid period specified' });
    });

    it('returns notFound when sales table metadata missing', async () => {
      // Start with a basic mockStrapi without custom db metadata
      mockStrapi = createMockStrapi();
      // Explicitly make metadata.get return undefined to simulate missing table
      mockStrapi.db.metadata.get.mockReturnValue(undefined);

      // Load the controller in an isolated module environment
      let controller: any;
      jest.isolateModules(() => {
        controller = require('../../../src/api/sale/controllers/sale').default;
      });

      // Use a valid period this time
      const ctx = createMockCtx({ params: { period: 'week' } });

      // Call the controller method
      const result = await controller.getSummary(ctx);

      // Controller is expected to call ctx.notFound and set HTTP status 404
      expect(ctx.status).toBe(404);
      expect(result).toEqual({ error: 'Sale table not found' });
    });
  });

  describe('getChartsData', () => {
    it('populates ctx.body with chart data', async () => {
      // Fake sales data returned by the documents API
      const salesData = [{ date: '2024-01-01', total: 100 }];

      // Create a mockStrapi where documents().findMany() returns salesData
      mockStrapi = createMockStrapi({
        documents: jest.fn(() => ({
          // Mock implementation of findMany to resolve to our test data
          findMany: jest.fn<() => Promise<any>>().mockResolvedValue(salesData as any),
        })),
      });

      // Load the controller in an isolated environment using this mockStrapi
      let controller: any;
      jest.isolateModules(() => {
        controller = require('../../../src/api/sale/controllers/sale').default;
      });

      // Create a basic mock ctx without any special params
      const ctx = createMockCtx();

      // Call the controller method under test
      await controller.getChartsData(ctx);

      // Controller is expected to set ctx.body to the salesData we mocked
      expect(ctx.body).toEqual(salesData);
    });
  });
});
