/*
 * @Author: 焦质晔
 * @Date: 2022-06-01 19:06:44
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-06-01 20:16:23
 */
import React from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../../_utils/prefix';

const PanelContent = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const { forceRender, className, style, boxStyle, isActive } = props;

  const [rendered, setRendered] = React.useState(isActive || forceRender);

  React.useEffect(() => {
    if (forceRender || isActive) {
      setRendered(true);
    }
  }, [forceRender, isActive]);

  if (!rendered) {
    return null;
  }

  const prefixCls = getPrefixCls('collapse');

  return (
    <div
      ref={ref}
      className={classNames(
        `${prefixCls}-content`,
        {
          [`${prefixCls}-content-active`]: isActive,
          [`${prefixCls}-content-inactive`]: !isActive,
        },
        className
      )}
      style={style}
    >
      <div className={`${prefixCls}-content-box`} style={boxStyle}>
        {props.children}
      </div>
    </div>
  );
});

PanelContent.displayName = 'PanelContent';

export default PanelContent;
