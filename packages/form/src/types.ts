/*
 * @Author: 焦质晔
 * @Date: 2021-08-07 21:32:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 11:44:34
 */
import PropTypes from 'prop-types';
import { noop } from '../../_utils/util';
import { throwError } from '../../_utils/error';
import { isValidComponentSize } from '../../_utils/validators';

import type { BuildInPlacements } from 'rc-trigger';
import type { IFetch, IColumn, IRowKey } from '../../table/src/table/types';
import type { CSSProperties, ComponentSize, JSXElement, ValueOf, AjaxResponse, IDict } from '../../_utils/types';

export const DEFAULT_COL = 4;
export const DEFAULT_ROWS = 1;
export const DEFAULT_LABEL_WIDTH = 80;
export const DEFAULT_COL_WIDTH = 300;
export const DEFAULT_TRUE_VALUE = '1';
export const DEFAULT_FALSE_VALUE = '0';

export type IRecord = Record<string, any>;

export type IFormLayout = 'horizontal' | 'vertical';

export type ILabelAlign = 'left' | 'right';

export type IFormType = 'default' | 'search' | 'onlyShow';

export type IValidateTrigger = 'onChange' | 'onBlur';

export type ICheckStrategy = 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';

export type IFormItemType =
  | 'DIVIDER'
  | 'INPUT'
  | 'TEXT_AREA'
  | 'RANGE_INPUT'
  | 'INPUT_NUMBER'
  | 'RANGE_INPUT_NUMBER'
  | 'CHECKBOX'
  | 'MULTIPLE_CHECKBOX'
  | 'RADIO'
  | 'SWITCH'
  | 'DATE'
  | 'RANGE_DATE'
  | 'TIME'
  | 'RANGE_TIME'
  | 'SELECT'
  | 'MULTIPLE_SELECT'
  | 'IMMEDIATE'
  | 'SEARCH_HELPER'
  | 'MULTIPLE_SEARCH_HELPER'
  | 'TREE_SELECT'
  | 'MULTIPLE_TREE_SELECT'
  | 'CASCADER'
  | 'MULTIPLE_CASCADER'
  | 'CITY_SELECT'
  | 'REGION_SELECT'
  | 'UPLOAD_FILE'
  | 'UPLOAD_IMG'
  | 'TINYMCE';

export const ARRAY_TYPE: IFormItemType[] = [
  'RANGE_INPUT',
  'RANGE_INPUT_NUMBER',
  'MULTIPLE_CHECKBOX',
  'MULTIPLE_SELECT',
  'RANGE_DATE',
  'RANGE_TIME',
  'MULTIPLE_TREE_SELECT',
  'MULTIPLE_SEARCH_HELPER',
  'MULTIPLE_CASCADER',
  'UPLOAD_FILE',
];

export const BUILT_IN_PLACEMENTS: BuildInPlacements = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
};

export type ISecretType = 'name' | 'phone' | 'IDnumber' | 'bankCard';

export type IDateType = 'date' | 'datetime' | 'exactdate' | 'week' | 'month' | 'quarter' | 'year';

export enum EDateType {
  'date' = 'date',
  'datetime' = 'date',
  'exactdate' = 'date',
  'week' = 'week',
  'month' = 'month',
  'quarter' = 'quarter',
  'year' = 'year',
}

export enum EDateFormat {
  'date' = 'YYYY-MM-DD HH:mm:ss',
  'datetime' = 'YYYY-MM-DD HH:mm:ss',
  'exactdate' = 'YYYY-MM-DD',
  'week' = 'YYYY-wo',
  'month' = 'YYYY-MM',
  'quarter' = 'YYYY-[Q]Q',
  'year' = 'YYYY',
}

export type ITimeType = 'hour' | 'hour-minute' | 'hour-minute-second';

export enum ETimeFormat {
  'hour' = 'HH',
  'hour-minute' = 'HH:mm',
  'hour-minute-second' = 'HH:mm:ss',
}

export type IFormData = Record<string, string | number | any[] | undefined>;

export type IFetchHeader = Record<string, string>;

export type IFetchParams = Record<string, any>;

export type IFieldData = {
  name: string[];
  errors?: string[];
  touched?: boolean;
  validating?: boolean;
  value?: ValueOf<IFormData>;
};

export type IExtraData = Record<string, string>;

export type IViewData = Record<string, string>;

export type IExpandData = Record<string, boolean>;

