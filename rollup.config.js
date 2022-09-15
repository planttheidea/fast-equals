import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];
const globals = external.reduce((globals, name) => {
  globals[name] = name;

  return globals;
}, {});

export default [
  {
    external,
    input: 'src/index.ts',
    output: {
      file: './dist/minified/index.js',
      format: 'umd',
      globals,
      name: pkg.name,
      sourcemap: true,
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      nodeResolve({
        mainFields: ['module', 'jsnext:main', 'main'],
      }),
      typescript({
        tsconfig: './tsconfig.minified.json',
        typescript: require('typescript'),
      }),
      terser({ compress: { passes: 3 } }),
    ],
  },
];
