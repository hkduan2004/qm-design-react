/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-03 13:50:33
 */
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import addEventListener from 'add-dom-event-listener';
import scrollIntoView from 'scroll-into-view-if-needed';
import ConfigContext from '../../config-provider/context';
import { isValidElement, isFragment, getParserWidth, throttle } from '../../_utils/util';
import { getOffsetTopDistance } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';
import { throwError } from '../../_utils/error';
import { isValidComponentSize, isValidWidthUnit } from '../../_utils/validators';
import type { ComponentSize, CSSProperties } from '../../_utils/types';

import AnchorNav from './anchor-nav';
import AnchorItem from './anchor-item';

import type { QmAnchorItemProps } from './anchor-item';

type ILabelItem = {
  id: string;
  label: string;
};

type IProps = {
  size?: ComponentSize;
  labelWidth?: number | string;
  labelList?: Array<ILabelItem>;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
};

type IState = {
  activeKey: number;
};

export type QmAnchorProps = IProps;

class QmAnchor extends Component<IProps, IState> {
  static Item = AnchorItem as React.ClassicComponentClass<QmAnchorItemProps>;

  static propTypes = {
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmAnchor', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    labelWidth: (props, propName, componentName) => {
      if (!isValidWidthUnit(props[propName])) {
        return throwError('QmAnchor', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    labelList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string,
      })
    ),
  };

  static defaultProps = {
    labelWidth: 80,
  };

  static contextType = ConfigContext;

  private currentState = 'ready';
  private itemsTotal: number;
  private timer: ReturnType<typeof setTimeout>;
  private scrollEvent: any;
  private scrollRef = createRef<HTMLDivElement>();

  private get __is_conf() {
    return !!this.props.labelList?.length;
  }

  state: IState = {
    activeKey: 0,
  };

  componentDidMount() {
    this.scrollEvent = addEventListener(this.scrollRef.current, 'scroll', throttle(this.onScrollHandle, 60));
  }

  componentWillUnmount() {
    this.scrollEvent.remove();
  }

  createDistances() {
    const { labelList = [] } = this.props;
    const children = this.__is_conf
      ? labelList.map((x) => document.getElementById(x.id) as HTMLElement)
      : Array.from(this.scrollRef.current?.children || []);
    return children.map((node: HTMLElement) => getOffsetTopDistance(node, this.scrollRef.current as HTMLElement));
  }

  findCurrentIndex(t: number) {
    const top: number = Math.abs(t);
    const distances: number[] = this.createDistances();
    let index = -1;
    for (let i = 0; i < distances.length; i++) {
      const t1: number = distances[i];
      const t2: number = distances[i + 1] || 10000;
      if (top >= t1 - 1 && top < t2) {
        index = i;
      }
    }
    return index;
  }

  onScrollHandle = (ev: MouseEvent) => {
    if (this.currentState !== 'ready') return;
    const index: number = this.findCurrentIndex((ev.target as HTMLElement).scrollTop);
    if (index === -1) return;
    this.setState({ activeKey: index });
  };

  onTabClickHandle = (index: number) => {
    const { labelList = [] } = this.props;
    const $el = (this.__is_conf ? document.getElementById(labelList[index].id) : this.scrollRef.current!.children[index]) as HTMLElement;
    if (!$el) return;
    this.setState({ activeKey: index });
    this.currentState = 'stop';
    this.timer && clearTimeout(this.timer);
    scrollIntoView($el, {
      block: 'start',
      behavior: 'smooth',
      boundary: this.scrollRef.current as HTMLElement,
    });
    this.timer = setTimeout(() => (this.currentState = 'ready'), 500);
  };

  // 公开方法
  SCROLL_TO_ITEM = (index: number) => {
    index = index < 0 ? 0 : index;
    index = index > this.itemsTotal ? this.itemsTotal : index;
    this.onTabClickHandle(index);
  };

  render(): React.ReactElement {
    const { activeKey } = this.state;
    const { size, labelWidth, labelList = [], className, style } = this.props;
    const $size = size || this.context.size || '';
    const prefixCls = getPrefixCls('anchor');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: $size === 'large',
      [`${prefixCls}--sm`]: $size === 'small',
    };

    const validChildren: React.ReactElement[] = [];

    React.Children.map(this.props.children, (node: React.ReactElement) => {
      if (!isValidElement(node) || isFragment(node)) return;
      if ((node.type as any)?.displayName === 'QmAnchorItem') {
        validChildren.push(node);
      }
    });

    const labels: string[] = this.__is_conf ? labelList.map((x) => x.label) : validChildren.map((node) => node.props.label);
    this.itemsTotal = labels.length;

    return (
      <div className={classNames(cls, className)} style={style}>
        <div className={classNames(`${prefixCls}__label`)} style={{ width: getParserWidth(labelWidth as NonNullable<IProps['labelWidth']>) }}>
          <AnchorNav activeKey={activeKey} labels={labels} onTabClick={this.onTabClickHandle} />
        </div>
        <div ref={this.scrollRef} className={classNames(`${prefixCls}__container`)}>
          {this.__is_conf ? this.props.children : validChildren}
        </div>
      </div>
    );
  }
}

export default QmAnchor;
