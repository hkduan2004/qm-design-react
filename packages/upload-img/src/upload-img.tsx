/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 17:57:32
 */
import React, { Component } from 'react';
import { t } from '../../locale';
import { getPrefixCls } from '../../_utils/prefix';

import CropperPreview from './cropper-preview';
import { PlusOutlined } from '@ant-design/icons';
import { Upload, Modal } from '../../antd';
import type { UploadProps } from '../../antd';

type IProps = UploadProps & {
  fixedSize?: [number, number] | undefined;
  quality?: number;
  fileTypes?: string[];
  fileSize?: number;
  beforeCrop?: (file: any, fileList: any[]) => Promise<boolean>;
};

type IState = {
  previewVisible: boolean;
  previewImage: string;
  previewTitle: string;
};

export type QmUploadImgProps = IProps;

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

class QmUploadImg extends Component<IProps, IState> {
  static defaultProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    listType: 'picture-card',
    quality: 1,
  };

  public state: IState = {
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
  };

  get showUploadButton() {
    const total = this.props.fileList?.length ?? 0;
    if (!this.props.maxCount) {
      return true;
    }
    return total < this.props.maxCount;
  }

  handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  render(): React.ReactElement {
    const { previewVisible, previewImage, previewTitle } = this.state;
    const { fixedSize, quality, fileTypes, fileSize, beforeCrop } = this.props;
    const prefixCls = getPrefixCls('upload-img');

    const uploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>{t('qm.uploadCropper.dragableText')}</div>
      </div>
    );

    return (
      <>
        <CropperPreview fixedSize={fixedSize} quality={quality} fileTypes={fileTypes} fileSize={fileSize} beforeCrop={beforeCrop}>
          <Upload className={prefixCls} {...this.props} onPreview={this.handlePreview}>
            {this.showUploadButton ? uploadButton : null}
          </Upload>
        </CropperPreview>
        <Modal
          visible={previewVisible}
          title={previewTitle}
          bodyStyle={{ padding: 10 }}
          footer={null}
          onCancel={() => {
            this.setState({ previewVisible: false });
          }}
        >
          <img alt="" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </>
    );
  }
}

export default QmUploadImg;
