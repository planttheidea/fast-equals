import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';

export default [
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      name: 'fe',
      file: 'dist/fast-equals.js',
      format: 'umd',
      sourcemap: true
    },
    plugins: [
      resolve({
        module: true,
        main: true
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      name: 'fe',
      file: 'dist/fast-equals.min.js',
      format: 'umd'
    },
    plugins: [
      resolve({
        module: true,
        main: true
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      uglify()
    ]
  }
];
