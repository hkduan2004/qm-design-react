/*
 * @Author: 焦质晔
 * @Date: 2021-07-30 11:23:11
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-07-30 11:23:32
 */
import React from 'react';

export const cloneElement = (element: React.ReactNode, ...rest: any[]): React.ReactElement | null => {
  if (!React.isValidElement(element)) {
    return null;
  }
  return React.cloneElement(element, ...rest);
};
