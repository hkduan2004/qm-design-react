/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 12:30:26
 */
import React, { Component } from 'react';
import FormContext from './context';
import { noop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH, DEFAULT_TRUE_VALUE, DEFAULT_FALSE_VALUE } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, Switch } from '../../antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

type IProps = {
  option: IFormItem;
};

type ISwitchProps<T = string | number> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

const VSwitch: React.FC<ISwitchProps> = (props) => {
  const { value, onChange, onValuesChange } = props;
  const { options = {}, style = {}, disabled } = props.option;
  const { falseValue = DEFAULT_FALSE_VALUE, trueValue = DEFAULT_TRUE_VALUE } = options;

  return (
    <Switch
      checked={value === trueValue}
      style={style}
      disabled={disabled}
      checkedChildren={<CheckOutlined />}
      unCheckedChildren={<CloseOutlined />}
      onChange={(value) => {
        const val = value ? trueValue : falseValue;
        onChange?.(val);
        onValuesChange(val);
      }}
    />
  );
};

class FormSwitch extends Component<IProps> {
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
      validateTrigger,
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
              validateTrigger={validateTrigger}
              messageVariables={{
                label: $$form.getFormItemLabel(label),
              }}
            >
              <VSwitch
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

export default FormSwitch;
