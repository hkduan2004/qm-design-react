/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-15 09:25:49
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import omit from 'omit.js';
import ConfigContext from '../../config-provider/context';
import { t } from '../../locale';
import { getAuthValue, noop, isFunction } from '../../_utils/util';
import { warn } from '../../_utils/error';

import { Button, Popconfirm } from '../../antd';
import type { ButtonProps } from '../../antd';

type IProps = ButtonProps & {
  authCode?: string;
  click?: () => Promise<void> | void;
  confirm?: {
    title?: string;
    onConfirm?: () => void;
    onCancel?: (ev: any) => void;
  };
};

type IState = {
  isLoading: boolean;
};

export type QmButtonProps = IProps;

class QmButton extends Component<IProps, IState> {
  static propTypes = {
    click: PropTypes.func,
    confirm: PropTypes.shape({
      title: PropTypes.string,
      onConfirm: PropTypes.func,
      onCancel: PropTypes.func,
    }),
  };

  static contextType = ConfigContext;

  state: IState = {
    isLoading: false,
  };

  clickHandle = async (): Promise<void> => {
    this.setState({ isLoading: true });
    try {
      await this.props.click?.();
    } catch (err) {
      warn('QmButton', '`click`方法执行出错');
    }
    this.setState({ isLoading: false });
  };

  render() {
    const { size, loading, authCode, click, confirm } = this.props;
    const { isLoading } = this.state;
    const $size = size || this.context.size || '';
    const clickConf = isFunction(click) ? { onClick: this.clickHandle } : null;

    const wrapProps: IProps = {
      ...omit(this.props, ['authCode', 'click', 'confirm']),
      size: $size,
      loading: isLoading || loading || false,
      ...clickConf,
    };

    if (authCode) {
      const auth = getAuthValue(authCode);
      if (auth) {
        const { visible = 1, disabled } = auth;
        if (!visible) {
          return null;
        }
        if (disabled) {
          wrapProps.disabled = true;
        }
      }
    }

    if (!confirm) {
      return <Button {...wrapProps}>{this.props.children}</Button>;
    }

    return (
      <Popconfirm
        title={confirm.title || t('qm.button.confirmTitle')}
        onConfirm={(ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
          confirm.onConfirm?.();
          wrapProps.onClick?.(ev);
        }}
        onCancel={(ev) => {
          confirm.onCancel?.(ev);
        }}
      >
        <Button {...wrapProps} onClick={noop}>
          {this.props.children}
        </Button>
      </Popconfirm>
    );
  }
}

export default QmButton;
