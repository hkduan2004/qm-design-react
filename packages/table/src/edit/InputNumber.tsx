/*
 * @Author: 焦质晔
 * @Date: 2022-01-03 17:28:03
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-10 10:17:18
 */
import React from 'react';
import useUpdateEffect from '../../../hooks/useUpdateEffect';

import type { ComponentSize } from '../../../_utils/types';

import { Input } from '../../../antd';

type INumberProps = {
  size?: ComponentSize;
  defaultValue?: number | string;
  value?: number | string;
  min?: number;
  max?: number;
  maxLength?: number;
  precision?: number;
  disabled?: boolean;
  onChange?: (value: number | string) => void;
  onBlur?: (value: number | string) => void;
  onEnter?: (value: number | string) => void;
};

const InputNumber = React.forwardRef<any, INumberProps>((props, ref) => {
  const { size, defaultValue, value, min, max, maxLength, precision, disabled } = props;

  const formatValue = (value: string | number) => {
    // 临时变量
    let temp: string = value.toString();
    // '.' at the end or only '-' in the input box.
    if (temp.charAt(temp.length - 1) === '.' || temp === '-') {
      temp = temp.slice(0, -1);
    }
    // 判断最大值/最小值
    if (Number(temp) > max!) {
      temp = max!.toString();
    }
    if (Number(temp) < min!) {
      temp = min!.toString();
    }
    // 处理精度
    if (precision! >= 0 && temp !== '') {
      temp = Number(temp).toFixed(precision);
    }
    return temp;
  };

  const toNumber = (value: string) => {
    return value !== '' ? Number(value) : '';
  };

  // 受否受控
  const isCtrl = typeof value !== 'undefined';

  const [stateValue, setStateValue] = React.useState<string>(defaultValue?.toString() ?? '');

  const inputValue = isCtrl ? value.toString() : stateValue;

  const setInputValue = (value: string) => {
    const { onChange } = props;
    isCtrl ? onChange?.(value) : setStateValue(value);
  };

  useUpdateEffect(() => {
    const { onChange } = props;
    onChange?.(inputValue);
  }, [stateValue]);

  const onChange = (ev) => {
    const { value } = ev.target;
    const regExp = /^-?\d*(\.\d*)?$/;
    const isPassed = (!Number.isNaN(value) && regExp.test(value)) || value === '' || value === '-';
    if (isPassed) {
      setInputValue(value);
    }
  };

  const onBlur = () => {
    const { onBlur } = props;
    const valueTemp = formatValue(inputValue);
    if (Number(valueTemp) !== Number(inputValue)) {
      setInputValue(valueTemp);
    }
    onBlur?.(toNumber(valueTemp));
  };

  const onKeyUp = (ev) => {
    const { onEnter } = props;
    if (ev.keyCode === 13) {
      onEnter?.(toNumber(inputValue));
    }
  };

  return (
    <Input ref={ref} size={size} value={inputValue} maxLength={maxLength} disabled={disabled} onChange={onChange} onBlur={onBlur} onKeyUp={onKeyUp} />
  );
});

InputNumber.displayName = 'InputNumber';

export default InputNumber;
