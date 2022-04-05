/*
 * @Author: 焦质晔
 * @Date: 2022-01-01 18:59:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-06 14:03:54
 */
import * as React from 'react';
import { on, off } from '../_utils/dom';

import type { Nullable } from '../_utils/types';

export default function useOutsideClick(ref: React.RefObject<HTMLElement>, omitClassNames?: string[]) {
  const [state, setState] = React.useState<boolean>(false);

  React.useEffect(() => {
    let startClick: MouseEvent;

    const $el = ref.current;

    const documentHandler = (mouseup: MouseEvent, mousedown: MouseEvent) => {
      const mouseUpTarget = mouseup.target as Nullable<HTMLElement>;
      const mouseDownTarget = mousedown?.target as Nullable<HTMLElement>;

      const isTargetExists = !mouseUpTarget || !mouseDownTarget;
      const isContainedByEl = $el?.contains(mouseUpTarget) || $el?.contains(mouseDownTarget);
      const isSelf = $el === mouseUpTarget;

      const excludes = omitClassNames?.map((x) => document.querySelector(x));

      const isTargetExcluded = excludes?.some((item) => item?.contains(mouseUpTarget)) || excludes?.includes(mouseDownTarget);

      if (isTargetExists || isContainedByEl || isSelf || isTargetExcluded) {
        setState(false);
      } else {
        setState(true);
      }
    };

    const mousedownHandler = (ev: MouseEvent) => {
      startClick = ev;
    };

    const mouseupHandler = (ev: MouseEvent) => {
      documentHandler(ev, startClick);
    };

    if ($el) {
      on(document, 'mousedown', mousedownHandler);
      on(document, 'mouseup', mouseupHandler);
    }

    return () => {
      if ($el) {
        off(document, 'mousedown', mousedownHandler);
        off(document, 'mouseup', mouseupHandler);
      }
    };
  }, [ref]);

  return state;
}
