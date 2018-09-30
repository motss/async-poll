declare interface AsyncPollParams<T> {
  fn: () => Promise<T>;
  conditionFn: (d: T) => boolean;
  interval: number;
  timeout: number;
}

async function delay(t: number) {
  console.log({ t });

  return t < 1 ? Promise.resolve() : new Promise(yay => setTimeout(yay, t));
}

export async function asyncPoll<T>({
  fn,
  conditionFn,
  interval,
  timeout,
}: AsyncPollParams<T>) {
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

    window.performance.mark('poll starts');
    do {
      op = (window.performance.mark(`poll ${i} starts`), window.performance.now());
      d = await fn();
      ed = (window.performance.mark(`poll ${i} ends`), window.performance.now());

      const diff = Math.ceil(ed - op);

      shouldContinuePolling = duration < maxItv && !conditionFn(d);
      duration += diff > itv ? diff : itv;
      window.performance.measure(`poll ${i} takes`, `poll ${i} starts`, `poll ${i} ends`);

      /** NOTE: Fast return */
      if (!shouldContinuePolling) break;

      await delay(itv - diff);
      window.performance.mark('next poll starts');
      window.performance.measure(
        `poll ${i + 1} starts after`, `poll ${i} ends`, 'next poll starts');
      i += 1;
    } while (shouldContinuePolling);
    window.performance.mark('poll ends');
    window.performance.measure('poll spent', 'poll starts', 'poll ends');

    return d;
  } catch (e) {
    throw e;
  }
}

export default asyncPoll;
