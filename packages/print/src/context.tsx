/*
 * @Author: 焦质晔
 * @Date: 2021-07-24 13:20:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-31 12:47:55
 */
import { createContext } from 'react';

export type IPreviewContext = {
  $$preview: any;
};

const PreviewContext = createContext<IPreviewContext | undefined>(undefined);

export default PreviewContext;
