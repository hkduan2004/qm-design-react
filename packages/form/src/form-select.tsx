/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 09:21:33
 */
import React, { Component } from 'react';
import { isEqual } from 'lodash-es';
import FormContext from './context';
import { noop, getParserWidth, isEmpty, get } from '../../_utils/util';
import { t } from '../../locale';
import pinyin from '../../pinyin';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';
import type { IDict } from '../../_utils/types';

import { Form, Row, Col, Select } from '../../antd';

const { Option } = Select;

type IProps = {
  option: IFormItem;
  multiple?: boolean;
};

type IState = {
  results: IDict[];
  loading: boolean;
};

class FormSelect extends Component<IProps, IState> {
  static contextType = FormContext;

  public state: IState = {
    results: [],
    loading: false,
  };

  componentDidMount() {
    this.getItemList();
  }

  componentDidUpdate(prevProps: IProps) {
    const prevParams = prevProps.option.request?.params;
    const params = this.props.option.request?.params;
    if (!isEqual(prevParams, params)) {
      this.getItemList();
    }
  }

  createViewText(val, list: IDict[]) {
    return !this.props.multiple
      ? list.find((x) => x.value === val)?.text
      : list
          .filter((x) => val?.includes(x.value))
          .map((x) => x.text)
          .join(',');
  }

  async getItemList() {
    const { request = {} } = this.props.option;
    const { fetchApi, params = {}, dataKey = '', valueKey = 'value', textKey = 'text' } = request;
    if (!fetchApi) return;
    this.setState({ loading: true });
    try {
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !dataKey ? res.data : get(res.data, dataKey, []);
        const results = dataList.map((x) => ({ value: x[valueKey], text: x[textKey] }));
        this.setState({ results });
      }
    } catch (err) {
      // ...
    }
    this.setState({ loading: false });
  }

  render(): React.ReactElement {
    const { $$form } = this.context;
    const { loading } = this.state;
    const { multiple } = this.props;
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
      style = {},
      placeholder = t('qm.form.selectPlaceholder'),
      bordered = true,
      allowClear = true,
      readOnly,
      disabled,
      onChange = noop,
    } = this.props.option;
    const { itemList = [], filterable = true, collapseTags, maxTagTextLength, openPyt = true } = options;
    const items = isEmpty(itemList) ? this.state.results : (itemList as IDict[]);
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
              <Select
                mode={multiple ? 'multiple' : undefined}
                placeholder={placeholder}
                style={style}
                loading={loading}
                bordered={bordered}
                allowClear={allowClear}
                disabled={disabled}
                showSearch={filterable}
                maxTagCount={collapseTags ? 'responsive' : undefined}
                maxTagTextLength={maxTagTextLength}
                filterOption={(input, option) => {
                  const text = (option?.children || '') as string;
                  const pyt: string = pinyin
                    .parse(text)
                    .map((v) => {
                      if (v.type === 2) {
                        return v.target.toLowerCase().slice(0, 1);
                      }
                      return v.target;
                    })
                    .join('');
                  const str: string = openPyt ? `${text}|${pyt}` : text;
                  return str.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
                onChange={(value) => {
                  const text = this.createViewText(value, items);
                  $$form.setViewValue(fieldName, text);
                  onChange(value, text);
                }}
              >
                {items.map((x) => (
                  <Option key={x.value} value={x.value} disabled={x.disabled}>
                    {x.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {extra && <Col flex={getParserWidth(extra.labelWidth || DEFAULT_LABEL_WIDTH)}>{$$form.renderFormItemExtra({ fieldName, ...extra })}</Col>}
        </Row>
      </Form.Item>
    );
  }
}

export default FormSelect;
