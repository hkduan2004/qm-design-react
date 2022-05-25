/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 12:21:26
 */
import React, { Component } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import FormContext from './context';
import { noop, getParserWidth, isEmpty } from '../../_utils/util';
import { getDate, formatDate } from './utils';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH, EDateType, EDateFormat } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, DatePicker } from '../../antd';

type IProps = {
  option: IFormItem;
};

type IRangePickerProps<T = string> = IProps & {
  value?: T[];
  onChange?: (value: T[]) => void;
  onValuesChange: (value: T[]) => void;
};

const disabledDate = (current, [minDateTime, maxDateTime]) => {
  if (minDateTime && maxDateTime) {
    return current.isBefore(minDateTime, 'day') || current.isAfter(maxDateTime, 'day');
  }
  if (minDateTime) {
    return current.isBefore(minDateTime, 'day');
  }
  if (maxDateTime) {
    return current.isAfter(maxDateTime, 'day');
  }
  return false;
};

const createRange = (day: number) => {
  return [dayjs().subtract(day, 'day'), dayjs()];
};

const ranges: Record<string, Dayjs[]> = {
  [t('qm.form.dateRangePickers')[0]]: createRange(7),
  [t('qm.form.dateRangePickers')[1]]: createRange(30),
  [t('qm.form.dateRangePickers')[2]]: createRange(90),
  [t('qm.form.dateRangePickers')[3]]: createRange(180),
};

const VRangePicker: React.FC<IRangePickerProps> = (props) => {
  const { value, onChange, onValuesChange } = props;
  const {
    options = {},
    style = {},
    placeholder = t('qm.form.daterangePlaceholder'),
    bordered = true,
    allowClear = true,
    readOnly,
    disabled,
  } = props.option;
  const { dateType = 'date', disableds = [false, false], minDateTime, maxDateTime, shortCuts = true } = options;

  const triggerChange = (date) => {
    let value = [formatDate(date?.[0], EDateFormat[dateType]), formatDate(date?.[1], EDateFormat[dateType])];
    if (dateType === 'date') {
      value = value.map((x, i) => {
        if (i === 0) {
          return x.replace(/\d{2}:\d{2}:\d{2}$/, '00:00:00');
        }
        return x.replace(/\d{2}:\d{2}:\d{2}$/, '23:59:59');
      });
    }
    onChange?.(value);
    onValuesChange(value);
  };

  return (
    <DatePicker.RangePicker
      style={{ width: '100%', ...style }}
      picker={EDateType[dateType]}
      bordered={bordered}
      showTime={dateType === 'datetime'}
      allowClear={allowClear}
      disabled={disabled ? [true, true] : disableds}
      inputReadOnly={readOnly}
      disabledDate={(current) => disabledDate(current, [minDateTime, maxDateTime])}
      ranges={shortCuts ? (ranges as Record<string, any>) : undefined}
      value={isEmpty(value) ? null : [getDate(value?.[0], EDateFormat[dateType]), getDate(value?.[1], EDateFormat[dateType])]}
      onChange={(date, _) => {
        triggerChange(date);
      }}
    />
  );
};

class FormRangeDate extends Component<IProps> {
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
              <VRangePicker
                option={this.props.option}
                onValuesChange={(value) => {
                  onChange(value);
                  $$form.setViewValue(fieldName, value.join('-'));
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

export default FormRangeDate;
