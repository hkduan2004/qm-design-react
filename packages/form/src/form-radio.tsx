/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-28 16:09:25
 */
import React, { Component } from 'react';
import { isEqual } from 'lodash-es';
import FormContext from './context';
import { noop, getParserWidth, isEmpty, get } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';
import type { IDict } from '../../_utils/types';

import { Form, Row, Col, Radio } from '../../antd';

type IProps = {
  option: IFormItem;
};

type IState = {
  results: IDict[];
};

class FormRadio extends Component<IProps, IState> {
  static contextType = FormContext;

  public state: IState = {
    results: [],
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

  async getItemList() {
    const { request = {} } = this.props.option;
    const { fetchApi, params = {}, dataKey, valueKey = 'value', textKey = 'text' } = request;
    if (!fetchApi) return;
    try {
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        const results = dataList.map((x) => ({ value: x[valueKey], text: x[textKey] }));
        this.setState({ results });
      }
    } catch (err) {
      // ...
    }
  }

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
      style = {},
      readOnly,
      disabled,
      onChange = noop,
    } = this.props.option;
    const { itemList = [] } = options;
    const items = isEmpty(itemList) ? this.state.results : (itemList as IDict[]);
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
              <Radio.Group
                style={{ width: '100%', ...style }}
                disabled={disabled}
                onChange={(ev) => {
                  const { value } = ev.target;
                  const text = items.find((x) => x.value === value)?.text;
                  $$form.setViewValue(fieldName, text);
                  onChange(value);
                }}
              >
                {items.map((x) => (
                  <Radio key={x.value} value={x.value} disabled={x.disabled}>
                    {x.text}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
          {extra && <Col flex={getParserWidth(extra.labelWidth || DEFAULT_LABEL_WIDTH)}>{$$form.renderFormItemExtra({ fieldName, ...extra })}</Col>}
        </Row>
      </Form.Item>
    );
  }
}

export default FormRadio;
