/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:39:45
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../../_utils/prefix';
import type { AnyFunction } from '../../_utils/types';

type IProps = {
  activeKey: number;
  labels: string[];
  onTabClick: AnyFunction<void>;
};

class AnchorNav extends Component<IProps> {
  renderLabel(prefixCls: string): React.ReactNode[] {
    const { activeKey, labels, onTabClick } = this.props;
    return labels.map((x, i) => {
      const cls = {
        [`${prefixCls}__item`]: true,
        [`actived`]: i === activeKey,
      };
      return (
        <div key={i} className={classNames(cls)} onClick={(ev) => onTabClick(i, ev)}>
          <span>{x}</span>
        </div>
      );
    });
  }

  render(): React.ReactElement {
    const prefixCls = getPrefixCls('anchor-nav');

    const cls = {
      [prefixCls]: true,
    };

    return <div className={classNames(cls)}>{this.renderLabel(prefixCls)}</div>;
  }
}

export default AnchorNav;
