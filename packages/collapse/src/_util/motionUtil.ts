/*
 * @Author: 焦质晔
 * @Date: 2022-06-01 19:52:17
 * @Last Modified by:   焦质晔
 * @Last Modified time: 2022-06-01 19:52:17
 */
import { CSSMotionProps, MotionEventHandler, MotionEndEventHandler } from 'rc-motion';

const getCollapsedHeight: MotionEventHandler = () => ({ height: 0, opacity: 0 });
const getRealHeight: MotionEventHandler = (node) => ({ height: node.scrollHeight, opacity: 1 });
const getCurrentHeight: MotionEventHandler = (node) => ({ height: node.offsetHeight });
const skipOpacityTransition: MotionEndEventHandler = (_, event) => (event as TransitionEvent).propertyName === 'height';

const collapseMotion: CSSMotionProps = {
  motionName: 'rc-collapse-motion',
  onEnterStart: getCollapsedHeight,
  onEnterActive: getRealHeight,
  onLeaveStart: getCurrentHeight,
  onLeaveActive: getCollapsedHeight,
  onEnterEnd: skipOpacityTransition,
  onLeaveEnd: skipOpacityTransition,
  motionDeadline: 500,
  leavedClassName: 'rc-collapse-content-hidden',
};

export default collapseMotion;
