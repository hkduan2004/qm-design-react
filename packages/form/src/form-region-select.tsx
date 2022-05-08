/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-27 09:50:25
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import FormContext from './context';
import ConfigContext from '../../config-provider/context';
import { deepFind } from './utils';
import { getPrefixCls } from '../../_utils/prefix';
import { noop, getParserWidth, get, nextTick, isEmpty } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH, BUILT_IN_PLACEMENTS } from './types';
import type { IFormItem } from './types';
import { IDict } from '../../_utils/types';

import Trigger from 'rc-trigger';
import { Form, Row, Col, Input, Tabs } from '../../antd';
import { QmEmpty } from '../../index';

import chinaData from 'china-area-data';

const formatChinaData = (data: any, key: string): IDict[] | undefined => {
  if (!data[key]) return;
  return Object.keys(data[key]).map((x) => ({
    text: data[key][x],
    value: x,
    children: formatChinaData(data, x),
  }));
};

// 判断 港澳
const isGA = (values: string[]): boolean => {
  return ['810000', '820000'].includes(values[0]);
};

const LEAVE_THREE = 3; // 省市区
const LEAVE_FOUR = 4; // 省市区-街道

type IProps = {
  option: IFormItem;
};

type IState = {
  results: Record<string, any>[];
  visible: boolean;
  values: string[];
  tabs: IDict[][]; // 二维数组
  activeName: string;
};

type IRegionSelectProps<T = string> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T, text: T) => void;
};

class VRegionSelect extends Component<IRegionSelectProps, IState> {
  static contextType = FormContext;

  private searchRef = React.createRef<any>();

  private prevText: string;

  constructor(props: IRegionSelectProps) {
    super(props);
    const results = formatChinaData(chinaData, '86') || [];
    this.state = {
      results: results,
      visible: false,
      values: [],
      tabs: [results.map((x) => ({ text: x.text, value: x.value }))],
      activeName: '0',
    } as IState;
  }

  componentDidMount() {
    this.initial();
    this.setInputReadonly();
  }

  componentDidUpdate(prevProps: IRegionSelectProps) {
    const { value: prevValue } = prevProps;
    const { value: nextValue } = this.props;
    if (prevValue !== nextValue && this.state.values.join(',') !== (nextValue ?? '')) {
      this.initial();
    }
  }

  get isFetch() {
    return !!this.props.option.request?.fetchApi;
  }

  get leave() {
    return !this.isFetch ? LEAVE_THREE : LEAVE_FOUR;
  }

  handleVisibleChange = (visible: boolean) => {
    this.setState({ visible });
  };

  triggerChange = (value: string) => {
    const { onChange, onValuesChange } = this.props;
    onChange?.(value);
    onValuesChange(value, this.createTextValue(value));
    this.handleVisibleChange(false);
  };

  setInputReadonly() {
    this.searchRef.current!.input.setAttribute('readonly', 'readonly');
  }

  createTextValue(val: string | undefined) {
    const values: string[] = val ? val.split(',') : [];
    return values.map((x, i) => this.state.tabs[i]?.find((k) => k.value === x)?.text).join('/');
  }

  initial() {
    const { value } = this.props;
    const values = value ? value.split(',') : [];
    this.setState({ values }, () => {
      this.createTabs();
      this.createActiveName(values.length ? values.length - 1 : 0);
    });
  }

  createActiveName(index: number | string) {
    this.setState({ activeName: index.toString() });
  }

  createTabs() {
    const { results, values } = this.state;
    if (!results.length) return;
    const tabs = this.state.tabs.slice(0, 1);
    for (let i = 0; i < values.length; i++) {
      const target = deepFind(results, values[i]);
      if (target && isEmpty(target.children)) {
        if (this.isFetch) {
          this.getStreetList(values[i]);
        }
        break;
      }
      if (Array.isArray(target?.children)) {
        tabs[i + 1] = target?.children.map((x) => ({ text: x.text, value: x.value }));
      }
    }
    this.setState({ tabs });
  }

  async getStreetList(code: string) {
    const { request = {} } = this.props.option;
    const { fetchApi, dataKey, valueKey = 'value', textKey = 'text' } = request;
    if (!fetchApi) return;
    try {
      const res = await fetchApi({ code });
      if (res.code === 200) {
        const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        this.setState((prevState) => {
          return { tabs: [...prevState.tabs, dataList.map((x) => ({ text: x[textKey], value: x[valueKey] }))] };
        });
      }
    } catch (err) {
      // ...
    }
  }

  renderTabs() {
    const { values } = this.state;
    const tabPanes = this.state.tabs.map((arr, index) => {
      const label: string =
        arr.find((x) => x.value === values[index])?.text ||
        `${t('qm.form.selectPlaceholder').replace('...', '')}(${t('qm.form.regionSelectLabel')[index]})`;
      return (
        <Tabs.TabPane key={index.toString()} tab={label}>
          <div className="region-box">
            {arr.map((x) => (
              <span
                key={x.value}
                className={classNames({ [`region-box__item`]: true, actived: values.includes(x.value) })}
                title={x.text}
                onClick={(): void => {
                  let { values } = this.state;
                  values[index] = x.value;
                  values = values.slice(0, index + 1);
                  this.setState({ values }, () => {
                    // 港澳 是两级，比正常的少一级
                    const n = !isGA(values) ? this.leave : this.leave - 1;
                    if (index + 1 >= n) {
                      return this.triggerChange(values.join(','));
                    }
                    this.createTabs();
                    this.createActiveName(index + 1);
                  });
                }}
              >
                {x.text}
              </span>
            ))}
          </div>
        </Tabs.TabPane>
      );
    });
    if (!tabPanes.length) {
      return <QmEmpty />;
    }
    return (
      <Tabs
        size="small"
        activeKey={this.state.activeName}
        onChange={(key) => {
          this.createActiveName(key);
        }}
      >
        {tabPanes}
      </Tabs>
    );
  }

  render(): React.ReactElement {
    const { visible } = this.state;
    const { value } = this.props;
    const {
      options = {},
      style = {},
      placeholder = t('qm.form.selectPlaceholder'),
      bordered = true,
      allowClear = true,
      readOnly,
      disabled,
    } = this.props.option;
    const prefixCls = getPrefixCls('form-region-select');

    const minWidth = this.searchRef.current ? (this.searchRef.current.input.parentNode as HTMLElement).offsetWidth : 300;

    const contentNode = (
      <div className="container" style={{ ...style }}>
        {this.renderTabs()}
      </div>
    );

    let textValue: string = this.prevText;
    if (!visible) {
      const temp: string = this.createTextValue(value);
      if (temp === '' || temp.split('/').every((x) => x !== '')) {
        textValue = temp;
        this.prevText = textValue;
      }
    }

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
                value={textValue}
                onChange={(ev) => {
                  const { value } = ev.target;
                  this.triggerChange(value);
                  !value && nextTick(() => this.initial());
                }}
              />
            </Trigger>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}

class FormRegionSelect extends Component<IProps> {
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
        labelCol={{ flex: !$$form.verticalLayout ? getParserWidth(labelWidth) : 'initial' }}
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
              <VRegionSelect
                option={this.props.option}
                onValuesChange={(value, text) => {
                  onChange(value);
                  $$form.setViewValue(fieldName, text);
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

export default FormRegionSelect;
