/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-14 12:55:53
 */
import React from 'react';
import classNames from 'classnames';
import SplitContext from './context';
import { t } from '../../locale';
import { getPosition } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';

type IProps = {
  minValues: number[];
  onDragChange: (value: boolean) => void;
  onDragging: (value: string) => void;
};

const getScrollTop = (el: HTMLElement) => {
  let offset = 0;
  let parent = el;
  while (parent) {
    offset += parent.scrollTop || 0;
    parent = parent.parentNode as HTMLElement;
  }
  return offset;
};

const getScrollLeft = (el: HTMLElement) => {
  let offset = 0;
  let parent = el;
  while (parent) {
    offset += parent.scrollLeft || 0;
    parent = parent.parentNode as HTMLElement;
  }
  return offset;
};

const ResizeBar: React.FC<IProps> = (props) => {
  const { minValues, onDragChange, onDragging } = props;
  const { splitRef, direction } = React.useContext(SplitContext)!;

  const dragStart = (ev: any) => {
    ev.preventDefault();
    onDragChange(true);
    document.addEventListener('mousemove', moving, { passive: true });
    document.addEventListener('mouseup', dragStop, { passive: true, once: true });
  };

  const dragStop = () => {
    document.removeEventListener('mousemove', moving);
    onDragChange(false);
  };

  const mouseOffset = ({ clientX, clientY }) => {
    const container = splitRef.current!;
    const containerOffset = getPosition(container);
    const range = [minValues[0], (direction === 'vertical' ? container.offsetHeight : container.offsetWidth) - minValues[1]];
    let offset: number;
    if (direction === 'vertical') {
      offset = clientY + getScrollTop(container) - containerOffset.y;
    } else {
      offset = clientX + getScrollLeft(container) - containerOffset.x;
    }
    offset = offset < range[0] ? range[0] : offset;
    offset = offset > range[1] ? range[1] : offset;
    return offset;
  };

  const moving = (ev: MouseEvent) => {
    onDragging(mouseOffset(ev) + 'px');
  };

  const prefixCls = getPrefixCls('split');

  const cls = {
    [`${prefixCls}__resize-bar`]: true,
    vertical: direction === 'vertical',
    horizontal: direction === 'horizontal',
  };

  return <div className={classNames(cls)} title={t('qm.split.resize')} onMouseDown={dragStart} />;
};

ResizeBar.displayName = 'ResizeBar';

export default ResizeBar;
