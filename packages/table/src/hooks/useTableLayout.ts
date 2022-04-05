/*
 * @Author: 焦质晔
 * @Date: 2021-12-26 20:31:13
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 20:54:38
 */
import React from 'react';
import { isObject, isUndefined } from '../../../_utils/util';
import { deepFindColumn, getAllTableData, findFirstColumn, findLastColumn, parseHeight } from '../utils';
import { DEFAULT_DISTANCE, getRowKeyType } from '../table/types';
import config from '../config';

import type { IColumn, IRecord, IRowKey, ITableProps } from '../table/types';
import type { ITableState } from './useTableState';
import type { ITableRef } from './useTableRef';
import type { ComponentSize } from '../../../_utils/types';

type IExtra = {
  getRowKey: getRowKeyType;
  tableRef: React.MutableRefObject<ITableRef>;
  $size: ComponentSize;
  tableColumns: IColumn[];
  flattenColumns: IColumn[];
  leftFixedColumns: IColumn[];
  layout: ITableState['layout'];
  scrollY: boolean;
  tableData: IRecord[];
  showFooter: boolean;
  showPagination: boolean;
  isWebPagination: boolean;
  isFullScreen: boolean;
  setLayout: <T extends ITableState['layout']>(layout: T | ((prev: T) => T)) => void;
  setScrollX: (scrollX: boolean) => void;
  setScrollY: (scrollY: boolean) => void;
  setElementStore: (key: string, value: HTMLElement) => void;
  setScrollYStore: (option: ITableRef['scrollYStore']) => void;
  setShouldToTop: (value: boolean) => void;
};

