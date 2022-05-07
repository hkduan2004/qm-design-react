/*
 * @Author: 焦质晔
 * @Date: 2021-12-26 15:29:08
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-13 12:35:18
 */
import React from 'react';
import { isEqual } from 'lodash-es';
import ConfigContext from '../../../config-provider/context';
import { getScrollBarWidth } from '../../../_utils/scrollbar-width';
import config from '../config';

import type { IFilter, IPagination, IRecord, IRowKey, ISorter, ISuperFilter, ITableProps } from '../table/types';

export type ITableState = {
  tableData: IRecord[];
  filters: IFilter;
  sorter: ISorter;
  superFilters: ISuperFilter[];
  pagination: IPagination;
  selectionKeys: IRowKey[];
  rowExpandedKeys: IRowKey[];
  highlightKey: IRowKey;
  layout: {
    gutterWidth: number;
    tableWidth: number;
    tableBodyWidth: number;
    tableBodyHeight: number;
    viewportHeight: number;
    headerHeight: number;
    footerHeight: number;
    tableAutoHeight: number;
    tableFullHeight: number;
  };
  permission: {
    export: boolean;
    import: boolean;
    print: boolean;
  };
  spinning: boolean;
  scrollX: boolean;
  scrollY: boolean;
  isPingLeft: boolean;
  isPingRight: boolean;
  isFullScreen: boolean;
};

const useTableState = <T extends ITableProps>(props: T) => {
  const { paginationConfig, rowSelection, expandable, rowHighlight } = props;

  const { global } = React.useContext(ConfigContext)!;

  const initialPage: IPagination = {
    current: config.pagination.current,
    pageSize: paginationConfig?.pageSize ?? global?.table?.pagination?.pageSize ?? config.pagination.pageSize,
    total: 0,
  };

  const initialSelectionKeys: IRowKey[] = rowSelection?.selectedRowKeys ?? rowSelection?.defaultSelectedRowKeys ?? [];

  const initialRowExpandedKeys: IRowKey[] = expandable?.expandedRowKeys ?? expandable?.defaultExpandedRowKeys ?? [];

  const [tableData, setTableData] = React.useState<ITableState['tableData']>([]);

  const [filters, setFilters] = React.useReducer<(state: IFilter, payload: IFilter) => IFilter>((state, payload) => {
    if (!isEqual(state, payload)) {
      return payload;
    }
    return state;
  }, {});

  const [sorter, setSorter] = React.useReducer<(state: ISorter, payload: ISorter) => ISorter>((state, payload) => {
    if (!isEqual(state, payload)) {
      return payload;
    }
    return state;
  }, {});

  const [superFilters, setSuperFilters] = React.useReducer<(state: ISuperFilter[], payload: ISuperFilter[]) => ISuperFilter[]>((state, payload) => {
    if (!isEqual(state, payload)) {
      return payload;
    }
    return state;
  }, []);

  const [pagination, setPagination] = React.useState<ITableState['pagination']>(initialPage);

  const [selectionKeys, setSelectionKeys] = React.useReducer<(state: IRowKey[], payload: IRowKey[]) => IRowKey[]>((state, payload) => {
    if (!isEqual(state, payload)) {
      return payload;
    }
    return state;
  }, initialSelectionKeys);

  const [rowExpandedKeys, setRowExpandedKeys] = React.useReducer<(state: IRowKey[], payload: IRowKey[]) => IRowKey[]>((state, payload) => {
    if (!isEqual(state, payload)) {
      return payload;
    }
    return state;
  }, initialRowExpandedKeys);

  const [highlightKey, setHighlightKey] = React.useState<ITableState['highlightKey']>(rowHighlight?.currentRowKey ?? '');

  const [layout, setLayout] = React.useState<ITableState['layout']>({
    // 滚动条宽度
    gutterWidth: getScrollBarWidth(),
    // 表格宽度
    tableWidth: 0,
    // 表格体宽度
    tableBodyWidth: 0,
    // 表格体内容高度
    tableBodyHeight: 0,
    // 表格体父容器（视口）高度
    viewportHeight: 0,
    // 头部高度
    headerHeight: 0,
    // 底部高度
    footerHeight: 0,
    // 自动计算的表格高度
    tableAutoHeight: 0,
    // 全屏的表格高度
    tableFullHeight: 0,
  });

  const [permission, setPermission] = React.useState<ITableState['permission']>({
    export: true,
    import: true,
    print: true,
  });

  const [spinning, setSpinning] = React.useState<ITableState['spinning']>(false);

  const [scrollX, setScrollX] = React.useState<ITableState['scrollX']>(false);

  const [scrollY, setScrollY] = React.useState<ITableState['scrollY']>(false);

  const [isPingLeft, setPingLeft] = React.useState<ITableState['isPingLeft']>(false);

  const [isPingRight, setPingRight] = React.useState<ITableState['isPingRight']>(false);

  const [isFullScreen, setFullScreen] = React.useState<ITableState['isFullScreen']>(false);

  return {
    tableData,
    setTableData,
    filters,
    setFilters,
    sorter,
    setSorter,
    superFilters,
    setSuperFilters,
    pagination,
    setPagination,
    selectionKeys,
    setSelectionKeys,
    rowExpandedKeys,
    setRowExpandedKeys,
    highlightKey,
    setHighlightKey,
    layout,
    permission,
    setPermission,
    setLayout,
    spinning,
    setSpinning,
    scrollX,
    setScrollX,
    scrollY,
    setScrollY,
    isPingLeft,
    setPingLeft,
    isPingRight,
    setPingRight,
    isFullScreen,
    setFullScreen,
  };
};

export default useTableState;
