/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 12:07:15
 */
import React, { Component } from 'react';
import { isRegExp } from 'lodash-es';
import FormContext from './context';
import { noop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { secretFormat } from './utils';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, Input } from '../../antd';

type IProps = {
  option: IFormItem;
};

type IInputProps<T = string> = IProps & {
  value?: T;
  onBlur?: (value: T) => void;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

class VInput extends Component<IInputProps> {
  static contextType = FormContext;

  triggerChange = (value: string) => {
    const { onChange, onValuesChange } = this.props;
    onChange?.(value);
    onValuesChange(value);
  };

  triggerBlur = (value: string) => {
    const { onBlur } = this.props;
    onBlur?.(value);
  };

  render(): React.ReactElement {
    const { $$form } = this.context;
    const { value } = this.props;
    const {
      type,
      options = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      bordered = true,
      allowClear = true,
      readOnly,
      disabled,
      onBlur = noop,
      onEnter = noop,
    } = this.props.option;
    const { prefix, suffix, password, maxLength, pattern, toUpper, secretType } = options;
    const showSecretType = secretType && (readOnly || disabled);
    const C = !password ? Input : Input.Password;
    return (
      <C
        ref={(ref) => (this[type] = ref)}
        value={showSecretType ? secretFormat(value, secretType) : value}
        placeholder={placeholder}
        style={style}
        title={value}
        prefix={prefix}
        suffix={suffix}
        maxLength={maxLength}
        bordered={bordered}
        allowClear={allowClear}
        readOnly={readOnly}
        disabled={disabled}
        onBlur={(ev) => {
          const { value } = ev.target;
          this.triggerBlur(value);
          onBlur(value);
        }}
        onKeyUp={(ev) => {
          if (ev.keyCode === 13) {
            const { value } = ev.target as HTMLInputElement;
            onEnter(value);
            // 筛选器
            if ($$form.isFilterType) {
              $$form.SUBMIT_FORM();
            }
          }
        }}
        onChange={(ev) => {
          let val = ev.target.value;
          if (isRegExp(pattern)) {
            val = pattern.test(val) ? val : value ?? '';
          }
          if (toUpper) {
            val = val.toUpperCase();
          }
          this.triggerChange(val);
        }}
      />
    );
  }
}

class FormInput extends Component<IProps> {
  static contextType = FormContext;

  public inputRef = React.createRef<VInput>();

  focus = () => {
    const { type } = this.props.option;
    this.inputRef.current![type].focus();
  };

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
              <VInput
                ref={this.inputRef}
                option={this.props.option}
                onValuesChange={(value) => {
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

export default FormInput;
