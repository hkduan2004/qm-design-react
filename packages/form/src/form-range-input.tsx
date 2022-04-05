/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-10 10:06:14
 */
import React, { Component } from 'react';
import FormContext from './context';
import { noop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, Input } from '../../antd';

type IProps = {
  option: IFormItem;
};

type IRangeInputProps<T = string> = IProps & {
  value?: T[];
  onChange?: (value: T[]) => void;
  onValuesChange: (value: T[]) => void;
};

class RangeInput extends Component<IRangeInputProps> {
  static contextType = FormContext;

  triggerChange = (changedValue: string[]) => {
    const { onChange = noop, onValuesChange } = this.props;
    changedValue = changedValue.every((x) => !x) ? [] : changedValue;
    onChange(changedValue);
    onValuesChange(changedValue);
  };

  render() {
    const { value = [] } = this.props;
    const {
      options = {},
      placeholder = t('qm.form.rangeInputNumberPlaceholder'),
      bordered = true,
      allowClear,
      readOnly,
      disabled,
    } = this.props.option;
    const { prefix, suffix, maxLength } = options;

    return (
      <Input.Group compact>
        <Input
          value={value[0]}
          className="site-input-left"
          style={{ width: 'calc(50% - 10px)' }}
          placeholder={placeholder[0]}
          prefix={prefix}
          suffix={suffix}
          maxLength={maxLength}
          allowClear={allowClear}
          bordered={bordered}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(ev) => {
            const { value: val } = ev.target;
            this.triggerChange([val, value[1]]);
          }}
        />
        <Input
          className="site-input-split"
          style={{
            width: 20,
            paddingLeft: 0,
            paddingRight: 0,
            borderLeft: 0,
            borderRight: 0,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
          placeholder="~"
          bordered={bordered}
          disabled={disabled}
          readOnly
        />
        <Input
          value={value[1]}
          className="site-input-right"
          style={{ width: 'calc(50% - 10px)' }}
          placeholder={placeholder[1]}
          prefix={prefix}
          suffix={suffix}
          maxLength={maxLength}
          bordered={bordered}
          allowClear={allowClear}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(ev) => {
            const { value: val } = ev.target;
            this.triggerChange([value[0], val]);
          }}
        />
      </Input.Group>
    );
  }
}

class FormRangeInput extends Component<IProps> {
  static contextType = FormContext;

  render(): React.ReactElement {
    const { $$form } = this.context;
    const {
      type,
      label,
      tooltip,
      fieldName,
      invisible,
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
              <RangeInput
                option={this.props.option}
                onValuesChange={(values = []) => {
                  onChange(values);
                  $$form.setViewValue(fieldName, values.join('-'));
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

export default FormRangeInput;
