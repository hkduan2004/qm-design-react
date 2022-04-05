/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:41:30
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ConfigContext from '../../config-provider/context';
import { getPrefixCls } from '../../_utils/prefix';
import { throwError } from '../../_utils/error';
import { isValidComponentSize } from '../../_utils/validators';
import type { ComponentSize } from '../../_utils/types';

import { Empty } from '../../antd';
import type { EmptyProps } from '../../antd';

type IProps = EmptyProps & {
  size?: ComponentSize;
};

export type QmEmptyProps = IProps;

class QmEmpty extends Component<IProps> {
  static contextType = ConfigContext;

  static propTypes = {
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmAnchor', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
  };

  render(): React.ReactElement {
    const { size, className } = this.props;
    const $size = size || this.context.size || '';
    const prefixCls = getPrefixCls('empty');

    const wrapProps = {
      ...this.props,
      image: Empty.PRESENTED_IMAGE_SIMPLE,
    };

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: $size === 'large',
      [`${prefixCls}--sm`]: $size === 'small',
    };

    return <Empty {...wrapProps} className={classNames(cls, className)} />;
  }
}

export default QmEmpty;
