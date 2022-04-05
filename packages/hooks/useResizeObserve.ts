/*
 * @Author: 焦质晔
 * @Date: 2021-12-31 12:25:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-06 13:58:21
 */
import * as React from 'react';
import { addResizeListener, removeResizeListener } from '../_utils/resize-event';

export default function useResizeObserve(ref: React.RefObject<HTMLElement>) {
  const [state, setState] = React.useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    const $el = ref.current;

    const handler = (entry: any) => {
      const { inlineSize: width, blockSize: height } = entry.contentBoxSize[0];
      setState({ width, height });
    };

    $el && addResizeListener($el, handler);

    return () => {
      $el && removeResizeListener($el, handler);
    };
  }, [ref]);

  return state;
}
