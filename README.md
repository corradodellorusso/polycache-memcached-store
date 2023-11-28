# polycache memcached store

[![codecov](https://codecov.io/gh/corradodellorusso/polycache-memcached-store/branch/master/graph/badge.svg?token=ZV3G5IFigq)](https://codecov.io/gh/corradodellorusso/polycache-memcached-store)
[![tests](https://github.com/corradodellorusso/polycache-memcached-store/actions/workflows/test.yml/badge.svg)](https://github.com/corradodellorusso/polycache-memcached-store/actions/workflows/test.yml)
[![license](https://img.shields.io/github/license/corradodellorusso/polycache-memcached-store)](https://github.com/corradodellorusso/polycache-memcached-store/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dm/polycache-memcached-store)](https://npmjs.com/package/polycache-memcached-store)
![npm](https://img.shields.io/npm/v/polycache-memcached-store)

## Memcached store for [polycache](https://www.npmjs.com/package/polycache-core)

A cache module for node that allows easy wrapping of functions, tiered caches, and a consistent interface.

## Features

- Made with Typescript and compatible with [ESModules](https://nodejs.org/docs/latest-v14.x/api/esm.html).
- 100% test coverage via [vitest](https://github.com/vitest-dev/vitest).
- Support any library with the same interface.

## Installation

    npm install polycache-memcached-store memcache-plus

This library has been tested with memcache-plus, but you can replace with any library with the same interface.

## Usage Examples

```typescript
import Memcache from 'memcache-plus';
import { caching } from 'polycache-core';
import { createMemcachedStore } from 'polycache-memcached-store';

const cache = caching(
  createMemcachedStore({
    driver: Memcache,
    options: {
      // Check all the options here: https://memcache-plus.com/initialization.html - see options
      hosts: ['127.0.0.1:11211'],
    },
  }),
);
```

## Contribute

If you would like to contribute to the project, please fork it and send us a pull request. Please add tests
for any new features or bug fixes.

## License

polycache-memcached-store is licensed under the [MIT license](./LICENSE).
