/*
 * @Author: 焦质晔
 * @Date: 2021-03-06 15:11:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-28 08:49:53
 */
import React from 'react';
import type { BuildInPlacements } from 'rc-trigger';
import type { ComponentSize, CSSProperties, Nullable, IDict, AjaxResponse } from '../../../_utils/types';
import type { IFormData, IFormItem } from '../../../form/src/types';

export type { ITableContext } from '../context';

export type IFixed = 'left' | 'right';

export type IAlign = 'left' | 'center' | 'right';

export type IFilterType = 'text' | 'textarea' | 'checkbox' | 'radio' | 'number' | 'date';

export type IEditerType =
  | 'text'
  | 'number'
  | 'select'
  | 'select-multiple'
  | 'checkbox'
  | 'switch'
  | 'search-helper'
  | 'search-helper-multiple'
  | 'tree-helper'
  | 'date'
  | 'datetime'
  | 'time';

export type ISelectionType = 'checkbox' | 'radio';

export type IRecord<T = any> = {
  [key: string]: T;
};

export type getRowKeyType = (row: IRecord, index: number) => string | number;

export type IRowKey = ReturnType<getRowKeyType>;

export const DEFAULT_DISTANCE = 10;

export const DEFAULT_TRUE_VALUE = '1';
export const DEFAULT_FALSE_VALUE = '0';

export const EMPTY_MIN_HEIGHT = 100;
export const MIN_POPPER_WIDTH = 150;

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm:ss';
export const DEFAULT_FILENAME_FORMAT = 'YYYYMMDDHHmmss';

export const BUILT_IN_PLACEMENTS: BuildInPlacements = {
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
};

export type IClicked = [IRowKey, string] | [];

export type IRowColSpan = {
  rowSpan: number;
  colSpan: number;
};

export enum EAlign {
  left = 'flex-start',
  right = 'flex-end',
}

export type IFormatType =
  | 'date'
  | 'datetime'
  | 'dateShortTime'
  | 'percent'
  | 'finance'
  | 'secret-name'
  | 'secret-phone'
  | 'secret-IDnumber'
  | 'secret-bankNumber';

export type IPaginationConfig = {
  current?: number;
  pageSize?: number;
  total?: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
};

export type IPagination = Required<Pick<IPaginationConfig, 'current' | 'pageSize' | 'total'>>;

export type IRule = {
  required?: boolean;
  message?: string;
  validator?: (value: unknown) => boolean;
};

export type IValidItem = {
  rowKey: IRowKey;
  dataIndex: string;
  text: string;
};

export type IFilter = {
  [key: string]: Record<string, any>;
};

export type ISorter = {
  [key: string]: Nullable<string>;
};

export type ISummaries = {
  [key: string]: number;
};

export type ISuperFilter = {
  type: string;
  bracketLeft: string;
  fieldName: string;
  expression: string;
  value: unknown;
  bracketRight: string;
  logic: string;
};

export type IEditerReturn = {
  type: IEditerType;
  items?: Array<IDict>;
  editable?: boolean;
  disabled?: boolean;
  extra?: {
    maxLength?: number;
    showCount?: boolean;
    max?: number;
    min?: number;
    trueValue?: string | number;
    falseValue?: string | number;
    minDateTime?: string;
    maxDateTime?: string;
    suffix?: React.ReactNode;
    readOnly?: boolean;
    disabled?: boolean;
    allowClear?: boolean;
  };
  helper?: {
    filters?: IFormItem[];
    table?: {
      fetch?: IFetch;
      columns?: IColumn[];
      rowKey?: ((row: IRecord, index: number) => IRowKey) | IRowKey;
      webPagination?: boolean;
    };
    width?: number | string;
    initialValue?: IFormData;
    closeRemoteMatch?: boolean;
    fieldAliasMap?: (() => Record<string, string>) | Record<string, string>;
    filterAliasMap?: (() => string[]) | string[];
    beforeOpen?: (value: Record<string, string | number>, row: IRecord, column: IColumn) => void | Promise<void> | boolean;
    closed?: (rowData: Record<string, any>) => void;
  };
  rules?: IRule[];
  onInput?: (value: Record<string, string | number>) => void;
  onChange?: (value: Record<string, string | number | Array<string | number>>, record: IRecord) => void;
  onEnter?: (value: Record<string, string | number | Array<string | number>>, record: IRecord) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
};

