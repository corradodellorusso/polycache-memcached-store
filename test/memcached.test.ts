// @ts-ignore
import Memcache from 'memcache-plus';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Cache, caching } from 'polycache-core';
import { createMemcachedStore, MemcachedConfig, MemcachedStore } from '../src';

const config = {
  memcached: {
    host: 'localhost',
    port: 11211,
    ttl: 30,
  },
};

const createTestMemcachedStore = <T = any>(props: Partial<MemcachedConfig<T>> = {}) => {
  return createMemcachedStore({
    driver: Memcache,
    options: {
      hosts: [process.env.MEMCACHED__HOST || config.memcached.host + ':' + config.memcached.port],
      testOption: true,
    },
    ...props,
  });
};

describe('memcached store', () => {
  let cache: Cache<MemcachedStore>;

  beforeAll(() => {
    cache = caching(createTestMemcachedStore());
  });

  afterAll(async () => cache.reset());

  describe('config', () => {
    it('should throw if no driver is provided', () => {
      expect(() => createMemcachedStore({} as unknown as MemcachedConfig)).toThrow('Driver must be provided.');
    });
    it('should throw if no options are provided', () => {
      expect(() => createMemcachedStore({ driver: Memcache } as unknown as MemcachedConfig)).toThrow('Options must be provided.');
    });
  });

  describe('options', () => {
    it('should return the options', () => {
      expect(cache.store.client.testOption).toBe(true);
    });
  });

  describe('set', () => {
    it('should store a value without ttl', async () => {
      await cache.set('foo', 'bar');
      // No error is thrown
    });

    it('should store a value with a specific ttl', async () => {
      await cache.set('foo', 'bar', config.memcached.ttl);
      // No error is thrown
    });

    it('should not store an invalid value', async () => {
      await cache.set('foo1', null);
      const result = await cache.get('foo1');
      expect(result).toBe(null);
    });

    it('should discard non cacheable values', async () => {
      const store = createTestMemcachedStore({ isCacheable: (value) => value !== 'bar' });
      await store.reset();
      await store.set('foo', 'bar');
      await store.set('foo1', 'bar1');
      const foo = await store.get('foo');
      expect(foo).toBe(null);
      const foo1 = await store.get('foo1');
      expect(foo1).toBe('bar1');
    });
  });

  describe('setMany', () => {
    it('should set many values', async () => {
      await cache.store.setMany([
        ['foo', 'bar'],
        ['foo1', 'bar1'],
      ]);
      const foo = await cache.get('foo');
      expect(foo).toBe('bar');
      const foo1 = await cache.get('foo1');
      expect(foo1).toBe('bar1');
    });

    it('should filter out non cacheable values', async () => {
      const store = createTestMemcachedStore({ isCacheable: (value) => value !== 'bar' });
      await store.reset();
      await store.setMany([
        ['foo', 'bar'],
        ['foo1', 'bar1'],
      ]);
      const foo = await store.get('foo');
      expect(foo).toBe(null);
      const foo1 = await store.get('foo1');
      expect(foo1).toBe('bar1');
    });
  });

  describe('get', () => {
    it('should retrieve a value for a given key', async () => {
      const value = 'bar';
      await cache.set('foo', value);
      const result = await cache.get('foo');
      expect(result).toBe(value);
    });

    it('should transform values', async () => {
      const store = createTestMemcachedStore({ resultTransformer: (value) => (value === 'bar' ? 'barbar' : value) });
      await store.reset();
      await store.set('foo', 'bar');
      await store.set('foo1', 'bar1');
      const foo = await store.get('foo');
      expect(foo).toBe('barbar');
      const foo1 = await store.get('foo1');
      expect(foo1).toBe('bar1');
    });
  });

  describe('getMany', () => {
    it('should get many values', async () => {
      await cache.set('foo', 'bar');
      await cache.set('foo1', 'bar1');
      const [foo, boo, foo1] = await cache.store.getMany('foo', 'boo', 'foo1');
      expect(foo).toBe('bar');
      expect(boo).toBe(null);
      expect(foo1).toBe('bar1');
    });

    it('should transform many values', async () => {
      const store = createTestMemcachedStore({ resultTransformer: (value) => (value === 'bar' ? 'barbar' : value) });
      await store.reset();
      await store.set('foo', 'bar');
      await store.set('foo1', 'bar1');
      const [foo, boo, foo1] = await store.getMany('foo', 'boo', 'foo1');
      expect(foo).toBe('barbar');
      expect(boo).toBe(null);
      expect(foo1).toBe('bar1');
    });
  });

  describe('del', () => {
    it('should delete a value for a given key', async () => {
      await cache.set('foo', 'bar');
      let result = await cache.get('foo');
      expect(result).toBe('bar');
      await cache.del('foo');
      result = await cache.get('foo');
      expect(result).toBe(null);
    });
  });

  describe('delMany', () => {
    it('should delete many values', async () => {
      await cache.set('foo', 'bar');
      await cache.set('foo1', 'bar1');
      let foo = await cache.get('foo');
      expect(foo).toBe('bar');
      let foo1 = await cache.get('foo1');
      expect(foo1).toBe('bar1');
      await cache.store.delMany('foo', 'foo1');
      foo = await cache.get('foo');
      expect(foo).toBe(null);
      foo1 = await cache.get('foo1');
      expect(foo1).toBe(null);
    });
  });

  describe('reset', () => {
    it('should flush underlying db', async () => {
      await cache.set('foo', 'bar');
      let result = await cache.get('foo');
      expect(result).toBe('bar');
      await cache.reset();
      result = await cache.get('foo');
      expect(result).toBe(null);
    });
  });

  describe('ttl', () => {
    it('should throw error', async () => {
      expect(() => cache.store.ttl('foo')).toThrow('ttl is not supported on this store.');
    });
  });

  describe('keys', () => {
    it('should throw error', async () => {
      expect(() => cache.store.keys('foo')).toThrow('keys are not supported on this store.');
    });
  });
});
