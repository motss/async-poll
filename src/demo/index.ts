// @ts-check

import { PerformanceObserver } from 'perf_hooks';

import fetch from 'node-fetch';

import { asyncPoll } from '..';

async function main() {
  const fn = async () => fetch('http://example.com').then(r => r.text());
  const conditionFn = (s: string) => Array.isArray(s);
  const interval = 2e3;
  const timeout = 10e3;

  const a: Record<string, unknown> = {};
  const perfObs = new PerformanceObserver((list) => {
    for (const n of list.getEntries()) {
      a[n.name] = n.duration;
    }
  });

  perfObs.observe({ entryTypes: ['measure'] });
  const d = await asyncPoll(fn, conditionFn, { interval, timeout });
  perfObs.disconnect();

  return {
    data: d,
    metrics: a,
  };
}

main().then(console.log).catch(console.error);
