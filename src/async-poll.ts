interface AsyncPollOptions {
  interval: number;
  timeout: number;
}

const delay = async (t: number) => new Promise(yay => t < 1 ? yay() : setTimeout(yay, t));

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
    const perf = window.performance;
    const itv = +interval;
    const maxItv = +timeout;
    let d: T;
    let op = 0;
    let ed = 0;
    let duration = 0;
    let i = 0;
    let shouldContinuePolling = false;

    perf.mark('poll starts');
    do {
      op = (perf.mark(`poll ${i} starts`), perf.now());
      d = await fn();
      ed = (perf.mark(`poll ${i} ends`), perf.now());

      const diff = Math.ceil(ed - op);

      shouldContinuePolling = duration < maxItv && !conditionFn(d);
      duration += diff > itv ? diff : itv;
      perf.measure(`poll ${i} takes`, `poll ${i} starts`, `poll ${i} ends`);

      /** NOTE: Fast return */
      if (!shouldContinuePolling) break;

      await delay(itv - diff);
      perf.mark('next poll starts');
      perf.measure(`poll ${i + 1} starts after`, `poll ${i} ends`, 'next poll starts');
      i += 1;
    } while (shouldContinuePolling);
    perf.mark('poll ends');
    perf.measure('poll spent', 'poll starts', 'poll ends');

    return d;
  } catch (e) {
    throw e;
  }
}

export default asyncPoll;