const useTableLayout = <T extends ITableProps>(props: T, extra: IExtra) => {
  const { height, minHeight, maxHeight, resizable, showHeader, spanMethod } = props;
  const {
    getRowKey,
    tableRef,
    $size,
    tableColumns,
    flattenColumns,
    leftFixedColumns,
    layout,
    scrollY,
    tableData,
    showFooter,
    showPagination,
    isWebPagination,
    isFullScreen,
    setLayout,
    setScrollX,
    setScrollY,
    setElementStore,
    setScrollYStore,
    setShouldToTop,
  } = extra;

  // 解决 updateColumnsWidth 方法中使用 `scrollY` 延迟导致的问题
  const scrollYRef = React.useRef<boolean>(scrollY);

  const createElementStore = (option: Record<string, HTMLElement>) => {
    Object.keys(option).forEach((key) => {
      setElementStore(key, option[key]);
    });
  };

  const tableStyles = React.useMemo(() => {
    const { tableFullHeight, tableAutoHeight } = layout;
    const result: React.CSSProperties = {};
    if (minHeight) {
      Object.assign(result, { minHeight: `${parseHeight(minHeight)}px` });
    }
    if (maxHeight) {
      Object.assign(result, { maxHeight: `${parseHeight(maxHeight)}px` });
    }
    if (isFullScreen) {
      return { ...result, height: `${tableFullHeight}px` };
    }
    if (height) {
      return { ...result, height: height !== 'auto' ? `${parseHeight(height)}px` : `${tableAutoHeight}px` };
    }
    return result;
  }, [height, maxHeight, minHeight, isFullScreen, layout]);

  // 更新列宽度
  const updateColumnsWidth = () => {
    const { elementStore } = tableRef.current;
    const tableWidth: number = elementStore[`$table`]!.clientWidth;
    const scrollYWidth: number = scrollYRef.current ? layout.gutterWidth : 0;
    const { defaultColumnWidth } = config;

    // 没有指定宽度的列
    const flexColumns: IColumn[] = flattenColumns.filter((column: IColumn) => typeof column.width !== 'number');
    // 表格最小宽度
    let bodyMinWidth = 0;

    flattenColumns.forEach((column: IColumn) => {
      if (typeof column.width === 'number') {
        column.renderWidth = null;
      }
    });

    if (flexColumns.length > 0) {
      // 获取表格的最小宽度
      flattenColumns.forEach((column: IColumn) => {
        bodyMinWidth += Number(column.width) || defaultColumnWidth;
      });

      // 最小宽度小于容器宽度 -> 没有横向滚动条
      if (bodyMinWidth <= tableWidth - scrollYWidth) {
        setScrollX(false);

        // 富余的宽度
        const totalFlexWidth = tableWidth - scrollYWidth - bodyMinWidth;

        if (flexColumns.length === 1 && resizable) {
          flexColumns[0].renderWidth = defaultColumnWidth + totalFlexWidth;
        } else {
          // 把富余的宽度均分给除第一列的其他列，剩下来的给第一列（避免宽度均分的时候除不尽）
          const allColumnsWidth = flexColumns.reduce((prev, column) => prev + defaultColumnWidth, 0);
          const flexWidthPerPixel = totalFlexWidth / allColumnsWidth;
          let noneFirstWidth = 0;

          flexColumns.forEach((column, index) => {
            if (index === 0) return;
            const flexWidth = Math.floor(defaultColumnWidth * flexWidthPerPixel);
            noneFirstWidth += flexWidth;
            column.renderWidth = defaultColumnWidth + flexWidth;
          });

          if (resizable) {
            flexColumns[0].renderWidth = defaultColumnWidth + totalFlexWidth - noneFirstWidth;
          }
        }
      } else {
        // 最小宽度大于容器宽度 -> 有横向滚动条
        setScrollX(true);

        // 对没有设置宽度的列宽度设为默认宽度
        flexColumns.forEach((column) => {
          column.renderWidth = defaultColumnWidth;
        });
      }

      // 表格内容宽度
      setLayout((prev) => Object.assign({}, prev, { tableBodyWidth: Math.max(bodyMinWidth, tableWidth) }));
    } else {
      flattenColumns.forEach((column: IColumn) => {
        column.renderWidth = Number(column.width) || defaultColumnWidth;
        bodyMinWidth += column.renderWidth;
      });

      setScrollX(bodyMinWidth > tableWidth);

      // 表格内容宽度
      setLayout((prev) => Object.assign({}, prev, { tableBodyWidth: bodyMinWidth }));
    }

    // 表格宽度
    setLayout((prev) => Object.assign({}, prev, { tableWidth }));
  };

  // 更新元素高度
  const updateElsHeight = () => {
    const { elementStore, scrollYLoad, resizeState } = tableRef.current;
    // 祖先元素有 display: none 时
    if (!elementStore[`$table`]!.offsetParent) return;
    const tableOuterHeight = elementStore[`$table`]!.offsetHeight;
    const headerHeight = showHeader ? elementStore[`$header`]!.offsetHeight : layout.headerHeight;
    const footerHeight = showFooter ? elementStore[`$footer`]!.offsetHeight : layout.footerHeight;
    // body 可视区高度
    const viewportHeight = tableOuterHeight - headerHeight - footerHeight;
    const tableBodyHeight = elementStore[`$tableBody`]!.offsetHeight;
    // 纵向滚动条
    const isScrollY = scrollYLoad || tableBodyHeight > viewportHeight;
    // 全屏高度计算
    let tableFullHeight = 0;
    if (isFullScreen) {
      const toperHeight = elementStore[`$toper`] ? elementStore[`$toper`].offsetHeight + DEFAULT_DISTANCE : 0;
      const pagerHeight = elementStore[`$pager`] ? elementStore[`$pager`].offsetHeight + DEFAULT_DISTANCE : 0;
      tableFullHeight = resizeState.winHeight - toperHeight - pagerHeight - DEFAULT_DISTANCE * 2;
    }
    if (viewportHeight !== layout.viewportHeight) {
      updateScrollYStore(viewportHeight);
    }
    scrollYRef.current = isScrollY;
    // setState 设置
    setScrollY(isScrollY);
    setLayout((prev) => Object.assign({}, prev, { headerHeight, footerHeight, viewportHeight, tableBodyHeight, tableFullHeight }));
  };

  // 更新虚拟滚动参数
  const updateScrollYStore = (viewportHeight: number) => {
    const { scrollYStore, isIE } = tableRef.current;
    const { startIndex, endIndex } = scrollYStore;
    const rowYHeight: number = config.rowHeightMaps[$size];
    const visibleYSize = Math.max(8, Math.ceil(viewportHeight / rowYHeight) + 2);
    const offsetYSize = !isIE ? 0 : 5;
    setScrollYStore(
      Object.assign({}, scrollYStore, {
        visibleSize: visibleYSize,
        offsetSize: offsetYSize,
        endIndex: Math.max(startIndex + visibleYSize + offsetYSize, endIndex),
        rowHeight: rowYHeight,
      })
    );
  };

  // 单元格合并
  const getSpan = (row: IRecord, column: IColumn, rowIndex: number, columnIndex: number, tableData: IRecord[]) => {
    let rowSpan = 1;
    let colSpan = 1;
    const fn = spanMethod;
    if (typeof fn === 'function') {
      const result = fn({ row, column, rowIndex, columnIndex, tableData });
      if (Array.isArray(result)) {
        rowSpan = result[0];
        colSpan = result[1];
      } else if (isObject(result)) {
        rowSpan = result.rowSpan;
        colSpan = result.colSpan;
      }
    }
    return { rowSpan, colSpan };
  };

  // 左侧固定列边距
  const getStickyLeft = (rowKey: IRowKey) => {
    // 说明是表头分组的上层元素，递归查找最下层的第一个后代元素
    if (flattenColumns.findIndex((x: IColumn) => x.dataIndex === rowKey) < 0) {
      rowKey = findFirstColumn(deepFindColumn(tableColumns, rowKey) as IColumn).dataIndex;
    }
    let l = 0;
    for (let i = 0; i < flattenColumns.length; i++) {
      const column: IColumn = flattenColumns[i];
      if (column.dataIndex === rowKey) break;
      l += parseHeight(column.width || column.renderWidth || 0) as number;
    }
    return l;
  };

  // 右侧固定列边距
  const getStickyRight = (rowKey: IRowKey) => {
    // 说明是表头分组的上层元素，递归查找最下层的最后一个后代元素
    if (flattenColumns.findIndex((x: IColumn) => x.dataIndex === rowKey) < 0) {
      rowKey = findLastColumn(deepFindColumn(tableColumns, rowKey) as IColumn).dataIndex;
    }
    let r = 0;
    for (let i = flattenColumns.length - 1; i >= 0; i--) {
      const column: IColumn = flattenColumns[i];
      if (column.dataIndex === rowKey) break;
      r += parseHeight(column.width || column.renderWidth || 0) as number;
    }
    return r;
  };

  // 滚动到指定列
  const scrollXToColumn = (dataIndex: string, index?: number) => {
    const { elementStore } = tableRef.current;
    const v = typeof index === 'undefined' ? flattenColumns.findIndex((x) => x.dataIndex === dataIndex) : index;
    if (v < 0) return;
    const fixedWidth = leftFixedColumns.map((x) => x.width || x.renderWidth || config.defaultColumnWidth).reduce((prev, curr) => prev + curr, 0);
    const $tableBodyOuter = elementStore[`$tableBody`]!.parentNode as HTMLElement;
    $tableBodyOuter.scrollLeft = (elementStore[`$tableBody`]!.querySelectorAll('tbody > tr > td')[v] as HTMLElement).offsetLeft - fixedWidth;
  };

  // 滚动到指定行
  const scrollYToRecord = (rowKey: IRowKey, index?: number) => {
    const { elementStore, scrollYStore, allTableData } = tableRef.current;
    const $tableBodyOuter = elementStore[`$tableBody`]!.parentNode as HTMLElement;
    if (!isUndefined(index) && index >= 0) {
      $tableBodyOuter.scrollTop = index * scrollYStore.rowHeight;
    } else {
      const pageTableData = isWebPagination ? getAllTableData(tableData) : allTableData;
      const v = pageTableData.findIndex((row) => rowKey === getRowKey(row, row.index));
      $tableBodyOuter.scrollTop = (v < 0 ? 0 : v) * scrollYStore.rowHeight;
    }
  };

  // 判断指定行是否在 tableBody 视口中
  const rowInViewport = (index: number) => {
    const { elementStore, scrollYStore } = tableRef.current;
    const { viewportHeight, gutterWidth } = layout;
    const st = index * scrollYStore.rowHeight;
    const $tableBodyOuter = elementStore[`$tableBody`]!.parentNode as HTMLElement;
    // 不在 tableBody 视口范围
    if (
      st < $tableBodyOuter.scrollTop ||
      st + scrollYStore.rowHeight > $tableBodyOuter.scrollTop + (scrollX ? viewportHeight - gutterWidth : viewportHeight)
    ) {
      return false;
    }
    return true;
  };

  // 计算表格高度
  const calcTableHeight = () => {
    if (height !== 'auto') return;
    const { elementStore, resizeState } = tableRef.current;
    const pagerHeight = showPagination ? elementStore[`$pager`]!.offsetHeight + DEFAULT_DISTANCE : 0;
    const tableAutoHeight = resizeState.winHeight - elementStore[`$table`]!.getBoundingClientRect().top - pagerHeight - DEFAULT_DISTANCE;
    setLayout((prev) => Object.assign({}, prev, { tableAutoHeight }));
  };

  // 重置滚动条位置
  const resetTableScroll = () => {
    const { shouldToTop } = tableRef.current;
    if (shouldToTop) {
      scrollYToRecord('', 0);
      // scrollXToColumn('', 0);
    }
    setShouldToTop(true);
  };

  // 渲染方法
  const doLayout = () => {
    updateElsHeight();
    updateColumnsWidth();
  };

  return {
    createElementStore,
    tableStyles,
    getSpan,
    getStickyLeft,
    getStickyRight,
    scrollXToColumn,
    scrollYToRecord,
    rowInViewport,
    calcTableHeight,
    resetTableScroll,
    doLayout,
  };
};

export default useTableLayout;
