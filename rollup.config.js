// @ts-check

import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import tslint from 'rollup-plugin-tslint';
import typescript from 'rollup-plugin-typescript2';

const isProd = !process.env.ROLLUP_WATCH;
const pluginFn = (iife) => [
  isProd && tslint({
    throwError: true,
    configuration: `tslint${isProd ? '.prod' : ''}.json`,
  }),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: isProd ? ['src/(demo|test)/**/*'] : [],
    ...(iife ? { tsconfigOverride: { compilerOptions: { target: 'es5' } } } : {}),
  }),
  isProd && terser(),
  isProd && filesize({ showBrotliSize: true }),
];

const multiBuild = [
  {
    input: ['src/index.ts'],
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      exports: 'named',
      sourcemap: true,
    },
  },
  {
    input: ['src/index.ts'],
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
  {
    input: ['src/async-poll.ts'],
    output: {
      file: 'dist/async-poll.js',
      format: 'esm',
      sourcemap: true,
    },
    context: 'window',
  },
  {
    input: ['src/async-poll.ts'],
    output: {
      file: 'dist/async-poll.iife.js',
      name: 'AsyncPoll',
      format: 'iife',
      sourcemap: true,
      exports: 'named',
    },
    context: 'window',
  }
].map(({ input, output, ...n }) => ({
  input,
  output,
  plugins: pluginFn('iife' === output.format),
  ...n,
}));

export default multiBuild;
