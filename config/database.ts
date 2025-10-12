// config/database.ts

import path from 'path';

export default ({ env }) => {
  // Choose database client; default to 'postgres' for your setup
  const client = env('DATABASE_CLIENT', 'postgres');

  // Detect if a full connection string is provided (e.g., for production PaaS)
  const hasUrl = !!env('DATABASE_URL');

  // Shared SSL resolver: boolean false for local; object when enabled
  const resolveSSL = () =>
    env.bool('DATABASE_SSL', false)
      ? {
          // In many dev/proxy cases you need to skip strict CA checks
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
        }
      : false;

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: resolveSSL(),
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },

    postgres: {
      connection: hasUrl
        ? {
            // Use DATABASE_URL verbatim when present
            connectionString: env('DATABASE_URL'),
            ssl: resolveSSL(),
            schema: env('DATABASE_SCHEMA', 'public'),
          }
        : {
            // Otherwise fall back to discrete fields (local Docker)
            host: env('DATABASE_HOST', '127.0.0.1'),
            port: env.int('DATABASE_PORT', 5348),
            database: env('DATABASE_NAME', 'erp_backend'),
            user: env('DATABASE_USERNAME', 'strapi_admin'),
            password: env('DATABASE_PASSWORD', ''),
            ssl: resolveSSL(),
            schema: env('DATABASE_SCHEMA', 'public'),
          },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },

    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          '..',
          '..',
          env('DATABASE_FILENAME', '.tmp/data.db'),
        ),
      },
      useNullAsDefault: true,
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
    },
  };
};
