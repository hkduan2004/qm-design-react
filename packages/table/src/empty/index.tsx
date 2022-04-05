/*
 * @Author: 焦质晔
 * @Date: 2021-12-27 22:21:10
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-27 22:28:41
 */
import React from 'react';
import { getPrefixCls } from '../../../_utils/prefix';
import TableContext from '../context';

import { QmEmpty } from '../../../index';

const TableEmpty: React.FC = () => {
  const { layout } = React.useContext(TableContext)!;

  const wrapStyle = React.useMemo((): React.CSSProperties => {
    const { headerHeight, viewportHeight } = layout;
    return {
      top: `${headerHeight}px`,
      height: `${viewportHeight}px`,
    };
  }, [layout]);

  const prefixCls = getPrefixCls('table');

  return (
    <div className={`${prefixCls}--empty`} style={wrapStyle}>
      <QmEmpty />
    </div>
  );
};

export default TableEmpty;
