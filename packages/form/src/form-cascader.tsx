/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-27 14:37:24
 */
import React, { Component } from 'react';
import { isEqual } from 'lodash-es';
import FormContext from './context';
import { deepMapList, deepFindValues } from './utils';
import { noop, getParserWidth, isEmpty, get } from '../../_utils/util';
import { t } from '../../locale';
import pinyin from '../../pinyin';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';
import type { IDict } from '../../_utils/types';

import { Form, Row, Col, Cascader } from '../../antd';

type IProps = {
  option: IFormItem;
  multiple?: boolean;
};

type IState = {
  results: IDict[];
  loading: boolean;
};

type ICascaderProps<T = string | string[]> = IProps & {
  value?: T;
  cascaderData: IDict[];
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

const VCascader: React.FC<ICascaderProps> = (props) => {
  const { value, multiple, cascaderData } = props;
  const {
    options = {},
    style = {},
    placeholder = t('qm.form.selectPlaceholder'),
    bordered = true,
    allowClear = true,
    readOnly,
    disabled,
  } = props.option;
  const { filterable = true, openPyt = true } = options;

  const filter = (input, path) => {
    return path.some((option) => {
      const text: string = option?.text || '';
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
    });
  };

  const createValue = () => {
    if (isEmpty(value)) {
      return [];
    }
    if (!multiple) {
      return (value as string).split(',');
    }
    return (value as string[]).map((x) => x.split(','));
  };

  const triggerChange = (value: string | string[]) => {
    const { onChange, onValuesChange } = props;
    onChange?.(value);
    onValuesChange(value);
  };

  return (
    <Cascader
      fieldNames={{ label: 'text', value: 'value', children: 'children' }}
      multiple={multiple}
      maxTagCount={'responsive'}
      value={createValue()}
      options={cascaderData as any}
      placeholder={placeholder}
      style={style}
      bordered={bordered}
      allowClear={allowClear}
      disabled={disabled}
      showSearch={filterable && { filter }}
      onChange={(value: unknown[] = []) => {
        triggerChange(!multiple ? value.join(',') : value.map((x) => (x as unknown as string[]).join(',')));
      }}
    />
  );
};

class FormCascader extends Component<IProps, IState> {
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

  createViewText(val: string | string[], items: IDict[]) {
    if (!this.props.multiple) {
      return deepFindValues<IDict>(items, val as string)
        .map((option) => option.text)
        .join('/');
    }
    return (val as unknown as string[])
      .map((x) => {
        return deepFindValues<IDict>(items, x)
          .map((option) => option.text)
          .join('/');
      })
      .join(',');
  }

  async getItemList() {
    const { request = {} } = this.props.option;
    const { fetchApi, params = {}, dataKey, valueKey = 'value', textKey = 'text' } = request;
    if (!fetchApi) return;
    this.setState({ loading: true });
    try {
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        const results = deepMapList(dataList, valueKey, textKey);
        this.setState({ results });
      }
    } catch (err) {
      // ...
    }
    this.setState({ loading: false });
  }

  render(): React.ReactElement {
    const { $$form } = this.context;
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
      onChange = noop,
    } = this.props.option;
    const { itemList = [] } = options;
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
              <VCascader
                option={this.props.option}
                multiple={multiple}
                cascaderData={items}
                onValuesChange={(value) => {
                  const text = this.createViewText(value, items);
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

export default FormCascader;
