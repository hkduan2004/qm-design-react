/*
 * @Author: 焦质晔
 * @Date: 2021-12-27 22:21:10
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-27 22:58:05
 */
import React from 'react';
import classNames from 'classnames';
import { noop } from '../../../_utils/util';
import { getNodeOffset } from '../utils';
import TableContext from '../context';
import config from '../config';

import type { IColumn } from '../table/types';

type IResizableProps = {
  column: IColumn;
};

const Resizable: React.FC<IResizableProps> = (props) => {
  const { column } = props;
  const { tableProps, tableRef, bordered } = React.useContext(TableContext)!;
  const { columns, resizable, columnsChange = noop } = tableProps;

  const resizeEventHandle = (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault();

    const $dom = ev.target as HTMLDivElement;
    const { elementStore } = tableRef.current;
    const target = elementStore[`$resizableBar`]!;

    const half = $dom.offsetWidth / 2;
    const disX = ev.clientX;
    const left = getNodeOffset($dom, elementStore[`$table`]!).left - (elementStore[`$tableBody`]!.parentNode! as HTMLElement).scrollLeft + half;

    elementStore[`$table`]!.classList.add('c--resize');
    target.style.left = `${left}px`;
    target.style.display = 'block';

    const renderWidth = column.width || column.renderWidth;
    let res = renderWidth;

    document.onmousemove = function (ev: MouseEvent) {
      if (typeof renderWidth !== 'number') return;

      const ml = ev.clientX - disX;
      const rw = renderWidth + ml;

      // 左边界限定
      if (rw < config.defaultColumnWidth) return;
      res = Math.floor(rw);

      target.style.left = `${ml + left}px`;
    };

    document.onmouseup = function () {
      elementStore[`$table`]!.classList.remove('c--resize');
      target.style.display = 'none';

      this.onmousemove = null;
      this.onmouseup = null;

      if (typeof res !== 'number') return;

      column.renderWidth = res;
      column.width = res;

      columnsChange([...columns]);
    };

    return false;
  };

  const cls = {
    [`resizable`]: true,
    [`is--line`]: resizable && !bordered,
  };
  return <div className={classNames(cls)} onMouseDown={resizeEventHandle} />;
};

export default Resizable;
