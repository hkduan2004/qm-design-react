/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-28 16:09:03
 */
import React, { Component } from 'react';
import FormContext from './context';
import { noop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH, DEFAULT_TRUE_VALUE, DEFAULT_FALSE_VALUE } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, Checkbox } from '../../antd';

type IProps = {
  option: IFormItem;
};

type ICheckboxProps<T = string | number> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

const VCheckbox: React.FC<ICheckboxProps> = (props) => {
  const { value, onChange, onValuesChange } = props;
  const { options = {}, style = {}, disabled } = props.option;
  const { falseValue = DEFAULT_FALSE_VALUE, trueValue = DEFAULT_TRUE_VALUE } = options;

  return (
    <Checkbox
      checked={value === trueValue}
      style={style}
      disabled={disabled}
      onChange={(ev) => {
        const { checked } = ev.target;
        const value = checked ? trueValue : falseValue;
        onChange?.(value);
        onValuesChange(value);
      }}
    />
  );
};

class FormCheckbox extends Component<IProps> {
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
    const { falseValue = DEFAULT_FALSE_VALUE, trueValue = DEFAULT_TRUE_VALUE } = options;
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
              <VCheckbox
                option={this.props.option}
                onValuesChange={(value) => {
                  onChange(value);
                  $$form.setViewValue(fieldName, value === trueValue ? t('am.form.trueText') : t('am.form.falseText'));
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

export default FormCheckbox;
