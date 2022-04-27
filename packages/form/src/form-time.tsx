/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-28 16:10:08
 */
import React, { Component } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import FormContext from './context';
import { noop, getParserWidth } from '../../_utils/util';
import { getDate, formatDate } from './utils';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH, ETimeFormat } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, TimePicker } from '../../antd';

type IProps = {
  option: IFormItem;
};

type ITimePickerProps<T = string> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

const VTimePicker: React.FC<ITimePickerProps> = (props) => {
  const { value, onChange, onValuesChange } = props;
  const {
    options = {},
    style = {},
    placeholder = t('qm.form.timePlaceholder'),
    bordered = true,
    allowClear = true,
    readOnly,
    disabled,
  } = props.option;
  const { timeType = 'hour-minute-second', hourStep = 1, minuteStep = 1, secondStep = 1 } = options;

  const triggerChange = (date) => {
    const value = formatDate(date, ETimeFormat[timeType]);
    onChange?.(value);
    onValuesChange(value);
  };

  return (
    <TimePicker
      style={{ width: '100%', ...style }}
      bordered={bordered}
      showNow={true}
      hourStep={hourStep}
      minuteStep={minuteStep}
      secondStep={secondStep}
      allowClear={allowClear}
      disabled={disabled}
      inputReadOnly={readOnly}
      format={ETimeFormat[timeType]}
      value={getDate(value, ETimeFormat[timeType])}
      onChange={(date, _) => {
        triggerChange(date);
      }}
    />
  );
};

class FormTime extends Component<IProps> {
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
              <VTimePicker
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

export default FormTime;
