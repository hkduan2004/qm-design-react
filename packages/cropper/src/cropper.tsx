/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:40:44
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Cropper from 'cropperjs';
import { getPrefixCls } from '../../_utils/prefix';
import type { CSSProperties, AnyObject, AnyFunction } from '../../_utils/types';

type IProps = {
  src: string;
  alt?: string;
  imgStyle?: CSSProperties;
  style?: CSSProperties;
  className?: string;
  // CropperJS props
  viewMode?: number;
  dragMode?: string;
  initialAspectRatio?: number;
  aspectRatio?: number;
  data?: AnyObject<any>;
  preview?: string;
  responsive?: boolean;
  restore?: boolean;
  checkCrossOrigin?: boolean;
  checkOrientation?: boolean;
  crossorigin?: string;
  guides?: boolean;
  center?: boolean;
  highlight?: boolean;
  background?: boolean;
  autoCrop?: boolean;
  autoCropArea?: number;
  movable?: boolean;
  rotatable?: boolean;
  scalable?: boolean;
  zoomable?: boolean;
  zoomOnTouch?: boolean;
  zoomOnWheel?: boolean;
  wheelZoomRatio?: number;
  cropBoxMovable?: boolean;
  cropBoxResizable?: boolean;
  toggleDragModeOnDblclick?: boolean;
  // Size limitation
  minCanvasWidth?: number;
  minCanvasHeight?: number;
  minCropBoxWidth?: number;
  minCropBoxHeight?: number;
  minContainerWidth?: number;
  minContainerHeight?: number;
  // callbacks
  ready?: AnyFunction<void>;
  cropstart?: AnyFunction<void>;
  cropmove?: AnyFunction<void>;
  cropend?: AnyFunction<void>;
  crop?: AnyFunction<void>;
  zoom?: AnyFunction<void>;
};

export type QmCropperProps = IProps;

class QmCropper extends Component<IProps> {
  static defaultProps = {
    src: '',
    responsive: true,
    restore: true,
    checkCrossOrigin: true,
    checkOrientation: true,
    modal: true,
    guides: true,
    center: true,
    highlight: true,
    background: true,
    autoCrop: true,
    movable: true,
    rotatable: true,
    scalable: true,
    zoomable: true,
    zoomOnTouch: true,
    zoomOnWheel: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: true,
  };

  private imgRef = React.createRef<HTMLImageElement>();

  private cropper: any;

  componentDidMount() {
    const { className, style, src, alt, imgStyle, ...data } = this.props;
    const props = {};

    for (const key in data) {
      if (typeof this.props[key] !== 'undefined') {
        props[key] = this.props[key];
      }
    }

    this.cropper = new Cropper(this.imgRef.current as HTMLImageElement, props);
  }

  componentWillUnmount() {
    this.destroy();
    this.cropper = null;
  }

  // Reset the image and crop box to their initial states
  reset() {
    return this.cropper.reset();
  }

  // Clear the crop box
  clear() {
    return this.cropper.clear();
  }

  // Init crop box manually
  initCrop() {
    return this.cropper.crop();
  }

  /**
   * Replace the image's src and rebuild the cropper
   * @param {string} url - The new URL.
   * @param {boolean} [onlyColorChanged] - Indicate if the new image only changed color.
   * @returns {Object} this
   */
  replace(url, onlyColorChanged = false) {
    return this.cropper.replace(url, onlyColorChanged);
  }

  // Enable (unfreeze) the cropper
  enable() {
    return this.cropper.enable();
  }

  // Disable (freeze) the cropper
  disable() {
    return this.cropper.disable();
  }

  // Destroy the cropper and remove the instance from the image
  destroy() {
    return this.cropper.destroy();
  }

  /**
   * Move the canvas with relative offsets
   * @param {number} offsetX - The relative offset distance on the x-axis.
   * @param {number} offsetY - The relative offset distance on the y-axis.
   * @returns {Object} this
   */
  move(offsetX, offsetY) {
    return this.cropper.move(offsetX, offsetY);
  }

  /**
   * Move the canvas to an absolute point
   * @param {number} x - The x-axis coordinate.
   * @param {number} [y=x] - The y-axis coordinate.
   * @returns {Object} this
   */
  moveTo(x, y = x) {
    return this.cropper.moveTo(x, y);
  }

