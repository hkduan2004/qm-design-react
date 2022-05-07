/*
 * @Author: 焦质晔
 * @Date: 2022-01-12 16:14:11
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-28 08:54:02
 */
import React from 'react';
import classNames from 'classnames';
import ConfigContext from '../../../config-provider/context';
import TableContext from '../context';
import { defaultProps } from './props';
import { getPrefixCls } from '../../../_utils/prefix';
import { warn } from '../../../_utils/error';
import { EAlign } from './types';
import TableManager from '../manager';

import useTableRef from '../hooks/useTableRef';
import useTableState from '../hooks/useTableState';
import useTableMemo from '../hooks/useTableMemo';
import useTableCore from '../hooks/useTableCore';
import useTableLayout from '../hooks/useTableLayout';
import useTableEffect from '../hooks/useTableEffect';
import useForceUpdate from '../../../hooks/useForceUpdate';
import useImperativeMethod from '../hooks/useImperativeMethod';

import type { getRowKeyType, IRecord, IRowKey, ITableContext, ITableProps, TableRef, TableBodyRef } from './types';

import Spin from '../../../spin';
import Alert from '../alert';
import FullScreen from '../full-screen';
import Reload from '../reload';
import TablePrint from '../print';
import TableImport from '../import';
import TableExport from '../export';
import SelectCollection from '../select-collection';
import GroupSummary from '../group-summary';
import SuperSearch from '../super-search';
import FastSearch from '../fast-search';
import ColumnFilter from '../column-filter';
import TableHeader from '../header';
import TableBody from '../body';
import TableFooter from '../footer';
import TablePager from '../pager';
import TableEmpty from '../empty';

export type QmTableProps = ITableProps;

