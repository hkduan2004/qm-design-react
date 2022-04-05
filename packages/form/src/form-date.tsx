/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-28 16:09:13
 */
import React, { Component } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import FormContext from './context';
import { noop, getParserWidth } from '../../_utils/util';
import { getDate, formatDate } from './utils';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH, EDateType, EDateFormat } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col, DatePicker, Tag } from '../../antd';

type IProps = {
  option: IFormItem;
};

type IDatePickerProps<T = string> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T) => void;
};

const disabledDate = (current: Dayjs, [minDateTime, maxDateTime]) => {
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

const VDatePicker: React.FC<IDatePickerProps> = (props) => {
  const { value, onChange, onValuesChange } = props;
  const {
    options = {},
    style = {},
    placeholder = t('qm.form.datePlaceholder'),
    bordered = true,
    allowClear = true,
    readOnly,
    disabled,
  } = props.option;
  const { dateType = 'date', minDateTime, maxDateTime, shortCuts = true } = options;

  const datePickerRef = React.createRef<any>();

  const triggerChange = (date) => {
    let value = formatDate(date, EDateFormat[dateType]);
    if (value && dateType === 'date') {
      value = value.replace(/\d{2}:\d{2}:\d{2}$/, '00:00:00');
    }
    onChange?.(value);
    onValuesChange(value);
  };

  const setDateValue = (day: number) => {
    const date = dayjs().subtract(day, 'day');
    triggerChange(date);
    datePickerRef.current!.blur();
    datePickerRef.current!.focus();
  };

  const createExtraFooter = (mode: string) => {
    return (
      <>
        <Tag color="processing" onClick={() => setDateValue(0)}>
          {t('qm.form.datePickers')[0]}
        </Tag>
        <Tag color="processing" onClick={() => setDateValue(1)}>
          {t('qm.form.datePickers')[1]}
        </Tag>
        <Tag color="processing" onClick={() => setDateValue(7)}>
          {t('qm.form.datePickers')[2]}
        </Tag>
        <Tag color="processing" onClick={() => setDateValue(30)}>
          {t('qm.form.datePickers')[3]}
        </Tag>
      </>
    );
  };

  return (
    <DatePicker
      ref={datePickerRef}
      style={{ width: '100%', ...style }}
      picker={EDateType[dateType]}
      bordered={bordered}
      showToday={false}
      showTime={dateType === 'datetime'}
      allowClear={allowClear}
      disabled={disabled}
      inputReadOnly={readOnly}
      disabledDate={(current) => disabledDate(current, [minDateTime, maxDateTime])}
      renderExtraFooter={shortCuts ? createExtraFooter : undefined}
      value={getDate(value, EDateFormat[dateType])}
      onChange={(date, _) => {
        triggerChange(date);
      }}
    />
  );
};

class FormDate extends Component<IProps> {
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
              <VDatePicker
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

export default FormDate;
