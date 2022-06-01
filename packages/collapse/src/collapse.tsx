/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-06-01 20:16:09
 */
import React from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../../_utils/prefix';
import motion from './_util/motionUtil';

import { QmDivider } from '../../index';
import CSSMotion from 'rc-motion';
import PanelContent from './Content';

type IProps = {
  defaultActive?: boolean;
  label: string;
  disabled?: boolean;
  forceRender?: boolean;
  destroyOnClose?: boolean;
  className?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  children?: React.ReactNode;
};

export type QmCollapseProps = IProps;

const Collapse: React.FC<IProps> = (props) => {
  const { defaultActive, label, className, style, containerStyle, disabled, forceRender, destroyOnClose = false } = props;

  const [isActive, setActive] = React.useState(!!defaultActive);

  const prefixCls = getPrefixCls('collapse');

  const cls = classNames(
    {
      [`${prefixCls}`]: true,
      [`${prefixCls}-active`]: isActive,
      [`${prefixCls}-disabled`]: disabled,
    },
    className
  );

  return (
    <div className={cls} style={style}>
      <QmDivider
        label={label}
        collapse={isActive}
        disabled={disabled}
        onCollapseChange={(collapse) => {
          setActive(collapse);
        }}
      />
      <CSSMotion
        visible={isActive}
        {...motion}
        leavedClassName={`${prefixCls}-content-hidden`}
        forceRender={forceRender}
        removeOnLeave={destroyOnClose}
      >
        {({ className: motionClassName, style: motionStyle }, ref) => {
          return (
            <PanelContent
              ref={ref}
              prefixCls={prefixCls}
              className={motionClassName}
              style={motionStyle}
              boxStyle={containerStyle}
              isActive={isActive}
              forceRender={forceRender}
            >
              {props.children}
            </PanelContent>
          );
        }}
      </CSSMotion>
    </div>
  );
};

export default Collapse;
