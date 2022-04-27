/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-19 12:12:59
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

import type { ComponentSize } from '../../_utils/types';

import Draggable from 'react-draggable';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { Modal } from '../../antd';
import { QmSpin } from '../../index';

import type { ModalProps } from '../../antd';

type EventType = React.MouseEvent<HTMLElement>;

type IProps = ModalProps & {
  size?: ComponentSize;
  height?: number | string;
  loading?: boolean;
  draggable?: boolean;
  showFullScreen?: boolean;
  onClose?: (e: EventType) => void;
  onClosed?: () => void;
};

type IState = {
  fullscreen: boolean;
  spinning: boolean;
  sloading: boolean;
  disabled: boolean;
  bounds: {
    left: number;
    top: number;
    bottom: number;
    right: number;
  };
  position?: {
    x: number;
    y: number;
  };
};

export type QmModalProps = IProps;

const DEFAULT_WIDTH = '72%';
const DEFAULT_TOP = '10vh';

enum headerHeight {
  large = 48,
  middle = 44,
  small = 40,
}

class QmModal extends Component<IProps, IState> {
  static contextType = ConfigContext;

  static propTypes = {
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmModal', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    spinning: PropTypes.bool,
  };

  static defaultProps = {
    width: DEFAULT_WIDTH,
    showFullScreen: true,
    destroyOnClose: true,
    draggable: true,
    footer: null,
    style: { top: DEFAULT_TOP },
  };

  public draggleRef = React.createRef<HTMLDivElement>();
  private opened = false;

  get $size() {
    const { size } = this.props;
    return size || this.context.size || '';
  }

  get defaultHeight() {
    return `calc(100vh - ${DEFAULT_TOP} - ${DEFAULT_TOP} - ${headerHeight[this.$size]}px)`;
  }

  state: IState = {
    fullscreen: false,
    spinning: false,
    sloading: false,
    disabled: true,
    bounds: { left: 0, top: 0, bottom: 0, right: 0 },
    position: undefined,
  };

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    const { visible, loading, destroyOnClose } = this.props;
    const { fullscreen } = this.state;
    if (visible && visible !== prevProps.visible) {
      if (destroyOnClose || !this.opened) {
        isUndefined(loading) && this.setState({ spinning: true });
      }

      if (!destroyOnClose && this.opened) return;
      setTimeout(() => {
        this.opened = true;
        isUndefined(loading) && this.setState({ spinning: false });
      }, 400);
    }
    if (fullscreen !== prevState.fullscreen) {
      fullscreen ? this.setState({ position: { x: 0, y: 0 } }) : this.setState({ position: undefined });
    }
  }

  onStart = (ev, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = this.draggleRef.current!.getBoundingClientRect();
    if (!targetRect) return;
    this.setState({
      bounds: {
        left: -targetRect.left + uiData.x,
        right: clientWidth - (targetRect.right - uiData.x) - 1,
        top: -targetRect.top + uiData.y,
        bottom: clientHeight - (targetRect.bottom - uiData.y) - 1,
      },
    });
  };

  toggleHandle = (ev) => {
    const modalWrapperDom = getParentNode(ev.target as HTMLElement, 'ant-modal');
    if (!modalWrapperDom) return;
    const modalBodyDom = modalWrapperDom.querySelector('.ant-modal-body') as HTMLElement;
    const { height } = this.props;
    const { fullscreen } = this.state;
    if (!fullscreen) {
      setStyle(modalWrapperDom, { width: '100%', height: '100%', top: 0, maxWidth: '100%' });
      setStyle(modalBodyDom, { height: `calc(100vh - ${headerHeight[this.$size]}px)`, maxHeight: '' });
    } else {
      setStyle(modalWrapperDom, {
        width: getParserWidth(this.props.width || DEFAULT_WIDTH),
        height: 'auto',
        top: DEFAULT_TOP,
      });
      setStyle(modalBodyDom, {
        height: !height ? this.defaultHeight : getParserWidth(height),
        maxHeight: height === 'auto' ? this.defaultHeight : '',
      });
    }
    this.setState((prevState: IState) => {
      return { fullscreen: !prevState.fullscreen };
    });
  };

  afterVisibleChange = () => {
    const { onClosed } = this.props;
    onClosed?.();
    this.setState({ fullscreen: false });
  };

  renderTitle() {
    const { fullscreen, disabled } = this.state;
    const { showFullScreen } = this.props;
    return (
      <div
        onMouseOver={() => {
          if (disabled) {
            this.setState({ disabled: false });
          }
        }}
        onMouseOut={() => {
          this.setState({ disabled: true });
        }}
      >
        <span className={classNames('text')}>{this.props.title}</span>
        {showFullScreen && (
          <span className={classNames('full-screen')} onClick={this.toggleHandle}>
            {React.createElement(fullscreen ? FullscreenExitOutlined : FullscreenOutlined)}
          </span>
        )}
      </div>
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
    const { spinning, sloading, fullscreen, disabled, bounds, position } = this.state;
    const { height, className, loading, draggable, maskClosable, bodyStyle, onClose } = this.props;
    const $global = this.context.global;
    const prefixCls = getPrefixCls('modal');

    const defaultBodyStyle = {
      height: !height ? this.defaultHeight : getParserWidth(height),
      maxHeight: height === 'auto' ? this.defaultHeight : '',
      overflow: 'auto',
    };

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: this.$size === 'large',
      [`${prefixCls}--sm`]: this.$size === 'small',
    };

    return (
      <Modal
        {...omit(this.props, ['showFullScreen', 'loading', 'maskClosable', 'onClose', 'onClosed'])}
        maskClosable={maskClosable ?? $global?.['maskClosable'] ?? false}
        className={classNames(cls, className)}
        title={this.renderTitle()}
        footer={null}
        bodyStyle={Object.assign({}, defaultBodyStyle, bodyStyle)}
        onCancel={onClose}
        afterClose={this.afterVisibleChange}
        modalRender={(modal) => (
          <Draggable
            disabled={!draggable || disabled || fullscreen}
            bounds={bounds}
            position={position}
            onStart={(ev, uiData) => this.onStart(ev, uiData)}
          >
            <div ref={this.draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        {this.props.children}
        {(loading || sloading || spinning) && <QmSpin spinning={true} className={classNames(`${prefixCls}-spin`)} />}
      </Modal>
    );
  }
}

export default QmModal;