export type IFetchFn = (params?: Record<string, unknown>) => Promise<AjaxResponse>;

export type IFetchParams = Record<string, any>;

export type IFetch = {
  api: IFetchFn;
  params?: IFetchParams;
  beforeFetch?: (params: IFetchParams) => boolean;
  afterFetch?: (records: IRecord[]) => IRecord[];
  stopToFirst?: boolean;
  dataKey?: string;
};

export type IRowSelection = {
  type: ISelectionType;
  defaultSelectedRowKeys?: IRowKey[];
  selectedRowKeys?: IRowKey[];
  hideSelectAll?: boolean;
  checkStrictly?: boolean;
  filterable?: boolean;
  clearableAfterFetched?: boolean;
  fetchSelectedRowKeys?: {
    api: IFetchFn;
    params?: IFetchParams;
    dataKey?: string;
  };
  fetchAllRowKeys?: {
    api: IFetchFn;
    params?: IFetchParams;
    dataKey?: string;
  };
  disabled?: (row: IRecord) => boolean;
  onChange?: (rowKeys: IRowKey[], selectedRows: IRecord[]) => void;
};

export type IRowHighlight = {
  currentRowKey?: IRowKey;
  disabled?: (row: IRecord) => boolean;
  onChange?: (rowKey: IRowKey, row: IRecord) => void;
};

export type ITreeConfig = {
  virtual?: boolean;
};

export type ITreeExpand = {
  rowKey: IRowKey;
  level: number;
};

export type IExpandable = {
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: IRowKey[];
  expandedRowKeys?: IRowKey[];
  hideExpandAll?: boolean;
  rowExpandable?: (row: IRecord) => boolean;
  expandedRowClassName?: string;
  expandedRowRender?: (row: IRecord, rowIndex: number) => React.ReactNode;
  onExpand?: (expand: boolean, row: IRecord) => void;
  onChange?: (expandedKeys: IRowKey[], expandedRows: IRecord[]) => void;
};

export type ISummation = {
  groupItems?: Array<{
    dataIndex: string;
    titleIndex?: string;
    color?: string;
    backgroundColor?: string;
  }>;
  fetch?: {
    api: IFetchFn;
    params?: IFetchParams;
    dataKey?: string;
  };
  onChange?: (summationRows: Record<string, number | string>[]) => void;
};

export type IExportExcel = {
  fileName?: string;
  fetch?: {
    api: IFetchFn;
    params?: IFetchParams;
  };
  cellStyle?: boolean;
};

export type ITablePrint = {
  showLogo?: boolean;
};

export type IAuthConfig = {
  fetch: {
    api: IFetchFn;
    params?: IFetchParams;
    columnDataKey?: string;
    exportDataKey?: string;
    importDataKey?: string;
    printDataKey?: string;
  };
};

export type IColumn = {
  dataIndex: string;
  title: string;
  description?: string;
  colSpan?: number;
  rowSpan?: number;
  width?: number;
  renderWidth?: number | null;
  fixed?: IFixed;
  align?: IAlign;
  printFixed?: boolean;
  hidden?: boolean;
  noAuth?: boolean;
  ellipsis?: boolean;
  className?: string;
  children?: Array<IColumn> | Nullable<undefined>;
  sorter?: boolean | ((a: IRecord, b: IRecord) => boolean);
  filter?: {
    type: IFilterType;
    items?: Array<IDict>;
  };
  precision?: number;
  formatType?: IFormatType;
  required?: boolean;
  editRender?: (row: IRecord, column: IColumn) => IEditerReturn;
  dictItems?: Array<IDict>;
  summation?: {
    sumBySelection?: boolean;
    displayWhenNotSelect?: boolean;
    dataKey?: string;
    unit?: string;
    render?: (tableData: IRecord[]) => React.ReactNode;
  };
  groupSummary?: {
    dataKey?: string;
    unit?: string;
    render?: () => React.ReactNode;
  };
  headRender?: (column: IColumn, tableData: IRecord[]) => React.ReactNode;
  render?: (text: string | number, row: IRecord, column: IColumn, rowIndex: number, columnIndex: number) => React.ReactNode | string | number;
};

export type IDerivedColumn = IColumn & {
  type?: string;
  level?: number;
  parentDataIndex?: string;
};

