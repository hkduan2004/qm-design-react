/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-14 12:58:45
 */
import React from 'react';
import classNames from 'classnames';
import SplitContext from './context';
import { getParserWidth } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';

type IProps = {
  min?: number | string;
  className?: string;
  style?: React.CSSProperties;
};

export type QmSplitPaneProps = IProps;

const QmSplitPane: React.FC<IProps & { offset?: string }> = (props) => {
  const { offset, className, style } = props;

  const { direction, dragging } = React.useContext(SplitContext)!;

  const property = direction === 'vertical' ? 'height' : 'width';

  const prefixCls = getPrefixCls('split-pane');

  const cls = {
    [prefixCls]: true,
    isLocked: dragging,
    horizontal: direction === 'horizontal',
    vertical: direction === 'vertical',
    [className!]: !!className,
  };

  const styles: React.CSSProperties = typeof offset !== 'undefined' ? { [property]: getParserWidth(offset) } : { flex: 1 };

  return (
    <div className={classNames(cls)} style={{ ...styles, ...style }}>
      {props.children}
    </div>
  );
};

QmSplitPane.displayName = 'QmSplitPane';

export default QmSplitPane;
