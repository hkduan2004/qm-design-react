/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-03 13:45:33
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../../_utils/prefix';
import type { CSSProperties } from '../../_utils/types';

import Divider from '../../divider';

type IProps = {
  label: string;
  showDivider?: boolean;
  style?: CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export type QmAnchorItemProps = IProps;

class QmAnchorItem extends Component<IProps> {
  static displayName = 'QmAnchorItem';

  render(): React.ReactElement {
    const { label, showDivider, className, style } = this.props;
    const prefixCls = getPrefixCls('anchor-item');

    const cls = {
      [prefixCls]: true,
    };

    return (
      <div className={classNames(cls, className)} style={style}>
        {showDivider && <Divider label={label} style={{ marginBottom: '10px' }} />}
        {this.props.children}
      </div>
    );
  }
}

export default QmAnchorItem;
