/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-28 16:08:51
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

type IInputProps<T = string> = IProps & {
  value?: T;
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

  render() {
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
    const { prefix, suffix, maxLength, toUpper } = options;
    return (
      <Input
        ref={(ref) => (this[type] = ref)}
        value={value}
        placeholder={placeholder}
        style={style}
        prefix={prefix}
        suffix={suffix}
        maxLength={maxLength}
        bordered={bordered}
        allowClear={allowClear}
        readOnly={readOnly}
        disabled={disabled}
        onBlur={(ev) => {
          const { value } = ev.target;
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
          const { value } = ev.target;
          this.triggerChange(!toUpper ? value : value.toUpperCase());
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
