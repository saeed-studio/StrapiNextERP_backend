// backend/tests/helpers/mock-strapi.ts

import { jest } from '@jest/globals';

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

type MockCtxInit = {
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  request?: {
    body?: unknown;
    header?: Record<string, unknown>;
    origin?: string;
  };
  body?: unknown;
  status?: number;
};

export const createMockCtx = (init: MockCtxInit = {}) => {
  const ctx: any = {
    params: init.params ?? {},
    query: init.query ?? {},
    request: {
      body: init.request?.body ?? {},
      header: init.request?.header ?? {},
      origin: init.request?.origin,
    },
    body: init.body,
    status: init.status,
    badRequest: jest.fn((message: string) => {
      ctx.status = 400;
      ctx.body = { error: message };
      return ctx.body;
    }),
    notFound: jest.fn((message: string) => {
      ctx.status = 404;
      ctx.body = { error: message };
      return ctx.body;
    }),
    throw: (status: number, message?: string) => {
      const error = new Error(message ?? 'Error');
      (error as any).status = status;
      throw error;
    },
  };

  return ctx;
};

export const createMockStrapi = (overrides: PartialRecord<string, any> = {}) => {
  const connectionBuilder = {
    whereBetween: jest.fn().mockReturnThis() as any,
    select: jest.fn().mockReturnThis() as any,
    first: jest.fn<() => Promise<any>>().mockResolvedValue(undefined),
  };

  const connection = jest.fn(() => connectionBuilder);
  (connection as any).raw = jest.fn((value: unknown) => value);

  // first core of fake strapi
  const base = {
    db: {
      metadata: { get: jest.fn() },
      connection,
      transaction: jest.fn(async (cb: any) => cb()),
    },
    documents: jest.fn(() => ({})),
    entityService: {
      findMany: jest.fn(),
    },
    config: { get: jest.fn() },
    log: { error: jest.fn(), warn: jest.fn() },
  };

  //merging base and overrides
  return {
    ...base,
    ...overrides,
    db: {
      ...base.db,
      ...(overrides as any).db,
      metadata: {
        ...base.db.metadata,
        ...((overrides as any).db?.metadata ?? {}),
      },
      connection:
        (overrides as any).db?.connection !== undefined
          ? (overrides as any).db.connection
          : connection,
      transaction:
        (overrides as any).db?.transaction !== undefined
          ? (overrides as any).db.transaction
          : base.db.transaction,
    },
    documents:
      overrides.documents !== undefined ? overrides.documents : base.documents,
    entityService:
      overrides.entityService !== undefined
        ? overrides.entityService
        : base.entityService,
    config: overrides.config !== undefined ? overrides.config : base.config,
    log: overrides.log !== undefined ? overrides.log : base.log,
  };
};
