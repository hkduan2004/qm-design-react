/*
 * @Author: 焦质晔
 * @Date: 2022-01-10 16:51:21
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 12:18:32
 */
import React from 'react';
import { cloneDeep, isEqual } from 'lodash-es';
import { warn } from '../../../_utils/error';
import { nextTick } from '../../../_utils/util';
import useUpdateEffect from '../../../hooks/useUpdateEffect';

import type { ITableRef } from './useTableRef';
import type { TableBodyRef, IColumn, IPagination, IRecord, IRowKey, ITableProps } from '../table/types';

type IExtra = {
  tableRef: React.MutableRefObject<ITableRef>;
  topElementRef: React.RefObject<HTMLDivElement>;
  tableElementRef: React.RefObject<HTMLDivElement>;
  tableBodyRef: React.RefObject<TableBodyRef>;
  resizableBarRef: React.RefObject<HTMLDivElement>;
  pagination: IPagination;
  selectionKeys: IRowKey[];
  rowExpandedKeys: IRowKey[];
  highlightKey: IRowKey;
  summationRows: Record<string, number | string>[];
  showSummary: boolean;
  isWebPagination: boolean;
  isScrollPagination: boolean;
  isTreeTable: boolean;
  toLastPage: () => void;
  setHandleState: (option: ITableRef['handleState']) => void;
  scrollYToRecord: (rowKey: IRowKey, index?: number) => void;
  setOriginColumns: (columns: IColumn[]) => void;
  setSelectionKeys: (rowKeys: IRowKey[]) => void;
  setSelectionRows: (records: IRecord[]) => void;
  setRowExpandedKeys: (rowKeys: IRowKey[]) => void;
  setHighlightKey: (rowKey: IRowKey) => void;
  setResizeState: (option: ITableRef['resizeState']) => void;
  calcTableHeight: () => void;
  createSelectionKeys: (rowKeys?: IRowKey[]) => IRowKey[];
  createSelectionRows: (rowKeys: IRowKey[]) => IRecord[];
  createRowExpandedKeys: () => IRowKey[];
  createElementStore: (option: Record<string, HTMLElement>) => void;
  triggerScrollYEvent: (st: number) => void;
  forceUpdate: () => void;
  initialTable: () => void;
  destroy: () => void;
};

