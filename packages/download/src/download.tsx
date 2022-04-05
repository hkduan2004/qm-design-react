/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:41:05
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import omit from 'omit.js';
import ConfigContext from '../../config-provider/context';
import { isString, sleep } from '../../_utils/util';
import { download } from '../../_utils/download';
import { throwError, warn } from '../../_utils/error';
import { t } from '../../locale';
import { isValidComponentSize } from '../../_utils/validators';
import type { AnyObject, AjaxResponse, ComponentSize } from '../../_utils/types';

import { DownloadOutlined } from '@ant-design/icons';
import { Button, message } from '../../antd';
import type { ButtonProps } from '../../antd';

type HttpRequestHeader = {
  [key: string]: string;
};

type ActionConfig = {
  api: (params?: Record<string, unknown>) => Promise<AjaxResponse>;
  params?: AnyObject<unknown>;
};

type IProps = Omit<ButtonProps, 'prefixCls' | 'ghost' | 'danger' | 'block'> & {
  action: string | ActionConfig;
  fileName?: string;
  size?: ComponentSize;
  headers?: HttpRequestHeader;
  withCredentials?: boolean;
  params?: AnyObject<unknown>;
  beforeDownload?: (action: string) => boolean;
  onSuccess?: () => void;
  onError?: (error: AnyObject<unknown>) => void;
};

type IState = {
  loading: boolean;
};

export type QmDownloadProps = IProps;

class QmDownload extends Component<IProps, IState> {
  static propTypes = {
    action: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        api: PropTypes.func.isRequired,
        params: PropTypes.object,
      }),
    ]),
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmAnchor', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    fileName: PropTypes.string,
    headers: PropTypes.object,
    withCredentials: PropTypes.bool,
    params: PropTypes.object,
    beforeDownload: PropTypes.func,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
  };

  static defaultProps = {
    icon: <DownloadOutlined />,
    children: t('qm.download.text'),
    withCredentials: false,
  };

  static contextType = ConfigContext;

  state: IState = {
    loading: false,
  };

  async getActionUrl() {
    const action = this.props.action as ActionConfig;
    if (action.api) {
      try {
        const res: AjaxResponse<string> = await action.api(action.params);
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {
        // ...
      }
    }
    return '';
  }

  async downloadFile(url: string) {
    const { fileName, headers, params, withCredentials } = this.props;
    try {
      const res = await axios({ url, params, headers, withCredentials, responseType: 'blob' });
      const blob: Blob = res.data;
      const contentDisposition = res.headers['content-disposition'];
      const name = fileName
        ? fileName
        : contentDisposition
        ? contentDisposition.split(';')[1].split('filename=')[1]
        : url.slice(url.lastIndexOf('/') + 1);
      download(blob, name);
    } catch (err) {
      // ...
    }
  }

  downloadHandle = async () => {
    this.setState({ loading: true });
    try {
      const { action, beforeDownload = () => true } = this.props;
      const actionUrl: string = isString(action) ? (action as string) : await this.getActionUrl();
      if (!actionUrl) {
        return warn('QmDownload', '参数 `action` 有误');
      }
      if (!beforeDownload(actionUrl)) return;
      await this.downloadFile(actionUrl);
      await sleep(100);
      this.props.onSuccess?.();
      message.success(t('qm.download.success'));
    } catch (err) {
      this.props.onError?.(err);
      message.error(t('qm.download.error'));
    }
    this.setState({ loading: false });
  };

  render(): React.ReactElement {
    const { size } = this.props;
    const { loading } = this.state;
    const $size = size || this.context.size || '';

    const wrapProps = omit(this.props, ['action', 'fileName', 'headers', 'withCredentials', 'params', 'beforeDownload', 'onSuccess', 'onError']);

    return (
      <Button {...wrapProps} size={$size} loading={loading} onClick={this.downloadHandle}>
        {this.props.children}
      </Button>
    );
  }
}

export default QmDownload;
