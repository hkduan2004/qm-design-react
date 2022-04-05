/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:42:18
 */
import React, { Component } from 'react';
import ConfigContext from '../../config-provider/context';
import { isNumber } from '../../_utils/util';
import type { ComponentSize } from '../../_utils/types';

import { Space } from '../../antd';
import type { SpaceProps } from '../../antd';

type IProps = Omit<SpaceProps, 'size'> & {
  size?: ComponentSize | number;
};

export type QmSpaceProps = IProps;

enum ESpace {
  default = 14,
  large = 12,
  middle = 10,
  small = 8,
}

class QmSpace extends Component<IProps> {
  static contextType = ConfigContext;

  render(): React.ReactElement {
    const { size } = this.props;
    const $size = size || this.context.size || '';
    const rsize = (isNumber(size) ? size : ESpace[size || $size || 'default']) as number;

    const wrapProps: IProps = {
      ...this.props,
      size: rsize,
    };

    return <Space {...wrapProps}>{this.props.children}</Space>;
  }
}

export default QmSpace;