  /**
   * Zoom the canvas with a relative ratio
   * @param {number} ratio - The target ratio.
   * @param {Event} _originalEvent - The original event if any.
   * @returns {Object} this
   */
  relativeZoom(ratio, _originalEvent) {
    return this.cropper.zoom(ratio, _originalEvent);
  }

  /**
   * Zoom the canvas to an absolute ratio
   * @param {number} ratio - The target ratio.
   * @param {Event} _originalEvent - The original event if any.
   * @returns {Object} this
   */
  zoomTo(ratio, _originalEvent) {
    return this.cropper.zoomTo(ratio, _originalEvent);
  }

  /**
   * Rotate the canvas with a relative degree
   * @param {number} degree - The rotate degree.
   * @returns {Object} this
   */
  rotate(degree) {
    return this.cropper.rotate(degree);
  }

  /**
   * Rotate the canvas to an absolute degree
   * @param {number} degree - The rotate degree.
   * @returns {Object} this
   */
  rotateTo(degree) {
    return this.cropper.rotateTo(degree);
  }

  /**
   * Scale the image on the x-axis.
   * @param {number} scaleX - The scale ratio on the x-axis.
   * @returns {Object} this
   */
  scaleX(scaleX) {
    return this.cropper.scaleX(scaleX);
  }

  /**
   * Scale the image on the y-axis.
   * @param {number} scaleY - The scale ratio on the y-axis.
   * @returns {Object} this
   */
  scaleY(scaleY) {
    return this.cropper.scaleY(scaleY);
  }

  /**
   * Scale the image
   * @param {number} scaleX - The scale ratio on the x-axis.
   * @param {number} [scaleY=scaleX] - The scale ratio on the y-axis.
   * @returns {Object} this
   */
  scale(scaleX, scaleY = scaleX) {
    return this.cropper.scale(scaleX, scaleY);
  }

  /**
   * Get the cropped area position and size data (base on the original image)
   * @param {boolean} [rounded=false] - Indicate if round the data values or not.
   * @returns {Object} The result cropped data.
   */
  getData(rounded = false) {
    return this.cropper.getData(rounded);
  }

  /**
   * Set the cropped area position and size with new data
   * @param {Object} data - The new data.
   * @returns {Object} this
   */
  setData(data) {
    return this.cropper.setData(data);
  }

  /**
   * Get the container size data.
   * @returns {Object} The result container data.
   */
  getContainerData() {
    return this.cropper.getContainerData();
  }

  /**
   * Get the image position and size data.
   * @returns {Object} The result image data.
   */
  getImageData() {
    return this.cropper.getImageData();
  }

  /**
   * Get the canvas position and size data.
   * @returns {Object} The result canvas data.
   */
  getCanvasData() {
    return this.cropper.getCanvasData();
  }

  /**
   * Set the canvas position and size with new data.
   * @param {Object} data - The new canvas data.
   * @returns {Object} this
   */
  setCanvasData(data) {
    return this.cropper.setCanvasData(data);
  }

  /**
   * Get the crop box position and size data.
   * @returns {Object} The result crop box data.
   */
  getCropBoxData() {
    return this.cropper.getCropBoxData();
  }

  /**
   * Set the crop box position and size with new data.
   * @param {Object} data - The new crop box data.
   * @returns {Object} this
   */
  setCropBoxData(data) {
    return this.cropper.setCropBoxData(data);
  }

  /**
   * Get a canvas drawn the cropped image.
   * @param {Object} [options={}] - The config options.
   * @returns {HTMLCanvasElement} - The result canvas.
   */
  getCroppedCanvas(options = {}) {
    return this.cropper.getCroppedCanvas(options);
  }

  /**
   * Change the aspect ratio of the crop box.
   * @param {number} aspectRatio - The new aspect ratio.
   * @returns {Object} this
   */
  setAspectRatio(aspectRatio) {
    return this.cropper.setAspectRatio(aspectRatio);
  }

  /**
   * Change the drag mode.
   * @param {string} mode - The new drag mode.
   * @returns {Object} this
   */
  setDragMode(mode) {
    return this.cropper.setDragMode(mode);
  }

  render(): React.ReactElement {
    const { className, style, src, alt, imgStyle } = this.props;
    const prefixCls = getPrefixCls('cropper');

    const cls = {
      [prefixCls]: true,
    };

    return (
      <div className={classNames(cls, className)} style={style}>
        <img ref={this.imgRef} src={src} alt={alt} style={{ maxWidth: '100%', ...imgStyle }} />
      </div>
    );
  }
}

export default QmCropper;
