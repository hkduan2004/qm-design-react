/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 16:48:18
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-14 13:42:21
 */
import dayjs from 'dayjs';
import defaultLang from './lang/zh-cn';

import 'dayjs/locale/zh-cn';

export type TranslatePair = {
  [key: string]: string | string[] | TranslatePair;
};

export type Language = {
  name: string;
  qm: TranslatePair;
};

let lang: Language = defaultLang;

let i18nHandler: null | ((...args: any[]) => string) = null;

export const i18n = (fn: (...args: any[]) => string): void => {
  i18nHandler = fn;
};

function template(str: string, option): string {
  if (!str || !option) return str;

  return str.replace(/\{(\w+)\}/g, (_, key) => {
    return option[key];
  });
}

export const t = (...args: any[]): string => {
  if (i18nHandler) return i18nHandler(...args);

  const [path, option] = args;
  let value;
  const array = path.split('.');
  let current = lang;
  for (let i = 0, j = array.length; i < j; i++) {
    const property = array[i];
    value = current[property];
    if (i === j - 1) return template(value, option);
    if (!value) return '';
    current = value;
  }

  return '';
};

export const setLocale = (l: Language): void => {
  lang = l || lang;
  if (lang.name) {
    dayjs.locale(lang.name);
  }
};
