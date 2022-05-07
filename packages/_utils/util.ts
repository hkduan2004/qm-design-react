/*
 * @Author: 焦质晔
 * @Date: 2021-07-30 09:08:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:47:33
 */
import React from 'react';
import { isNumber, isString, isUndefined, isFunction, isArray, isPlainObject as isObject, debounce, throttle, get } from 'lodash-es';
import isServer from './isServer';
import type { AnyFunction, AnyObject } from './types';

export { isNumber, isString, isArray, isUndefined, isFunction, isObject, debounce, throttle, get };

export const isIE = (): boolean => {
  return !isServer && /MSIE|Trident/.test(navigator.userAgent);
};

export const isEdge = (): boolean => {
  return !isServer && navigator.userAgent.indexOf('Edge') > -1;
};

export const isChrome = (): boolean => {
  return !isServer && navigator.userAgent.indexOf('Chrome') > -1 && !isEdge();
};

export const isFirefox = (): boolean => {
  return !isServer && !!navigator.userAgent.match(/firefox/i);
};

export const isSimpleValue = (x: unknown): boolean => {
  const simpleTypes = new Set(['undefined', 'boolean', 'number', 'string']);
  return x === null || simpleTypes.has(typeof x);
};

export const isValidElement = (c: React.ReactNode): boolean => {
  return React.isValidElement(c);
};

export const isFragment = (c: React.ReactNode): boolean => {
  return isValidElement(c) && (c as React.ReactElement).type === React.Fragment;
};

// /^\p{Unified_Ideograph}+$/u

export const noop = (): void => {};

export const trueNoop = (): boolean => true;

export const hasOwn = <T extends AnyObject<unknown>>(obj: T, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

export const sleep = async (delay: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const nextTick = (cb: AnyFunction<void>): void => {
  Promise.resolve().then(cb);
};

export const errorCapture = async (asyncFn: AnyFunction<any>, ...params: any[]): Promise<any[]> => {
  try {
    const res = await asyncFn(...params);
    return [null, res];
  } catch (e) {
    return [e, null];
  }
};

export const camelize = (input: string): string => {
  return input.replace(/-(\w)/g, (_, str) => (str ? str.toUpperCase() : ''));
};

export const isEmpty = (val: any): boolean => {
  if ((!val && val !== 0) || (isArray(val) && !val.length) || (isObject(val) && !Object.keys(val).length)) {
    return true;
  }
  return false;
};

export const isValid = (val: string): boolean => {
  return val !== undefined && val !== null && val !== '';
};

export const getValueByPath = (obj: AnyObject<any>, paths = ''): unknown => {
  let ret = obj;
  paths.split('.').map((path) => {
    ret = ret?.[path];
  });
  return ret;
};

export const getParserWidth = (val: number | string): string => {
  if (isNumber(val)) {
    return `${val}px`;
  }
  return val.toString();
};

function generateFlattenMap(source) {
  const map: Map<string, any> = new Map();
  for (const [key, value] of Object.entries(source)) {
    if (isObject(value)) {
      const deepMap = generateFlattenMap(value);
      for (const [mapKey, mapValue] of deepMap.entries()) {
        map.set(`${key}.${mapKey}`, mapValue);
      }
    } else {
      map.set(key, value);
    }
  }

  return map;
}

export const flatJson = <T extends Record<string, any>>(jsonObject: T): T => {
  const map = generateFlattenMap(jsonObject);

  const flatten: any = {};
  for (const [key, value] of map.entries()) {
    flatten[key] = value;
  }

  return flatten;
};

export const getAuthValue = (code: string): Record<string, any> | undefined => {
  try {
    const _data = JSON.parse(localStorage.getItem('auths') || '{}');
    return get(_data, code);
  } catch (err) {
    // ...
  }
  return {};
};
