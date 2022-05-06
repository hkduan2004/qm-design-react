/*
 * @Author: 焦质晔
 * @Date: 2021-12-26 14:21:57
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 20:44:46
 */
import React from 'react';
import { get, intersection } from 'lodash-es';
import {
  createUidKey,
  deepFindColumn,
  deepFindRowKey,
  mapTableColumns,
  difference,
  getCellValue,
  setCellValue,
  groupByProps,
  hasOwn,
  isArrayContain,
  deepGetRowkey,
} from '../utils';
import { trueNoop, debounce, isEmpty } from '../../../_utils/util';
import { warn } from '../../../_utils/error';
import TableManager from '../manager';
import useUpdateEffect from '../../../hooks/useUpdateEffect';
import useResizeObserve from '../../../hooks/useResizeObserve';
import config from '../config';

import type { ITableRef } from './useTableRef';
import type { ITableState } from './useTableState';
import type {
  getRowKeyType,
  IColumn,
  IDerivedRowKey,
  IFetchParams,
  IFilter,
  IPagination,
  IRecord,
  IRowKey,
  IRule,
  ISorter,
  ISuperFilter,
  ITableProps,
  ITreeExpand,
  IValidItem,
  TableBodyRef,
} from '../table/types';
import type { ComponentSize } from '../../../_utils/types';

type IExtra = {
  getRowKey: getRowKeyType;
  tableRef: React.MutableRefObject<ITableRef>;
  tableElementRef: React.RefObject<HTMLElement>;
  tableBodyRef: React.RefObject<TableBodyRef>;
  $size: ComponentSize;
  tableColumns: IColumn[];
  tableFullData: IRecord[];
  pagination: IPagination;
  layout: ITableState['layout'];
  filters: IFilter;
  sorter: ISorter;
  superFilters: ISuperFilter[];
  fetchParams: IFetchParams;
  selectionKeys: IRowKey[];
  rowExpandedKeys: IRowKey[];
  highlightKey: IRowKey;
  summationColumns: IColumn[];
  shouldUpdateHeight: boolean;
  isFetch: boolean;
  isTreeTable: boolean;
  isWebPagination: boolean;
  isScrollPagination: boolean;
  isServiceSummation: boolean;
  isGroupSubtotal: boolean;
  doLayout: () => void;
  setTableData: (records: IRecord[]) => void;
  setTableFullData: (records: IRecord[]) => void;
  setTableOriginData: (records: IRecord[]) => void;
  setAllTableData: (records: IRecord[]) => void;
  setDeriveRowKeys: (records: IRecord[]) => void;
  setPagination: <T extends IPagination>(pagination: T | ((prev: T) => T)) => void;
  setSpinning: (value: boolean) => void;
  setSorter: (sorter: ITableState['sorter']) => void;
  setFilters: (sorter: ITableState['filters']) => void;
  setSuperFilters: (options: ITableState['superFilters']) => void;
  setSelectionKeys: (rowKeys: IRowKey[]) => void;
  setRowExpandedKeys: (rowKeys: IRowKey[]) => void;
  setHighlightKey: (rowKey: IRowKey) => void;
  setScrollYLoad: (scrollYLoad: boolean) => void;
  setScrollYStore: (option: ITableRef['scrollYStore']) => void;
  setResizeState: (option: ITableRef['resizeState']) => void;
  setSummaries: (option: ITableRef['summaries']) => void;
  setPermission: <T extends ITableState['permission']>(option: T | ((prev: T) => T)) => void;
  setRowKeysMap: (key: IRowKey, value: number) => void;
  resetTableScroll: () => void;
  clearElementStore: () => void;
  clearAllRowKeysMap: () => void;
};

