/*
 * @Author: 焦质晔
 * @Date: 2021-12-26 08:57:11
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-06 14:04:06
 */
import * as React from 'react';

export default function useForceUpdate(): () => void {
  const [, forceUpdate] = React.useReducer<(x: number) => number>((x) => x + 1, 0);
  return forceUpdate;
}
