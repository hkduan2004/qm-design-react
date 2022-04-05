/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 14:35:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-13 12:32:08
 */
'use strict';

const utils = require('./utils');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const pkg = require('../package.json');
const deps = Object.keys(pkg.dependencies);

process.env.NODE_ENV = 'production';

module.exports = {
  mode: 'production',
  target: 'web',
  entry: utils.resolve('packages/index.ts'),
  output: {
    path: utils.resolve('lib'),
    publicPath: '/',
    filename: 'index.full.js',
    libraryTarget: 'umd',
    library: utils.library,
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
    },
    // function ({ context, request }, callback) {
    //   if (deps.some((k) => new RegExp('^' + k).test(request))) {
    //     return callback(null, `commonjs ${request}`);
    //   }
    //   callback();
    // },
    nodeExternals(),
  ],
  module: {
    rules: [
      // ts tsx js jsx
      {
        test: /\.(ts|js)x?$/,
        use: [{ loader: 'babel-loader' }],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
};