const useTableEffect = <T extends ITableProps>(props: T, extra: IExtra) => {
  const { columns, summation, rowSelection, expandable, rowHighlight } = props;
  const {
    tableRef,
    topElementRef,
    tableElementRef,
    tableBodyRef,
    resizableBarRef,
    pagination,
    selectionKeys,
    rowExpandedKeys,
    highlightKey,
    summationRows,
    showSummary,
    isWebPagination,
    isScrollPagination,
    isTreeTable,
    toLastPage,
    setHandleState,
    scrollYToRecord,
    setSelectionKeys,
    setOriginColumns,
    setSelectionRows,
    setRowExpandedKeys,
    setHighlightKey,
    setResizeState,
    calcTableHeight,
    createSelectionKeys,
    createSelectionRows,
    createRowExpandedKeys,
    createElementStore,
    triggerScrollYEvent,
    forceUpdate,
    initialTable,
    destroy,
  } = extra;

  const { elementStore, handleState, scrollYLoad } = tableRef.current;
  const summationRowsTemp = React.useRef<Record<string, number | string>[]>(summationRows);

  useUpdateEffect(() => {
    if (!rowSelection) return;
    const { onChange } = rowSelection;
    if (rowSelection.type === 'radio') {
      tableBodyRef.current!.setClickedValues(selectionKeys.length ? [selectionKeys[0], ''] : []);
    }
    setSelectionRows(createSelectionRows(selectionKeys));
    onChange?.(selectionKeys, tableRef.current.selectionRows);
    if (showSummary) {
      forceUpdate();
    }
  }, [selectionKeys]);

  useUpdateEffect(() => {
    if (!expandable) return;
    const { allTableData, allRowKeys } = tableRef.current;
    const { onChange } = expandable;
    onChange?.(
      rowExpandedKeys,
      rowExpandedKeys.map((x) => allTableData[allRowKeys.findIndex((k) => k === x)])
    );
  }, [rowExpandedKeys]);

  useUpdateEffect(() => {
    const { allTableData, allRowKeys } = tableRef.current;
    if (isTreeTable) {
      setRowExpandedKeys(createRowExpandedKeys());
    }
    if (rowHighlight) {
      tableBodyRef.current!.setClickedValues(highlightKey ? [highlightKey, ''] : []);
      rowHighlight.onChange?.(highlightKey, allTableData[allRowKeys.findIndex((x) => x === highlightKey)] ?? null);
    }
  }, [highlightKey]);

  useUpdateEffect(() => {
    if (isEqual(summationRows, summationRowsTemp.current)) return;
    summationRowsTemp.current = summationRows;
    if (showSummary && summation) {
      summation.onChange?.(summationRows);
    }
  }, [summationRows]);

  useUpdateEffect(() => {
    const _selectionKeys = createSelectionKeys(rowSelection!.selectedRowKeys);
    if (isEqual(_selectionKeys, selectionKeys)) return;
    setSelectionKeys(_selectionKeys);
    if (isTreeTable) {
      setRowExpandedKeys(createRowExpandedKeys());
    }
  }, [rowSelection?.selectedRowKeys]);

  useUpdateEffect(() => {
    const _rowExpandedKeys = createRowExpandedKeys();
    if (isEqual(_rowExpandedKeys, rowExpandedKeys)) return;
    setRowExpandedKeys(_rowExpandedKeys);
  }, [expandable?.expandedRowKeys]);

  useUpdateEffect(() => {
    const { currentRowKey } = rowHighlight!;
    if (currentRowKey === highlightKey) return;
    setHighlightKey(currentRowKey ?? '');
  }, [rowHighlight?.currentRowKey]);

  useUpdateEffect(() => {
    const { insert, remove } = handleState;
    if (insert) {
      if (isWebPagination) {
        toLastPage();
      }
      scrollYToRecord('', 100000);
    }
    if (insert || remove) {
      setHandleState({ insert: false, remove: false });
    }
  }, [pagination.total]);

  useUpdateEffect(() => {
    if (scrollYLoad) {
      triggerScrollYEvent((elementStore[`$tableBody`]!.parentNode as HTMLElement).scrollTop);
    }
  }, [scrollYLoad]);

  useUpdateEffect(() => {
    if (scrollYLoad) {
      if (!(props.height || props.maxHeight)) {
        warn('Table', '必须设置组件参数 `height` 或 `maxHeight`');
      }
      if (!props.ellipsis) {
        warn('Table', '必须设置组件参数 `ellipsis`');
      }
    }
    if (isScrollPagination) {
      if (!(props.height || props.maxHeight)) {
        warn('Table', '必须设置组件参数 `height` 或 `maxHeight`');
      }
    }
  }, [scrollYLoad, isScrollPagination]);

  // window resize 监听函数
  const winResizeHandler = () => {
    const { resizeState } = tableRef.current;
    const { winHeight: oldWinHeight } = resizeState;
    const winHeight = window.innerHeight;
    const isYChange = winHeight !== oldWinHeight;
    if (isYChange) {
      setResizeState(Object.assign({}, resizeState, { winHeight: winHeight }));
      calcTableHeight();
    }
  };

  const bindResizeEvent = () => {
    window.addEventListener('resize', winResizeHandler, false);
  };

  const removeResizeEvent = () => {
    window.addEventListener('resize', winResizeHandler);
  };

  React.useEffect(() => {
    createElementStore({
      [`$toper`]: topElementRef.current!,
      [`$table`]: tableElementRef.current!,
      [`$resizableBar`]: resizableBarRef.current!,
    });
    setOriginColumns(cloneDeep(columns));
    initialTable();
    bindResizeEvent();
    nextTick(() => calcTableHeight());
    return () => {
      destroy();
      removeResizeEvent();
    };
  }, []);
};

export default useTableEffect;
