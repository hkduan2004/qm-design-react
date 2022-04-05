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

// 同步渲染模式
ReactDOM.render(<App />, document.getElementById('app'));

// 并发渲染模式
// ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
