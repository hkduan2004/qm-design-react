/*
 * @Author: 焦质晔
 * @Date: 2021-12-28 16:51:50
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-28 19:51:47
 */
import React from 'react';
import TableContext from '../context';
import { deepFindRowKey, isArrayContain } from '../utils';
import type { IColumn, IRecord, IRowKey, ISelectionType } from '../table/types';

import { Radio, Checkbox } from '../../../antd';

type ISelectionProps = {
  selectionKeys: IRowKey[];
  column: IColumn & { type?: ISelectionType };
  record: IRecord;
  rowKey: IRowKey;
};

const Selection: React.FC<ISelectionProps> = (props) => {
  const { selectionKeys, column, record, rowKey } = props;
  const { tableProps, tableRef, isTreeTable, getAllChildRowKeys } = React.useContext(TableContext)!;
  const { rowSelection } = tableProps;

  const selectionType = React.useMemo(() => {
    return column.type;
  }, [column.type]);

  const createIndeterminate = (key: IRowKey) => {
    const checkStrictly = rowSelection!.checkStrictly ?? true;
    if (!(isTreeTable && !checkStrictly)) {
      return !1;
    }
    // true -> 子节点非全部选中，至少有一个后代节点在 selectionKeys 中
    const target = deepFindRowKey(tableRef.current.deriveRowKeys, key);
    const childRowKeys = getAllChildRowKeys(target?.children ?? []);
    const isContain = Array.isArray(target?.children) ? isArrayContain(selectionKeys, target?.children.map((x) => x.rowKey) || []) : !0;
    return !isContain && childRowKeys.some((x) => selectionKeys.includes(x));
  };

  const renderRadio = () => {
    const disabled = rowSelection!.disabled;
    const isDisabled = disabled?.(record);
    const prevValue = !isDisabled ? selectionKeys[0] === rowKey : false;
    // 完全受控
    return <Radio checked={prevValue} disabled={isDisabled} />;
  };

  const renderCheckbox = () => {
    const disabled = rowSelection!.disabled;
    const isDisabled = disabled?.(record);
    const prevValue = !isDisabled && selectionKeys.includes(rowKey) ? true : false;
    // 完全受控
    return <Checkbox checked={prevValue} indeterminate={createIndeterminate(rowKey)} disabled={isDisabled} />;
  };

  return selectionType === 'radio' ? renderRadio() : renderCheckbox();
};

export default Selection;