export type IFetchFn = (params?: Record<string, unknown>) => Promise<AjaxResponse>;

export type IAuthConfig = {
  fetch: {
    api: IFetchFn;
    params?: IFetchParams;
    dataKey?: string;
  };
};

export type IFormItem = {
  type: IFormItemType;
  fieldName: string;
  label?: string | IFormItem;
  tooltip?: string;
  labelWidth?: number | string;
  hidden?: boolean; // 隐藏字段
  noAuth?: boolean; // 权限控制
  invisible?: boolean; // 隐藏字段，依旧会 占位 并 保留字段值
  rules?: Record<string, any>[];
  validateTrigger?: IValidateTrigger | IValidateTrigger[];
  selfCol?: number;
  offsetLeft?: number;
  offsetRight?: number;
  style?: CSSProperties;
  className?: string;
  placeholder?: string;
  bordered?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  readOnly?: boolean;
  options?: {
    // select + checkbox-group + radio
    itemList?: IDict[];
    // input
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    maxLength?: number;
    password?: boolean;
    toUpper?: boolean;
    pattern?: RegExp;
    secretType?: ISecretType;
    // input-number
    step?: number;
    min?: number;
    max?: number;
    controls?: boolean;
    precision?: number;
    formatter?: (value: number | string) => string;
    parser?: (value: string) => string | number;
    // checkbox + switch
    falseValue?: string | number;
    trueValue?: string | number;
    // textarea
    showCount?: boolean;
    autoSize?: {
      minRows?: number;
      maxRows?: number;
    };
    // date
    dateType?: IDateType;
    minDateTime?: string;
    maxDateTime?: string;
    disableds?: [boolean, boolean];
    shortCuts?: boolean;
    // time
    timeType?: ITimeType;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    // select
    filterable?: boolean;
    collapseTags?: boolean;
    maxTagTextLength?: number;
    openPyt?: boolean;
    // tree-select
    checkStrategy?: ICheckStrategy;
    // immediate
    hideHeader?: boolean;
    onlySelect?: boolean;
    columns?: IColumn[];
    fieldAliasMap?: (() => Record<string, string>) | Record<string, string>;
    extraAliasMap?: (() => Record<string, string>) | Record<string, string>;
    // upload-file + upload-img
    multiple?: boolean;
    maxCount?: number;
    fileTypes?: string[]; // 未实现
    fileSize?: number; // 未实现
    onRemove?: (file: any) => void;
    // upload-img
    fixedSize?: [number, number] | undefined;
    quality?: number;
    // tinymce
    tinymceHeight?: number | string;
  };
  searchHelper?: {
    name?: string;
    getServerConfig?: IFetchFn;
    createTableFetch?: (url: string) => IFetchFn;
    filters?: IFormItem[];
    table?: {
      fetch?: IFetch;
      columns?: IColumn[];
      rowKey?: ((row: IRecord, index: number) => IRowKey) | IRowKey;
      webPagination?: boolean;
    };
    tree?: {
      fetch?: IFetch;
      tableParamsMap?: (() => Record<string, string>) | Record<string, string>;
    };
    request?: {
      fetchApi?: IFetchFn;
      params?: IFetchParams;
      formatter?: (params: IFetchParams) => IFetchParams;
      dataKey?: string;
    };
    width?: number | string;
    initialValue?: IFormData;
    onlySelect?: boolean;
    closeRemoteMatch?: boolean;
    fieldAliasMap?: (() => Record<string, string>) | Record<string, string>;
    extraAliasMap?: (() => Record<string, string>) | Record<string, string>;
    filterAliasMap?: (() => string[]) | string[];
    beforeOpen?: (formData: IFormData) => void | Promise<void> | boolean;
    closed?: (rowData: Record<string, any>) => void;
  };
  request?: {
    fetchApi?: IFetchFn;
    params?: IFetchParams;
    formatter?: (params: IFetchParams) => IFetchParams;
    dataKey?: string;
    valueKey?: string;
    textKey?: string;
  };
  upload?: {
    action?: string;
    headers?: IFetchHeader;
    withCredentials?: boolean;
    params?: IFetchParams;
    dataKey?: string;
    fieldAliasMap?: (() => Record<string, string>) | Record<string, string>;
  };
  extra?: {
    style?: CSSProperties;
    labelWidth?: number | string;
    isTooltip?: boolean;
  };
  collapse?: {
    defaultExpand?: boolean;
    showLimit?: number;
    remarkItems?: Array<{
      fieldName: string;
      showLabel?: boolean;
    }>;
    onCollapse?: (collapse: boolean) => void;
  };
  render?: (options: IFormItem, instance: any) => JSXElement;
  onChange?: (value: ValueOf<IFormData> | boolean, others?: any) => void;
  onBlur?: (value: ValueOf<IFormData>) => void;
  onEnter?: (value: ValueOf<IFormData>) => void;
};

