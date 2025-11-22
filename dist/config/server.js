"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1442),
    app: {
        // Strapi env helper exposes `array`; guard for typing
        keys: env.array ? env.array('APP_KEYS') : [],
    },
});
