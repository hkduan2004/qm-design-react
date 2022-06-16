/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-19 11:53:59
 */
import React, { Component } from 'react';
import { cloneDeep } from 'lodash-es';
import classNames from 'classnames';
import memoize from 'memoize-one';
import ConfigContext from '../../config-provider/context';
import FormContext from './context';
import { addResizeListener, removeResizeListener } from '../../_utils/resize-event';
import { getParserWidth, getAuthValue, debounce, get, noop, isEmpty, isObject, isFunction } from '../../_utils/util';
import { isEmptyValue } from './utils';
import { warn } from '../../_utils/error';
import { t } from '../../locale';
import { getPrefixCls } from '../../_utils/prefix';
import { propTypes, defaultProps, IFieldData, DEFAULT_COL, DEFAULT_COL_WIDTH, ARRAY_TYPE, DEFAULT_FALSE_VALUE } from './types';

import type { ResizableElement } from '../../_utils/resize-event';
import type { IFormProps, IFormData, IFormItem, IExtraData, IViewData, IExpandData } from './types';
import type { JSXElement, ValueOf } from '../../_utils/types';
import type { FormProps, FormInstance } from '../../antd';

import { Form, Row, Col, Space, Tooltip, Select } from '../../antd';
import { DownOutlined, UpOutlined, SearchOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { QmButton } from '../../index';
import FieldsFilter from './fields-filter';

import FormInput from './form-input';
import FormRangeInput from './form-range-input';
import FormInputNumber from './form-input-number';
import FormRangeInputNumber from './form-range-input-number';
import FormSearchHelper from './form-search-helper';
import FormMultipleSearchHelper from './form-multiple-search-helper';
import FormTreeTableHelper from './form-tree-table-helper';
import FormMultipleTreeTableHelper from './form-multiple-tree-table-helper';
import FormCheckbox from './form-checkbox';
import FormCheckboxGroup from './form-checkbox-group';
import FormRadio from './form-radio';
import FormSwitch from './form-switch';
import FormTextArea from './form-text-area';
import FormDate from './form-date';
import FormRangeDate from './form-range-date';
import FormTime from './form-time';
import FormRangeTime from './form-range-time';
import FormSelect from './form-select';
import FormImmediate from './form-immediate';
import FormDivider from './form-divider';
import FormTreeSelect from './form-tree-select';
import FormCascader from './form-cascader';
import FormCitySelect from './form-city-select';
import FormRegionSelect from './form-region-select';
import FormUploadFile from './form-upload-file';
import FormUploadImg from './form-upload-img';
import FormTinymce from './form-tinymce';

type IProps = FormProps & IFormProps;

type IState = {
  formData: IFormData;
  viewData: IViewData;
  other: IFormData;
  extra: IExtraData;
  expand: IExpandData;
  flexCols: number;
  collapse: boolean;
};

export type QmFormProps = IProps;

export type FormRef = QmForm;

class QmForm extends Component<IProps, IState> {
  static contextType = ConfigContext;

  static propTypes = propTypes;

  static defaultProps = defaultProps;

  private provide = {
    $$form: this,
  };

  private _initialValues: IFormData;

  private _initialOthers: IFormData;

  private _initialExtras: IExtraData;

  private wrapperRef = React.createRef<HTMLDivElement>();

  private formRef = React.createRef<FormInstance>();

  public state: IState = {
    formData: {}, // 表单数据
    viewData: {}, // 视图数据
    other: {}, // 额外的表单数据
    extra: {}, // 描述信息
    expand: {}, // 分隔符的 展开/收起
    flexCols: this.props.cols ?? DEFAULT_COL, // 动态栅格数
    collapse: false, // 筛选器 展开/收起 状态
  };

  constructor(props: IProps) {
    super(props);
    this.createInitialValues();
    this.createInitialOthers();
    this.createInitialExtras();
    this.getFormAuth();
    this.createFormAuth();
  }

  get $size() {
    return this.props.size ?? this.context.size ?? '';
  }

  get verticalLayout() {
    return this.props.layout === 'vertical';
  }

  get formItems() {
    return this.getFormItems(this.props.items);
  }

  get flattenItems() {
    return this.getFlattenItems(this.formItems);
  }

  get dividers() {
    return this.formItems.filter((x) => x.type === 'DIVIDER');
  }

  get isFilterType() {
    return this.props.formType === 'search';
  }

  get isOnlyShow() {
    return this.props.formType === 'onlyShow';
  }

  get showDividerCollapse() {
    return this.dividers.some((x) => !!x.collapse);
  }

  get showFilterCollapse() {
    const { isCollapse } = this.props;
    return isCollapse && this.formItems.length >= this.state.flexCols;
  }

  componentDidMount() {
    this.checkFieldNames();
    this.initialHandle();
    this.createInputFocus();
    this.bindResizeEvent();
    this.resizeObserveHandler();
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (this.props.items !== prevProps.items) {
      this.checkFieldNames();
    }
  }

  componentWillUnmount() {
    this.removeResizeEvent();
  }

  // resize 事件处理函数
  resizeObserveHandler = () => {
    const w = this.wrapperRef.current?.offsetWidth;
    if (typeof w === 'undefined' || w === 0 || this.props.cols! > 0) return;
    let cols = Math.floor(w / DEFAULT_COL_WIDTH);
    cols = 24 % cols === 0 ? cols : cols - 1;
    cols = cols < 1 ? 1 : cols;
    cols = cols > 8 ? 8 : cols;
    if (cols === this.state.flexCols) return;
    this.setState({ flexCols: cols });
  };

  // resize 事件处理函数 + 防抖
  resizeListenerHandle = debounce(this.resizeObserveHandler, 10);

  // 绑定 resize 事件
  bindResizeEvent() {
    addResizeListener(this.wrapperRef.current as unknown as ResizableElement, this.resizeListenerHandle);
  }

  // 解绑 resize 事件
  removeResizeEvent() {
    removeResizeListener(this.wrapperRef.current as unknown as ResizableElement, this.resizeListenerHandle);
  }

  // 初始化方法
  initialHandle() {
    this.setState({
      formData: this.createFormValue(this.props.initialValues!),
      other: this.createOtherValue(this.props.initialValues!),
      extra: this.createExtraValue(this.props.initialExtras!),
      expand: this.createDividerExpand(),
    });
  }

  // 检查 item.fieldName 的合法性
  checkFieldNames() {
    const fieldNames = this.flattenItems.map((item) => item.fieldName);
    if ([...new Set(fieldNames)].length !== fieldNames.length) {
      warn('QmForm', `配置项 fieldName 属性是唯一的，不能重复`);
    }
  }

  // 获取表单项是否有必填校验
  getFormItemRequired(rules: Record<string, any>[] = []) {
    return rules.some((x) => x.required);
  }

  // 创建额外表单数据
  createOtherValue(values: IFormData) {
    const fieldNames = this.flattenItems.map((x) => x.fieldName);
    const target: IFormData = {};
    for (const key in values) {
      if (fieldNames.includes(key)) continue;
      target[key] = values[key];
    }
    return Object.assign({}, target);
  }

  // 创建描述信息数据
  createExtraValue(values: IExtraData) {
    const target: IExtraData = {};
    this.flattenItems
      .filter((x) => isObject(x.extra))
      .forEach((x) => {
        target[x.fieldName] = values[x.fieldName] ?? '';
      });
    return Object.assign({}, target);
  }

  // 创建分隔符 展开/收起 状态
  createDividerExpand() {
    const target: IExpandData = {};
    this.dividers
      .filter((x) => isObject(x.collapse))
      .forEach((x) => {
        target[x.fieldName] = x.collapse!.defaultExpand ?? false;
      });
    return Object.assign({}, target);
  }

  // 获取表单项的初始值
  getInitialValue(item: IFormItem, val?: ValueOf<IFormData>) {
    const { type, options } = item;
    val = val ?? undefined;
    if (ARRAY_TYPE.includes(type)) {
      val = val ?? [];
    }
    if (type === 'CHECKBOX' || type === 'SWITCH') {
      val = val ?? options?.falseValue ?? DEFAULT_FALSE_VALUE;
    }
    return val;
  }

  // 创建表单数据
  createFormValue(values: IFormData) {
    const target: IFormData = {};
    this.flattenItems.forEach((x) => {
      target[x.fieldName] = this.getInitialValue(x, values[x.fieldName]);
    });
    return Object.assign({}, values, target);
  }

  // 初始化表单数据
  createInitialValues() {
    this._initialValues = this.createFormValue(this.props.initialValues!);
  }

  // 初始化额外表单数据
  createInitialOthers() {
    this._initialOthers = this.createOtherValue(this.props.initialValues!);
  }

  // 初始化描述信息
  createInitialExtras() {
    this._initialExtras = this.createExtraValue(this.props.initialExtras!);
  }

  // 获取表单项列表
  getFormItems = memoize((items: IFormItem[]) => {
    return items.filter((item: IFormItem) => !item.noAuth && !item.hidden);
  });

  // 获取扁平化的表单项列表
  getFlattenItems = memoize((items: IFormItem[]) => {
    const result: IFormItem[] = [];
    items
      .filter((x) => x.fieldName && x.type !== 'DIVIDER')
      .forEach((x) => {
        if (isObject(x.label) && (x.label as IFormItem).fieldName) {
          result.push(x.label as IFormItem);
        }
        result.push(x);
      });
    return result;
  });

  // 设置视图数据，用于摘要显示
  setViewValue(fieldName: string, val = '') {
    if (!this.showDividerCollapse) return;
    const { viewData } = this.state;
    if (val !== viewData[fieldName]) {
      this.setState((prevState) => ({
        viewData: Object.assign({}, prevState.viewData, { [fieldName]: val }),
      }));
    }
  }

  // 输入框获得焦点
  createInputFocus() {
    const { isAutoFocus } = this.props;
    if (!isAutoFocus || this.isOnlyShow) return;
    const { type, fieldName } = this.formItems.filter((x) => x.fieldName)[0] || {};
    if ((type === 'INPUT' || type === 'INPUT_NUMBER') && fieldName) {
      setTimeout(() => this[`${fieldName}_Ref`]?.focus());
    }
  }

  // 获取表单项的 label
  getFormItemLabel(label: string | IFormItem) {
    if (typeof label === 'string') {
      return label;
    }
    const { fieldName, options = {} } = label;
    const { itemList = [] } = options;
    if (!itemList.length) {
      warn('QmForm', `fieldName 为 ${fieldName} 的表单项的 \`itemList\` 配置有误`);
      return '';
    }
    const value = this.formRef.current?.getFieldsValue([fieldName])[fieldName] ?? this._initialValues[fieldName] ?? itemList[0].value;
    return itemList.find((x) => x.value === value)?.text || '';
  }

  // 获取显示状态，派生的表单项列表
  getBlockDerivedItems() {
    const result: Array<Pick<IFormItem, 'fieldName' | 'label'>>[] = [];
    for (let i = 0, len = this.dividers.length; i < len; i++) {
      const index: number = this.formItems.findIndex((x) => x === this.dividers[i]);
      let nextIndex: number | undefined = this.formItems.findIndex((x) => x === this.dividers[i + 1]);
      nextIndex = (nextIndex as number) > -1 ? nextIndex : undefined;
      result.push(this.formItems.slice(index, nextIndex).map((x) => ({ label: x.label, fieldName: x.fieldName })));
    }
    return result;
  }

  // 获取表单项的显隐状态
  getFormItemDisplay({ type, fieldName }) {
    if (type === 'DIVIDER') {
      return !0;
    }
    const blockItems = this.getBlockDerivedItems();
    for (let i = 0, len = blockItems.length; i < len; i++) {
      const arr = blockItems[i];
      const divider = this.dividers.find((x) => x.fieldName === arr[0].fieldName);
      const limit = divider?.collapse?.showLimit ?? arr.length - 1;
      for (let k = 1; k < arr.length; k++) {
        const x = arr[k];
        if (x.fieldName === fieldName && k > limit) {
          return this.state.expand[arr[0].fieldName];
        }
      }
    }
    return !0;
  }

  // 格式化表单数据
  formatFormValue(values: IFormData) {
    for (const key in values) {
      const val = values[key];
      if (isEmptyValue(val)) {
        values[key] = '';
      }
      if (Array.isArray(val)) {
        val.forEach((x, i) => {
          if (isEmptyValue(x)) {
            (values[key] as any[])[i] = '';
          }
        });
      }
      if (key.includes('|') && Array.isArray(val)) {
        const [start, end] = key.split('|');
        values[start] = val[0] ?? '';
        values[end] = val[1] ?? '';
      }
    }
    // 筛选器 - 空值设置成 undefined
    if (this.isFilterType) {
      for (const key in values) {
        if (isEmpty(values[key])) {
          values[key] = undefined;
        }
      }
    }
    return values;
  }

  // 设置表单权限
  createFormAuth() {
    if (!this.props.authCode) return;
    const auth = getAuthValue(this.props.authCode);
    if (auth) {
      const { fieldList = [] } = auth;
      const items = this.props.items.map((item: IFormItem) => {
        const { fieldName } = item;
        const target = fieldList.find((x) => x.dataIndex === fieldName);
        if (target) {
          const { visible = 1, disabled, secretName } = target;
          if (!visible) {
            item.noAuth = true;
          }
          if (disabled) {
            item.disabled = true;
          }
          if (secretName) {
            item.options ? (item.options.secretType = secretName) : (item.options = { secretType: secretName });
          }
        }
        return item;
      });
      this.props.fieldsChange?.(items);
    }
  }

  // 获取表单权限
  async getFormAuth() {
    if (!this.props.authConfig?.fetch) return;
    const { api: fetchApi, params, dataKey } = this.props.authConfig.fetch;
    try {
      const res = await fetchApi(params);
      if (res.code === 200) {
        // 返回不可见列的 dataIndex
        const fieldNames: string[] = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        // true 为反向，默认为正向，正向的意思是设置的字段 fieldNames 不可见
        const reverse = !!get(res.data, 'reverse');
        const items = this.props.items.map((item: IFormItem) => {
          const { fieldName } = item;
          if (!reverse ? fieldNames.includes(fieldName) : !fieldNames.includes(fieldName)) {
            item.noAuth = true;
          }
          return item;
        });
        this.props.fieldsChange?.(items);
      }
    } catch (err) {
      // ...
    }
  }

  // input + search helper
  INPUT(option: IFormItem): JSXElement {
    return <FormInput ref={(componentRef) => (this[`${option.fieldName}_Ref`] = componentRef)} option={option} />;
  }

  // range-input
  RANGE_INPUT(option: IFormItem): JSXElement {
    return <FormRangeInput option={option} />;
  }

  // input-number
  INPUT_NUMBER(option: IFormItem): JSXElement {
    return <FormInputNumber ref={(componentRef) => (this[`${option.fieldName}_Ref`] = componentRef)} option={option} />;
  }

  // range-input-number
  RANGE_INPUT_NUMBER(option: IFormItem): JSXElement {
    return <FormRangeInputNumber option={option} />;
  }

  // search-helper
  SEARCH_HELPER(option: IFormItem): JSXElement {
    return <FormSearchHelper option={option} />;
  }

  // multiple-search-helper
  MULTIPLE_SEARCH_HELPER(option: IFormItem): JSXElement {
    return <FormMultipleSearchHelper option={option} />;
  }

  // tree-table-helper
  TREE_TABLE_HELPER(option: IFormItem): JSXElement {
    return <FormTreeTableHelper option={option} />;
  }

  // multiple-tree-table-helper
  MULTIPLE_TREE_TABLE_HELPER(option: IFormItem): JSXElement {
    return <FormMultipleTreeTableHelper option={option} />;
  }

  // checkbox
  CHECKBOX(option: IFormItem): JSXElement {
    return <FormCheckbox option={option} />;
  }

  // checkbox-group
  MULTIPLE_CHECKBOX(option: IFormItem): JSXElement {
    return <FormCheckboxGroup option={option} />;
  }

  // radio
  RADIO(option: IFormItem): JSXElement {
    return <FormRadio option={option} />;
  }

  // switch
  SWITCH(option: IFormItem): JSXElement {
    return <FormSwitch option={option} />;
  }

  // textarea
  TEXT_AREA(option: IFormItem): JSXElement {
    return <FormTextArea option={option} />;
  }

  // date
  DATE(option: IFormItem): JSXElement {
    return <FormDate option={option} />;
  }

  // range-date
  RANGE_DATE(option: IFormItem): JSXElement {
    return <FormRangeDate option={option} />;
  }

  // time
  TIME(option: IFormItem): JSXElement {
    return <FormTime option={option} />;
  }

  // range-time
  RANGE_TIME(option: IFormItem): JSXElement {
    return <FormRangeTime option={option} />;
  }

  // select
  SELECT(option: IFormItem): JSXElement {
    return <FormSelect option={option} />;
  }

  // multiple-select
  MULTIPLE_SELECT(option: IFormItem): JSXElement {
    return <FormSelect option={option} multiple />;
  }

  // immediate
  IMMEDIATE(option: IFormItem): JSXElement {
    return <FormImmediate option={option} />;
  }

  // divider
  DIVIDER(option: IFormItem): JSXElement {
    return <FormDivider option={option} />;
  }

  // tree-select
  TREE_SELECT(option: IFormItem): JSXElement {
    return <FormTreeSelect option={option} />;
  }

  // multiple-tree-select
  MULTIPLE_TREE_SELECT(option: IFormItem): JSXElement {
    return <FormTreeSelect option={option} multiple />;
  }

  // cascader
  CASCADER(option: IFormItem): JSXElement {
    return <FormCascader option={option} />;
  }

  // multiple-cascader
  MULTIPLE_CASCADER(option: IFormItem): JSXElement {
    return <FormCascader option={option} multiple />;
  }

  // city-select
  CITY_SELECT(option: IFormItem): JSXElement {
    return <FormCitySelect option={option} />;
  }

  // region-select
  REGION_SELECT(option: IFormItem): JSXElement {
    return <FormRegionSelect option={option} />;
  }

  // upload-file
  UPLOAD_FILE(option: IFormItem): JSXElement {
    return <FormUploadFile option={option} />;
  }

  // upload-img
  UPLOAD_IMG(option: IFormItem): JSXElement {
    return <FormUploadImg option={option} />;
  }

  // tinymce
  TINYMCE(option: IFormItem): JSXElement {
    return <FormTinymce option={option} />;
  }

  // 渲染表单项 label
  renderFormLabel(label: IFormItem) {
    if (!isObject(label)) {
      return label;
    }
    const { type, fieldName, options = {}, disabled, onChange = noop } = label;
    const { itemList = [] } = options;
    return (
      <Form.Item name={fieldName} noStyle>
        {type === 'SELECT' && (
          <Select
            placeholder={''}
            disabled={disabled}
            style={{ width: 'calc(100% - 8px)' }}
            onChange={(value) => onChange(value, itemList.find((x) => x.value === value)!.text)}
          >
            {itemList.map((x) => (
              <Select.Option key={x.value} value={x.value} disabled={x.disabled}>
                {x.text}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
    );
  }

  // 渲染表单项尾部描述信息
  renderFormItemExtra(option: IFormItem['extra'] & { fieldName: string }) {
    const { fieldName, isTooltip, style = {} } = option;
    const { extra } = this.state;
    if (isTooltip) {
      return (
        <Tooltip className={classNames('extra-tooltip')} title={extra[fieldName]}>
          <ExclamationCircleOutlined />
        </Tooltip>
      );
    }
    return (
      <div className={classNames('extra-text')} title={extra[fieldName]} style={style}>
        <span className="extra-overflow-cut">{extra[fieldName]}</span>
      </div>
    );
  }

  // 渲染表单项
  renderFormItem(option: IFormItem) {
    const { label, fieldName, labelWidth = this.props.labelWidth, rules = [], style = {}, render } = option;
    if (isEmpty(this.state.formData)) {
      return null;
    }
    return (
      <Form.Item label={label} name={fieldName} rules={rules} style={{ width: '100%', ...style }} labelCol={{ flex: getParserWidth(labelWidth!) }}>
        {render?.(option, this)}
      </Form.Item>
    );
  }

  // 创建表单项
  createFormItem(item: IFormItem) {
    if (!isFunction(this[item.type])) {
      warn('QmForm', `配置项 ${item.fieldName} 的 type 类型错误`);
      return null;
    }
    return item.render ? this.renderFormItem(item) : this[item.type](item);
  }

  // 表单布局
  createFormLayout() {
    const { flexCols: cols } = this.state;
    const { formType, defaultRows, isFieldsDefine } = this.props;
    // 栅格列的数组
    const colsArr: Partial<IFormItem>[] = [];

    this.formItems.forEach((x) => {
      const { offsetLeft = 0, offsetRight = 0 } = x;
      for (let i = 0; i < offsetLeft; i++) {
        colsArr.push({});
      }
      colsArr.push(x);
      for (let i = 0; i < offsetRight; i++) {
        colsArr.push({});
      }
    });

    const colSpan = 24 / cols;
    const fieldCols: number[] = [];
    // 栅格所占的总列数
    const total = colsArr.reduce((prev, cur) => {
      const { selfCol = 1 } = cur;
      const sum: number = prev + selfCol;
      fieldCols.push(sum); // 当前栅格及之前所跨的列数
      return sum;
    }, 0);

    // 默认展示的行数
    const defaultPlayRows: number = defaultRows! > Math.ceil(total / cols) ? Math.ceil(total / cols) : defaultRows!;

    // 用于获取最后一个展示栅格的 cols
    const tmpArr: number[] = [];
    const colFormItems = colsArr.map((item, i) => {
      let { selfCol = 1 } = item;
      const { type, fieldName } = item;
      // 调整 selfCol 的大小
      selfCol = selfCol >= 24 || type === 'DIVIDER' || type === 'TINYMCE' ? cols : selfCol;
      // 判断改栅格是否显示
      const isBlock: boolean = this.state.collapse || !this.showFilterCollapse ? true : fieldCols[i] < defaultPlayRows * cols;
      const isDisplay: boolean = this.showDividerCollapse ? this.getFormItemDisplay(item as IFormItem) : !0;
      if (isBlock) {
        tmpArr.push(fieldCols[i]);
      }

      return (
        <Col
          key={fieldName ?? i}
          span={selfCol * colSpan}
          style={this.isFilterType ? { display: !this.showFilterCollapse || isBlock ? 'block' : 'none' } : { display: isDisplay ? 'block' : 'none' }}
        >
          {type ? this.createFormItem(cloneDeep(item) as IFormItem) : null}
        </Col>
      );
    });

    // 自定义表单项
    if (isFieldsDefine && formType === 'default') {
      colFormItems.push(<div className={`form-fields__define`}>{this.createFieldsDefine()}</div>);
    }

    return [...colFormItems, this.createSearchButtonLayout(tmpArr[tmpArr.length - 1])];
  }

  // 搜索按钮
  createSearchButtonLayout(lastCols = 0) {
    const { flexCols: cols, collapse } = this.state;
    const { isSearchBtn, isFieldsDefine = true } = this.props;

    // 不是搜索类型
    if (!this.isFilterType) {
      return null;
    }

    const colSpan = 24 / cols;
    // 左侧偏移量
    const offset = cols - (lastCols % cols) - 1;

    return isSearchBtn ? (
      <Col key="-" span={colSpan} offset={offset * colSpan} style={{ textAlign: 'right' }}>
        <Space style={{ marginBottom: 12 }}>
          <QmButton type="primary" size={this.$size} icon={<SearchOutlined />} onClick={() => this.SUBMIT_FORM()}>
            {t('qm.form.search')}
          </QmButton>
          <QmButton size={this.$size} icon={<ReloadOutlined />} onClick={() => this.RESET_FORM()}>
            {t('qm.form.reset')}
          </QmButton>
          {isFieldsDefine ? this.createFieldsDefine() : null}
          {this.showFilterCollapse && (
            <a onClick={() => this.setExpandHandle(!collapse)}>
              {collapse ? <UpOutlined /> : <DownOutlined />} {collapse ? t('qm.form.collect') : t('qm.form.spread')}
            </a>
          )}
        </Space>
      </Col>
    ) : null;
  }

  // 保存按钮
  createFormButtonLayout() {
    const { flexCols: cols } = this.state;
    const { formType, isSubmitBtn } = this.props;
    if (this.isFilterType) {
      return null;
    }
    const colSpan = 24 / cols;
    return isSubmitBtn && formType === 'default' ? (
      <Row gutter={0}>
        <Col key="-" span={colSpan}>
          <Form.Item>
            <Space style={{ marginBottom: 12 }}>
              <QmButton type="primary" size={this.$size} onClick={() => this.SUBMIT_FORM()}>
                {t('qm.form.save')}
              </QmButton>
              <QmButton size={this.$size} onClick={() => this.RESET_FORM()}>
                {t('qm.form.reset')}
              </QmButton>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    ) : null;
  }

  // 列定义
  createFieldsDefine() {
    const { uniqueKey, items, fieldsChange } = this.props;
    return <FieldsFilter uniqueKey={uniqueKey} items={items} fieldsChange={fieldsChange} />;
  }

  // 切换 展开/收起 状态
  setExpandHandle(collapse: boolean) {
    this.setState({ collapse }, () => {
      this.props.onCollapse?.(this.state.collapse);
    });
  }

  // 字段值更新时触发回调事件
  valuesChangeHandle = (changedValues: IFormData, allValues: IFormData) => {
    this.props.onValuesChange?.(changedValues, this._initialValues);
  };

  // 字段更新时触发回调事件
  fieldsChangeHandle = (changedFields: IFieldData[], allFields: IFieldData[]) => {
    this.props.onFieldsChange?.(changedFields, allFields);
  };

  // 提交表单且数据验证成功后回调事件
  finishHandle = (values: IFormData) => {
    this.props.onFinish?.(Object.assign({}, this.get_fields_other(), this.formatFormValue(values)));
  };

  // 提交表单且数据验证失败后回调事件
  finishFailedHandle = ({ values, errorFields }) => {
    this.props.onFinishFailed?.(errorFields);
  };

  // 设置表单额外字段值
  set_fields_other(values: IFormData) {
    this.setState((prevState) => ({
      other: Object.assign({}, prevState.other, this.createOtherValue(values)),
    }));
  }

  // 获取表单额外字段值
  get_fields_other(fields?: string[]) {
    if (!fields) {
      return this.state.other;
    }
    const result: IFormData = {};
    fields.forEach((fieldName) => {
      result[fieldName] = this.state.other[fieldName];
    });
    return result;
  }

  // 对外公开的方法
  // 设置表单字段的值，参数是表单值得集合 { fieldName: val, ... }
  SET_FIELDS_VALUE(values: IFormData) {
    this.formRef.current!.setFieldsValue(values);
    this.set_fields_other(values);
  }

  // 获取表单字段的值，参数是表单字段数组 [fieldName, ...]
  GET_FIELDS_VALUE(fields?: string[]): IFormData {
    if (!fields) {
      return Object.assign({}, this.state.other, this.formRef.current!.getFieldsValue(true));
    }
    return Object.assign({}, this.get_fields_other(fields), this.formRef.current!.getFieldsValue(fields));
  }

  // 获取表单的值，异步方法，错误前置的原则
  async GET_FORM_DATA(): Promise<[any, any]> {
    try {
      const res: IFormData = await this.formRef.current!.validateFields();
      return [null, Object.assign({}, this.get_fields_other(), this.formatFormValue(res))];
    } catch ({ errorFields }) {
      this.formRef.current!.scrollToField(errorFields[0].name);
      return [errorFields, null];
    }
  }

  // 设置表单项描述值
  SET_FIELDS_EXTRA(values: IExtraData) {
    this.setState((prevState) => ({
      extra: Object.assign({}, prevState.extra, values),
    }));
  }

  // 获取表单项描述值，参数是表单字段数组 [fieldName, ...]
  GET_FIELDS_EXTRA(fields?: string[]) {
    if (!fields) {
      return this.state.extra;
    }
    const result: IExtraData = {};
    fields.forEach((fieldName) => {
      result[fieldName] = this.state.extra[fieldName];
    });
    return result;
  }

  // 检查字段是否被用户操作过，参数是表单字段数组 [fieldName, ...]
  GET_FIELDS_TOUCHED(fields?: string[]) {
    return this.formRef.current!.isFieldsTouched(fields);
  }

  // 提交表单
  SUBMIT_FORM() {
    this.formRef.current!.submit();
  }

  // 重置表单
  RESET_FORM() {
    this.formRef.current!.resetFields();
    this.setState({ other: this._initialOthers });
    this.setState({ extra: this._initialExtras });
    this.props.onReset?.();
  }

  render(): React.ReactElement {
    const { className, style, formType, layout, labelWidth, customClass } = this.props;
    const prefixCls = getPrefixCls('form');

    const validateMessages = {
      required: '${label}' + t('qm.form.requiredTips'),
    };

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: this.$size === 'large',
      [`${prefixCls}--sm`]: this.$size === 'small',
      [`${prefixCls}__only-show`]: this.isOnlyShow,
      [customClass!]: !!customClass,
    };

    return (
      <div ref={this.wrapperRef} className={classNames(cls, className)} style={style}>
        <Form
          ref={this.formRef}
          size={this.$size}
          initialValues={this._initialValues}
          layout={layout}
          colon={false}
          labelCol={{ flex: !this.verticalLayout ? getParserWidth(labelWidth!) : 'initial' }}
          scrollToFirstError={true}
          validateMessages={validateMessages}
          onValuesChange={this.valuesChangeHandle}
          onFieldsChange={this.fieldsChangeHandle}
          onFinish={this.finishHandle}
          onFinishFailed={this.finishFailedHandle}
        >
          <FormContext.Provider value={this.provide}>
            <Row gutter={!this.verticalLayout ? 0 : 20}>{this.createFormLayout()}</Row>
            {this.createFormButtonLayout()}
          </FormContext.Provider>
        </Form>
      </div>
    );
  }
}

export default QmForm;
