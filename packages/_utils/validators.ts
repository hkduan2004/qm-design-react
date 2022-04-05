/*
 * @Author: 焦质晔
 * @Date: 2021-02-20 10:51:11
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-07-30 11:18:10
 */
export const isValidWidthUnit = (val: string | number): boolean => {
  if (typeof val === 'number' || typeof val === 'undefined') {
    return true;
  } else {
    return ['px', 'rem', 'em', 'vw', 'vh', '%'].some((unit) => (val as string).endsWith(unit)) || (val as string).startsWith('calc');
  }
};

export const isValidComponentSize = (val: string): boolean => ['', 'small', 'middle', 'large'].includes(val);
