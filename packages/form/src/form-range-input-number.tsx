/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-28 12:52:37
 */
import React, { Component } from 'react';
import FormContext from './context';
import { noop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, Input, InputNumber } from '../../antd';

type IProps = {
  option: IFormItem;
};

type IRangeInputNumberProps<T = number> = IProps & {
  value?: T[];
  onChange?: (value: T[]) => void;
  onValuesChange: (value: T[]) => void;
};

class RangeInputNumber extends Component<IRangeInputNumberProps> {
  static contextType = FormContext;

  validateValues = (values: number[]) => {
    // 结束值 不能大于 开始值
    if (values.every((x) => x !== null) && values[0] > values[1]) {
      values[1] = values[0];
    }
    this.triggerChange(values);
  };

  triggerChange = (changedValue: number[]) => {
    const { onChange = noop, onValuesChange } = this.props;
    const values = changedValue.every((x) => x === null) ? [] : [...changedValue];
    onChange(values);
    onValuesChange(values);
  };

  render(): React.ReactElement {
    const { value = [] } = this.props;
    const {
      options = {},
      placeholder = t('qm.form.rangeInputNumberPlaceholder'),
      bordered = true,
      allowClear,
      readOnly,
      disabled,
    } = this.props.option;
    const { step = 1, min = 0, max, controls, precision, formatter, parser } = options;

    return (
      <Input.Group compact>
        <InputNumber
          value={value[0]}
          className="site-input-left"
          style={{ width: 'calc(50% - 10px)' }}
          placeholder={placeholder[0]}
          step={step}
          min={min}
          max={max}
          controls={controls}
          precision={precision}
          formatter={formatter}
          parser={parser}
          bordered={bordered}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(val) => {
            this.triggerChange([val as number, value[1]]);
          }}
          onBlur={() => {
            this.validateValues(value);
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
        <InputNumber
          value={value[1]}
          className="site-input-right"
          style={{ width: 'calc(50% - 10px)' }}
          placeholder={placeholder[1]}
          step={step}
          min={min}
          max={max}
          controls={controls}
          precision={precision}
          formatter={formatter}
          parser={parser}
          bordered={bordered}
          readOnly={readOnly}
          disabled={disabled}
          onChange={(val) => {
            this.triggerChange([value[0], val as number]);
          }}
          onBlur={() => {
            this.validateValues(value);
          }}
        />
      </Input.Group>
    );
  }
}

class FormRangeInputNumber extends Component<IProps> {
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
              <RangeInputNumber
                option={this.props.option}
                onValuesChange={(values) => {
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

export default FormRangeInputNumber;
