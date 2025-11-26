// backend/test/api/sale/product.controller.test.ts

import { jest } from '@jest/globals';
import { createMockCtx, createMockStrapi } from '../../helpers/mock-strapi';

// Global variable holding the current mock Strapi instance
// This will be used inside our mocked '@strapi/strapi' implementation.
let mockStrapi: any;

// Mock the '@strapi/strapi' module used by the Product controller
jest.mock('@strapi/strapi', () => ({
  factories: {
    /**
     * Mock implementation of Strapi's factories.createCoreController
     *
     * In the real Strapi app, this would create a controller for a given UID.
     * Here we:
     *  - Ignore the factory function pattern and simply return an object
     *    with a default "find" method.
     *  - That "find" method uses mockStrapi.entityService.findMany to fetch data.
     *
     * This way, when the product controller does:
     *   factories.createCoreController('api::product.product')
     * it will receive this object with the mocked "find" method.
     */
    createCoreController: (uid: string) => ({
      // Default "find" method that mimics Strapi core controller behavior
      async find(ctx: any) {
        // Call the mocked entityService.findMany on our mockStrapi instance
        // uid = 'api::product.product' for the product controller
        // ctx?.query is the query object coming from the request (e.g. filters, pagination)
        const result = await mockStrapi.entityService.findMany(uid, ctx?.query);

        // Assign the result to ctx.body so it becomes the HTTP response payload
        ctx.body = result;

        // Also return the result, so the test can assert on it directly
        return result;
      },
    }),

    /**
     * Mock implementation of createCoreService.
     * Not needed for this specific test, so it simply returns an empty object.
     */
    createCoreService: () => ({}),
  },
}));

describe('CRITICAL: Product controller', () => {
  it('returns products via entityService.findMany', async () => {
    // Fake products list that we expect the controller to return
    const products = [{ id: 1, name: 'Widget' }];

    // Create a fresh mock Strapi instance
    mockStrapi = createMockStrapi();

    // Configure the mock: when entityService.findMany is called,
    // it should resolve to our "products" array.
    mockStrapi.entityService.findMany.mockResolvedValue(products);

    // Holder for the controller instance
    let controller: any;

    // Load the product controller in an isolated Jest module context
    jest.isolateModules(() => {
      /**
       * Require the product controller from the real codebase.
       *
       * Inside that file, it likely does something like:
       *   export default factories.createCoreController('api::product.product');
       *
       * Since we mocked '@strapi/strapi', the call to createCoreController
       * returns our custom object defined above (with the async find method).
       */
      controller = require('../../../src/api/product/controllers/product').default;
    });

    // Create a mock Koa/Strapi ctx with a query object `{ limit: 5 }`
    // This simulates an incoming HTTP request with query params.
    const ctx = createMockCtx({ query: { limit: 5 } });

    // Call the controller's "find" method
    const result = await controller.find(ctx);

    /**
     * ASSERTIONS
     */

    // 1. Ensure entityService.findMany was called with the correct UID and query.
    //    UID should be 'api::product.product', matching the product content type.
    expect(mockStrapi.entityService.findMany).toHaveBeenCalledWith(
      'api::product.product',
      { limit: 5 }
    );

    // 2. The result returned by controller.find should equal our "products" array.
    expect(result).toEqual(products);

    // 3. ctx.body should also be set to "products",
    //    meaning the controller correctly assigned the response body.
    expect(ctx.body).toEqual(products);
  });
});
