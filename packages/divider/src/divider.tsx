/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-06-01 20:18:47
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ConfigContext from '../../config-provider/context';
import { noop, isUndefined } from '../../_utils/util';
import { t } from '../../locale';
import { getPrefixCls } from '../../_utils/prefix';
import { throwError } from '../../_utils/error';
import { isValidComponentSize } from '../../_utils/validators';
import type { ComponentSize, CSSProperties, JSXElement } from '../../_utils/types';

import { Button } from '../../antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

type IProps = {
  label: string;
  size?: ComponentSize;
  extra?: JSXElement | string;
  collapse?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  onCollapseChange?: (collapse: boolean) => void;
};

export type QmDividerProps = IProps;

class QmDivider extends Component<IProps> {
  static propTypes = {
    label: PropTypes.string,
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmDivider', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    extra: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    collapse: PropTypes.bool,
  };

  static contextType = ConfigContext;

  clickHandle = () => {
    const { collapse, onCollapseChange = noop } = this.props;
    onCollapseChange(!collapse);
  };

  render(): React.ReactElement {
    const { size, label, extra, collapse, disabled, className, style, id } = this.props;
    const $size = size || this.context.size || '';

    const prefixCls = getPrefixCls('divider');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: $size === 'large',
      [`${prefixCls}--sm`]: $size === 'small',
    };

    return (
      <div id={id} className={classNames(cls, className)} style={style}>
        <span className={classNames(`${prefixCls}__title`)}>{label}</span>
        <div className={classNames(`${prefixCls}__extra`)}>{extra}</div>
        {!isUndefined(collapse) && (
          <Button type="link" className={classNames(`${prefixCls}__collapse`)} disabled={disabled} onClick={this.clickHandle}>
            {collapse ? t('qm.divider.collect') : t('qm.divider.spread')}
            {collapse ? <UpOutlined /> : <DownOutlined />}
          </Button>
        )}
      </div>
    );
  }
}

export default QmDivider;
