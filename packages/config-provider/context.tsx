/*
 * @Author: 焦质晔
 * @Date: 2021-07-24 13:20:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 17:11:43
 */
import { createContext } from 'react';
import { Locale, ComponentSize } from '../_utils/types';

export type IConfig = {
  locale: Locale;
  size: ComponentSize;
  theme?: string;
  global?: Record<string, any>;
};

const ConfigContext = createContext<IConfig>({ locale: 'zh-cn', size: 'middle' });

export default ConfigContext;
