/*
 * @Author: 焦质晔
 * @Date: 2021-07-24 13:20:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-31 12:47:55
 */
import { createContext } from 'react';

export type IFormContext = {
  $$form: any;
};

const FormContext = createContext<IFormContext | undefined>(undefined);

export default FormContext;
