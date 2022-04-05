/*
 * @Author: 焦质晔
 * @Date: 2021-02-12 09:22:19
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-03 12:40:12
 */
'use strict';

import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import pkg from '../package.json';

const utils = require('./utils');
const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const deps = Object.keys(pkg.dependencies);

const env = process.env.NODE_ENV;

export default [
  {
    input: utils.resolve('packages/index.ts'),
    output: [
      {
        format: 'es',
        file: 'lib/index.esm.js',
      },
      {
        format: 'cjs',
        file: 'lib/index.js',
        exports: 'named',
      },
      // {
      //   format: 'umd',
      //   name: utils.library,
      //   file: 'lib/index.js',
      //   globals: {
      //     react: 'React',
      //   },
      // },
    ],
    plugins: [
      json(),
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions,
      }),
      typescript({
        outDir: 'lib',
        sourceMap: false,
        include: ['packages/**/*', 'typings/*.d.ts'],
        exclude: ['node_modules/**'],
      }),
      commonjs({
        extensions,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
        // options
        preventAssignment: true,
      }),
      terser(),
    ],
    external(id) {
      return /^react/.test(id) || /^(antd|@ant-design\/icons)/.test(id) || deps.some((k) => new RegExp('^' + k).test(id));
    },
  },
];
