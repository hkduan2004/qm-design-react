/*
 * @Author: 焦质晔
 * @Date: 2021-12-28 12:39:46
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-06 14:03:54
 */
import * as React from 'react';

export default function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
  const didMountRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    if (didMountRef.current) {
      effect();
    } else {
      didMountRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
