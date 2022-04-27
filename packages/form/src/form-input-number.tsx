/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-28 12:52:09
 */
import React, { Component } from 'react';
import FormContext from './context';
import { noop, getParserWidth, nextTick } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, InputNumber } from '../../antd';

type IProps = {
  option: IFormItem;
};

const toNumber = <T extends string | number>(value: T): T => {
  const val = Number(value);
  return !Number.isNaN(val) ? (val as T) : value;
};

class FormInputNumber extends Component<IProps> {
  static contextType = FormContext;

  focus = () => {
    const { type } = this.props.option;
    this[type].focus();
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
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      bordered = true,
      allowClear,
      readOnly,
      disabled,
      onChange = noop,
      onBlur = noop,
      onEnter = noop,
    } = this.props.option;
    const { step = 1, min = 0, max, controls, precision, formatter, parser } = options;
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
              <InputNumber
                ref={(ref) => (this[type] = ref)}
                placeholder={placeholder}
                style={{ width: '100%', ...style }}
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
                onBlur={(ev) => {
                  nextTick(() => {
                    const { value } = ev.target;
                    onBlur(toNumber(parser?.(value) ?? value));
                  });
                }}
                onKeyUp={(ev) => {
                  if (ev.keyCode === 13) {
                    const { value } = ev.target as HTMLInputElement;
                    onEnter(toNumber(parser?.(value) ?? value));
                  }
                }}
                onChange={(value) => {
                  $$form.setViewValue(fieldName, value?.toString() ?? '');
                  onChange(value);
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

export default FormInputNumber;
