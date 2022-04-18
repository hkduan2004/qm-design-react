/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-27 10:48:31
 */
import React, { Component } from 'react';
import { get, merge } from 'lodash-es';
import FormContext from './context';
import { getParserWidth, nextTick, noop, trueNoop } from '../../_utils/util';
import { t } from '../../locale';
import { warn } from '../../_utils/error';
import { SizeHeight } from '../../_utils/types';
import { DEFAULT_LABEL_WIDTH, IFormData } from './types';

import type { IFormItem } from './types';
import type { ValueOf } from '../../_utils/types';

import { QmModal, QmSearchHelper } from '../../index';
import { Form, Row, Col, Input } from '../../antd';

const { Search } = Input;

type IProps = {
  option: IFormItem;
};

type IState = {
  visible: boolean;
  loading: boolean;
};

type ISearchProps<T = string> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

class VSearch extends Component<ISearchProps, IState> {
  static contextType = FormContext;

  // 搜索帮助配置参数
  public searchHelper: IFormItem['searchHelper'];

  // 表单字段映射
  public alias: Record<string, string>;

  // 描述信息字段映射
  public extras: Record<string, string>;

  // 派生参数
  public deriveParams: Record<string, unknown>;

  // 值是否变化
  public _is_change = false;

  state: IState = {
    visible: false,
    loading: false,
  };

  constructor(props: ISearchProps) {
    super(props);
    this.initialHandle();
  }

  setVisible = (visible: boolean, cb?: () => void) => {
    this.setState({ visible }, () => cb?.());
  };

  // ===================================

  // 初始化方法
  initialHandle = () => {
    const { fieldName, searchHelper } = this.props.option;
    this.searchHelper = searchHelper || {};
    const fieldAliasMap = this.searchHelper.fieldAliasMap;
    const extraAliasMap = this.searchHelper.extraAliasMap;
    if (!fieldAliasMap) {
      warn('QmForm', 'searchHelper 需要配置 `fieldAliasMap` 选项');
    }
    this.alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap || {};
    this.extras = typeof extraAliasMap === 'function' ? extraAliasMap() : extraAliasMap || {};
    if (!Object.keys(this.alias).includes(fieldName)) {
      warn('QmForm', 'fieldAliasMap 选项必须包含自身 `fieldName` 值');
    }
  };

  // 执行打开动作
  todoOpen = (val: string) => {
    this.deriveParams = this.createFilters(val);
    this.setVisible(true);
  };

  // 设置搜做帮助组件表单数据
  createFilters = (val: string) => {
    const { fieldName } = this.props.option;
    const { filterAliasMap } = this.searchHelper!;
    const filterAlias = typeof filterAliasMap === 'function' ? filterAliasMap() : filterAliasMap ?? [];
    const inputParams: Record<string, unknown> = { [fieldName]: val };
    filterAlias.forEach((x) => (inputParams[x] = val));
    return inputParams;
  };

  // 执行搜索帮助接口，获取数据
  getSearchHelperTableData = (val: string): Promise<Record<string, unknown>[]> => {
    const { table, initialValue = {} } = this.searchHelper!;
    const { beforeFetch = trueNoop } = table!.fetch!;
    return new Promise(async (resolve, reject) => {
      const params: any = merge(
        {},
        table!.fetch!.params,
        {
          ...initialValue,
          ...this.createFilters(val),
        },
        {
          currentPage: 1,
          pageSize: 500,
        }
      );
      try {
        if (!beforeFetch(params)) {
          return reject();
        }
        this.setState({ loading: true });
        const res = await table!.fetch!.api(params);
        nextTick(() => this.setState({ loading: false }));
        if (res.code === 200) {
          const list: Record<string, unknown>[] = Array.isArray(res.data) ? res.data : get(res.data, table!.fetch!.dataKey!) ?? [];
          return resolve(list);
        }
      } catch (err) {
        this.setState({ loading: false });
      }
      reject();
    });
  };

  // 设置搜索帮助的值
  resetSearchHelperValue = async (list: Record<string, unknown>[] = [], val: string) => {
    const { fieldName } = this.props.option;
    const records = list.filter((data) => (data[this.alias[fieldName]] as any)?.toString().toLowerCase().includes(val.toLowerCase()));
    if (records.length === 1) {
      return this.closeSearchHelper(records[0]);
    }
    this.openSearchHelper(val);
  };

  // 打开搜索帮助面板
  openSearchHelper = (val: string, cb?: () => void) => {
    const { $$form } = this.context;
    const { beforeOpen } = this.searchHelper!;
    // 打开的前置钩子
    const open = beforeOpen ?? trueNoop;
    const before = open($$form.state.formData);
    if ((before as Promise<void>)?.then) {
      (before as Promise<void>)
        .then(() => {
          this.todoOpen(val);
          cb?.();
        })
        .catch(() => {});
    } else if (before !== false) {
      this.todoOpen(val);
      cb?.();
    }
  };

  // 搜索帮助关闭，回显值事件
  closeSearchHelper = (data: Record<string, any>) => {
    const { $$form } = this.context;
    const { fieldName } = this.props.option;
    for (const key in this.alias) {
      if (key === fieldName) continue;
      const val = data[this.alias[key]];
      $$form.SET_FIELDS_VALUE({ [key]: val });
    }
    for (const key in this.extras) {
      const val = data[this.extras[key]];
      $$form.SET_FIELDS_EXTRA({ [key]: val });
    }
    this.triggerChange(data[this.alias[fieldName]]);
    this.searchHelperChangeHandle(data[this.alias[fieldName]]);
    const { closed } = this.searchHelper!;
    this.setVisible(false, () => {
      closed?.(data);
    });
  };

