/*
 * @Author: 焦质晔
 * @Date: 2021-02-14 14:25:07
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-09 18:29:28
 */
import type React from 'react';

export type Nullable<T> = T | null;

export type ValueOf<T> = T[keyof T];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

export type JSXElement = React.ReactNode | JSX.Element;

export type AnyObject<T> = { [key: string]: T };

export type AnyFunction<T> = (...args: any[]) => T;

export type CustomHTMLElement<T> = HTMLElement & T;

export type CSSProperties = React.CSSProperties;

export type TimeoutHandle = ReturnType<typeof setTimeout>;

export type IntervalHandle = ReturnType<typeof setInterval>;

export type AjaxResponse<T = any> = {
  code: number;
  data: T;
  msg: string;
};

export enum SizeHeight {
  large = 40,
  middle = 32,
  small = 24,
}

export type ComponentSize = 'small' | 'middle' | 'large';

export type Locale = 'zh-cn' | 'en';

export type IDict = {
  text: string;
  value: string;
  disabled?: boolean;
  children?: Array<IDict> | Nullable<undefined>;
};
