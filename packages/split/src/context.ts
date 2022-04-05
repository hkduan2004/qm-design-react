/*
 * @Author: 焦质晔
 * @Date: 2022-01-14 10:59:22
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-14 11:07:14
 */
import React from 'react';

export type ISplitContext = {
  splitRef: React.RefObject<HTMLDivElement>;
  direction: 'horizontal' | 'vertical';
  dragging: boolean;
};

const SplitContext = React.createContext<ISplitContext | undefined>(undefined);

export default SplitContext;
