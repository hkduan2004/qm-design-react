/*
 * @Author: 焦质晔
 * @Date: 2020-07-11 13:39:54
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-01 09:34:29
 */
// 模糊搜索中需要转义的特殊字符
const SPAN_CHAR_REG = /(\^|\.|\[|\]|\$|\(|\)|\||\*|\+|\?|\{|\}|\\)/g;

const PRIMITIVE_VALUES: string[] = ['string', 'number', 'boolean', 'symbol'];

const escapeKeyword = (keyword: string): string => {
  return keyword.toString().replace(SPAN_CHAR_REG, '\\$1');
};

const isPrimitive = (value: unknown): boolean => {
  return PRIMITIVE_VALUES.includes(typeof value);
};

const isDate = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return false;
  }
  return /^\d{4}-\d{2}-\d{2}(\s+\d{2}:\d{2}:\d{2})?$/.test(value as string);
};

const createRegExp = (condition: string): RegExp => {
  return new RegExp(escapeKeyword(condition.replace(/├/g, '(').replace(/┤/g, ')').replace(/\^/g, ' ')), 'i');
};

/**
 * 解析 where 条件的各种情况
 * @param {any} value 数据值
 * @param {string} expression 标记符
 * @param {any} condition 条件值
 * @returns {boolean}
 */
export const matchWhere = (value: any, expression: string, condition: any): boolean => {
  value = value ?? '';
  let res = true;
  switch (expression) {
    case 'like': {
      res = value.toString().match(createRegExp(condition)) !== null;
      break;
    }
    case 'likes': {
      const conditions: string[] = (condition as string).split(/,|，/);
      res = conditions.some((condition: string): boolean => {
        return value.toString().match(createRegExp(condition)) !== null;
      });
      break;
    }
    case 'in': {
      if (isPrimitive(condition)) {
        condition = [condition];
      }
      if (Array.isArray(condition)) {
        res = Array.isArray(value) ? condition.every((x) => value.includes(x)) : condition.includes(value);
      }
      break;
    }
    case 'nin': {
      if (isPrimitive(condition)) {
        condition = [condition];
      }
      if (Array.isArray(condition)) {
        res = !(Array.isArray(value) ? condition.some((x) => value.includes(x)) : condition.includes(value));
      }
      break;
    }
    case '!=':
    case '<>': {
      res = (isDate(value) ? value.slice(0, 10) : value) != condition;
      break;
    }
    case '<': {
      res = (isDate(value) ? value.slice(0, 10) : value) < condition;
      break;
    }
    case '<=': {
      res = (isDate(value) ? value.slice(0, 10) : value) <= condition;
      break;
    }
    case '>': {
      res = (isDate(value) ? value.slice(0, 10) : value) > condition;
      break;
    }
    case '>=': {
      res = (isDate(value) ? value.slice(0, 10) : value) >= condition;
      break;
    }
    case '==':
    default: {
      res = (isDate(value) ? value.slice(0, 10) : value) == condition;
    }
  }
  return res;
};
