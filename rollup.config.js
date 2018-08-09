import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';

export default [
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/fast-equals.js',
      format: 'umd',
      name: 'fe',
      sourcemap: true,
    },
    plugins: [
      resolve({
        main: true,
        module: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/fast-equals.min.js',
      format: 'umd',
      name: 'fe',
    },
    plugins: [
      resolve({
        main: true,
        module: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      uglify(),
    ],
  },
];