  // 关闭但是没选择数据
  closeButNotSelect = () => {
    const { closeRemoteMatch, onlySelect = true } = this.searchHelper!;
    if (this._is_change) {
      !closeRemoteMatch && onlySelect ? this.clearSearchHelperValue() : this.searchHelperChangeHandle(this.props.value);
    }
    this._is_change = false;
    this.setVisible(false);
  };

  // 清空搜索帮助
  clearSearchHelperValue = () => {
    const { fieldName } = this.props.option;
    const { $$form } = this.context;
    for (const key in this.alias) {
      if (key === fieldName) continue;
      $$form.SET_FIELDS_VALUE({ [key]: undefined });
    }
    for (const key in this.extras) {
      $$form.SET_FIELDS_EXTRA({ [key]: '' });
    }
    this.triggerChange('');
    this.searchHelperChangeHandle('');
  };

  // 搜索帮助 change 事件
  searchHelperChangeHandle = (val?: string) => {
    const { fieldName, onChange } = this.props.option;
    const { $$form } = this.context;
    const others: Record<string, ValueOf<IFormData>> = {};
    Object.keys(this.alias).forEach((key) => {
      if (key === fieldName) return;
      others[key] = $$form.state.formData[key];
    });
    this.deriveParams = {};
    this._is_change = false;
    onChange?.(val, Object.keys(others).length ? others : null);
  };

  // ===================================

  triggerChange = (value: string) => {
    const { onChange, onValuesChange } = this.props;
    onChange?.(value);
    onValuesChange(value);
  };

  render(): React.ReactElement {
    const { $$form } = this.context;
    const { visible, loading } = this.state;
    const { value } = this.props;
    const {
      type,
      options = {},
      searchHelper = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      bordered = true,
      allowClear = true,
      readOnly,
      disabled,
    } = this.props.option;

    const { prefix, suffix, maxLength } = options;

    const dialogProps = {
      visible,
      title: t('qm.searchHelper.text'),
      width: searchHelper.width ?? '60%',
      loading: false,
      bodyStyle: { paddingBottom: `${SizeHeight[$$form.$size] + 20}px` },
      onClose: () => {
        this.closeButNotSelect();
      },
    };

    const helperProps = {
      ...searchHelper,
      size: $$form.$size,
      initialValue: merge({}, searchHelper.initialValue, this.deriveParams),
      onClose: (data) => {
        if (data) {
          this.closeSearchHelper(data);
        } else {
          this.closeButNotSelect();
        }
      },
    };

    return (
      <>
        <Search
          ref={(ref) => (this[`${type}_Ref`] = ref)}
          value={value}
          loading={loading}
          placeholder={placeholder}
          style={style}
          prefix={prefix}
          suffix={suffix}
          maxLength={maxLength}
          bordered={bordered}
          allowClear={allowClear}
          readOnly={readOnly}
          disabled={disabled}
          onBlur={(ev) => {
            const { value } = ev.target;
            if (!this._is_change || visible) return;
            if (!value) {
              this.clearSearchHelperValue();
            } else {
              if (searchHelper.closeRemoteMatch) {
                this.searchHelperChangeHandle(value);
              } else if (searchHelper.table?.fetch?.api) {
                this.getSearchHelperTableData(value)
                  .then((list) => this.resetSearchHelperValue(list, value))
                  .catch(() => this.clearSearchHelperValue());
              }
            }
          }}
          onKeyUp={(ev) => {
            if (ev.keyCode === 13) {
              ev.preventDefault();
              const { value } = ev.target as HTMLInputElement;
              this.openSearchHelper(value);
            }
          }}
          onDoubleClick={(ev) => {
            const { value } = ev.target as HTMLInputElement;
            this.openSearchHelper(value);
          }}
          onChange={(ev) => {
            const { value } = ev.target;
            this.triggerChange(value);
            this._is_change = true;
          }}
          onSearch={(value, ev) => {
            if (ev?.type !== 'click') return;
            // 放大镜
            if ((ev.target as HTMLElement).tagName !== 'INPUT') {
              this.openSearchHelper(value);
            } else {
              this.clearSearchHelperValue();
            }
          }}
        />
        <QmModal {...dialogProps}>
          <QmSearchHelper {...helperProps} />
        </QmModal>
      </>
    );
  }
}

class FormSearchHelper extends Component<IProps> {
  static contextType = FormContext;

  render(): React.ReactElement {
    const { $$form } = this.context;
    const { type, label, tooltip, fieldName, invisible, options = {}, labelWidth = $$form.props.labelWidth, extra, rules = [] } = this.props.option;

    return (
      <Form.Item
        label={$$form.renderFormLabel(label)}
        tooltip={tooltip}
        hidden={invisible}
        labelCol={{ flex: getParserWidth(labelWidth) }}
        required={$$form.getFormItemRequired(rules)}
      >
        <Row wrap={false} gutter={8}>
          <Col flex="auto">
            <Form.Item
              name={fieldName}
              noStyle
              rules={rules}
              messageVariables={{
                label: $$form.getFormItemLabel(label),
              }}
            >
              <VSearch
                option={this.props.option}
                onValuesChange={(value = '') => {
                  $$form.setViewValue(fieldName, value);
                }}
              />
            </Form.Item>
          </Col>
          {extra && <Col flex={getParserWidth(extra.labelWidth || DEFAULT_LABEL_WIDTH)}>{$$form.renderFormItemExtra({ fieldName, ...extra })}</Col>}
        </Row>
      </Form.Item>
    );
  }
}

export default FormSearchHelper;
