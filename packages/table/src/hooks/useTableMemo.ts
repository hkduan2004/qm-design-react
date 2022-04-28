/*
 * @Author: 焦质晔
 * @Date: 2021-12-25 20:09:42
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-28 08:53:32
 */
import React from 'react';
import {
  createFilterColumns,
  columnsFlatMap,
  convertToRows,
  createOrderBy,
  getCellValue,
  setCellValue,
  formatNumber,
  getGroupValidData,
} from '../utils';
import { t } from '../../../locale';
import config from '../config';

import type {
  ITableProps,
  IColumn,
  IDerivedColumn,
  IRowSelection,
  IExpandable,
  IRecord,
  getRowKeyType,
  IFetchParams,
  ISorter,
  IFilter,
  IPagination,
  ISuperFilter,
} from '../table/types';
import type { ITableRef } from './useTableRef';
import type { Nullable } from '../../../_utils/types';

type IExtra = {
  getRowKey: getRowKeyType;
  tableRef: React.MutableRefObject<ITableRef>;
  tableFullData: IRecord[];
  tableData: IRecord[];
  sorter: ISorter;
  filters: IFilter;
  superFilters: ISuperFilter[];
  pagination: IPagination;
};

const deepMapColumns = (columns: IColumn[]): IColumn[] => {
  return columns.map((column) => {
    if (column.children) {
      column.children.forEach((subColumn: IDerivedColumn) => {
        subColumn.parentDataIndex = column.dataIndex;
        if (column.fixed) {
          subColumn.fixed = column.fixed;
        } else {
          delete subColumn.fixed;
        }
      });
      column.children = deepMapColumns(column.children);
    }
    return column;
  });
};

const createSelectionColumn = (options?: IRowSelection): Nullable<IDerivedColumn> => {
  if (!options) {
    return null;
  }
  const { type } = options;
  return {
    dataIndex: config.selectionColumn,
    title: type === 'radio' ? t('qm.table.config.selectionText') : '',
    width: config.selectionColumnWidth,
    fixed: 'left',
    type,
  };
};

const createExpandableColumn = (options?: IExpandable): Nullable<IDerivedColumn> => {
  if (!options?.expandedRowRender) {
    return null;
  }
  return {
    dataIndex: config.expandableColumn,
    title: '',
    width: config.selectionColumnWidth,
    fixed: 'left',
    type: 'expand',
  };
};

const createTableColumns = (columns: IColumn[], rowSelection?: IRowSelection, expandable?: IExpandable): IColumn[] => {
  const results = deepMapColumns(columns);
  const selectionColumn = createSelectionColumn(rowSelection);
  const expandableColumn = createExpandableColumn(expandable);
  selectionColumn && results.unshift(selectionColumn);
  expandableColumn && results.unshift(expandableColumn);
  return createFilterColumns(results);
};

// 格式化 表头筛选 和 高级检索 参数
const formatFiltersParams = (filters: IFilter, superFilters: any[]) => {
  const result: ISuperFilter[] = [];
  // 表头筛选
  if (Object.keys(filters).length) {
    for (const key in filters) {
      const [fieldName, type] = config.showFilterType ? key.split('|') : [key, ''];
      const target = filters[key];
      Object.keys(target).forEach((k) => {
        result.push({
          type,
          bracketLeft: '',
          fieldName,
          expression: k,
          value: target[k],
          bracketRight: '',
          logic: 'and',
        });
      });
    }
  }
  // 高级检索
  if (superFilters.length) {
    superFilters.forEach((x) => {
      result.push({
        type: config.showFilterType ? x.fieldType : '', // 筛选器类型
        bracketLeft: x.bracketLeft, // 左括号
        fieldName: x.fieldName, // 字段名
        expression: x.expression, // 运算符号
        value: x.condition, // 值
        bracketRight: x.bracketRight, // 右括号
        logic: x.logic, // 逻辑符号
      });
    });
  }
  // 移除最后的 逻辑符号
  if (result.length) {
    result[result.length - 1].logic = '';
  }
  return result;
};

