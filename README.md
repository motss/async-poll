<div align="center" style="text-align: center;">
  <h1 style="border-bottom: none;">async-poll</h1>

  <p>Async polling with condition and timeout</p>
</div>

<hr />

[![Version][version-badge]][version-url]
[![Node version][node-version-badge]][node-version-url]
[![MIT License][mit-license-badge]][mit-license-url]

[![Downloads][downloads-badge]][downloads-url]
[![Total downloads][total-downloads-badge]][downloads-url]
[![Packagephobia][packagephobia-badge]][packagephobia-url]
[![Bundlephobia][bundlephobia-badge]][bundlephobia-url]

[![Build Status][travis-badge]][travis-url]
[![CircleCI][circleci-badge]][circleci-url]
[![Dependency Status][daviddm-badge]][daviddm-url]
[![codecov][codecov-badge]][codecov-url]
[![Coverage Status][coveralls-badge]][coveralls-url]

[![codebeat badge][codebeat-badge]][codebeat-url]
[![Codacy Badge][codacy-badge]][codacy-url]
[![Code of Conduct][coc-badge]][coc-url]

> Writing your own polling function can be difficult and hard to collect metrics about the polling. `asyncPoll` aims to solve those with modern JavaScript and advanced API. By leveraging `async...await`, asynchronous polling function has never been easier and [Performance Timing/ Timeline API][performance-timeline-api-url] is used to collect metrics about each polling in terms of the duration.
>
> 🛠 Please check if `Performance Timing/ Timeline API` is supported on your browser or Node.js environment.

## Table of contents

