/*
 * @Author: 焦质晔
 * @Date: 2021-08-27 16:52:54
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 17:57:25
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import ConfigContext from '../../config-provider/context';
import { t } from '../../locale';
import { sleep } from '../../_utils/util';
import { warn } from '../../_utils/error';
import { getPrefixCls } from '../../_utils/prefix';
import type { CSSProperties } from '../../_utils/types';

import { Modal, Button, Space, message } from '../../antd';
import { ZoomInOutlined, ZoomOutOutlined, RotateRightOutlined, RotateLeftOutlined } from '@ant-design/icons';
import Cropper from '../../cropper';

type IProps = {
  fixedSize?: [number, number];
  quality?: number;
  fileTypes?: string[];
  fileSize?: number;
  beforeCrop?: (file: any, fileList: any[]) => Promise<boolean>;
};

type IState = {
  src: string;
};

const MODAL_WIDTH = 790;
const PREVIEW_WIDTH = 380;
const IMG_MAX_WIDTH = 1920;

class CropperPreview extends Component<IProps, IState> {
  static contextType = ConfigContext;

  private cropperRef = React.createRef<Cropper>();

  private beforeUploadRef;
  private fileRef;
  private resolveRef;
  private rejectRef;

  public state: IState = {
    src: '',
  };

  get previewSize(): CSSProperties {
    const { fixedSize } = this.props;
    return {
      width: `${PREVIEW_WIDTH}px`,
      height: !fixedSize ? 'auto' : `calc(${PREVIEW_WIDTH}px * ${fixedSize[1] / fixedSize[0]})`,
    };
  }

  setSrc(src) {
    this.setState({ src });
  }

  renderUpload() {
    const { children, beforeCrop } = this.props;
    const upload: any = Array.isArray(children) ? children[0] : children;
    if (!upload) {
      return null;
    }
    const { beforeUpload, ...restUploadProps } = upload.props;
    this.beforeUploadRef = beforeUpload;
    return React.createElement(upload.type, {
      ...restUploadProps,
      beforeUpload: (file, fileList) => {
        return new Promise(async (resolve, reject) => {
          if (beforeCrop && !(await beforeCrop(file, fileList))) {
            reject();
            return;
          }

          this.fileRef = file;
          this.resolveRef = resolve;
          this.rejectRef = reject;

          const reader = new FileReader();
          reader.onload = () => {
            this.setSrc(reader.result);
            reader.onload = null; // 解绑事件
          };
          reader.readAsDataURL(file);
        });
      },
    });
  }

  confirmHandle = async () => {
    const { quality } = this.props;
    const { type, name, uid } = this.fileRef;
    this.cropperRef
      .current!.getCroppedCanvas({
        maxWidth: IMG_MAX_WIDTH,
        fillColor: type === 'image/png' ? 'transparent' : '#fff',
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'high',
      })
      .toBlob(
        async (blob: Blob) => {
          let newFile = new File([blob], name, { type });
          (newFile as any).uid = uid;

          const { fileTypes = [], fileSize } = this.props;
          const isType = fileTypes.length ? fileTypes.includes(newFile.name.slice(newFile.name.lastIndexOf('.') + 1).toLowerCase()) : true;

          if (!isType) {
            message.warning(t('qm.upload.tooltip', { type: fileTypes.join(',') }));
            return this.rejectRef('file type is error');
          }

          if (typeof this.beforeUploadRef !== 'function') {
            return this.resolveRef(newFile);
          }

          const res = this.beforeUploadRef(newFile, [newFile]);

          if (typeof res !== 'boolean' && !res) {
            warn('CropperPreview', '`beforeUpload` 必须返回 `boolean` 或 `Promise` 类型');
            return;
          }

          if (res === true) {
            return this.resolveRef(newFile);
          }

          if (res === false) {
            return this.rejectRef('not upload');
          }

          if (res && typeof res.then === 'function') {
            try {
              const passedFile = await res;
              const type = Object.prototype.toString.call(passedFile);
              if (type === '[object File]' || type === '[object Blob]') {
                newFile = passedFile;
              }
              this.resolveRef(newFile);
            } catch (err) {
              this.rejectRef(err);
            }
          }
        },
        type,
        quality
      );
    await sleep(100);
    this.onClose();
  };

  scaleHandle(percent: number) {
    this.cropperRef.current!.relativeZoom(percent, undefined);
  }

  rotateHandle(deg: number) {
    this.cropperRef.current!.rotate(deg);
  }

  renderCropper() {
    const { fixedSize } = this.props;
    return (
      <div className="cropper-preview">
        <div className="cropper-area">
          <div className="img-cropper">
            <Cropper
              ref={this.cropperRef}
              aspect-ratio={fixedSize ? fixedSize[0] / fixedSize[1] : fixedSize}
              src={this.state.src}
              drag-mode="move"
              preview=".preview"
            />
          </div>
          <div className="actions">
            <Space size="small">
              <Button type="primary" size="middle" icon={<ZoomInOutlined />} onClick={() => this.scaleHandle(0.2)}>
                {t('qm.uploadCropper.zoomIn')}
              </Button>
              <Button type="primary" size="middle" icon={<ZoomOutOutlined />} onClick={() => this.scaleHandle(-0.2)}>
                {t('qm.uploadCropper.zoomOut')}
              </Button>
              <Button type="primary" size="middle" icon={<RotateRightOutlined />} onClick={() => this.rotateHandle(90)}>
                {t('qm.uploadCropper.rotatePlus')}
              </Button>
              <Button type="primary" size="middle" icon={<RotateLeftOutlined />} onClick={() => this.rotateHandle(-90)}>
                {t('qm.uploadCropper.rotateSubtract')}
              </Button>
            </Space>
          </div>
        </div>
        <div className="preview-area">
          <div className="preview" style={this.previewSize} />
        </div>
      </div>
    );
  }

  onOk = () => {
    this.confirmHandle();
  };

  onClose = () => {
    this.setSrc('');
  };

  render(): React.ReactElement {
    const { src } = this.state;
    const prefixCls = getPrefixCls('cropper-preview');

    return (
      <>
        {this.renderUpload()}
        {src && (
          <Modal
            visible={true}
            wrapClassName={classNames(prefixCls)}
            title={t('qm.uploadCropper.cropper')}
            width={MODAL_WIDTH}
            bodyStyle={{ padding: 10 }}
            onOk={this.onOk}
            onCancel={this.onClose}
            maskClosable={false}
            destroyOnClose
          >
            {this.renderCropper()}
          </Modal>
        )}
      </>
    );
  }
}

export default CropperPreview;