const createColumnSummary = (columns: IColumn[]) => {
  return columns
    .filter((x) => x.summation!.dataKey)
    .map((x) => `sum|${x.dataIndex}`)
    .join(',');
};

const useTableMemo = <T extends ITableProps>(props: T, extra: IExtra) => {
  const {
    fetch,
    columns,
    height,
    minHeight,
    maxHeight,
    border = true,
    rowSelection,
    summation,
    expandable,
    webPagination,
    scrollPagination,
    showSuperSearch,
    showFastSearch,
    showTableImport,
    showSelectCollection,
    footRender,
  } = props;
  const { tableRef, tableFullData, tableData, sorter, filters, superFilters, pagination } = extra;
  const { selectionRows, summaries } = tableRef.current;

  // 创建底部合计行
  const createSummationRows = () => {
    // 合计结果
    const res: Record<string, number | string> = {};
    summationColumns.forEach((column) => {
      const { dataIndex, precision, summation } = column;
      const { sumBySelection, displayWhenNotSelect, unit } = summation!;
      const tableDataList = !isGroupSubtotal ? tableFullData : getGroupValidData(tableFullData);
      // 未选择时，显示合计结果
      const notSelectAndDisplay = !selectionRows.length && !!displayWhenNotSelect;
      // 可选择列动态合计
      const values = !sumBySelection || notSelectAndDisplay ? tableDataList : selectionRows;
      // 累加求和
      let result = values.reduce((prev, curr) => {
        if (curr?.[config.summaryIgnore]) {
          return prev;
        }
        const value = Number(getCellValue(curr, dataIndex));
        if (!Number.isNaN(value)) {
          return prev + value;
        }
        return prev;
      }, 0);
      // 服务端合计
      if (Object.keys(summaries).includes(dataIndex) && (!sumBySelection || notSelectAndDisplay)) {
        result = Number(getCellValue(summaries, dataIndex));
      }
      // 设置合计值 - 数值类型
      setCellValue(res, dataIndex, result);
      // 处理数值精度
      let result2: string = precision! >= 0 ? result.toFixed(precision) : result.toString();
      // 处理数据格式化
      result2 = formatNumber(result2);
      // 设置合计单元格文本 - 字符串
      setCellValue(res, `${dataIndex}_text`, unit ? `${result2} ${unit}` : result2);
    });
    return [res];
  };

  const isFetch = React.useMemo(() => !!fetch?.api, [fetch?.api]);

  const isWebPagination = React.useMemo(() => !isFetch && !!webPagination, [isFetch, webPagination]);

  const isScrollPagination = React.useMemo(() => isFetch && !!scrollPagination, [isFetch, scrollPagination]);

  const showPagination = React.useMemo(() => (isFetch || isWebPagination) && !isScrollPagination, [isFetch, isWebPagination, isScrollPagination]);

  const shouldUpdateHeight = React.useMemo(() => !!(height || minHeight || maxHeight), [height, minHeight, maxHeight]);

  const tableColumns = React.useMemo(() => createTableColumns(columns, rowSelection, expandable), [columns, rowSelection, expandable]);

  const flattenColumns = React.useMemo(() => columnsFlatMap(tableColumns), [tableColumns]);

  const editableColumns = React.useMemo(() => flattenColumns.filter((x) => typeof x.editRender === 'function'), [flattenColumns]);

  const summationColumns = React.useMemo(() => flattenColumns.filter((column) => !!column.summation), [flattenColumns]);

  const leftFixedColumns = React.useMemo(() => flattenColumns.filter((column) => column.fixed === 'left'), [flattenColumns]);

  const rightFixedColumns = React.useMemo(() => flattenColumns.filter((column) => column.fixed === 'right'), [flattenColumns]);

  const firstDataIndex = React.useMemo(() => {
    const _columns = flattenColumns.filter((x) => ![config.expandableColumn, config.selectionColumn, config.operationColumn].includes(x.dataIndex));
    return _columns.length ? _columns[0].dataIndex : '';
  }, [flattenColumns]);

  const showSummary = React.useMemo(() => summationColumns.length > 0, [summationColumns]);

  const showFooter = React.useMemo(() => !!footRender || showSummary, [footRender, showSummary]);

  const isHeadGroup = React.useMemo(() => convertToRows(tableColumns).length > 1, [tableColumns]);

  const bordered = React.useMemo(() => border || isHeadGroup, [border, isHeadGroup]);

  const isHeadSorter = React.useMemo(() => flattenColumns.some((column) => column.sorter), [flattenColumns]);

  const isHeadFilter = React.useMemo(() => flattenColumns.some((column) => column.filter), [flattenColumns]);

  const isServiceSummation = React.useMemo(() => summationColumns.some((x) => !!x.summation!.dataKey), [summationColumns]);

  const isTableImport = React.useMemo(() => !isFetch && !!showTableImport, [isFetch, showTableImport]);

  const isSelectCollection = React.useMemo(() => !!showSelectCollection && rowSelection?.type === 'checkbox', [showSelectCollection, rowSelection]);

  const isSuperSearch = React.useMemo(() => !!showSuperSearch && isHeadFilter, [showSuperSearch, isHeadFilter]);

  const isFastSearch = React.useMemo(() => !isFetch && !!showFastSearch && isHeadFilter, [isFetch, showFastSearch, isHeadFilter]);

  const isGroupSummary = React.useMemo(() => flattenColumns.some((column) => !!column.groupSummary), [flattenColumns]);

  const isGroupSubtotal = React.useMemo(() => !!summation?.groupItems?.length, [summation]);

  const isTreeTable = React.useMemo(() => tableFullData.some((x) => Array.isArray(x.children) && x.children.length), [tableFullData]);

  const isTableEmpty = React.useMemo(() => !tableData.length, [tableData]);

  const summationRows = React.useMemo(() => createSummationRows(), [tableFullData, selectionRows, summaries]);

  const summationQuery = React.useMemo(() => createColumnSummary(summationColumns), [summationColumns]);

  const fetchParams = React.useMemo<IFetchParams>(() => {
    const orderby = createOrderBy(sorter);
    const query = formatFiltersParams(filters, superFilters);
    const _sorter = orderby ? { [config.sorterFieldName]: orderby } : null;
    const _filter = query.length ? { [config.filterFieldName]: query } : null;
    const _summary = isServiceSummation ? { [config.groupSummary.summaryFieldName]: summationQuery, usedJH: 1 } : null;
    const _params = fetch?.params ?? null;
    const _pager = { [config.currentPageName]: pagination.current, [config.pageSizeName]: pagination.pageSize };
    return {
      ..._sorter,
      ..._filter,
      ..._summary,
      ..._params,
      ..._pager,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch?.params, pagination.current, pagination.pageSize, sorter, filters, superFilters, summationQuery, isServiceSummation]);

  return {
    isFetch,
    isWebPagination,
    isScrollPagination,
    showPagination,
    shouldUpdateHeight,
    tableColumns,
    flattenColumns,
    editableColumns,
    summationColumns,
    leftFixedColumns,
    rightFixedColumns,
    firstDataIndex,
    showSummary,
    showFooter,
    isHeadGroup,
    bordered,
    isHeadSorter,
    isHeadFilter,
    isServiceSummation,
    isSelectCollection,
    isTableImport,
    isSuperSearch,
    isFastSearch,
    isGroupSummary,
    isGroupSubtotal,
    isTreeTable,
    isTableEmpty,
    summationRows,
    fetchParams,
  };
};

export default useTableMemo;
