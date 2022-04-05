/*
 * @Author: 焦质晔
 * @Date: 2021-12-26 19:22:20
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-15 13:48:09
 */
import React from 'react';
import { isObject } from '../../../_utils/util';
import { getCellValue, setCellValue } from '../utils';
import config from '../config';

import type { ITableRef } from './useTableRef';
import type { getRowKeyType, IColumn, IFetchParams, IPagination, IRecord, IRowKey, IRule, IValidItem, TableBodyRef, TableRef } from '../table/types';

type IExtra = {
  getRowKey: getRowKeyType;
  tableRef: React.MutableRefObject<ITableRef>;
  flattenColumns: IColumn[];
  editableColumns: IColumn[];
  pagination: IPagination;
  fetchParams: IFetchParams;
  isFetch: boolean;
  dataChange: () => void;
  getTableData: () => Promise<void>;
  createTableData: (records: IRecord[]) => void;
  calcTableHeight: () => void;
  scrollXToColumn: (dataIndex: string, index?: number) => void;
  scrollYToRecord: (rowKey: IRowKey, index?: number) => void;
  doFieldValidate: (rules: IRule[], val: unknown, rowKey: IRowKey, columnKey: string) => void;
  setHandleState: (option: ITableRef['handleState']) => void;
  forceUpdate: () => void;
  setSelectionKeys: (rowKeys: IRowKey[]) => void;
  setHighlightKey: (rowKey: IRowKey) => void;
  getTableLog: () => {
    required: IValidItem[];
    validate: IValidItem[];
    inserted: IValidItem[];
    updated: IValidItem[];
    removed: IValidItem[];
  };
  clearRowSelection: () => void;
  clearRowHighlight: () => void;
  clearTableSorter: () => void;
  clearTableFilter: () => void;
  clearSuperFilters: () => void;
  clearTableLog: () => void;
};

const useImperativeMethod = <T extends React.ForwardedRef<TableRef>>(ref: T, extra: IExtra) => {
  const {
    getRowKey,
    tableRef,
    flattenColumns,
    editableColumns,
    pagination,
    fetchParams,
    isFetch,
    dataChange,
    getTableData,
    createTableData,
    calcTableHeight,
    scrollXToColumn,
    scrollYToRecord,
    doFieldValidate,
    setHandleState,
    setSelectionKeys,
    setHighlightKey,
    forceUpdate,
    getTableLog,
    clearRowSelection,
    clearRowHighlight,
    clearTableSorter,
    clearTableFilter,
    clearSuperFilters,
    clearTableLog,
  } = extra;

  React.useImperativeHandle(ref, () => {
    return {
      // 计算表格高度
      CALCULATE_HEIGHT: () => {
        calcTableHeight();
      },
      // 刷新表格数据
      DO_REFRESH: async (callback: () => void) => {
        if (!isFetch) return;
        await getTableData();
        callback?.();
      },
      // 获取表格操作记录
      GET_LOG: () => {
        return getTableLog();
      },
      // 获取表格的查询参数
      GET_FETCH_PARAMS: () => {
        const params: IFetchParams = {};
        for (const key in fetchParams) {
          // 过滤分页参数
          if (Object.keys(pagination).includes(key)) continue;
          params[key] = fetchParams[key];
        }
        return params;
      },
      // 清空表格数据
      CLEAR_TABLE_DATA: () => {
        if (isFetch) return;
        clearRowSelection();
        clearRowHighlight();
        clearTableSorter();
        clearTableFilter();
        clearSuperFilters();
        clearTableLog();
        createTableData([]);
      },
      // 清空表格操作记录
      CLEAR_LOG: () => {
        clearTableLog();
      },
      // 组件强制更新
      FORCE_UPDATE: () => {
        forceUpdate();
      },
      // 滚动到指定数据行
      SCROLL_TO_RECORD: (rowKey: IRowKey) => {
        scrollYToRecord(rowKey);
      },
      // 滚动到指定表格列
      SCROLL_TO_COLUMN: (dataIndex: string) => {
        scrollXToColumn(dataIndex);
      },
      // 设置表格字段的值，参数是值的集合 { dataIndex: val, ... }
      SET_FIELDS_VALUE: (row: IRecord, values: Record<string, any>) => {
        for (const dataIndex in values) {
          setCellValue(row, dataIndex, getCellValue(values, dataIndex));
        }
        dataChange();
      },
      // 设置选择列
      SET_SELECTION(rowKeys: IRowKey[]) {
        setSelectionKeys(rowKeys);
      },
      // 设置高亮行
      SET_HIGHLIGHT(rowKey: IRowKey) {
        setHighlightKey(rowKey);
      },
      // 表格数据插入
      INSERT_RECORDS: <T extends IRecord>(records: T | T[]) => {
        const { store, tableFullData } = tableRef.current;
        const rows = (Array.isArray(records) ? records : [records]).filter((x) => isObject(x));
        if (!rows.length) return;
        rows.forEach((row) => {
          flattenColumns.forEach((column) => {
            const { dataIndex } = column;
            if ([config.expandableColumn, config.selectionColumn, config.operationColumn].includes(dataIndex)) return;
            setCellValue(row, dataIndex, getCellValue(row, dataIndex));
          });
          // 添加表格操作记录
          store.addToInserted(row);
        });
        createTableData(tableFullData.concat(rows));
        setHandleState(Object.assign({}, tableRef.current.handleState, { insert: true }));
        dataChange();
      },
      // 删除数据
      REMOVE_RECORDS: <T extends IRecord | IRowKey>(records: T | T[]) => {
        const { store, tableFullData } = tableRef.current;
        const rows = Array.isArray(records) ? records : [records];
        const rowKeys = rows.map((x) => (isObject(x) ? getRowKey(x as IRecord, (x as IRecord).index) : x));
        if (!rowKeys.length) return;
        let isRemoved = false;
        for (let i = 0; i < tableFullData.length; i++) {
          const row = tableFullData[i];
          const rowKey = getRowKey(row, row.index);
          if (rowKeys.includes(rowKey)) {
            store.addToRemoved(row);
            // 移除表单校验记录
            editableColumns.forEach((column) => {
              const { dataIndex, editRender } = column;
              const options = editRender?.(row, column);
              if (!options) return;
              const { rules = [], disabled } = options;
              if (!disabled && rules.length) {
                store.removeFromRequired({ x: rowKey, y: dataIndex });
                store.removeFromValidate({ x: rowKey, y: dataIndex });
              }
            });
            tableFullData.splice(i, 1);
            i = i - 1;
            isRemoved = true;
          }
        }
        if (isRemoved) {
          createTableData([...tableFullData]);
          setHandleState(Object.assign({}, tableRef.current.handleState, { remove: true }));
          dataChange();
        }
      },
      // 字段校验
      VALIDATE_FIELDS: () => {
        tableRef.current.allTableData.forEach((record) => {
          editableColumns.forEach((column) => {
            const { dataIndex, editRender } = column;
            const options = editRender?.(record, column);
            if (!options) return;
            const { rules = [], disabled } = options;
            if (!disabled && rules.length) {
              doFieldValidate(rules, getCellValue(record, dataIndex), getRowKey(record, record.index), dataIndex);
            }
          });
        });
        const { required, validate } = getTableLog();
        const result = [...required, ...validate];
        // 定位未通过校验的字段
        if (result.length) {
          scrollYToRecord(result[0].rowKey);
          forceUpdate();
        }
        return { required, validate };
      },
    };
  });
};

export default useImperativeMethod;