const Table = React.forwardRef<TableRef, ITableProps>((props, ref) => {
  const {
    rowKey,
    columns,
    loading,
    stripe,
    resizable,
    customClass,
    paginationConfig,
    tablePrint,
    exportExcel,
    showAlert,
    topSpaceAlign,
    showFullScreen,
    showRefresh,
    showColumnDefine,
    showHeader,
  } = props;

  const { size } = React.useContext(ConfigContext)!;
  const $size = React.useMemo(() => props.size ?? size ?? '', [props.size, size]);

  const topElementRef = React.useRef<HTMLDivElement>(null);
  const tableElementRef = React.useRef<HTMLDivElement>(null);
  const tableBodyRef = React.useRef<TableBodyRef>(null);
  const resizableBarRef = React.useRef<HTMLDivElement>(null);

  const forceUpdate = useForceUpdate();

  const getRowKey: getRowKeyType = React.useCallback(
    (row: IRecord, index: number) => {
      const key: IRowKey = typeof rowKey === 'function' ? rowKey(row, index) : row[rowKey];
      if (key === undefined) {
        warn('Table', 'Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.');
        return index;
      }
      return key;
    },
    [rowKey]
  );

  // ========== 数据缓存 ==========
  const {
    tableRef,
    tableFullData,
    setElementStore,
    setOriginColumns,
    setTableFullData,
    setTableOriginData,
    setAllTableData,
    setDeriveRowKeys,
    setScrollYStore,
    setScrollYLoad,
    setResizeState,
    setHandleState,
    setSummaries,
    setSelectionRows,
    setShouldToTop,
    setRowKeysMap,
    clearElementStore,
    clearAllRowKeysMap,
  } = useTableRef<ITableProps>(props, {
    getRowKey,
    $size,
  });

  // ========== 状态数据 ==========
  const {
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
    setLayout,
    permission,
    setPermission,
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
  } = useTableState<ITableProps>(props);

  // ========== 计算属性 ==========
  const {
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
  } = useTableMemo<ITableProps>(props, {
    getRowKey,
    tableRef,
    tableFullData,
    tableData,
    sorter,
    filters,
    superFilters,
    pagination,
  });

  // ========== 核心方法 ==========
  const {
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
  } = useTableLayout<ITableProps>(props, {
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
  });

  const {
    initialTable,
    createTableFullData,
    getTableData,
    createTableData,
    createGroupData,
    createSelectionKeys,
    createSelectionRows,
    createRowExpandedKeys,
    findParentRowKeys,
    getAllChildRowKeys,
    doFieldValidate,
    getTableLog,
    dataChange,
    tableChange,
    toLastPage,
    pagerChangeHandle,
    triggerScrollYEvent,
    scrollBottomDebouncer,
    clearTableSorter,
    clearTableFilter,
    clearSuperFilters,
    clearRowSelection,
    clearRowHighlight,
    clearTableLog,
    destroy,
  } = useTableCore<ITableProps>(props, {
    getRowKey,
    tableRef,
    tableElementRef,
    tableBodyRef,
    $size,
    tableColumns,
    tableFullData,
    pagination,
    layout,
    filters,
    sorter,
    superFilters,
    fetchParams,
    selectionKeys,
    rowExpandedKeys,
    highlightKey,
    summationColumns,
    shouldUpdateHeight,
    isFetch,
    isTreeTable,
    isWebPagination,
    isScrollPagination,
    isServiceSummation,
    isGroupSubtotal,
    doLayout,
    setTableData,
    setTableFullData,
    setTableOriginData,
    setAllTableData,
    setDeriveRowKeys,
    setPagination,
    setSpinning,
    setSorter,
    setFilters,
    setSuperFilters,
    setSelectionKeys,
    setRowExpandedKeys,
    setHighlightKey,
    setScrollYLoad,
    setScrollYStore,
    setResizeState,
    setSummaries,
    setPermission,
    setRowKeysMap,
    resetTableScroll,
    clearElementStore,
    clearAllRowKeysMap,
  });

  useTableEffect<ITableProps>(props, {
    tableRef,
    topElementRef,
    tableElementRef,
    tableBodyRef,
    resizableBarRef,
    scrollX,
    pagination,
    selectionKeys,
    rowExpandedKeys,
    highlightKey,
    showSummary,
    summationRows,
    isWebPagination,
    isScrollPagination,
    isTreeTable,
    toLastPage,
    setHandleState,
    scrollYToRecord,
    setOriginColumns,
    setSelectionKeys,
    setSelectionRows,
    setRowExpandedKeys,
    setHighlightKey,
    setResizeState,
    setPingRight,
    calcTableHeight,
    createSelectionKeys,
    createSelectionRows,
    createRowExpandedKeys,
    createElementStore,
    triggerScrollYEvent,
    forceUpdate,
    initialTable,
    destroy,
  });

  // ========== table context ===========
  const context = React.useMemo<ITableContext>(
    (): ITableContext => ({
      getRowKey,
      tableProps: props,
      tableRef,
      tableBodyRef,
      $size,
      flattenColumns,
      editableColumns,
      leftFixedColumns,
      rightFixedColumns,
      firstDataIndex,
      sorter,
      filters,
      superFilters,
      layout,
      bordered,
      showFooter,
      showSummary,
      summationRows,
      scrollX,
      scrollY,
      pagination,
      fetchParams,
      selectionKeys,
      rowExpandedKeys,
      highlightKey,
      isFetch,
      isPingLeft,
      isPingRight,
      isHeadSorter,
      isHeadFilter,
      isFullScreen,
      isTableEmpty,
      isHeadGroup,
      isTreeTable,
      isGroupSubtotal,
      isWebPagination,
      dataChange,
      tableChange,
      getTableData,
      setElementStore,
      createTableFullData,
      setSorter,
      setFilters,
      setSuperFilters,
      setSelectionKeys,
      setHighlightKey,
      setRowExpandedKeys,
      getSpan,
      getStickyLeft,
      getStickyRight,
      scrollXToColumn,
      scrollYToRecord,
      rowInViewport,
      setPagination,
      setPingLeft,
      setPingRight,
      setSpinning,
      setFullScreen,
      setShouldToTop,
      doFieldValidate,
      createTableData,
      createGroupData,
      findParentRowKeys,
      getAllChildRowKeys,
      triggerScrollYEvent,
      scrollBottomDebouncer,
      resetTableScroll,
      clearTableSorter,
      clearTableFilter,
      clearSuperFilters,
      clearRowSelection,
      clearRowHighlight,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      $size,
      flattenColumns,
      editableColumns,
      leftFixedColumns,
      rightFixedColumns,
      firstDataIndex,
      sorter,
      filters,
      superFilters,
      layout,
      bordered,
      showFooter,
      showSummary,
      summationRows,
      scrollX,
      scrollY,
      pagination,
      fetchParams,
      selectionKeys,
      rowExpandedKeys,
      highlightKey,
      isFetch,
      isPingLeft,
      isPingRight,
      isHeadSorter,
      isHeadFilter,
      isFullScreen,
      isTableEmpty,
      isHeadGroup,
      isTreeTable,
      isGroupSubtotal,
      isWebPagination,
    ]
  );

  // ========== 公开方法 ==========
  useImperativeMethod<React.ForwardedRef<TableRef>>(ref, {
    getRowKey,
    tableRef,
    flattenColumns,
    editableColumns,
    pagination,
    fetchParams,
    selectionKeys,
    rowExpandedKeys,
    highlightKey,
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
    setRowExpandedKeys,
    setHighlightKey,
    forceUpdate,
    getTableLog,
    clearRowSelection,
    clearRowHighlight,
    clearTableSorter,
    clearTableFilter,
    clearSuperFilters,
    clearTableLog,
  });

  // ========== componentDidMount ==========
  React.useEffect(() => {
    TableManager.register(tableRef.current.uid, ref ?? { current: null });
  }, []);

  // ========== Render ==========
  const renderBorderLine = () => {
    return bordered && <div className={`${prefixCls}--border-line`} />;
  };

  const renderResizableLine = () => {
    return resizable && <div ref={resizableBarRef} className={`${prefixCls}--resizable-bar`} />;
  };

  const prefixCls = getPrefixCls('table');

  const wrapperCls = {
    [`${prefixCls}--wrapper`]: true,
    [`${prefixCls}--lg`]: $size === 'large',
    [`${prefixCls}--sm`]: $size === 'small',
    [`${prefixCls}--maximize`]: isFullScreen,
    [customClass!]: !!customClass,
  };

  const tableCls = {
    [prefixCls]: true,
    [`is--border`]: bordered,
    [`is--striped`]: stripe,
    [`is--fixed`]: leftFixedColumns.length || rightFixedColumns.length,
    [`is--sortable`]: isHeadSorter,
    [`is--filterable`]: isHeadFilter,
    [`is--empty`]: isTableEmpty,
    [`show--head`]: showHeader,
    [`show--foot`]: showFooter,
    [`ping--left`]: isPingLeft,
    [`ping--right`]: isPingRight,
    [`scroll--x`]: scrollX,
    [`scroll--y`]: scrollY,
  };

  return (
    <TableContext.Provider value={context}>
      <div className={classNames(wrapperCls)}>
        <div ref={topElementRef} className={`${prefixCls}-top`}>
          <div className={`${prefixCls}-top__space`}>
            {/* 信息条 */}
            {showAlert && <Alert total={pagination.total} />}
            <div className={`${prefixCls}-top__space-slot`} style={{ justifyContent: EAlign[topSpaceAlign!] }}>
              {/* 默认槽口 */}
              {props.children}
            </div>
          </div>
          <div className={`${prefixCls}-top__actions`}>
            {/* 全屏 */}
            {showFullScreen && <FullScreen isFullScreen={isFullScreen} />}
            {/* 刷新 */}
            {showRefresh && isFetch && <Reload />}
            {/* 打印 */}
            {permission.print && tablePrint && <TablePrint tableColumns={tableColumns} />}
            {/* 导入 */}
            {permission.import && isTableImport && <TableImport tableColumns={tableColumns} />}
            {/* 导出 */}
            {permission.export && exportExcel && <TableExport tableColumns={tableColumns} />}
            {/* 多选集合 */}
            {isSelectCollection && <SelectCollection columns={tableColumns} />}
            {/* 快速定位查找 */}
            {isFastSearch && <FastSearch />}
            {/* 分组汇总 */}
            {isGroupSummary && <GroupSummary />}
            {/* 高级检索 */}
            {isSuperSearch && <SuperSearch />}
            {/* 列定义 */}
            {showColumnDefine && <ColumnFilter columns={columns} />}
          </div>
        </div>
        <Spin spinning={loading ?? spinning}>
          <div ref={tableElementRef} className={classNames(tableCls)} style={tableStyles}>
            {/* 主要内容 */}
            <div className={`${prefixCls}--main-wrapper`}>
              {/* 头部 */}
              {showHeader && <TableHeader tableColumns={tableColumns} flattenColumns={flattenColumns} sorter={sorter} filters={filters} />}
              {/* 表格体 */}
              <TableBody ref={tableBodyRef} tableData={tableData} flattenColumns={flattenColumns} />
              {/* 底部 */}
              {showFooter && <TableFooter summationRows={summationRows} flattenColumns={flattenColumns} />}
            </div>
            {/* 边框线 */}
            {renderBorderLine()}
            {/* 空数据 */}
            {isTableEmpty && <TableEmpty />}
            {/* 列宽线 */}
            {renderResizableLine()}
          </div>
        </Spin>
        {/* 分页 */}
        {showPagination && (
          <TablePager {...pagination} config={paginationConfig} onChange={(current, pageSize) => pagerChangeHandle({ current, pageSize })} />
        )}
      </div>
    </TableContext.Provider>
  );
});

Table.defaultProps = defaultProps;
Table.displayName = 'Table';

export default Table;
