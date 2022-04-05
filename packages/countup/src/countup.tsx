/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:40:31
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import CountUp from 'react-countup';
import { CountUpProps } from 'react-countup/build/CountUp';
import ConfigContext from '../../config-provider/context';
import { getPrefixCls } from '../../_utils/prefix';
import type { ComponentSize, CSSProperties } from '../../_utils/types';

type IProps = CountUpProps & {
  size?: ComponentSize;
  className?: string;
  style?: CSSProperties;
};

export type QmCountupProps = IProps;

class QmCountup extends Component<IProps> {
  static defaultProps = {
    duration: 2,
  };

  static contextType = ConfigContext;

  render(): React.ReactElement {
    const { size, className, style } = this.props;
    const $size = size || this.context.size || '';
    const prefixCls = getPrefixCls('countup');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: $size === 'large',
      [`${prefixCls}--sm`]: $size === 'small',
    };

    return (
      <CountUp {...this.props} className={classNames(cls, className)} style={style}>
        {this.props.children}
      </CountUp>
    );
  }
}

export default QmCountup;
