/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:25
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-11-14 11:50:41
 */
import ResizeObserver from 'resize-observer-polyfill';
import isServer from './isServer';
import type { CustomHTMLElement } from './types';

type IResizeListener = (option: ResizeObserverEntry) => void;

export type ResizableElement = CustomHTMLElement<{
  __resizeListeners__?: Array<IResizeListener>;
  __ro__?: ResizeObserver;
}>;

const resizeHandler = function (entries: ResizeObserverEntry[]): void {
  for (const entry of entries) {
    const listeners = (entry.target as ResizableElement).__resizeListeners__ || [];
    if (listeners.length) {
      listeners.forEach((fn) => fn(entry));
    }
  }
};

export const addResizeListener = function (element: ResizableElement, fn: IResizeListener): void {
  if (isServer || !element) return;
  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = [];
    element.__ro__ = new ResizeObserver(resizeHandler);
    element.__ro__.observe(element);
  }
  element.__resizeListeners__.push(fn);
};

export const removeResizeListener = function (element: ResizableElement, fn: IResizeListener): void {
  if (!element || !element.__resizeListeners__) return;
  element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
  if (!element.__resizeListeners__.length) {
    element.__ro__?.disconnect();
  }
};
