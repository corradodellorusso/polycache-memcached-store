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

describe('memcached store', () => {
  let cache: Cache<MemcachedStore>;

  beforeAll(() => {
    cache = caching(
      createMemcachedStore({
        driver: Memcache,
        options: {
          hosts: [process.env.MEMCACHED__HOST || config.memcached.host + ':' + config.memcached.port],
          testOption: true,
        },
      }),
    );
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
  });

  describe('get', () => {
    it('should retrieve a value for a given key', async () => {
      const value = 'bar';
      await cache.set('foo', value);
      const result = await cache.get('foo');
      expect(result).toBe(value);
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

  describe('detMany', () => {
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
