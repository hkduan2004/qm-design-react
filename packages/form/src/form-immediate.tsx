/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-01 14:18:23
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import FormContext from './context';
import ConfigContext from '../../config-provider/context';
import { getPrefixCls } from '../../_utils/prefix';
import { noop, getParserWidth, debounce, get } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH, BUILT_IN_PLACEMENTS } from './types';
import type { IFormItem } from './types';

import Trigger from 'rc-trigger';
import { Form, Row, Col, Input, Spin } from '../../antd';
import { QmEmpty } from '../../index';

type IProps = {
  option: IFormItem;
};

type IState = {
  results: Record<string, any>[];
  visible: boolean;
  loading: boolean;
  activeIndex: number;
};

type ISerachProps<T = string> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

class VSearch extends Component<ISerachProps, IState> {
  static contextType = FormContext;

  private prevValue: string;

  private searchRef = React.createRef<any>();

  public state: IState = {
    results: [],
    visible: false,
    loading: false,
    activeIndex: 0,
  };

  async getItemList(input?: string) {
    const { fieldName, request = {} } = this.props.option;
    const { fetchApi, params = {}, dataKey } = request;
    if (!fetchApi) return;
    this.setState({ loading: true });
    try {
      const res = await fetchApi({ ...params, ...{ [fieldName]: input } });
      if (res.code === 200) {
        const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        this.setState({ results: dataList, activeIndex: 0 });
      }
    } catch (err) {
      // ...
    }
    this.setState({ loading: false });
  }

  fetchHandle = debounce(this.getItemList, 200);

  handleVisibleChange = (visible: boolean) => {
    this.setState({ visible });
  };

  triggerChange = (value: string, isValuesChange: boolean) => {
    const { onChange, onValuesChange } = this.props;
    onChange?.(value);
    isValuesChange && onValuesChange(value);
  };

  clickHandle = (row: Record<string, any>, cb?: () => void) => {
    const { $$form } = this.context;
    const { fieldName, options = {} } = this.props.option;
    const { fieldAliasMap = {}, extraAliasMap = {} } = options;
    // 表单字段映射
    const alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap;
    for (const key in alias) {
      if (key === fieldName) continue;
      $$form.SET_FIELDS_VALUE({ [key]: row[alias[key]] });
    }
    // 描述字段映射
    const alias2 = typeof extraAliasMap === 'function' ? extraAliasMap() : extraAliasMap;
    for (const key in alias2) {
      $$form.SET_FIELDS_EXTRA({ [key]: row[alias2[key]] });
    }
    // 保持焦点状态
    this.searchRef.current!.focus();
    // 改变值
    this.prevValue = row[alias[fieldName]] ?? '';
    this.triggerChange(row[alias[fieldName]], true);
    // 执行回调
    cb && cb();
  };

  render() {
    const { visible, loading, results } = this.state;
    const { value } = this.props;
    const {
      options = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      bordered = true,
      allowClear = true,
      readOnly,
      disabled,
    } = this.props.option;
    const { columns = [], hideHeader, onlySelect = true } = options;
    const prefixCls = getPrefixCls('form-immediate');

    const minWidth = this.searchRef.current ? (this.searchRef.current.input.parentNode as HTMLElement).offsetWidth : 300;

    const contentNode = (
      <Spin spinning={loading}>
        {results.length ? (
          <table cellSpacing={0} cellPadding={0} className={classNames('table')}>
            {!hideHeader && (
              <thead>
                <tr>
                  {columns
                    .filter((x) => !x.hidden)
                    .map((x) => (
                      <th key={x.dataIndex} style={{ width: `${x.width}px`, backgroundColor: '#f0f0f0' }}>
                        {x.title}
                      </th>
                    ))}
                </tr>
              </thead>
            )}
            <tbody>
              {results.map((item, index) => (
                <tr
                  key={index}
                  className={this.state.activeIndex === index ? 'active' : ''}
                  onMouseEnter={() => {
                    this.setState({ activeIndex: index });
                  }}
                  onClick={() => {
                    this.clickHandle(item, () => this.handleVisibleChange(false));
                  }}
                >
                  {columns
                    .filter((x) => !x.hidden)
                    .map((x) => (
                      <td key={x.dataIndex}>{get(item, x.dataIndex)}</td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <QmEmpty />
        )}
      </Spin>
    );

    return (
      <ConfigContext.Consumer>
        {(context) => {
          const cls = {
            [prefixCls]: true,
            [`${prefixCls}--lg`]: context?.size === 'large',
            [`${prefixCls}--sm`]: context?.size === 'small',
          };
          return (
            <Trigger
              action={!disabled ? ['click'] : []}
              popupVisible={!disabled ? visible : false}
              popup={contentNode}
              popupClassName={classNames(cls)}
              popupStyle={{ minWidth, ...style }}
              onPopupVisibleChange={this.handleVisibleChange}
              builtinPlacements={BUILT_IN_PLACEMENTS}
              prefixCls="ant-select-dropdown"
              popupPlacement="bottomLeft"
              popupTransitionName="ant-slide-up"
            >
              <Input
                ref={this.searchRef}
                placeholder={placeholder}
                allowClear={allowClear}
                bordered={bordered}
                readOnly={readOnly}
                disabled={disabled}
                value={value}
                onFocus={() => {
                  !results.length && this.fetchHandle(value);
                }}
                onBlur={(ev) => {
                  const { value } = ev.target;
                  if (onlySelect && value !== this.prevValue) {
                    this.triggerChange(this.prevValue, false);
                  }
                }}
                onKeyUp={(ev) => {
                  if (ev.keyCode === 27) {
                    this.handleVisibleChange(false);
                  }
                  if (ev.keyCode === 13) {
                    this.clickHandle(results[this.state.activeIndex], () => this.handleVisibleChange(false));
                  }
                  if (ev.keyCode === 38 || ev.keyCode === 40) {
                    if (!this.state.visible) {
                      return this.handleVisibleChange(true);
                    }
                    let index = this.state.activeIndex;
                    const nextIndex = ev.keyCode === 40 ? ++index % results.length : (--index + results.length) % results.length;
                    this.setState({ activeIndex: nextIndex });
                  }
                }}
                onChange={(ev) => {
                  const { value } = ev.target;
                  this.fetchHandle(value);
                  // 清空输入框 或 点击清楚按钮
                  if (!value && this.prevValue) {
                    this.clickHandle({});
                  } else {
                    this.handleVisibleChange(true);
                    this.triggerChange(value, !onlySelect);
                  }
                }}
              />
            </Trigger>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}

class FormImmediate extends Component<IProps> {
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
              <VSearch
                option={this.props.option}
                onValuesChange={(value = '') => {
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

export default FormImmediate;
