/*
 * @Author: 焦质晔
 * @Date: 2021-07-24 13:20:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 20:50:39
 */
import { createContext } from 'react';

import type {
  TableBodyRef,
  IColumn,
  IDerivedRowKey,
  IFetchParams,
  IPagination,
  IRecord,
  IRowColSpan,
  IRowKey,
  IRule,
  ITableProps,
} from '../table/types';
import type { ITableRef } from '../hooks/useTableRef';
import type { ITableState } from '../hooks/useTableState';
import type { ComponentSize } from '../../../_utils/types';

export type ITableContext = {
  getRowKey: (row: IRecord, index: number) => IRowKey;
  tableProps: ITableProps;
  tableRef: React.MutableRefObject<ITableRef>;
  tableBodyRef: React.RefObject<TableBodyRef>;
  $size: ComponentSize;
  flattenColumns: IColumn[];
  editableColumns: IColumn[];
  leftFixedColumns: IColumn[];
  rightFixedColumns: IColumn[];
  firstDataIndex: string;
  sorter: ITableState['sorter'];
  filters: ITableState['filters'];
  superFilters: ITableState['superFilters'];
  layout: ITableState['layout'];
  bordered: boolean;
  showFooter: boolean;
  showSummary: boolean;
  summationRows: Record<string, number | string>[];
  scrollX: boolean;
  scrollY: ITableState['scrollY'];
  pagination: IPagination;
  fetchParams: IFetchParams;
  selectionKeys: IRowKey[];
  rowExpandedKeys: ITableState['rowExpandedKeys'];
  highlightKey: IRowKey;
  isFetch: boolean;
  isPingLeft: boolean;
  isPingRight: boolean;
  isHeadSorter: boolean;
  isHeadFilter: boolean;
  isFullScreen: boolean;
  isTableEmpty: boolean;
  isHeadGroup: boolean;
  isTreeTable: boolean;
  isGroupSubtotal: boolean;
  isWebPagination: boolean;
  dataChange: () => void;
  tableChange: () => void;
  getTableData: () => Promise<void>;
  setElementStore: (key: string, value: HTMLElement) => void;
  createTableFullData: (records: IRecord[]) => void;
  setSorter: (value: ITableState['sorter']) => void;
  setFilters: (value: ITableState['filters']) => void;
  setSuperFilters: (options: ITableState['superFilters']) => void;
  setSelectionKeys: (rowKeys: IRowKey[]) => void;
  setHighlightKey: (rowKey: IRowKey) => void;
  setRowExpandedKeys: (rowKeys: IRowKey[]) => void;
  setSelectionRows: (records: IRecord[]) => void;
  getSpan: (row: IRecord, column: IColumn, rowIndex: number, columnIndex: number, tableData: IRecord[]) => IRowColSpan;
  getStickyLeft: (rowKey: IRowKey) => number;
  getStickyRight: (rowKey: IRowKey) => number;
  scrollXToColumn: (dataIndex: string, index?: number) => void;
  scrollYToRecord: (rowKey: IRowKey, index?: number) => void;
  rowInViewport: (index: number) => boolean;
  setPagination: (pagination: IPagination) => void;
  setPingLeft: (value: boolean) => void;
  setPingRight: (value: boolean) => void;
  setSpinning: (value: boolean) => void;
  setFullScreen: (value: boolean) => void;
  setShouldToTop: (value: boolean) => void;
  doFieldValidate: (rules: IRule[], val: unknown, rowKey: IRowKey, columnKey: string) => void;
  createTableData: (list: IRecord[]) => void;
  createGroupData: (records: IRecord[]) => IRecord[];
  findParentRowKeys: (deriveRowKeys: IDerivedRowKey[], key: IRowKey) => IRowKey[];
  getAllChildRowKeys: (deriveRowKeys: IDerivedRowKey[]) => IRowKey[];
  triggerScrollYEvent: (st: number) => void;
  scrollBottomDebouncer: (event: React.SyntheticEvent<HTMLDivElement>) => void;
  resetTableScroll: () => void;
  clearTableSorter: () => void;
  clearTableFilter: () => void;
  clearSuperFilters: () => void;
  clearRowSelection: () => void;
  clearRowHighlight: () => void;
};

const TableContext = createContext<ITableContext | undefined>(undefined);

export default TableContext;
