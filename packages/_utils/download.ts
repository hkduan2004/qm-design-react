/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 13:13:47
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:47:08
 */
import type { Nullable } from './types';

/**
 * @description 文件下载
 * @param {Blob} blob 对象
 * @param {string} fileName 文件名
 * @returns
 */
export const download = (blob: Blob, fileName: string): void => {
  // ie10+
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, decodeURI(fileName));
  } else {
    const downloadUrl: string = window.URL.createObjectURL(blob);
    let a: Nullable<HTMLAnchorElement> = document.createElement('a');
    a.href = downloadUrl;
    a.download = decodeURI(fileName);
    a.click();
    a = null;
  }
};
