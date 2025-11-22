type EnvFn = {
  (key: string, defaultValue?: any): any;
  bool(key: string, defaultValue?: boolean): boolean;
  int(key: string, defaultValue?: number): number;
  array?(key: string, defaultValue?: string[]): string[];
};

export default ({ env }: { env: EnvFn }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1442),
  app: {
    // Strapi env helper exposes `array`; guard for typing
    keys: env.array ? env.array('APP_KEYS') : [],
  },
});
