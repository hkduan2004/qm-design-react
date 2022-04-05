/*
 * @Author: 焦质晔
 * @Date: 2020-05-23 10:58:27
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-18 09:34:48
 */
import type { Nullable } from '../../_utils/types';

export const getDPI = (): number[] => {
  const arrDPI: number[] = [];
  const { deviceXDPI, deviceYDPI } = window.screen as any;
  if (deviceXDPI && deviceYDPI) {
    arrDPI[0] = deviceXDPI;
    arrDPI[1] = deviceYDPI;
  } else {
    let tmpNode: Nullable<HTMLElement> = document.createElement('DIV');
    tmpNode.style.cssText = `width: 1in; height: 1in; position: absolute; left: 0px; top: 0px; z-index: -1; visibility: hidden;`;
    document.body.appendChild(tmpNode);
    arrDPI[0] = parseInt(tmpNode.offsetWidth.toString());
    arrDPI[1] = parseInt(tmpNode.offsetHeight.toString());
    tmpNode.parentNode?.removeChild(tmpNode);
    tmpNode = null;
  }
  return arrDPI;
};

export const mmToPx = (value: number): number => {
  const inch = value / 25.4;
  const c_value = inch * getDPI()[0];
  return Math.ceil(c_value);
};

export const pxToMm = (value: number): number => {
  const inch = value / getDPI()[0];
  const c_value = inch * 25.4;
  return Math.ceil(c_value);
};

export const insertBefore = (el: HTMLElement, parent: HTMLElement): void => {
  if (parent.children[0]) {
    parent.insertBefore(el, parent.children[0]);
  } else {
    parent.appendChild(el);
  }
};

export const isPageBreak = (str: string): boolean => {
  const regeExp = /^<tr[^>]+type="page-break"[^>]+><\/tr>$/;
  return regeExp.test(str);
};