const useTableCore = <T extends ITableProps>(props: T, extra: IExtra) => {
  const {
    rowKey,
    dataSource,
    summation,
    fetch,
    rowSelection,
    expandable,
    treeConfig,
    authConfig,
    columnsChange,
    onScrollEnd,
    onDataChange,
    onDataLoad,
    onChange,
  } = props;
  const {
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
  } = extra;

  const { store } = tableRef.current;
  const tableSize = useResizeObserve(tableElementRef);
  const prevParamsRef = React.useRef<IFetchParams>({ ...fetchParams });
  const treeExpandRef = React.useRef<{ list: ITreeExpand[]; maps: Map<IRowKey, number> }>({ list: [], maps: new Map() });

  useUpdateEffect(() => {
    doLayout();
  }, [tableColumns, $size, layout.tableAutoHeight]);

  useUpdateEffect(() => {
    resizeObserve();
  }, [tableSize]);

  useUpdateEffect(() => {
    clearTableSorter();
    clearTableFilter();
    clearSuperFilters();
    if (!isFetch) {
      createTableData(dataSource!);
    }
  }, [dataSource, fetch?.params]);

  useUpdateEffect(() => {
    const isOnlyPageChange = onlyPaginationChange(fetchParams, prevParamsRef.current);
    if (!isOnlyPageChange) {
      isFetch && rowSelection?.clearableAfterFetched && clearRowSelection();
    }
    if (!isOnlyPageChange && fetchParams[config.currentPageName] > 1 && !fetch?.stopToFirst) {
      toFirstPage();
    } else {
      isFetch && getTableData();
    }
    prevParamsRef.current = fetchParams;
  }, [fetchParams]);

  useUpdateEffect(() => {
    if (isWebPagination) {
      updateTableData();
    }
    if (!isScrollPagination) {
      resetTableScroll();
    }
    tableChange();
  }, [pagination.current, pagination.pageSize]);

  useUpdateEffect(() => {
    if (!isFetch) {
      setRecordsTotal(tableFullData.length);
    }
    doLayout();
  }, [tableFullData]);

  useUpdateEffect(() => {
    if (isTreeTable && treeConfig?.virtual) {
      createTreeExpand();
      updateTableData();
    }
  }, [rowExpandedKeys]);

  // ==========================================

  // 组件初始化
  const initialTable = () => {
    getTableAuth();
    setTableFocus();
    if (isFetch) {
      getTableData();
    } else {
      createTableData(dataSource!);
    }
  };

  // table resize 监听函数
  const resizeObserve = () => {
    const { scrollYLoad, resizeState } = tableRef.current;
    const { height: oldTableHeight } = resizeState;
    const { width, height } = tableSize;
    const isYChange = height !== oldTableHeight;
    doLayout();
    // 判断虚拟滚动
    if (isYChange && shouldUpdateHeight && scrollYLoad) {
      updateTableData();
    }
    setResizeState(Object.assign({}, resizeState, { width, height }));
  };

  // 设置表格焦点
  const setTableFocus = () => {
    if (highlightKey) {
      tableBodyRef.current!.setClickedValues([highlightKey, '']);
    }
    if (rowSelection?.type === 'radio' && selectionKeys.length) {
      tableBodyRef.current!.setClickedValues([selectionKeys[0], '']);
    }
  };

  // 创建分页索引
  const createPageIndex = (index: number) => {
    const { current, pageSize } = pagination;
    return !isFetch || isScrollPagination ? index : (current - 1) * pageSize + index;
  };

  // 设置数据总数
  const setRecordsTotal = (total: number) => {
    if (total === pagination.total) return;
    setPagination((prev) => Object.assign({}, prev, { total }));
  };

  // 滚动触底
  const scrollBottom = (ev: React.SyntheticEvent<HTMLDivElement>) => {
    scrollLoadTableData();
    onScrollEnd?.(ev);
  };

  const scrollBottomDebouncer = debounce(scrollBottom);

  // 纵向 Y 可视渲染事件处理
  const triggerScrollYEvent = (st: number) => {
    loadScrollYData(st);
  };

  // 更新纵向 Y 可视渲染上下剩余空间大小
  const updateScrollYSpace = (list: IRecord[]) => {
    const { elementStore, scrollYStore, scrollYLoad } = tableRef.current;
    const { startIndex, rowHeight } = scrollYStore;
    let yTranslate = '';
    let ySpaceHeight = '';
    if (scrollYLoad) {
      yTranslate = `translateY(${Math.max(0, startIndex * rowHeight) + 'px'})`;
      ySpaceHeight = list.length * rowHeight + 'px';
    }
    elementStore[`$tableBody`]!.style.transform = yTranslate;
    elementStore[`$tableYspace`]!.style.height = ySpaceHeight;
  };

  // 纵向 Y 可视渲染处理 - 用于虚拟滚动
  const loadScrollYData = (scrollTop = 0) => {
    const { scrollYStore } = tableRef.current;
    const { startIndex, endIndex, offsetSize, visibleSize, rowHeight } = scrollYStore;
    const toVisibleIndex = Math.floor(scrollTop / rowHeight);
    const offsetStartIndex = Math.max(0, toVisibleIndex - 1 - offsetSize);
    const offsetEndIndex = toVisibleIndex + visibleSize + offsetSize;
    if (toVisibleIndex <= startIndex || toVisibleIndex >= endIndex - visibleSize - 1) {
      if (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex) {
        setScrollYStore(
          Object.assign({}, scrollYStore, {
            startIndex: offsetStartIndex,
            endIndex: offsetEndIndex,
          })
        );
        updateTableData();
      }
    }
  };

  // 分组合计
  const createGroupData = (list: IRecord[]) => {
    if (!isGroupSubtotal) {
      return list;
    }
    return flatTreeData(deepCreateData(list, 0));
  };

  const flatTreeData = (list: IRecord[]) => {
    const result: IRecord[] = [];

    list.forEach((record) => {
      if (record.children) {
        result.push(...flatTreeData(record.children));
      }
      delete record.children;
      result.push(record);
    });

    return result;
  };

  const deepCreateData = (list: IRecord[], index: number) => {
    const item = summation!.groupItems?.[index];

    if (!item) {
      list.forEach((row, i) => {
        row._rowSpan = i === 0 ? list.length : 0;
        row._colSpan = 1;
      });
      return list;
    }

    // groups 分组项
    const groups = groupByProps(list, [item.dataIndex]);

    return groups.map((arr) => {
      const target = {
        children: deepCreateData(arr, index + 1),
        _group: item.dataIndex,
      };

      if (typeof rowKey !== 'function') {
        setCellValue(target, rowKey.toString(), createUidKey());
      }

      if (item.titleIndex) {
        setCellValue(target, item.titleIndex, getCellValue(arr[0], item.titleIndex));
      }
      setCellValue(target, item.dataIndex, getCellValue(arr[0], item.dataIndex));

      summationColumns.forEach((column: IColumn) => {
        const { dataIndex } = column;
        const result: number = target.children?.reduce((prev, curr) => {
          if (curr[config.summaryIgnore]) {
            return prev;
          }
          const value = Number(getCellValue(curr, dataIndex));
          if (!Number.isNaN(value)) {
            return prev + value;
          }
          return prev;
        }, 0);
        setCellValue(target, dataIndex, result);
      });

      return target;
    });
  };

  // 表单校验
  const doFieldValidate = (rules: IRule[], val: unknown, rowKey: IRowKey, columnKey: string) => {
    if (!Array.isArray(rules)) {
      return warn('Table', '可编辑单元格的校验规则 `rules` 配置不正确');
    }
    if (!rules.length) return;
    store.removeFromRequired({ x: rowKey, y: columnKey });
    store.removeFromValidate({ x: rowKey, y: columnKey });
    rules.forEach((x) => {
      if (x.required && isEmpty(val)) {
        store.addToRequired({ x: rowKey, y: columnKey, text: x.message });
      }
      if (typeof x.validator === 'function' && !x.validator?.(val)) {
        store.addToValidate({ x: rowKey, y: columnKey, text: x.message });
      }
    });
  };

  // 树表格选择列 keys
  const createTreeSelectionKeys = (key: IRowKey, arr: IRowKey[]) => {
    const { deriveRowKeys } = tableRef.current;
    const target = deepFindRowKey(deriveRowKeys, key);
    let result: IRowKey[] = [];
    if (!target) {
      return result;
    }
    const childRowKeys = getAllChildRowKeys(target?.children || []);
    // const parentRowKeys = findParentRowKeys(deriveRowKeys, key);
    const parentRowKeys = deepGetRowkey(deriveRowKeys, key)?.slice(0, -1).reverse() || [];
    // 处理后代节点
    result = [...new Set([...arr, ...childRowKeys])];
    // 处理祖先节点
    parentRowKeys.forEach((x) => {
      const target = deepFindRowKey(deriveRowKeys, x);
      const isContain = isArrayContain(result, target?.children?.map((k) => k.rowKey) || []);
      if (isContain) {
        result = [...result, x];
      } else {
        result = result.filter((k) => k !== x);
      }
    });
    return result;
  };

  // 选择列已选中 rows
  const createSelectionRows = (selectedKeys: IRowKey[]) => {
    const { selectionRows, allTableData, rowKeysMap } = tableRef.current;
    if (isFetch) {
      return [
        ...selectionRows.filter((row) => selectedKeys.includes(getRowKey(row, row.index))),
        ...allTableData.filter((row) => {
          const rowKey = getRowKey(row, row.index);
          return selectedKeys.includes(rowKey) && selectionRows.findIndex((row) => getRowKey(row, row.index) === rowKey) === -1;
        }),
      ];
    }
    const result: IRecord[] = [];
    for (let i = 0, len = selectedKeys.length; i < len; i++) {
      const key = selectedKeys[i];
      if (!rowKeysMap.has(key)) continue;
      result.push(allTableData[rowKeysMap.get(key)!]);
    }
    return result;
  };

  // 选择列已选中 keys
  const createSelectionKeys = (rowKeys?: IRowKey[]) => {
    const { type, checkStrictly = !0 } = rowSelection || {};
    const selectedKeys = Array.isArray(rowKeys) ? rowKeys : selectionKeys;
    let result: IRowKey[] = [];
    if (tableRef.current.treeTable && !checkStrictly) {
      selectedKeys.forEach((x) => {
        result.push(...createTreeSelectionKeys(x, selectedKeys));
      });
    }
    result = type === 'radio' ? selectedKeys.slice(0, 1) : [...new Set([...selectedKeys, ...result])];
    return result;
  };

  // 展开行，已展开的 keys
  const createRowExpandedKeys = () => {
    const { allRowKeys, deriveRowKeys, flattenRowKeys } = tableRef.current;
    const { defaultExpandAllRows, expandedRowKeys = [], expandedRowRender } = expandable || {};
    // 树结构
    if (tableRef.current.treeTable) {
      if (expandedRowRender) {
        warn('Table', '树结构表格不能再设置展开行的 `expandedRowRender` 参数');
      }
      const mergedRowKeys = [...selectionKeys, ...expandedRowKeys];
      if (highlightKey) {
        mergedRowKeys.unshift(highlightKey);
      }
      let result: IRowKey[] = [];
      mergedRowKeys.forEach((key) => {
        result.push(...(deepGetRowkey(deriveRowKeys, key)?.slice(0, -1).reverse() || []));
      });
      result = defaultExpandAllRows && !expandedRowKeys.length ? allRowKeys : [...new Set([...expandedRowKeys, ...result])];
      return result.filter((key) => !flattenRowKeys.includes(key));
    }
    // 展开行
    if (expandable) {
      return defaultExpandAllRows && !expandedRowKeys.length ? allRowKeys.slice(0) : [...expandedRowKeys];
    }
    return [];
  };

  // 获取所有后代节点 rowKeys
  const getAllChildRowKeys = (deriveRowKeys: IDerivedRowKey[]) => {
    const results: IRowKey[] = [];
    for (let i = 0; i < deriveRowKeys.length; i++) {
      if (Array.isArray(deriveRowKeys[i].children)) {
        results.push(...getAllChildRowKeys(deriveRowKeys[i].children as IDerivedRowKey[]));
      }
      results.push(deriveRowKeys[i].rowKey);
    }
    return results;
  };

  // 获取祖先节点 rowKeys
  const findParentRowKeys = (deriveRowKeys: IDerivedRowKey[], key: IRowKey) => {
    const results: IRowKey[] = [];
    deriveRowKeys.forEach((x) => {
      if (x.children) {
        results.push(...findParentRowKeys(x.children, key));
      }
      if (x.rowKey === key && x.parentRowKey) {
        results.push(x.parentRowKey);
      }
    });
    if (results.length) {
      results.push(...findParentRowKeys(deriveRowKeys, results[results.length - 1]));
    }
    return results;
  };

  // 表格 change 事件
  const _tableChange = () => {
    onChange?.(pagination, formatFilterValue(filters), formatSorterValue(sorter), superFilters, {
      currentDataSource: createTableList(),
    });
  };

  const tableChange = debounce(_tableChange);

  // 格式化排序参数
  const formatSorterValue = (sorter: ISorter) => {
    const result: ISorter = {};
    for (const key in sorter) {
      if (sorter[key] === null) continue;
      result[key] = sorter[key];
    }
    return result;
  };

  // 格式化筛选参数
  const formatFilterValue = (filters: IFilter) => {
    const result: IFilter = {};
    for (const key in filters) {
      if (!key.includes('|')) continue;
      const [dataIndex, type] = key.split('|');
      result[config.showFilterType ? `${dataIndex}|${type}` : dataIndex] = filters[key];
    }
    return result;
  };

  // 是否仅有分页参数产生变化
  const onlyPaginationChange = (next: IFetchParams, prev: IFetchParams) => {
    const diff = Object.keys(difference(next, prev));
    return diff.length === 1 && (diff.includes(config.currentPageName) || diff.includes(config.pageSizeName));
  };

  // ajax 获取权限
  const getTableAuth = async () => {
    if (!authConfig?.fetch) return;
    const { originColumns } = tableRef.current;
    const { api, params, columnDataKey, exportDataKey, printDataKey } = authConfig.fetch!;
    try {
      const res = await api(params);
      if (res.code === 200) {
        if (columnDataKey) {
          // 返回不可见列的 dataIndex
          const fieldNames: string[] = get(res.data, columnDataKey) ?? [];
          // true 为反向，默认为正向，正向的意思是设置的字段 fieldNames 不可见
          const reverse = !!get(res.data, 'reverse');
          const columns = mapTableColumns(props.columns, (column) => {
            const { dataIndex } = column;
            if (!reverse ? fieldNames.includes(dataIndex) : !fieldNames.includes(dataIndex)) {
              const originColumn = deepFindColumn(originColumns, dataIndex) as IColumn;
              column.noAuth = !0;
              originColumn.noAuth = !0;
            }
          });
          columnsChange?.(columns);
        }
        if (exportDataKey) {
          setPermission((prev) => Object.assign({}, prev, { export: !!get(res.data, exportDataKey) }));
        }
        if (printDataKey) {
          setPermission((prev) => Object.assign({}, prev, { print: !!get(res.data, printDataKey) }));
        }
      }
    } catch (err) {
      // ...
    }
  };

  // ajax 获取数据
  const getTableData = async () => {
    if (!fetch) return;
    const { beforeFetch = trueNoop, afterFetch } = fetch;
    if (!beforeFetch(fetchParams)) return;
    // 是否为滚动加载
    const isScrollLoad: boolean =
      isScrollPagination &&
      fetchParams[config.currentPageName] > prevParamsRef.current[config.currentPageName] &&
      onlyPaginationChange(fetchParams, prevParamsRef.current);
    // 是否为单独的合计接口
    const isSummationFetch = !!summation?.fetch?.api;
    // console.log(`ajax 请求参数：`, fetchParams);
    setSpinning(true);
    try {
      const [res, sum] = !isSummationFetch
        ? [await fetch.api(fetchParams)]
        : await Promise.all([fetch.api(fetchParams), summation!.fetch!.api(fetchParams)]);
      const isSuccess = !isSummationFetch ? res.code === 200 : res.code === 200 && sum!.code === 200;
      if (isSuccess) {
        const dataKey = fetch.dataKey ?? config.dataKey;
        let items: IRecord[] = get(res.data, dataKey) ?? [];
        // 处理数据
        items = typeof afterFetch === 'function' ? afterFetch(items) : items;
        const total = get(res.data, dataKey.replace(/[^.]+$/, config.totalKey)) || items.length || 0;
        createTableData(isScrollLoad ? tableRef.current.tableFullData.concat(items) : items);
        setRecordsTotal(total);
        createSummation(sum?.data || res.data);
      }
    } catch (err) {
      // ...
    }
    if (hasOwn(fetch, 'stopToFirst')) {
      fetch.stopToFirst = false;
    }
    setSpinning(false);
  };

  // 服务端合计
  const createSummation = (data: Record<string, any>) => {
    if (!isServiceSummation) return;
    const dataKey = summation?.fetch?.dataKey ?? config.summationKey;
    const summationData = (dataKey ? get(data, dataKey) : data) ?? {};
    const result: Record<string, number> = {};
    summationColumns
      .filter((x) => !!x.summation!.dataKey)
      .forEach((x) => {
        setCellValue(result, x.dataIndex, Number(getCellValue(summationData, x.summation!.dataKey!)));
      });
    setSummaries(result);
  };

  // 创建表格数据
  const createTableData = (list: IRecord[]) => {
    const resetRowData = (arr: IRecord[]) => {
      return arr.map((record, index) => {
        if (Array.isArray(record.children) && record.children.length) {
          record.children = resetRowData(record.children);
        }
        // 数据索引
        record.index = index;
        // 分页索引
        record.pageIndex = createPageIndex(index);
        return record;
      });
    };
    const results: IRecord[] = createGroupData(resetRowData(list));
    createTableFullData(results);
    createTableOriginData(results);
    // 设置 选择列、展开行
    setSelectionKeys(createSelectionKeys());
    setRowExpandedKeys(createRowExpandedKeys());
    onDataLoad?.(results);
  };

  // 滚动加载表格数据
  const scrollLoadTableData = () => {
    if (!isScrollPagination) return;
    const { current, pageSize, total } = pagination;
    const pageCount: number = Math.ceil(total / pageSize);
    if (current >= pageCount) return;
    pagerChangeHandle({ ...pagination, current: current + 1 });
  };

  // 分页事件
  const pagerChangeHandle = ({ current, pageSize }: Omit<IPagination, 'total'>) => {
    setPagination((prev) => Object.assign({}, prev, { current, pageSize }));
  };

  // 数据变化事件
  const dataChange = () => {
    onDataChange?.(tableRef.current.tableFullData);
  };

  // 返回到第一页
  const toFirstPage = () => {
    pagerChangeHandle(Object.assign({}, pagination, { current: 1 }));
  };

  // 前往最后一页
  const toLastPage = () => {
    const { current, pageSize, total } = pagination;
    const pageCount: number = Math.ceil(total / pageSize);
    if (current < pageCount) {
      pagerChangeHandle(Object.assign({}, pagination, { current: pageCount }));
    }
  };

  // 创建 treeExpandRef 数据
  const createTreeExpand = () => {
    const list = deepMapRowkey(tableRef.current.deriveRowKeys);
    treeExpandRef.current.list = list;
    treeExpandRef.current.maps.clear();
    list.forEach((x, i) => treeExpandRef.current.maps.set(x.rowKey, i));
  };

  // 深度遍历 deriveRowKeys
  const deepMapRowkey = (deriveRowKeys: IDerivedRowKey[]) => {
    const result: Array<{ rowKey: IRowKey; level: number }> = [];
    deriveRowKeys.forEach((x) => {
      if (x.children) {
        result.push(...deepMapRowkey(x.children));
      }
      if (typeof x.parentRowKey === 'undefined') {
        result.push({ rowKey: x.rowKey, level: x.level });
      } else if (rowExpandedKeys.includes(x.parentRowKey)) {
        const _prks = x.rowKeyPath.split('-').slice(0, -1);
        if (_prks.every((key) => rowExpandedKeys.findIndex((k) => k == key) > -1)) {
          result.push({ rowKey: x.rowKey, level: x.level });
        }
      }
    });
    return result;
  };

  // 创建虚拟滚动树列表数据
  const createVirtualTree = (dataList?: IRecord[]): IRecord[] => {
    const { allTableData, allRowKeys } = tableRef.current;
    const { list, maps } = treeExpandRef.current;
    const result: IRecord[] = [];
    for (let i = 0, len = allRowKeys.length; i < len; i++) {
      const rowKey = allRowKeys[i];
      if (!maps.has(rowKey)) continue;
      allTableData[i]._level = list[maps.get(rowKey)!].level;
      result.push(allTableData[i]);
    }
    return result;
  };

  // 创建内存分页的列表数据
  const createPageData = () => {
    const { current, pageSize } = pagination;
    return tableRef.current.tableFullData.slice((current - 1) * pageSize, current * pageSize);
  };

  // 获取表格数据
  const createTableList = () => {
    return !isWebPagination ? tableRef.current.tableFullData : createPageData();
  };

  // 处理渲染数据
  const handleTableData = (dataList: IRecord[]) => {
    const { scrollYLoad, scrollYStore } = tableRef.current;
    setTableData(scrollYLoad ? dataList.slice(scrollYStore.startIndex, scrollYStore.endIndex) : dataList);
  };

  // 更新表格数据
  const updateTableData = () => {
    let dataList = createTableList();
    if (tableRef.current.treeTable && treeConfig?.virtual) {
      dataList = createVirtualTree();
    }
    setScrollYLoad(dataList.length > config.virtualScrollY);
    updateScrollYSpace(dataList);
    handleTableData(dataList);
  };

  // 设置表格当前状态的全量数据
  const createTableFullData = (list: IRecord[]) => {
    setTableFullData(list);
    setAllTableData(list);
    setDeriveRowKeys(list);
    createRowKeysMap();
    updateTableData();
  };

  // 设置表格原始数据
  const createTableOriginData = (list: IRecord[]) => {
    setTableOriginData(list);
  };

  // 设置 rowKey map 缓存
  const createRowKeysMap = () => {
    const { allRowKeys } = tableRef.current;
    clearAllRowKeysMap();
    allRowKeys.forEach((rowKey, index) => setRowKeysMap(rowKey, index));
  };

  // 获取表格操作记录
  const getTableLog = () => {
    const { required, validate, inserted, updated, removed } = store.state;
    // 求 inserted, removed 的交集
    const intersections = intersection(inserted, removed);
    const format = (list): IValidItem[] => list.map((item) => ({ rowKey: item.x, dataIndex: item.y, text: item.text }));
    return {
      required: format(required),
      validate: format(validate),
      inserted: format(inserted.filter((row) => !intersections.includes(row))),
      updated: format(updated.filter((row) => ![...intersection(updated, inserted), ...intersection(updated, removed)].includes(row))),
      removed: format(removed.filter((row) => !intersections.includes(row))),
    };
  };

  // 清空表头排序
  const clearTableSorter = () => {
    setSorter({});
  };

  // 清空表头筛选
  const clearTableFilter = () => {
    setFilters({});
  };

  // 清空高级检索的条件
  const clearSuperFilters = () => {
    setSuperFilters([]);
  };

  // 清空列选中
  const clearRowSelection = () => {
    setSelectionKeys([]);
  };

  // 清空行高亮
  const clearRowHighlight = () => {
    setHighlightKey('');
  };

  // 清空表格各种操作记录
  const clearTableLog = () => {
    store.clearAllLog();
  };

  // 析构方法
  const destroy = () => {
    clearElementStore();
    store.destroy();
    TableManager.deregister(tableRef.current.uid);
  };

  return {
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
  };
};

export default useTableCore;
