/*
 * @Author: 焦质晔
 * @Date: 2021-12-28 19:46:40
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-28 20:19:59
 */

import React from 'react';
import classNames from 'classnames';
import TableContext from '../context';
import { getPrefixCls } from '../../../_utils/prefix';
import useUpdateEffect from '../../../hooks/useUpdateEffect';

import type { IRecord, IRowKey } from '../table/types';

type IExpandableProps = {
  record: IRecord;
  rowKey: IRowKey;
  style?: React.CSSProperties;
};

const Expandable: React.FC<IExpandableProps> = (props) => {
  const { record, rowKey, style } = props;
  const { tableProps, rowExpandedKeys, setRowExpandedKeys } = React.useContext(TableContext)!;
  const { expandable } = tableProps;

  const expanded = React.useMemo(() => {
    return rowExpandedKeys.includes(rowKey);
  }, [rowExpandedKeys, rowKey]);

  useUpdateEffect(() => {
    expandable?.onExpand?.(expanded, record);
  }, [expanded]);

  const clickHandle = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    // 展开状态 -> 收起
    const result = expanded ? rowExpandedKeys.filter((x) => x !== rowKey) : [...rowExpandedKeys, rowKey];
    // 完全受控
    setRowExpandedKeys(result);
  };

  const prefixCls = getPrefixCls('expand');

  const cls = {
    [`${prefixCls}--icon`]: true,
    expanded: expanded,
    collapsed: !expanded,
  };

  return <span className={classNames(cls)} onClick={clickHandle} style={style} />;
};

export default Expandable;
