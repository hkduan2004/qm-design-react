/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-01 13:04:45
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfigContext from '../../config-provider/context';
import { t } from '../../locale';
import { sleep } from '../../_utils/util';
import { isValidComponentSize } from '../../_utils/validators';
import { throwError } from '../../_utils/error';

import config from './config';

import type { ComponentSize } from '../../_utils/types';
import type { ButtonProps } from '../../antd';

import { QmButton, QmModal } from '../../index';
import Preview from './preview';
import { PrinterOutlined } from '@ant-design/icons';

type IProps = ButtonProps & {
  size?: ComponentSize;
  templateRender?: () => React.Component;
  uniqueKey?: string;
  defaultConfig?: Record<string, any>;
  preview?: boolean;
  closeOnPrinted?: boolean;
  click?: () => void;
};

type IState = {
  visible: boolean;
  loading: boolean;
};

export type QmPrintProps = IProps;

class QmPrint extends Component<IProps, IState> {
  static propTypes = {
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmAnchor', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    templateRender: PropTypes.elementType,
  };

  static defaultProps = {
    preview: true,
    type: 'primary',
    icon: <PrinterOutlined />,
  };

  static contextType = ConfigContext;

  public previewRef = React.createRef<any>();

  state: IState = {
    visible: false,
    loading: false,
  };

  clickHandle = async () => {
    this.setState({ loading: true });
    try {
      const res = await this.props.click?.();
      this.setState({ loading: false });
      if (typeof res === 'boolean' && !res) return;
      await this.DO_PRINT();
    } catch (err) {
      // ...
    }
    this.setState({ loading: false });
  };

  createRender = () => {
    const { visible } = this.state;
    const { templateRender, uniqueKey, defaultConfig, preview, closeOnPrinted } = this.props;
    const dialogProps = {
      visible: visible,
      title: t('qm.print.preview'),
      width: `${config.previewWidth}px`,
      loading: false,
      onClose: () => {
        this.setState({ visible: false });
      },
    };
    const previewProps = {
      ref: this.previewRef,
      templateRender: templateRender,
      uniqueKey: uniqueKey,
      defaultConfig: defaultConfig,
      preview: preview,
      closeOnPrinted: closeOnPrinted,
      onClose: () => {
        this.setState({ visible: false });
      },
    };
    return preview ? (
      <QmModal {...dialogProps}>
        <Preview {...previewProps} />
      </QmModal>
    ) : visible ? (
      <Preview {...previewProps} />
    ) : null;
  };

  DO_PRINT = async () => {
    const { preview } = this.props;
    await sleep(0);
    this.setState({ visible: true });
    await sleep(preview ? 500 : 0);
    const ctx = this.previewRef.current.containRef.current;
    preview ? ctx.SHOW_PREVIEW() : ctx.DIRECT_PRINT();
  };

  render(): React.ReactElement {
    const { loading } = this.state;
    const { size, icon, type, disabled, shape } = this.props;
    const $size = size || this.context.size || '';

    const btnProps = {
      size: $size,
      type,
      shape,
      icon,
      loading,
      disabled,
      click: this.clickHandle,
    };

    return (
      <>
        {this.props.children && <QmButton {...btnProps}>{this.props.children}</QmButton>}
        {this.createRender()}
      </>
    );
  }
}

export default QmPrint;
