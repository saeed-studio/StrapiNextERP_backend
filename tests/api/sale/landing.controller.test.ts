// backend/test/api/sale/landing.controller.test.ts

import { jest } from '@jest/globals';
import { createMockCtx, createMockStrapi } from '../../helpers/mock-strapi';

// Global reference to the current mock Strapi instance.
// This will be injected into the controller via the mocked '@strapi/strapi' factories.
let mockStrapi: any;

// Mock the Strapi package used inside the controller under test.
jest.mock('@strapi/strapi', () => ({
  factories: {
    /**
     * Mock implementation of Strapi's factories.createCoreController
     *
     * In the real app, controllers are usually created like:
     *   factories.createCoreController('api::sale.landing', ({ strapi }) => ({ ...methods }))
     *
     * Here, when the controller file calls createCoreController, we:
     *  - Take the factoryFn (second argument)
     *  - Call it with our own `{ strapi: mockStrapi }`
     *    so that inside the controller logic, `strapi` refers to this mocked instance.
     *  - If no factoryFn is given, we simply return an empty object.
     */
    createCoreController: (_uid: string, factoryFn?: any) =>
      factoryFn ? factoryFn({ strapi: mockStrapi }) : {},
    /**
     * Mock implementation of createCoreService.
     * We don't need any custom behavior from services in this test,
     * so it just returns an empty object.
     */
    createCoreService: () => ({}),
  },
}));

/**
 * Helper to load the landing controller with the currently configured mockStrapi.
 *
 * jest.isolateModules:
 *  - Ensures that requiring the module happens in an isolated module registry.
 *  - This prevents cross-test pollution and allows different tests
 *    to use different mockStrapi instances safely.
 */
const loadController = () => {
  let controller: any;
  jest.isolateModules(() => {
    // Require the landing controller module.
    // Inside this module, factories.createCoreController will be called
    // and will receive `{ strapi: mockStrapi }` from our jest.mock above.
    controller = require('../../../src/api/sale/controllers/landing').default;
  });
  return controller;
};

describe('CRITICAL: Sale landing controller', () => {
  it('returns landing content with resolved media', async () => {
    /**
     * Mock implementation of documents().findMany()
     * This simulates the landing controller fetching some landing data
     * that includes an image with a relative URL.
     *
     * Example returned data:
     *   [{ image: { url: '/image.jpg' } }]
     */
    const findMany = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue([{ image: { url: '/image.jpg' } }]);

    /**
     * Create a mock Strapi instance customized for this test case.
     *
     * - documents: when called, returns an object with our mock findMany function.
     * - config.get: returns a fake API base URL ("https://api.example.com").
     *
     * This allows the controller to call:
     *   strapi.documents(...).findMany(...)
     * and
     *   strapi.config.get(...)
     * without hitting any real Strapi internals.
     */
    mockStrapi = createMockStrapi({
      documents: jest.fn(() => ({ findMany })),
      config: { get: jest.fn().mockReturnValue('https://api.example.com') },
    });

    // Load the controller with the current mockStrapi instance
    const controller = loadController();

    /**
     * Create a mock Koa/Strapi ctx with a request containing an Origin header.
     *
     * The controller is expected to:
     *   - Resolve image URLs based on the client origin (from request header)
     *     rather than the API base URL.
     *
     * Here we simulate a client origin:
     *   'https://client.example.com'
     */
    const ctx = createMockCtx({
      request: { header: { origin: 'https://client.example.com' } },
    });

    // Execute the controller method under test: getLanding
    const result = await controller.getLanding(ctx);

    /**
     * ASSERTIONS
     */

    // Ensure that documents().findMany() was called
    // meaning the controller attempted to fetch landing data.
    expect(findMany).toHaveBeenCalled();

    /**
     * Check that the controller correctly resolved the media URL.
     *
     * Input from mocked DB: image.url = '/image.jpg'
     * Origin header: 'https://client.example.com'
     *
     * Expected final URL: 'https://client.example.com/image.jpg'
     *
     * We assert against result.data.demo.media,
     * which is presumably how the controller formats the response payload.
     */
    expect(result.data.demo.media).toBe('https://client.example.com/image.jpg');
  });
});
