/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-28 16:10:04
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

class FormTextArea extends Component<IProps> {
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
    const { showCount, maxLength, autoSize } = options;
    const currentSize = Object.assign({}, { minRows: 1, maxRows: 3 }, autoSize);
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
              <Input.TextArea
                placeholder={placeholder}
                style={style}
                maxLength={maxLength}
                showCount={showCount}
                autoSize={currentSize}
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
                  }
                }}
                onChange={(ev) => {
                  const { value } = ev.target;
                  $$form.setViewValue(fieldName, value);
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

export default FormTextArea;
