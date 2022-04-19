/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-19 12:14:03
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import omit from 'omit.js';
import classNames from 'classnames';
import ConfigContext from '../../config-provider/context';
import { getParserWidth, isUndefined } from '../../_utils/util';
import { getParentNode, setStyle } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';
import { throwError } from '../../_utils/error';
import { isValidComponentSize } from '../../_utils/validators';

import type { ComponentSize, Nullable } from '../../_utils/types';

import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { Drawer } from '../../antd';
import { QmSpin } from '../../index';
import type { DrawerProps } from '../../antd';

type EventType = React.MouseEvent<HTMLElement>;

type IProps = DrawerProps & {
  size?: ComponentSize;
  loading?: boolean;
  showFullScreen?: boolean;
  onClose?: (e: EventType) => void;
  onClosed?: () => void;
};

type IState = {
  fullscreen: boolean;
  spinning: boolean;
  sloading: boolean;
};

export type QmDrawerProps = IProps;

const DEFAULT_WIDTH = '72%';

class QmDrawer extends Component<IProps, IState> {
  static contextType = ConfigContext;

  static propTypes = {
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmDrawer', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    spinning: PropTypes.bool,
  };

  static defaultProps = {
    width: DEFAULT_WIDTH,
    showFullScreen: true,
    destroyOnClose: true,
  };

  public titleRef = React.createRef<HTMLSpanElement>();
  public $drawer: Nullable<HTMLElement> = null;
  private opened = false;

  state: IState = {
    fullscreen: false,
    spinning: false,
    sloading: false,
  };

  componentWillUnmount() {
    this.$drawer = null;
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    const { visible, loading, destroyOnClose } = this.props;
    const { fullscreen } = this.state;
    if (visible && visible !== prevProps.visible) {
      if (destroyOnClose || !this.opened) {
        isUndefined(loading) && this.setState({ spinning: true });
      }
    }
    if (this.$drawer && fullscreen !== prevState.fullscreen) {
      if (fullscreen) {
        setStyle(this.$drawer, { width: '100%' });
      } else {
        setStyle(this.$drawer, { width: getParserWidth(this.props.width || DEFAULT_WIDTH) });
      }
    }
  }

  afterVisibleChange = (visible: boolean) => {
    const { loading } = this.props;
    if (visible) {
      this.opened = true;
      isUndefined(loading) && setTimeout(() => this.setState({ spinning: false }), 100);
    } else {
      this.props.onClosed?.();
      this.setState({ fullscreen: false });
    }
  };

  toggleHandle = () => {
    if (!this.$drawer) {
      this.$drawer = getParentNode(this.titleRef.current!, 'ant-drawer-content-wrapper')!;
    }
    this.setState((prevState: IState) => ({ fullscreen: !prevState.fullscreen }));
  };

  renderTitle() {
    const { fullscreen } = this.state;
    const { showFullScreen } = this.props;
    return (
      <>
        <span ref={this.titleRef} className={classNames('text')}>
          {this.props.title}
        </span>
        {showFullScreen && (
          <span className={classNames('full-screen')} onClick={this.toggleHandle}>
            {React.createElement(fullscreen ? FullscreenExitOutlined : FullscreenOutlined)}
          </span>
        )}
      </>
    );
  }

  // 对外公开的方法
  START_LOADING = () => {
    this.setState({ sloading: true });
  };

  STOP_LOADING = () => {
    this.setState({ sloading: false });
  };

  render(): React.ReactElement {
    const { spinning, sloading } = this.state;
    const { size, className, loading, maskClosable, onClose } = this.props;
    const $global = this.context.global;
    const $size = size || this.context.size || '';
    const prefixCls = getPrefixCls('drawer');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: $size === 'large',
      [`${prefixCls}--sm`]: $size === 'small',
    };

    return (
      <Drawer
        {...omit(this.props, ['showFullScreen', 'loading', 'maskClosable', 'onClosed'])}
        maskClosable={maskClosable ?? $global?.['maskClosable'] ?? false}
        className={classNames(cls, className)}
        title={this.renderTitle()}
        onClose={onClose}
        afterVisibleChange={this.afterVisibleChange}
      >
        {this.props.children}
        {(loading || sloading || spinning) && <QmSpin spinning={true} className={classNames(`${prefixCls}-spin`)} />}
      </Drawer>
    );
  }
}

export default QmDrawer;
