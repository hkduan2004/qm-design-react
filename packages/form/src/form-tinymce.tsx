/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-28 16:10:11
 */
import React, { Component } from 'react';
import FormContext from './context';
import { noop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col } from '../../antd';
import { QmTinymce } from '../../index';

type IProps = {
  option: IFormItem;
};

type ITinymceProps<T = string> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

const VTinymce: React.FC<ITinymceProps> = (props) => {
  const { value, onChange, onValuesChange } = props;
  const { options = {}, style = {}, placeholder = t('qm.form.inputPlaceholder'), readOnly, disabled } = props.option;
  const { tinymceHeight } = options;
  return (
    <QmTinymce
      height={tinymceHeight}
      style={style}
      disabled={readOnly || disabled}
      value={value}
      onChange={(value) => {
        onChange?.(value);
        onValuesChange(value);
      }}
    />
  );
};

class FormTinymce extends Component<IProps> {
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
              <VTinymce
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

export default FormTinymce;
