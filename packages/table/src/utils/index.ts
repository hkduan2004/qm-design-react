/*
 * @Author: 焦质晔
 * @Date: 2021-08-31 14:43:51
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 10:56:58
 */
import { get, set, transform, intersection, isEqual } from 'lodash-es';
import dayjs, { Dayjs } from 'dayjs';
import { hasOwn, isObject, isValidElement } from '../../../_utils/util';
import { stringify, array_format } from '../filter-sql';
import type { IColumn, IDerivedColumn, IDerivedRowKey, IRecord, IRowKey, ISorter } from '../table/types';
import type { Nullable, AnyObject, JSXElement } from '../../../_utils/types';

export { hasOwn };

// 展平 columns
export const columnsFlatMap = (columns: IColumn[]): IColumn[] => {
  const result: IColumn[] = [];
  columns.forEach((column) => {
    if (column.children) {
      result.push(...columnsFlatMap(column.children));
    } else {
      result.push(column);
    }
  });
  return result;
};

// 筛选 columns
export const createFilterColumns = (columns: IColumn[]): IColumn[] => {
  return columns.filter((column) => {
    if (column.children) {
      column.children = createFilterColumns(column.children);
    }
    return !column.hidden && !column.noAuth;
  });
};

// 所有 columns
export const getAllColumns = (columns: IColumn[]): IColumn[] => {
  const result: IColumn[] = [];
  columns.forEach((column) => {
    result.push(column);
    if (column.children) {
      result.push(...getAllColumns(column.children));
    }
  });
  return result;
};

// 深度遍历 columns
export const mapTableColumns = (columns: IColumn[], callback?: (column: IColumn) => void): IColumn[] => {
  return columns.map((column) => {
    if (column.children) {
      column.children = mapTableColumns(column.children, callback);
    }
    callback?.(column);
    return column;
  });
};

// 深度查找 column by dataIndex
export const deepFindColumn = (columns: IColumn[], mark: IRowKey): Nullable<IColumn> => {
  let result: Nullable<IColumn> = null;
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].children) {
      result = deepFindColumn(columns[i].children as IColumn[], mark);
    }
    if (result) {
      return result;
    }
    if (columns[i].dataIndex === mark) {
      return columns[i];
    }
  }
  return result;
};

// 查找最后一级的第一个 column
export const findFirstColumn = (column: IColumn): IColumn => {
  const childColumns = column.children;
  if (childColumns) {
    if (childColumns[0].children) {
      return findFirstColumn(childColumns[0]);
    }
    return childColumns[0];
  }
  return column;
};

// 查找最后一级的最后一个 column
export const findLastColumn = (column: IColumn): IColumn => {
  const childColumns = column.children;
  if (childColumns) {
    if (childColumns[childColumns.length - 1].children) {
      return findLastColumn(childColumns[childColumns.length - 1]);
    }
    return childColumns[childColumns.length - 1];
  }
  return column;
};

// 根据条件过滤 columns
export const filterTableColumns = (columns: IColumn[], marks: string[]): IColumn[] => {
  return columns.filter((x) => !marks.includes(x.dataIndex));
};

// 深度查找 rowKey
export const deepFindRowKey = (rowKeys: IDerivedRowKey[], mark: IRowKey): Nullable<IDerivedRowKey> => {
  let result: Nullable<IDerivedRowKey> = null;
  for (let i = 0; i < rowKeys.length; i++) {
    if (rowKeys[i].children) {
      result = deepFindRowKey(rowKeys[i].children as IDerivedRowKey[], mark);
    }
    if (result) {
      return result;
    }
    if (rowKeys[i].rowKey === mark) {
      return rowKeys[i];
    }
  }
  return result;
};

// 展平 tableData
export const tableDataFlatMap = (list: IRecord[]): IRecord[] => {
  const result: IRecord[] = [];
  list.forEach((record) => {
    if (record.children) {
      result.push(...tableDataFlatMap(record.children));
    } else {
      result.push(record);
    }
  });
  return result;
};

