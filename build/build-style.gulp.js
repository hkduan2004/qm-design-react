/*
 * @Author: 焦质晔
 * @Date: 2021-02-11 15:05:17
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-15 21:25:39
 */
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const { series, src, dest } = require('gulp');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const utils = require('./utils');

function compile() {
  return src(utils.resolve('packages/style/index.less'))
    .pipe(less({ javascriptEnabled: true }))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('index.css'))
    .pipe(dest(utils.resolve('lib/style')))
    .pipe(cssmin({ keepSpecialComments: false }))
    .pipe(rename('index.min.css'))
    .pipe(dest(utils.resolve('lib/style')));
}

function copyfont() {
  return src(utils.resolve('packages/style/fonts/**'))
    .pipe(cssmin())
    .pipe(dest(utils.resolve('lib/style/fonts')));
}

function copyscss() {
  return src(utils.resolve('packages/**/*.less')).pipe(dest(utils.resolve('lib')));
}

exports.build = series(compile, copyfont, copyscss);
