interface TestData {
  message: string;
  pollingIdx: number;
}

import asyncPoll from '..';

describe('async-poll (node)', () => {
  const fn = async () => {
    return { message: 'Polling done!' };
  };
  const conditionFn = () => true;
  const interval = 1e3;
  const timeout = 3e3;

  describe('error', () => {
    it(`throws when undefined 'options'`, async () => {
      try {
        await asyncPoll(null!, null!, null!);
      } catch (e) {
        expect(e).toStrictEqual(
          new TypeError(`Expected 'interval' to be a valid number, but received 'undefined'`));
      }
    });

    it(`throws when undefined 'interval'`, async () => {
      try {
        await asyncPoll(null!, null!, { interval: null!, timeout: null! });
      } catch (e) {
        expect(e).toStrictEqual(
          new TypeError(`Expected 'interval' to be a valid number, but received 'null'`));
      }
    });

    it(`throws when undefined 'timeout'`, async () => {
      try {
        await asyncPoll(null!, null!, { interval: 2e3, timeout: null! });
      } catch (e) {
        expect(e).toStrictEqual(
          new TypeError(`Expected 'timeout' to be a valid number, but received 'null'`));
      }
    });

    it('throws when error occurs', async () => {
      try {
        await asyncPoll(
          () => { throw new Error('stop in polling'); },
          () => true,
          { interval, timeout });
      } catch (e) {
        expect(e).toStrictEqual(new Error('stop in polling'));
      }
    });

  });

  describe('ok', () => {
    it('completes the polling', async () => {
      const d = await asyncPoll(
        fn,
        conditionFn,
        { interval, timeout });

      expect(d).toStrictEqual({ message: 'Polling done!' });
    }, 10e3);

    it(`returns after a couple of pollings with delays`, async () => {
      let pollingIdx = 0;

      const d = await asyncPoll<TestData>(
        async () => new Promise<TestData>((yay) => {
          pollingIdx += 1;
          setTimeout(() => yay({ pollingIdx, message: 'polling...' }), 1);
        }),
        (n: { pollingIdx: number }) => n.pollingIdx > 1,
        { interval: 2e3, timeout: 5e3 });

      expect(d.message).toStrictEqual('polling...');
      expect(d.pollingIdx).toBeGreaterThan(1);
    }, 10e3);

    it(`returns with next polling starts instantly`, async () => {
      let pollingIdx = 0;

      const d = await asyncPoll<TestData>(
        async () => new Promise<TestData>((yay) => {
          pollingIdx += 1;

          setTimeout(() => yay({ pollingIdx, message: 'polling...' }), 3e3);
        }),
        (n: { pollingIdx: number }) => n.pollingIdx > 1,
        { interval: 2e3, timeout: 5e3 });

      expect(d.message).toStrictEqual('polling...');
      expect(d.pollingIdx).toBeGreaterThan(1);
    }, 10e3);

    it(`returns when 'timeout' is hit`, async () => {
      const d = await asyncPoll(
        async () => new Promise(yay => setTimeout(() => yay({ message: 'Timeout hit' }), 5e3)),
        conditionFn,
        { timeout, interval: 2e3 });

      expect(d).toStrictEqual({ message: 'Timeout hit' });
    }, 10e3);

    it(`never stops polling`, async () => {
      const d = 'poll forever';

      try {
        await new Promise(async (yay, nah) => {
          setTimeout(() => nah(new Error(d)), 10e3);

          yay(await asyncPoll(
            async () => Promise.resolve(d),
            conditionFn,
            { timeout: 0, interval: 1e3 }));
        });
      } catch (e) {
        expect(e).toStrictEqual(new Error(d));
      }
    }, 15e3);

  });

});
