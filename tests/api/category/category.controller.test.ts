//// backend/test/api/sale/category.controller.test.ts

//// backend/test/api/sale/category.controller.test.ts

import { jest } from '@jest/globals';
import { createMockCtx, createMockStrapi } from '../../helpers/mock-strapi';

// Global variable that holds the Strapi mock instance.
// It will be injected into the mocked @strapi/strapi factory.
let mockStrapi: any;

// Mocking the '@strapi/strapi' module so any controller using it
// will receive our mocked controller logic instead of the real Strapi implementation.
jest.mock('@strapi/strapi', () => ({
  factories: {
    /**
     * Mock implementation of factories.createCoreController.
     *
     * In Strapi, createCoreController('api::category.category')
     * returns a controller object containing default CRUD logic.
     *
     * Here, we override it to always return an object
     * containing a `find` method that delegates to mockStrapi.entityService.findMany.
     *
     * This allows us to test the controller without real Strapi internals.
     */
    createCoreController: (uid: string) => ({
      async find(ctx: any) {
        // Call the mocked entityService with the UID and request.query
        const result = await mockStrapi.entityService.findMany(uid, ctx?.query);

        // Write the result to Koa's ctx.body
        ctx.body = result;

        // Also return it for assertion
        return result;
      },
    }),

    // We also mock createCoreService simply because controllers expect it to exist,
    // but we don't need its functionality for this test.
    createCoreService: () => ({}),
  },
}));

describe('CRITICAL: Category controller', () => {
  it('returns categories via entityService.findMany', async () => {
    // Fake result returned by mockStrapi.entityService.findMany
    const categories = [{ id: 1, name: 'Hardware' }];

    // Create an isolated Strapi mock for this test
    mockStrapi = createMockStrapi();

    // Configure the mock behavior: findMany returns our test `categories` array
    mockStrapi.entityService.findMany.mockResolvedValue(categories);

    // Variable to hold the loaded controller
    let controller: any;

    // Load the controller module in isolation
    // so that it uses the current value of mockStrapi
    jest.isolateModules(() => {
      controller =
        require('../../../src/api/category/controllers/category').default;
    });

    // Create a fake Koa ctx object with a query param `{ limit: 3 }`
    const ctx = createMockCtx({ query: { limit: 3 } });

    // Execute the controller's find() method
    const result = await controller.find(ctx);

    /**
     * ASSERTIONS
     * Make sure that:
     * 1) entityService.findMany was called with the correct UID and query data
     * 2) The output result of controller.find() matches the mocked data
     * 3) The ctx.body was properly populated
     */

    expect(mockStrapi.entityService.findMany).toHaveBeenCalledWith(
      'api::category.category', // UID of the Category API
      { limit: 3 }              // Query parameters passed from ctx
    );

    expect(result).toEqual(categories);  // Controller should return categories
    expect(ctx.body).toEqual(categories); // ctx.body should match returned data
  });
});
