/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-27 13:47:51
 */
import React, { Component } from 'react';
import { merge } from 'lodash-es';
import FormContext from './context';
import { noop, trueNoop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { warn } from '../../_utils/error';
import { SizeHeight } from '../../_utils/types';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';

import { QmModal, QmTreeTableHelper } from '../../index';
import { Form, Row, Col, Input } from '../../antd';

const { Search } = Input;

type IProps = {
  option: IFormItem;
};

type IState = {
  visible: boolean;
};

type ITreeTableHelperProps<T = string> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

class VTreeTableHelper extends Component<ITreeTableHelperProps, IState> {
  static contextType = FormContext;

  // 搜索帮助配置参数
  public searchHelper: IFormItem['searchHelper'];

  // 表单字段映射
  public alias: Record<string, string>;

  // 描述信息字段映射
  public extras: Record<string, string>;

  public state: IState = {
    visible: false,
  };

  constructor(props: ITreeTableHelperProps) {
    super(props);
    this.initialHandle();
  }

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

  setVisible = (visible: boolean, cb?: () => void) => {
    this.setState({ visible }, () => cb?.());
  };

  // 打开搜索帮助面板
  openSearchHelper = (cb?: () => void) => {
    const { $$form } = this.context;
    const { beforeOpen } = this.searchHelper!;
    // 打开的前置钩子
    const open = beforeOpen ?? trueNoop;
    const before = open($$form.state.formData);
    if ((before as Promise<void>)?.then) {
      (before as Promise<void>)
        .then(() => {
          this.setVisible(true);
          cb?.();
        })
        .catch(() => {});
    } else if (before !== false) {
      this.setVisible(true);
      cb?.();
    }
  };

  // 搜索帮助关闭，回显值事件
  closeSearchHelper = (data: Record<string, any>[]) => {
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
    const { closed } = this.searchHelper!;
    this.setVisible(false, () => {
      closed?.(data);
    });
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
  };

  triggerChange = (value: string) => {
    const { onChange, onValuesChange } = this.props;
    onChange?.(value);
    onValuesChange(value);
  };

  render() {
    const { $$form } = this.context;
    const { visible } = this.state;
    const { value } = this.props;
    const {
      type,
      options = {},
      searchHelper = {},
      style = {},
      placeholder = t('qm.form.selectPlaceholder'),
      bordered = true,
      allowClear = true,
      readOnly,
      disabled,
    } = this.props.option;
    const { prefix, suffix, maxLength } = options;

    const dialogProps = {
      visible,
      title: t('qm.searchHelper.text'),
      width: searchHelper.width ?? '65%',
      loading: false,
      bodyStyle: { paddingBottom: `${SizeHeight[$$form.$size] + 20}px` },
      onClose: () => {
        this.setVisible(false);
      },
    };

    const helperProps = {
      ...searchHelper,
      size: $$form.$size,
      initialValue: merge({}, searchHelper.initialValue),
      onClose: (data) => {
        if (data) {
          this.closeSearchHelper(data);
        } else {
          this.setVisible(false);
        }
      },
    };

    return (
      <>
        <Search
          ref={(ref) => (this[`${type}_Ref`] = ref)}
          value={value ?? ''}
          placeholder={placeholder}
          style={style}
          prefix={prefix}
          suffix={suffix}
          maxLength={maxLength}
          bordered={bordered}
          allowClear={allowClear}
          readOnly={readOnly}
          disabled={disabled}
          onKeyUp={(ev) => {
            if (ev.keyCode === 13) {
              ev.preventDefault();
              this.openSearchHelper();
            }
          }}
          onDoubleClick={(ev) => {
            this.openSearchHelper();
          }}
          onSearch={(value, ev) => {
            if (ev?.type !== 'click') return;
            // 放大镜
            if ((ev.target as HTMLElement).tagName !== 'INPUT') {
              this.openSearchHelper();
            } else {
              this.clearSearchHelperValue();
            }
          }}
        />
        <QmModal {...dialogProps}>
          <QmTreeTableHelper {...helperProps} />
        </QmModal>
      </>
    );
  }
}

class FormTreeTableHelper extends Component<IProps> {
  static contextType = FormContext;

  render(): React.ReactElement {
    const { $$form } = this.context;
    const {
      type,
      label,
      tooltip,
      fieldName,
      invisible,
      options = {},
      labelWidth = $$form.props.labelWidth,
      extra,
      rules = [],
      onChange = noop,
    } = this.props.option;

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
              <VTreeTableHelper
                option={this.props.option}
                onValuesChange={(value) => {
                  onChange(value);
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

export default FormTreeTableHelper;
