/*
 * @Author: 焦质晔
 * @Date: 2021-12-21 14:36:06
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-21 15:06:06
 */
import pinyin from './core';
import patcher56L from './patchers/56l';

if (pinyin.isSupported() && patcher56L.shouldPatch(pinyin.genToken)) {
  pinyin.patchDict(patcher56L);
}

export default pinyin;
