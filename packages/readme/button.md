## API

### Button

| 参数    | 说明                                     | 类型     | 默认值 |
| ------- | ---------------------------------------- | -------- | ------ |
| click   | 点击时执行的方法，用于防止 ajax 重复提交 | function | -      |
| confirm | 点击操作，确认提示，[配置项](#confirm)   | object   | -      |

说明：其他参数与 antd Button 组件一样，参考地址：https://ant.design/components/button-cn/#API

### confirm

| 参数      | 说明               | 类型     | 默认值           |
| --------- | ------------------ | -------- | ---------------- |
| title     | 提示内容           | string   | 确认执行删除吗？ |
| onConfirm | 点击确认按钮时触发 | function | -                |
| onCancel  | 点击取消按钮时触发 | function | -                |
