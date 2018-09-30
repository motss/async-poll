declare interface TestData {
  message: string;
  pollingIdx: number;
}

import { performance } from 'perf_hooks';
import asyncPoll from '../browser';

describe('async-poll', () => {
  const fn = async () => {
    return { message: 'Polling done!' };
  };
  const conditionFn = () => true;
  const interval = 1e3;
  const timeout = 3e3;

  beforeAll(() => {
    /**
     * NOTE: JSDOM does not support `performance#mark` and `performance#measure`
     * Since `perf_hooks` complies to W3C specs, we can use that directly.
     */
    const windowFn = jest.fn().mockImplementation(() => {
      return { performance };
    });
    (global as any).window = windowFn();
  });

  describe('error', () => {
    it(`throws when undefined 'interval'`, async () => {
      try {
        await asyncPoll({
          fn: null!,
          conditionFn: null!,
          interval: null!,
          timeout: null!,
        });
      } catch (e) {
        expect(e).toStrictEqual(
          new TypeError(`Expected 'interval' to be a valid number, but received 'null'`));
      }
    });

    it(`throws when undefined 'timeout'`, async () => {
      try {
        await asyncPoll({
          fn: null!,
          conditionFn: null!,
          interval: 2e3,
          timeout: null!,
        });
      } catch (e) {
        expect(e).toStrictEqual(
          new TypeError(`Expected 'timeout' to be a valid number, but received 'null'`));
      }
    });

    it('throws when error occurs', async () => {
      try {
        await asyncPoll({
          interval,
          timeout,
          fn: () => { throw new Error('stop in polling'); },
          conditionFn: () => true,
        });
      } catch (e) {
        expect(e).toStrictEqual(new Error('stop in polling'));
      }
    });

  });

  describe('ok', () => {
    it('completes the async polling', async () => {
      try {
        const d = await asyncPoll({
          fn,
          conditionFn,
          interval,
          timeout,
        });

        expect(d).toStrictEqual({ message: 'Polling done!' });
      } catch (e) {
        throw e;
      }
    }, 10e3);

    it(`returns after a couple of pollings with delays`, async () => {
      try {
        let pollingIdx = 0;

        const d = await asyncPoll<TestData>({
          conditionFn: (n: { pollingIdx: number }) => {
            return n.pollingIdx > 1;
          },
          fn: async () => new Promise<TestData>((yay) => {
            pollingIdx += 1;

            setTimeout(() => yay({ pollingIdx, message: 'polling...' }), 1);
          }),
          interval: 2e3,
          timeout: 5e3,
        });

        expect(d.message).toStrictEqual('polling...');
        expect(d.pollingIdx).toBeGreaterThan(1);
      } catch (e) {
        throw e;
      }
    }, 10e3);

    it(`returns with next polling starts instantly`, async () => {
      try {
        let pollingIdx = 0;

        const d = await asyncPoll<TestData>({
          conditionFn: (n: { pollingIdx: number }) => {
            return n.pollingIdx > 1;
          },
          fn: async () => new Promise<TestData>((yay) => {
            pollingIdx += 1;

            setTimeout(() => yay({ pollingIdx, message: 'polling...' }), 3e3);
          }),
          interval: 2e3,
          timeout: 5e3,
        });

        expect(d.message).toStrictEqual('polling...');
        expect(d.pollingIdx).toBeGreaterThan(1);
      } catch (e) {
        throw e;
      }
    }, 10e3);

    it(`returns when 'timeout' is hit`, async () => {
      try {
        const d = await asyncPoll({
          conditionFn,
          timeout,
          fn: async () => new Promise(yay =>
            setTimeout(() => yay({ message: 'Timeout hit' }), 5e3)),
          interval: 2e3,
        });

        expect(d).toStrictEqual({ message: 'Timeout hit' });
      } catch (e) {
        throw e;
      }
    }, 10e3);

  });

  afterAll(() => {
    (global as any).window = void 0;
  });

});
