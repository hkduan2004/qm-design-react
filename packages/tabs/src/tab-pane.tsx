/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-02 12:09:07
 */
import React, { Component } from 'react';

import { Tabs } from '../../antd';
import type { TabPaneProps } from '../../antd';

type IProps = TabPaneProps;

export type QmTabPaneProps = IProps;

class QmTabPane extends Component<IProps> {
  render(): React.ReactElement {
    return <Tabs.TabPane {...this.props}>{this.props.children}</Tabs.TabPane>;
  }
}

export default QmTabPane;