- [Table of contents](#table-of-contents)
- [Pre-requisites](#pre-requisites)
- [Setup](#setup)
  - [Install](#install)
  - [Usage](#usage)
    - [Node.js](#nodejs)
    - [Native ES modules or TypeScript](#native-es-modules-or-typescript)
    - [Performance Timing/ Timeline API via `PerformanceObserver`](#performance-timing-timeline-api-via-performanceobserver)
- [API Reference](#api-reference)
  - [asyncPoll(fn, conditionFn, interval, timeout)](#asyncpollfn-conditionfn-interval-timeout)
- [License](#license)

## Pre-requisites

- [Node.js][nodejs-url] >= 8.9.0
- [NPM][npm-url] >= 5.5.1 ([NPM][npm-url] comes with [Node.js][nodejs-url] so there is no need to install separately.)

## Setup

### Install

```sh
# Install via NPM
$ npm install --save async-poll
```

### Usage

#### Node.js

```js
const { asyncPoll } = require('async-poll');

/** Fetch news from a mock URL */
const fn = async () => fetch('https://example.com/api/news').then(r => r.json());
/** Keep polling until the more than 100 `news` are received or `status` returns `complete` */
const conditionFn = d => d.data.news.length > 100 || d.data.status === 'complete';
/** Poll every 2 seconds */
const interval = 2e3;
/** Timeout after 30 seconds and returns end result */
const timeout = 30e3;

async function main() {
  return asyncPoll(fn, conditionFn, interval, timeout);
}

main().then(console.log).catch(console.error);
```

#### Native ES modules or TypeScript

```ts
declare interface NewsData {
  data: {
    news: object[];
    status: number;
  };
}

import asyncPoll from 'async-poll';

/** Fetch news from a mock URL */
const fn = async () => fetch('https://example.com/api/news').then(r => r.json());
/** Keep polling until the more than 100 `news` are received or `status` returns `complete` */
const conditionFn = (d: NewsData) => d.data.news.length > 100 || d.data.status === 'complete';
/** Poll every 2 seconds */
const interval = 2e3;
/** Timeout after 30 seconds and returns end result */
const timeout = 30e3;

async function main(): Promise<NewsData> {
  return asyncPoll<NewsData>(fn, conditionFn, interval, timeout);
}

main().then(console.log).catch(console.error);
```

#### Performance Timing/ Timeline API via `PerformanceObserver`

Performance timing data can be obtained via the experimental [Performance Tming API][performance-timing-api-url] that has been added as of [Node.js 8.5.0][nodejs-url] or [Performance Timeline API][performance-timeline-api-url] on browsers.

```ts
/** For Node.js **only**, no import is required on browser. */
import { PerformanceObserver } from 'perf_hooks';

...
async function main() {
  let measurements = {};
  const perfObs = new PerformanceObserver((list) => {
    for (const n of list.getEntries()) {
      measurements[n.name] = n.duration;
    }
  });
  perfObs.observe({ entryTypes: ['measure'] });
  const d = await asyncPoll(fn, conditionFn, interval, timeout);
  perObs.disconnect();

  return {
    data: d,
    measurements,
  };
}
...
```

## API Reference

### asyncPoll(fn, conditionFn, interval, timeout)

- `fn` <[Function][function-mdn-url]> Function to execute for each polling happens.
- `conditionFn` <[Function][function-mdn-url]> Function to check the condition before a subsequent polling takes place. The function should return a boolean. If `true`, the polling stops and returns with a value in the type of `T`.
- `interval` <[number][number-mdn-url]> Polling interval.
- `timeout` <[number][number-mdn-url]> Timeout.
- returns: <[Promise][promise-mdn-url]<[`T`]>> Promise which resolves with a value in the type of `T`.

## License

[MIT License](https://motss.mit-license.org/) © Rong Sen Ng (motss)

<!-- References -->
[typescript-url]: https://github.com/Microsoft/TypeScript
[nodejs-url]: https://nodejs.org
[npm-url]: https://www.npmjs.com
[node-releases-url]: https://nodejs.org/en/download/releases
[performance-timing-api-url]: https://nodejs.org/api/perf_hooks.html
[performance-timeline-api-url]: https://developer.mozilla.org/en-US/docs/Web/API/Performance

<!-- MDN -->
[array-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[boolean-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[function-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[map-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[number-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[object-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[promise-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[regexp-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[set-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[string-mdn-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String

<!-- Badges -->
[version-badge]: https://flat.badgen.net/npm/v/async-poll
[node-version-badge]: https://flat.badgen.net/npm/node/async-poll
[mit-license-badge]: https://flat.badgen.net/npm/license/async-poll

[downloads-badge]: https://flat.badgen.net/npm/dm/async-poll
[total-downloads-badge]: https://flat.badgen.net/npm/dt/async-poll?label=total%20downloads
[packagephobia-badge]: https://flat.badgen.net/packagephobia/install/async-poll
[bundlephobia-badge]: https://flat.badgen.net/bundlephobia/minzip/async-poll

[travis-badge]: https://flat.badgen.net/travis/motss/async-poll
[circleci-badge]: https://flat.badgen.net/circleci/github/motss/async-poll
[daviddm-badge]: https://flat.badgen.net/david/dep/motss/async-poll
[codecov-badge]: https://flat.badgen.net/codecov/c/github/motss/async-poll?label=codecov
[coveralls-badge]: https://flat.badgen.net/coveralls/c/github/motss/async-poll?label=coveralls

[codebeat-badge]: https://codebeat.co/badges/123
[codacy-badge]: https://api.codacy.com/project/badge/Grade/123
[coc-badge]: https://flat.badgen.net/badge/code%20of/conduct/pink

<!-- Links -->
[version-url]: https://www.npmjs.com/package/async-poll
[node-version-url]: https://nodejs.org/en/download
[mit-license-url]: https://github.com/motss/async-poll/blob/master/LICENSE

[downloads-url]: http://www.npmtrends.com/async-poll
[packagephobia-url]: https://packagephobia.now.sh/result?p=async-poll
[bundlephobia-url]: https://bundlephobia.com/result?p=async-poll

[travis-url]: https://travis-ci.org/motss/async-poll
[circleci-url]: https://circleci.com/gh/motss/async-poll/tree/master
[daviddm-url]: https://david-dm.org/motss/async-poll
[codecov-url]: https://codecov.io/gh/motss/async-poll
[coveralls-url]: https://coveralls.io/github/motss/async-poll?branch=master

[codebeat-url]: https://codebeat.co/projects/github-com-motss-async-poll-master
[codacy-url]: https://www.codacy.com/app/motss/async-poll?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=motss/async-poll&amp;utm_campaign=Badge_Grade
[coc-url]: https://github.com/motss/async-poll/blob/master/CODE_OF_CONDUCT.md
