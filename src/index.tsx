/*
 * @Author: 焦质晔
 * @Date: 2021-02-05 09:13:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-15 08:28:44
 */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import '../packages/style/index.less';

// const data = {
//   spa1001: {
//     button: {
//       b01: {
//         visible: 0,
//         disabled: 1,
//       },
//       b02: {
//         visible: 0,
//         disabled: 0,
//       },
//     },
//     table: {
//       t01: {
//         fieldList: [
//           {
//             dataIndex: 'person.name',
//             visible: 1,
//             disabled: 0,
//             secretName: 'name',
//           },
//           {
//             dataIndex: 'choice',
//             visible: 0,
//             disabled: 0,
//           },
//           {
//             dataIndex: 'state',
//             visible: 0,
//             disabled: 0,
//           },
//         ],
//         isExport: 0,
//         isImport: 0,
//         isPrint: 0,
//       },
//     },
//     form: {
//       f01: {
//         fieldList: [
//           {
//             dataIndex: 'a',
//             visible: 1,
//             disabled: 1,
//             secretName: 'name',
//           },
//           {
//             dataIndex: 'b',
//             visible: 1,
//             disabled: 1,
//           },
//         ],
//       },
//       f02: {
//         fieldList: [
//           {
//             dataIndex: 'a',
//             visible: 1,
//             disabled: 0,
//           },
//           {
//             dataIndex: 'b',
//             visible: 1,
//             disabled: 1,
//           },
//         ],
//       },
//     },
//   },
// };

// localStorage.setItem('auths', JSON.stringify(data));

// 同步渲染模式
ReactDOM.render(<App />, document.getElementById('app'));

// 并发渲染模式
// ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
