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

type IAllExpandableProps = {
  style?: React.CSSProperties;
};

const AllExpandable: React.FC<IAllExpandableProps> = (props) => {
  const { style } = props;
  const { tableProps, tableRef, isTreeTable, setRowExpandedKeys } = React.useContext(TableContext)!;
  const { expandable } = tableProps;

  const [expanded, setExpand] = React.useState(expandable?.defaultExpandAllRows || false);

  useUpdateEffect(() => {
    const { allRowKeys, flattenRowKeys } = tableRef.current;
    setRowExpandedKeys(expanded ? allRowKeys.filter((key) => !(isTreeTable && flattenRowKeys.includes(key))) : []);
  }, [expanded]);

  const clickHandle = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setExpand(!expanded);
  };

  const prefixCls = getPrefixCls('expand');

  const cls = {
    [`${prefixCls}--icon`]: true,
    expanded: expanded,
    collapsed: !expanded,
  };

  return <span className={classNames(cls)} onClick={clickHandle} style={style} />;
};

export default AllExpandable;
