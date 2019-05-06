// @ts-check

import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import tslint from 'rollup-plugin-tslint';
import typescript from 'rollup-plugin-typescript2';

const isProd = !process.env.ROLLUP_WATCH;
const input = ['src/index.ts'];
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
  // isProd && terser(),
  isProd && filesize({ showBrotliSize: true }),
];

const multiBuild = [
  {
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      exports: 'named',
      sourcemap: true,
    },
  },
  {
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
  },
  {
    output: {
      file: 'dist/async-poll.js',
      format: 'esm',
      sourcemap: true,
    },
    context: 'window',
  },
  {
    output: {
      file: 'dist/async-poll.iife.js',
      name: 'AsyncPoll',
      format: 'iife',
      sourcemap: true,
      exports: 'named',
    },
    context: 'window',
  }
].map(({ output, ...n }) => ({
  input,
  output,
  plugins: pluginFn('iife' === output.format),
  ...n,
}));

export default multiBuild;
