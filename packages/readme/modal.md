## API

### Modal

| 参数           | 说明                                                                     | 类型                     | 默认值 |
| -------------- | ------------------------------------------------------------------------ | ------------------------ | ------ |
| size           | 尺寸                                                                     | large \| middle \| small | -      |
| width          | 设置 Modal 的宽度                                                        | number \| string         | 60%    |
| height         | 设定 Modal Body 的高度                                                   | number \| string         | -      |
| loading        | Modal Body 的 loading 状态，不传此参数，会默认开启 200ms 的 loading 动画 | boolean                  | -      |
| showFullScreen | 是否显示全屏按钮                                                         | boolean                  | true   |
| draggable      | 是否开启可拖拽功能                                                       | boolean                  | true   |
| onClose        | Modal 关闭前的回调                                                       | function                 | -      |
| onClosed       | Modal 完全关闭后的回调                                                   | function                 | -      |

说明：其他参数与 antd Modal 组件一样，参考地址：https://ant.design/components/modal-cn/#API
