/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 11:26:35
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-15 09:36:56
 */
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.css' {
  const resource: { [key: string]: string };
  export default resource;
}

declare module '*.less' {
  const resource: { [key: string]: string };
  export default resource;
}

declare module '*.json' {
  const value: any;
  export const version: string;
  export default value;
}
