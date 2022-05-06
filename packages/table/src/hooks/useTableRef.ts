/*
 * @Author: 焦质晔
 * @Date: 2021-12-26 15:45:00
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 20:35:57
 */
import React from 'react';
import { createUidKey, getAllTableData } from '../utils';
import { isIE } from '../../../_utils/util';
import Store from '../store';
import config from '../config';

import type { getRowKeyType, IColumn, IDerivedRowKey, IRecord, IRowKey, ITableProps } from '../table/types';
import type { ComponentSize, Nullable } from '../../../_utils/types';

export type ITableRef = {
  uid: string;
  elementStore: Record<string, Nullable<HTMLElement>>;
  originColumns: IColumn[];
  tableFullData: IRecord[];
  tableOriginData: IRecord[];
  allTableData: IRecord[]; // 展平后的全量
  allRowKeys: IRowKey[];
  deriveRowKeys: IDerivedRowKey[]; // 派生的 rowKeys for treeTable
  flattenRowKeys: IRowKey[];
  scrollYStore: {
    startIndex: number;
    endIndex: number;
    offsetSize: number;
    visibleSize: number;
    rowHeight: number;
  };
  store: Store;
  resizeState: {
    width: number;
    height: number;
    winHeight: number;
  };
  handleState: {
    insert: boolean;
    remove: boolean;
  };
  summaries: Record<string, number>;
  treeTable: boolean;
  scrollYLoad: boolean;
  shouldToTop: boolean;
  selectionRows: IRecord[];
  rowKeysMap: Map<IRowKey, number>;
  isIE: boolean;
};

type IExtra = {
  getRowKey: getRowKeyType;
  $size: ComponentSize;
};

const useTableRef = <T extends ITableProps>(props: T, { getRowKey, $size }: IExtra) => {
  const tableRef = React.useRef<ITableRef>({
    // 实例 uid
    uid: createUidKey(),
    // dom 节点集合
    elementStore: {},
    // 原始列
    originColumns: [],
    // 所有数据
    tableFullData: [],
    // 原始数据
    tableOriginData: [],
    // 展平所有数据
    allTableData: [],
    // 展平所有 rowKey
    allRowKeys: [],
    // 派生 rowKeys
    deriveRowKeys: [],
    // 叶子节点 rowKeys
    flattenRowKeys: [],
    // 存放纵向 Y 虚拟滚动相关信息
    scrollYStore: {
      startIndex: 0,
      endIndex: 0,
      offsetSize: 0,
      visibleSize: 0,
      rowHeight: config.rowHeightMaps[$size],
    },
    // 表单状态
    store: new Store(),
    // 尺寸变化
    resizeState: {
      width: 0,
      height: 0,
      winHeight: window.innerHeight, // 窗口高度
    },
    // 插入/移除数据
    handleState: {
      insert: false,
      remove: false,
    },
    // 服务端合计
    summaries: {},
    // 树表格
    treeTable: false,
    // 虚拟滚动
    scrollYLoad: false,
    // 滚动条是否返回顶部
    shouldToTop: true,
    // 选中的行记录
    selectionRows: [],
    // 缓存数据
    rowKeysMap: new Map(),
    // 是否是 IE11
    isIE: isIE(),
  });

  // 创建派生的 rowKeys for treeTable
  const createDeriveRowKeys = (rows: IRecord[], key: IRowKey, path: string, depth = 0): IDerivedRowKey[] => {
    return rows.map((row) => {
      const rowKey = getRowKey(row, row.index);
      const rowKeyPath = path ? `${path}-${rowKey}` : `${rowKey}`;
      const item: IDerivedRowKey = { level: depth, rowKey, rowKeyPath };
      if (row.children) {
        item.children = createDeriveRowKeys(row.children, rowKey, rowKeyPath, depth + 1);
      }
      return key ? Object.assign({}, item, { parentRowKey: key }) : item;
    });
  };

  // 创建叶子节点 rowKeys for treeTable
  const createFlatRowKeys = (deriveRowKeys: IDerivedRowKey[]): IRowKey[] => {
    const result: IRowKey[] = [];
    deriveRowKeys.forEach((x) => {
      if (x.children?.length) {
        result.push(...createFlatRowKeys(x.children));
      } else {
        result.push(x.rowKey);
      }
    });
    return result;
  };

  const setElementStore = (key: string, value: HTMLElement) => {
    tableRef.current.elementStore[key] = value;
  };
  const clearElementStore = () => {
    for (const key in tableRef.current.elementStore) {
      tableRef.current.elementStore[key] = null;
    }
  };

  const setOriginColumns = (columns: IColumn[]) => {
    tableRef.current.originColumns = columns;
  };

  const setTableFullData = (records: IRecord[]) => {
    tableRef.current.tableFullData = records;
  };

  const setTableOriginData = (records: IRecord[]) => {
    tableRef.current.tableOriginData = records;
  };

  const setAllTableData = (records: IRecord[]) => {
    const flattenTableData = getAllTableData(records);
    tableRef.current.allTableData = flattenTableData;
    tableRef.current.allRowKeys = flattenTableData.map((row) => getRowKey(row, row.index));
  };

  const setDeriveRowKeys = (records: IRecord[]) => {
    tableRef.current.deriveRowKeys = createDeriveRowKeys(records, '', '');
    tableRef.current.flattenRowKeys = createFlatRowKeys(tableRef.current.deriveRowKeys);
    tableRef.current.treeTable = tableRef.current.deriveRowKeys.some((x) => Array.isArray(x.children) && x.children.length);
  };

  const setScrollYStore = (option: ITableRef['scrollYStore']) => {
    tableRef.current.scrollYStore = option;
  };

  const setResizeState = (option: ITableRef['resizeState']) => {
    tableRef.current.resizeState = option;
  };

  const setHandleState = (option: ITableRef['handleState']) => {
    tableRef.current.handleState = option;
  };

  const setSummaries = (option: ITableRef['summaries']) => {
    tableRef.current.summaries = option;
  };

  const setScrollYLoad = (value: boolean) => {
    tableRef.current.scrollYLoad = value;
  };

  const setShouldToTop = (value: boolean) => {
    tableRef.current.shouldToTop = value;
  };

  const setSelectionRows = (selectKeys: IRecord[]) => {
    tableRef.current.selectionRows = selectKeys;
  };

  const setRowKeysMap = (key: IRowKey, value: number) => {
    tableRef.current.rowKeysMap.set(key, value);
  };

  const clearAllRowKeysMap = () => {
    tableRef.current.rowKeysMap.clear();
  };

  return {
    tableRef,
    ...tableRef.current,
    setElementStore,
    setOriginColumns,
    setTableFullData,
    setTableOriginData,
    setAllTableData,
    setDeriveRowKeys,
    setScrollYStore,
    setResizeState,
    setHandleState,
    setSummaries,
    setScrollYLoad,
    setShouldToTop,
    setSelectionRows,
    setRowKeysMap,
    clearElementStore,
    clearAllRowKeysMap,
  };
};

export default useTableRef;
