/*
 * @Author: 焦质晔
 * @Date: 2021-02-11 08:44:40
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-02 17:03:11
 */
const path = require('path');

exports.library = 'QmDesign';

exports.resolve = (dir) => {
  return path.join(__dirname, '..', dir);
};