// 获取所有 tableData
export const getAllTableData = (list: IRecord[]): IRecord[] => {
  const result: IRecord[] = [];
  list.forEach((record) => {
    result.push(record);
    if (record.children) {
      result.push(...getAllTableData(record.children));
    }
  });
  return result;
};

// 表头分组
export const convertToRows = (columns: IColumn[]): IColumn[][] => {
  let maxLevel = 1;

  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }

    if (column.children) {
      let colSpan = 0;
      column.children.forEach((subColumn) => {
        if (column.fixed) {
          subColumn.fixed = column.fixed;
        } else {
          delete subColumn.fixed;
        }
        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = column.colSpan ?? 1;
    }
  };

  columns.forEach((column: IDerivedColumn) => {
    column.level = 1;
    traverse(column, null);
  });

  const rows: IColumn[][] = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  const allColumns = getAllColumns(columns);

  allColumns.forEach((column: IDerivedColumn) => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level! + 1;
    } else {
      column.rowSpan = 1;
    }
    rows[column.level! - 1].push(column);
  });

  return rows;
};

// 获取元素相对于 目标祖先元素 的位置
export const getNodeOffset = (el: Nullable<HTMLElement>, container: HTMLElement, rest = { left: 0, top: 0 }) => {
  if (el) {
    const parentElem = el.parentNode as Nullable<HTMLElement>;
    rest.top += el.offsetTop;
    rest.left += el.offsetLeft;
    if (parentElem && parentElem !== document.documentElement && parentElem !== document.body) {
      rest.top -= parentElem.scrollTop;
      rest.left -= parentElem.scrollLeft;
    }
    if (container && (el === container || el.offsetParent === container) ? 0 : el.offsetParent) {
      return getNodeOffset(el.offsetParent as HTMLElement, container, rest);
    }
  }
  return rest;
};

// 格式化 DOM 元素高度
export const parseHeight = (height: number | string): Nullable<number | string> => {
  if (typeof height === 'number') {
    return height;
  }
  if (typeof height === 'string') {
    if (/^\d+(?:px)?$/.test(height)) {
      return Number.parseInt(height, 10);
    } else {
      return height;
    }
  }
  return null;
};