export type IDerivedRowKey = {
  level: number;
  rowKey: IRowKey;
  rowKeyPath: string;
  parentRowKey?: IRowKey;
  children?: IDerivedRowKey[];
};

export type ITableProps = {
  columns: IColumn[];
  columnsChange?: (columns: IColumn[]) => void;
  dataSource?: IRecord[];
  rowKey: ((row: IRecord, index: number) => IRowKey) | IRowKey;
  size?: ComponentSize;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  border?: boolean;
  stripe?: boolean;
  fetch?: IFetch;
  loading?: boolean;
  resizable?: boolean;
  uniqueKey?: string;
  authCode?: string;
  customClass?: string;
  showHeader?: boolean;
  ellipsis?: boolean;
  rowStyle?: CSSProperties | ((row: IRecord, rowIndex: number) => CSSProperties);
  cellStyle?: CSSProperties | ((row: IRecord, column: IColumn, rowIndex: number, columnIndex: number) => CSSProperties);
  spanMethod?: (options: {
    row: IRecord;
    column: IColumn;
    rowIndex: number;
    columnIndex: number;
    tableData: IRecord[];
  }) => IRowColSpan | [number, number];
  rowDraggable?: boolean;
  rowSelection?: IRowSelection;
  rowHighlight?: IRowHighlight;
  treeConfig?: ITreeConfig;
  expandable?: IExpandable;
  summation?: ISummation;
  footRender?: (flattenColumns: IColumn[], tableData: IRecord[]) => React.ReactNode;
  multipleSort?: boolean;
  ignorePageIndex?: boolean;
  scrollPagination?: boolean;
  webPagination?: boolean;
  paginationConfig?: IPaginationConfig;
  showAlert?: boolean;
  topSpaceAlign?: IAlign;
  exportExcel?: IExportExcel;
  tablePrint?: ITablePrint;
  authConfig?: IAuthConfig;
  showFullScreen?: boolean;
  showRefresh?: boolean;
  showTableImport?: boolean;
  showSelectCollection?: boolean;
  showSuperSearch?: boolean;
  showFastSearch?: boolean;
  showGroupSummary?: boolean;
  showColumnDefine?: boolean;
  children?: React.ReactNode;
  onlyShowIcon?: boolean;
  onChange?: (
    pagination: IPagination,
    filters: IFilter,
    sorter: ISorter,
    superFilters: ISuperFilter[],
    extra: { currentDataSource: IRecord[] }
  ) => void;
  onDataChange?: (tableData: IRecord[]) => void;
  onDataLoad?: (tableData: IRecord[]) => void;
  onRowClick?: (row: IRecord, column: IColumn, event: React.MouseEvent<HTMLTableCellElement>) => void;
  onRowDblclick?: (row: IRecord, column: IColumn, event: React.MouseEvent<HTMLTableCellElement>) => void;
  onRowContextmenu?: (row: IRecord, column: IColumn, event: React.MouseEvent<HTMLTableCellElement>) => void;
  onRowEnter?: (row: IRecord, event: KeyboardEvent) => void;
  onScrollEnd?: (event: React.SyntheticEvent<HTMLDivElement>) => void;
};

export type TableRef = {
  CALCULATE_HEIGHT: () => void;
  DO_REFRESH: (cb: () => void) => Promise<void>;
  GET_LOG: () => {
    required: IValidItem[];
    validate: IValidItem[];
    inserted: IRecord[];
    updated: IRecord[];
    removed: IRecord[];
  };
  GET_FETCH_PARAMS: () => IFetchParams;
  CLEAR_TABLE_DATA: () => void;
  CLEAR_LOG: () => void;
  FORCE_UPDATE: () => void;
  SCROLL_TO_RECORD: (rowKey: IRowKey) => void;
  SCROLL_TO_COLUMN: (dataIndex: string) => void;
  SET_FIELDS_VALUE: (row: IRecord, values: Record<string, any>) => void;
  INSERT_RECORDS: <T extends IRecord>(records: T | T[]) => void;
  REMOVE_RECORDS: <T extends IRecord | IRowKey>(records: T | T[]) => void;
  VALIDATE_FIELDS: () => {
    required: IValidItem[];
    validate: IValidItem[];
  };
};

export type TableBodyRef = {
  renderCellTitle: (column: IColumn, row: IRecord, rowIndex: number, columnIndex: number) => string;
  setClickedValues: (clicked: IClicked) => void;
  forceUpdate: () => void;
};
