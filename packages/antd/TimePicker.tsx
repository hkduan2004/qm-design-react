/*
 * @Author: 焦质晔
 * @Date: 2021-08-14 09:53:41
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-17 10:05:59
 */
import { Dayjs } from 'dayjs';
import * as React from 'react';
import DatePicker from './DatePicker';
import { PickerTimeProps, RangePickerTimeProps } from 'antd/es/date-picker/generatePicker';

export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker'> {}
export interface TimeRangePickerProps extends Omit<RangePickerTimeProps<Dayjs>, 'picker'> {}

// TimePicker
const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => {
  return <DatePicker {...props} picker="time" mode={undefined} ref={ref} />;
});
TimePicker.displayName = 'TimePicker';

// TimePicker.RangePicker
const RangePicker = React.forwardRef<any, TimeRangePickerProps>((props, ref) => {
  return <DatePicker.RangePicker {...props} picker="time" mode={undefined} ref={ref} />;
});
RangePicker.displayName = 'RangePicker';

type MergedTimePicker = typeof TimePicker & {
  RangePicker: typeof RangePicker;
};

(TimePicker as MergedTimePicker).RangePicker = RangePicker;

export default TimePicker as MergedTimePicker;
