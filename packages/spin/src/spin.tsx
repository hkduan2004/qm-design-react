/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-31 19:47:28
 */
import React, { Component } from 'react';

import { Spin } from '../../antd';
import type { SpinProps } from '../../antd';

type IProps = SpinProps;

export type QmSpinProps = IProps;

class QmSpin extends Component<IProps> {
  static defaultProps = {
    tip: 'Loading...',
  };

  render(): React.ReactElement {
    const wrapProps = {
      ...this.props,
      style: { ...this.props.style, maxHeight: 'none' },
    };
    return <Spin {...wrapProps}>{this.props.children}</Spin>;
  }
}

export default QmSpin;
