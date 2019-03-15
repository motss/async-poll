interface AsyncPollOptions {
  interval: number;
  timeout: number;
}

import { performance } from 'perf_hooks';

async function delay(t: number) {
  /**
   * NOTE:
   *
   * References for `process.nextTick` vs `setImmediate` vs `Promise`:-
   *  1. https://bit.ly/2Mmk7Xa
   *  2. https://bit.ly/2TIIPYr
   */
  return new Promise(yay => t < 1 ? process.nextTick(yay) : setTimeout(yay, t));
}

export async function asyncPoll<T>(
  fn: () => Promise<T>,
  conditionFn: (d: T) => boolean,
  options: AsyncPollOptions
) {
  const { interval, timeout }: AsyncPollOptions = options || {};

  if (typeof interval !== 'number' || interval < 0) {
    throw new TypeError(`Expected 'interval' to be a valid number, but received '${interval}'`);
  }

  if (typeof timeout !== 'number' || timeout < 0) {
    throw new TypeError(`Expected 'timeout' to be a valid number, but received '${timeout}'`);
  }

  try {
    const itv = +interval;
    const maxItv = +timeout;
    let d: T;
    let op = 0;
    let ed = 0;
    let duration = 0;
    let i = 0;
    let shouldContinuePolling = false;

    performance.mark('poll starts');
    do {
      op = (performance.mark(`poll ${i} starts`), performance.now());
      d = await fn();
      ed = (performance.mark(`poll ${i} ends`), performance.now());

      const diff = Math.ceil(ed - op);

      shouldContinuePolling = duration < maxItv && !conditionFn(d);
      duration += diff > itv ? diff : itv;
      performance.measure(`poll ${i} takes`, `poll ${i} starts`, `poll ${i} ends`);

      /** NOTE: Fast return */
      if (!shouldContinuePolling) break;

      await delay(itv - diff);
      performance.mark('next poll starts');
      performance.measure(`poll ${i + 1} starts after`, `poll ${i} ends`, 'next poll starts');
      i += 1;
    } while (shouldContinuePolling);
    performance.mark('poll ends');
    performance.measure('poll spent', 'poll starts', 'poll ends');

    return d;
  } catch (e) {
    throw e;
  }
}

export default asyncPoll;
