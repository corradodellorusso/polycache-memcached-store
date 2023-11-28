import { Store } from 'polycache-core';
import { identity, isCacheable } from './utils';

type Constructor<T> = new (...args: any[]) => T;

export type MemcachedConfig<T = any> = {
  /**
   * Memcached client. It must be constructable with the new keyword.
   */
  driver: Constructor<T>;
  /**
   * Options to pass to driver's constructor.
   */
  options: Record<string, any>;
  /**
   * Check if a given parameter is cacheable or not.
   * If none is passed, everything is cached excluding null and undefined.
   * @param value
   */
  isCacheable?: (value: unknown) => boolean;
  /**
   * Transform of get and getMany.
   * By default no transformation is provided.
   * @param value
   */
  resultTransformer?: (value: unknown) => unknown;
};

export type MemcachedStore<T = any> = Store & {
  client: T;
};

export const createMemcachedStore = <C>(config: MemcachedConfig<C>): MemcachedStore<C> => {
  if (!config.driver) {
    throw new Error('Driver must be provided.');
  }
  if (!config.options) {
    throw new Error('Options must be provided.');
  }

  const client = new config.driver(config.options) as any;
  const resultTransformerFn = config.resultTransformer ?? identity;
  const isCacheableFn = config.isCacheable ?? isCacheable;

  return {
    name: 'memcached',
    client,
    get: async <T>(key: string) => client.get(key).then((value: T) => resultTransformerFn(value)),
    set: async (key, data, ttl) => {
      if (!isCacheableFn(data)) {
        return Promise.resolve();
      }
      return client.set(key, data, ttl);
    },
    del: async (key) => client.delete(key),
    getMany: (...args) =>
      client.getMulti(args).then((obj: Record<string, any>) => Object.keys(obj).map((key) => resultTransformerFn(obj[key]))),
    setMany: async (args, ttl) =>
      Promise.all(args.filter((arg) => isCacheableFn(arg[1])).map((arg) => client.set(...arg, ttl))).then(() => undefined),
    delMany: async (...args) => Promise.all(args.map((arg) => client.delete(arg))).then(() => undefined),
    reset: () => client.flush(),
    ttl: () => {
      throw new Error('ttl is not supported on this store.');
    },
    keys: () => {
      throw new Error('keys are not supported on this store.');
    },
  };
};
