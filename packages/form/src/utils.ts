/*
 * @Author: 焦质晔
 * @Date: 2021-08-07 22:16:17
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 10:52:49
 */
import dayjs, { Dayjs } from 'dayjs';
import type { IDict } from 'packages/_utils/types';

import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

export const getDate = (dateString: string | undefined, format: string) => {
  return dateString ? dayjs(dateString, format) : null;
};

export const formatDate = (date: Dayjs | null, format: string) => {
  return date ? dayjs(date).format(format) : '';
};

export const isEmptyValue = (value: unknown) => value === '' || value === undefined || value === null;

export const deepMapList = (list: any[], valueKey: string, textKey: string): IDict[] => {
  return list.map((x) => {
    const item: IDict = { value: x[valueKey], text: x[textKey] };
    x.disabled && (item.disabled = true);
    if (Array.isArray(x.children)) {
      item.children = deepMapList(x.children, valueKey, textKey);
    }
    return item;
  });
};

export const deepFind = (arr: any[], mark: string) => {
  let res = null;
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i].children)) {
      res = deepFind(arr[i].children, mark);
    }
    if (res) {
      return res;
    }
    if (arr[i].value === mark) {
      return arr[i];
    }
  }
  return res;
};

export const deepFindValues = <T>(arr: T[], str: string, depth = 0): T[] => {
  const result: T[] = [];
  arr.forEach((x: any) => {
    if (x.value == str.split(',')[depth]) {
      result.push(x);
    }
    if (Array.isArray(x.children)) {
      result.push(...deepFindValues<T>(x.children, str, depth + 1));
    }
  });
  return result;
};

export const deepGetPath = (arr: any[], value: string): string[] | undefined => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].value === value) {
      return [value];
    }
    if (Array.isArray(arr[i].children)) {
      const temp = deepGetPath(arr[i].children, value);
      if (temp) {
        return [arr[i].value, temp].flat();
      }
    }
  }
};

// 数值类型格式化
export const formatNumber = (value: string | number): string => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const parserNumber = (value: string): string => value.replace(/\$\s?|(,*)/g, '');

// 表单字段值加密
export const secretFormat = (value = '', type: string): string => {
  value += '';
  if (type === 'finance') {
    value = formatNumber(value);
  }
  if (type === 'name') {
    value = value.replace(/^([\u4e00-\u9fa5]{1}).+$/, '$1**');
  }
  if (type === 'phone') {
    value = value.replace(/^(\d{3}).+(\d{4})$/, '$1****$2');
  }
  if (type === 'IDnumber') {
    value = value.replace(/^(\d{3}).+(\w{4})$/, '$1***********$2');
  }
  if (type === 'bankNumber') {
    value = value.replace(/^(\d{4}).+(\w{3})$/, '$1************$2');
  }
  return value;
};
