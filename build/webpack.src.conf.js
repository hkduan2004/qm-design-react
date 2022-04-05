/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 14:35:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 09:13:25
 */
'use strict';

const path = require('path');
const webpack = require('webpack');
const utils = require('./utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');

process.env.NODE_ENV = 'development';

module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-source-map',
  entry: {
    app: utils.resolve('src/index.tsx'),
  },
  output: {
    path: utils.resolve('dist'),
    filename: 'js/[name].js',
    publicPath: '/',
  },
  resolve: {
    // 配置解析规则
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': utils.resolve('src'),
    },
  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      // js jsx
      {
        test: /\.js(x)?$/,
        use: [{ loader: 'babel-loader' }],
        exclude: /node_modules/,
      },
      // ts tsx
      {
        test: /\.ts(x)?$/,
        use: [{ loader: 'babel-loader' }, { loader: 'ts-loader' }],
        exclude: /node_modules/,
      },
      // css
      {
        test: /\.css?$/,
        use: ['style-loader', 'css-loader'],
      },
      // scss
      {
        test: /\.less?$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      // do not base64-inline SVG
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },
      // images
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },
      // fonts
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'fonts/[contenthash:8][ext][query]' },
      },
      // media
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'media/[contenthash:8][ext][query]' },
      },
    ],
  },
  devServer: {
    /* 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html */
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [{ from: /.*/, to: '/index.html' }],
    },
    client: {
      overlay: false,
      progress: true,
    },
    host: 'localhost',
    port: '8082',
    hot: true, // 热加载
    open: true,
    proxy: {},
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: utils.resolve('src/index.html'),
      favicon: utils.resolve('src/favicon.ico'),
      inject: true,
    }),
  ],
};
