/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-16 20:29:31
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import ConfigContext from '../../config-provider/context';
import { getPrefixCls } from '../../_utils/prefix';

import { Tabs } from '../../antd';
import type { TabsProps } from '../../antd';
import TabPane from './tab-pane';
import type { QmTabPaneProps } from './tab-pane';

type IProps = TabsProps;

export type QmTabsProps = IProps;

class QmTabs extends Component<IProps> {
  static TabPane = TabPane as React.ClassicComponentClass<QmTabPaneProps>;

  static contextType = ConfigContext;

  static defaultProps = {
    tabBarGutter: 10,
  };

  render(): React.ReactElement {
    const { size, className } = this.props;
    const $size = size || this.context.size || '';
    const prefixCls = getPrefixCls('tabs');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: $size === 'large',
      [`${prefixCls}--sm`]: $size === 'small',
    };

    return (
      <Tabs {...this.props} className={classNames(cls, className)}>
        {this.props.children}
      </Tabs>
    );
  }
}

export default QmTabs;
