import { Store } from 'polycache-core';

type Constructor<T> = new (...args: any[]) => T;

export type MemcachedConfig<T = any> = {
  driver: Constructor<T>;
  options: Record<string, any>;
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

  return {
    name: 'memcached',
    client,
    get: async (key) => client.get(key),
    set: async (key, data, ttl) => client.set(key, data, ttl),
    del: async (key) => client.delete(key),
    getMany: (...args) => client.getMulti(args).then((obj: Record<string, any>) => Object.keys(obj).map((key) => obj[key])),
    setMany: async (args, ttl) => {
      Promise.all(args.map((arg) => client.set(...arg, ttl)));
    },
    delMany: async (...args) => {
      Promise.all(args.map((arg) => client.delete(arg)));
    },
    reset: () => client.flush(),
    ttl: () => {
      throw new Error('ttl is not supported on this store.');
    },
    keys: () => {
      throw new Error('keys are not supported on this store.');
    },
  };
};