// 比对两个对象的差异
export const difference = <T extends AnyObject<any>>(obj: T, base: T): T => {
  return transform(obj, (result, value, key) => {
    if (!isEqual(value, base[key])) {
      (result as any)[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
    }
  });
};

// 判断数组的包含
export const isArrayContain = (targetArr: unknown[], arr: unknown[]): boolean => {
  return intersection(targetArr, arr).length === arr.length;
};

// 获取格式化后的数据
export const getCellValue = (record: IRecord, dataIndex: string): any => {
  return get(record, dataIndex) ?? '';
};

// 设置单元格的数据
export const setCellValue = (record: IRecord, dataIndex: string, val: unknown, precision?: number): void => {
  val = val ?? '';
  if (precision! >= 0 && val !== '') {
    val = Number(val).toFixed(precision);
  }
  set(record, dataIndex, val);
};

// 数字格式化
export const formatNumber = (value: number | string): string => {
  value = value.toString();
  const list = value.split('.');
  const prefix = list[0].charAt(0) === '-' ? '-' : '';
  let num = prefix ? list[0].slice(1) : list[0];
  let result = '';
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
};

// 数值类型校验
export const validateNumber = (val: string): boolean => {
  const regExp = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
  return (!Number.isNaN(val) && regExp.test(val)) || val === '' || val === '-';
};

// 字符串转数值类型
export const stringToNumber = (input: string): number | '' => {
  if (!validateNumber(input)) return '';
  input = input === '-' ? '' : input;
  return input ? Number(input) : '';
};

// 转日期对象
export const getDate = (dateString: string | undefined, format: string) => {
  return dateString ? dayjs(dateString, format) : null;
};

// 转日期格式
export const formatDate = (date: Dayjs | null, format: string) => {
  return date ? dayjs(date).format(format) : '';
};

// 生成 uuid key
export const createUidKey = (key = ''): string => {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return key + uuid;
};

// 获取 VNode 中的文本
export const getVNodeText = <T extends string | number>(val: JSXElement | T): T[] => {
  const result: T[] = [];
  if (isValidElement(val)) {
    const { children } = (val as any).props;
    if (Array.isArray(children)) {
      children.forEach((c) => result.push(...getVNodeText(c)));
    } else if (children) {
      result.push(...getVNodeText(children));
    }
  } else {
    result.push(val as T);
  }
  return result;
};

// 获取有效的分组合计数据
export const getGroupValidData = (list: IRecord[]) => {
  return list.filter((row) => !row._group);
};

// 生成排序的 sql 片段
export const createOrderBy = (sorter: ISorter): string => {
  const result: string[] = [];
  Object.keys(sorter).forEach((dataIndex) => {
    if (sorter[dataIndex] !== null) {
      result.push(`${dataIndex}|${sorter[dataIndex]}`);
    }
  });
  return result.join(',');
};

// 生成查询条件的 sql 片段
export const createWhereSQL = (filters: any, showType = false): string => {
  let query_str = ``;
  if (!Array.isArray(filters)) {
    const cutStep = 5;
    for (const key in filters) {
      const [property, type] = key.includes('|') ? key.split('|') : [key, ''];
      const filterVal = filters[key];
      for (const mark in filterVal) {
        // 用 ^ 替换字符串中的 空格
        const val = Array.isArray(filterVal[mark]) ? array_format(filterVal[mark]) : stringify(filterVal[mark], '^');
        if (val === "''" || val === '[]') continue;
        query_str += `${!showType ? property : `${property}|${type}`} ${mark} ${val} and `;
      }
    }
    query_str = query_str.slice(0, -1 * cutStep);
  } else {
    let cutStep = 0;
    for (let i = 0, len = filters.length; i < len; i++) {
      const x = filters[i];
      if (!x.fieldName) continue;
      const val = Array.isArray(x.condition) ? array_format(x.condition) : stringify(x.condition, '^');
      query_str += `${x.bracketLeft} ${!showType ? x.fieldName : `${x.fieldName}|${x.fieldType}`} ${x.expression} ${val} ${x.bracketRight} ${
        x.logic
      } `;
      cutStep = x.logic.length;
    }
    query_str = query_str.slice(0, -1 * cutStep - 2);
  }
  // console.log('where:', query_str);
  return query_str.replace(/\s+/g, ' ').trim();
};

// 多列分组聚合
export const groupByProps = (array: IRecord[] = [], props: string[] = []): any[][] => {
  const fn = (x) => {
    const res: unknown[] = [];
    props.forEach((k) => res.push(getCellValue(x, k)));
    return res;
  };
  const groups: Record<string, any[]> = {};
  array.forEach((x) => {
    const group = JSON.stringify(fn(x));
    groups[group] = groups[group] || [];
    groups[group].push(x);
  });
  return Object.keys(groups).map((group) => {
    return groups[group];
  });
};

export const deepGetRowkey = (arr: any[], value: IRowKey): IRowKey[] | undefined => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].rowKey === value) {
      return [value];
    }
    if (Array.isArray(arr[i].children)) {
      const temp = deepGetRowkey(arr[i].children, value);
      if (temp) {
        return [arr[i].rowKey, temp].flat();
      }
    }
  }
};

export const deepTreeFilter = (tree: any[], fn: (node: unknown) => boolean) => {
  // 使用map复制一下节点，避免修改到原树
  return tree
    .map((node) => ({ ...node }))
    .filter((node) => {
      node.children = node.children && deepTreeFilter(node.children, fn);
      return fn(node) || (node.children && node.children.length);
    });
};

export const flatToTree = (list: any[], id: string, pid: string) => {
  const info = list.reduce((map, node) => {
    map[node[id]] = node;
    node.children = [];
    return map;
  }, {});
  return list.filter((node) => {
    info[node[pid]]?.children.push(node);
    return !node[pid];
  });
};
