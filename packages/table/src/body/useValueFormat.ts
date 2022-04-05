/*
 * @Author: 焦质晔
 * @Date: 2021-12-27 14:39:15
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-27 20:28:16
 */
import dayjs from 'dayjs';
import { formatNumber } from '../utils';

const useValueFormat = () => {
  const dateFormat = (val: string): string => {
    const res = val ? dayjs(val).format('YYYY-MM-DD') : '';
    return !res.startsWith('1900-01-01') ? res : '';
  };

  const datetimeFormat = (val: string): string => {
    const res = val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '';
    return !res.startsWith('1900-01-01') ? res : '';
  };

  const dateShortTimeFormat = (val: string): string => {
    const res = val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '';
    return !res.startsWith('1900-01-01') ? res : '';
  };

  const percentFormat = (val: number): string => {
    return Number(val * 100).toFixed(2) + '%';
  };

  const financeFormat = (val: number): string => {
    return formatNumber(val.toString());
  };

  const secretNameFormat = (val: string): string => {
    return val.replace(/^([\u4e00-\u9fa5]{1}).+$/, '$1**');
  };

  const secretPhoneFormat = (val: string): string => {
    return val.replace(/^(\d{3}).+(\d{4})$/, '$1****$2');
  };

  const secretIDnumberFormat = (val: string): string => {
    return val.replace(/^(\d{3}).+(\w{4})$/, '$1***********$2');
  };

  const secretBankNumberFormat = (val: string): string => {
    return val.replace(/^(\d{4}).+(\w{3})$/, '$1************$2');
  };

  return {
    dateFormat,
    datetimeFormat,
    dateShortTimeFormat,
    percentFormat,
    financeFormat,
    secretNameFormat,
    secretPhoneFormat,
    secretIDnumberFormat,
    secretBankNumberFormat,
  };
};

export default useValueFormat;
