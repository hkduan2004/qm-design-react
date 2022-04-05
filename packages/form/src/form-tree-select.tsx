/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 09:21:49
 */
import React, { Component } from 'react';
import { isEqual } from 'lodash-es';
import FormContext from './context';
import { deepMapList, deepFind } from './utils';
import { noop, getParserWidth, isEmpty, get } from '../../_utils/util';
import { t } from '../../locale';
import pinyin from '../../pinyin';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';
import type { IDict } from '../../_utils/types';

import { Form, Row, Col, TreeSelect } from '../../antd';
const { TreeNode } = TreeSelect;

type IProps = {
  option: IFormItem;
  multiple?: boolean;
};

type IState = {
  results: IDict[];
  loading: boolean;
};

class FormTreeSelect extends Component<IProps, IState> {
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

  getItemText(val, items: IDict[]) {
    return deepFind(items, val)?.text || '';
  }

  createViewText(val, items: IDict[]) {
    if (!this.props.multiple) {
      return this.getItemText(val, items);
    }
    return val
      .map((x) => this.getItemText(x, items))
      .filter((x) => !!x)
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
        const results = deepMapList(dataList, valueKey, textKey);
        this.setState({ results });
      }
    } catch (err) {
      // ...
    }
    this.setState({ loading: false });
  }

  createTreeNode(items: IDict[]) {
    return items.map((x) => {
      if (Array.isArray(x.children)) {
        return (
          <TreeNode key={x.value} value={x.value} title={x.text} disabled={x.disabled}>
            {this.createTreeNode(x.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={x.value} value={x.value} title={x.text} disabled={x.disabled} />;
    });
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
    const { itemList = [], filterable = true, collapseTags, openPyt = true } = options;
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
              <TreeSelect
                multiple={multiple}
                placeholder={placeholder}
                style={style}
                loading={loading}
                bordered={bordered}
                allowClear={allowClear}
                disabled={disabled}
                treeDefaultExpandAll={true}
                showSearch={filterable}
                maxTagCount={collapseTags ? 'responsive' : undefined}
                filterTreeNode={(input, option) => {
                  const text: string = (option?.title as string) || '';
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
                {this.createTreeNode(items)}
              </TreeSelect>
            </Form.Item>
          </Col>
          {extra && <Col flex={getParserWidth(extra.labelWidth || DEFAULT_LABEL_WIDTH)}>{$$form.renderFormItemExtra({ fieldName, ...extra })}</Col>}
        </Row>
      </Form.Item>
    );
  }
}

export default FormTreeSelect;