export type IFormProps = {
  items: IFormItem[];
  initialValues?: IFormData;
  initialExtras?: IExtraData;
  layout?: IFormLayout;
  size?: ComponentSize;
  cols?: number;
  customClass?: string;
  labelWidth?: number | string;
  labelAlign?: ILabelAlign;
  formType?: IFormType;
  uniqueKey?: string;
  authCode?: string;
  defaultRows?: number;
  authConfig?: IAuthConfig;
  isAutoFocus?: boolean;
  isCollapse?: boolean;
  isFieldsDefine?: boolean;
  isSearchBtn?: boolean;
  isSubmitBtn?: boolean;
  fieldsChange?: (items: IFormItem[]) => void;
  onValuesChange?: (changedValues: IFormData, initialValues: IFormData) => void;
  onFieldsChange?: (changedFields: IFieldData[], allFields: IFieldData[]) => void;
  onFinish?: (values: IFormData) => void;
  onFinishFailed?: (errorFields: any) => void;
  onReset?: () => void;
  onCollapse?: (collapse: boolean) => void;
};

export const propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      fieldName: PropTypes.string.isRequired,
    })
  ), // 配置项
  initialValues: PropTypes.object, // 表单项的初始值
  initialExtras: PropTypes.object, // 表单项的尾部信息初始值
  layout: PropTypes.oneOf(['horizontal', 'vertical']), // 表单布局
  size: (props, propName, componentName) => {
    if (!isValidComponentSize(props[propName] || '')) {
      return throwError('QmForm', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
    }
  }, // 组件尺寸
  cols: PropTypes.number, // 显示的列数
  customClass: PropTypes.string, // 自定义选择器类名
  labelWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // 表单项 label 标签的宽度
  labelAlign: PropTypes.oneOf(['left', 'right']), // label 标签文本对齐方式
  formType: PropTypes.oneOf(['default', 'search', 'onlyShow']), // 表单类型
  uniqueKey: PropTypes.string, // 唯一标记
  authCode: PropTypes.string, // 控制表单权限的 code，和平台相关
  defaultRows: PropTypes.number, // 默认展示几行
  // 表单字段权限
  authConfig: PropTypes.shape({
    fetch: PropTypes.shape({
      api: PropTypes.func.isRequired,
      params: PropTypes.object,
      dataKey: PropTypes.string,
    }),
  }),
  isAutoFocus: PropTypes.bool, // 是否自动获得焦点
  isCollapse: PropTypes.bool, // 是否开启 展开/收起 功能
  isFieldsDefine: PropTypes.bool, // 是否开启拖动排序功能
  isSearchBtn: PropTypes.bool, // 是否展示搜索按钮
  isSubmitBtn: PropTypes.bool, // 是否展示提交按钮
  fieldsChange: PropTypes.func, // 字段排序筛选的回调
  onValuesChange: PropTypes.func, // 表单组件，字段值更新时触发回调事件
  onFieldsChange: PropTypes.func, // 表单组件，字段更新时触发回调事件
  onFinish: PropTypes.func, // 提交表单且数据验证成功后回调事件
  onFinishFailed: PropTypes.func, // 提交表单且数据验证失败后回调事件
  onReset: PropTypes.func, // 表单重置事件
  onCollapse: PropTypes.func, // 展开/收起 状态改变时的回调事件
};

export const defaultProps = {
  layout: 'horizontal',
  labelWidth: DEFAULT_LABEL_WIDTH,
  labelAlign: 'right',
  formType: 'default',
  initialValues: {},
  initialExtras: {},
  defaultRows: DEFAULT_ROWS,
  isAutoFocus: true,
  isCollapse: true,
  isSearchBtn: true,
  onValuesChange: noop,
  onFieldsChange: noop,
  onFinish: noop,
  onFinishFailed: noop,
  onReset: noop,
  onCollapse: noop,
  onFormItemsChange: noop,
};
