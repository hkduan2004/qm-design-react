/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 17:58:27
 */
import React, { Component } from 'react';
import { t } from '../../locale';
import { getPrefixCls } from '../../_utils/prefix';

import { Upload, Button, message } from '../../antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';

import type { UploadProps } from '../../antd';

type IProps = UploadProps & {
  fileTypes?: string[];
  fileSize?: number;
};

type IState = {
  loading: boolean;
};

export type QmUploadFileProps = IProps;

class QmUploadFile extends Component<IProps, IState> {
  static defaultProps = {
    name: 'file',
    multiple: true,
    showUploadList: {
      showDownloadIcon: true,
      downloadIcon: <DownloadOutlined />,
    },
  };

  state: IState = {
    loading: false,
  };

  beforeUpload = (file, fileList): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      const { fileTypes = [], fileSize, beforeUpload } = this.props;
      const isType = fileTypes.length ? fileTypes.includes(file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()) : true;
      const isLt5M = fileSize ? file.size / 1024 / 1024 < fileSize : true;
      const result: boolean = isType && isLt5M;
      if (!isType) {
        message.warning(t('qm.upload.tooltip', { type: fileTypes.join(',') }));
      }
      if (!isLt5M) {
        message.warning(t('qm.upload.sizeLimit', { size: fileSize }));
      }
      if (!result) {
        return reject('file type is error or to large');
      }
      if (beforeUpload) {
        const res = beforeUpload(file, fileList);
        if (res === true) {
          return resolve(file);
        }
        if (res === false) {
          return reject('not upload');
        }
        if (res && typeof (res as Promise<any>).then === 'function') {
          try {
            const passedFile = await res;
            resolve(passedFile);
          } catch (err) {
            reject(err);
          }
        }
      }
      resolve(file);
    });
  };

  render(): React.ReactElement {
    const { loading } = this.state;
    const { disabled, onChange } = this.props;
    const prefixCls = getPrefixCls('upload-file');
    return (
      <Upload
        className={prefixCls}
        {...this.props}
        beforeUpload={this.beforeUpload}
        onChange={(info) => {
          onChange?.(info);
          this.setState({ loading: false });
        }}
      >
        {!this.props.children ? (
          <Button icon={<UploadOutlined />} loading={loading} disabled={disabled}>
            {t('qm.upload.text')}
          </Button>
        ) : (
          this.props.children
        )}
      </Upload>
    );
  }
}

export default QmUploadFile;
