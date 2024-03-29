## API

### Form

| 参数           | 说明                                           | 类型                     | 默认值     |
| -------------- | ---------------------------------------------- | ------------------------ | ---------- |
| formType       | 表单类型，[配置项](#form_type)                 | string                   | default    |
| items          | 表单配置项列表，[配置项](#form_item)，必要参数 | array                    | -          |
| fieldsChange   | 表单配置项变化回调，必要参数                   | function(fields)         | -          |
| initialValues  | 表单初始值                                     | object                   | -          |
| initialExtras  | 表单项的尾部信息初始值                         | object                   | -          |
| size           | 尺寸                                           | large \| middle \| small | -          |
| layout         | 表单布局                                       | horizontal \| vertical   | horizontal |
| labelWidth     | label 标签宽度                                 | number \| string         | 80         |
| labelAlign     | label 标签文本对齐方式                         | left \| right            | right      |
| cols           | 每行显示的列数，不设置默认为自适应             | number                   | -          |
| uniqueKey      | 用于表单配置项的本地缓存，不能重复             | string                   | -          |
| authCode       | 控制表单项权限的 formID，和平台相关            | string                   | -          |
| customClass    | 自定义选择器类名                               | string                   | -          |
| defaultRows    | 收起状态默认显示的行数 - 筛选器有效            | number                   | 1          |
| authConfig     | 表单权限配置，[配置项](#auth_config)           | object                   | -          |
| isAutoFocus    | 是否自动获得焦点                               | boolean                  | true       |
| isFieldsDefine | 是否显示列定义功能                             | boolean                  | -          |
| isCollapse     | 是否显示 展开/收起 功能 - 筛选器有效           | boolean                  | true       |
| isSearchBtn    | 是否显示 搜索/重置 按钮                        | boolean                  | true       |
| isSubmitBtn    | 是否显示 保存/重置 按钮                        | boolean                  | -          |

### 事件

| 事件名称       | 说明                               | 回调参数                               |
| -------------- | ---------------------------------- | -------------------------------------- |
| onFinish       | 提交表单且数据验证成功后回调事件   | function(formValues)                   |
| onFinishFailed | 提交表单且数据验证失败后回调事件   | function(errorFields)                  |
| onReset        | 表单重置时触发的回调事件           | -                                      |
| onValuesChange | 表单组件，字段值变化时触发回调事件 | function(changedValues, initialValues) |
| onFieldsChange | 表单组件，字段更新时触发回调事件   | function(changedFields, allFields)     |
| onCollapse     | 展开/收起 状态改变时的回调事件     | function(collapse： boolean)           |

### 方法

| 方法名称           | 说明                     | 参数                             | 返回值                               |
| ------------------ | ------------------------ | -------------------------------- | ------------------------------------ |
| SUBMIT_FORM        | 表单提交                 | -                                | -                                    |
| RESET_FORM         | 重置表单                 | -                                | -                                    |
| GET_FORM_DATA      | 获取表单数据，异步方法   | -                                | 返回错误前置的数组 [error, formData] |
| GET_FIELDS_VALUE   | 获取表单项的值           | function(fieldNames[]: string[]) | fieldValues                          |
| SET_FIELDS_VALUE   | 设置表单字段的值         | function(values:object)          | -                                    |
| GET_FIELDS_EXTRA   | 获取表单项尾部描述值     | function(fieldNames[]: string[]) | extraValues                          |
| SET_FIELDS_EXTRA   | 设置表单项尾部描述值     | function(values:object)          | -                                    |
| GET_FIELDS_TOUCHED | 检查字段是否被用户操作过 | function(fieldNames[]: string[]) | boolean                              |

### form_type

| 表单类型 | 说明     |
| -------- | -------- |
| default  | 表单     |
| search   | 筛选器   |
| onlyShow | 只读表单 |

### form_item_type

| 表单类型                   | 说明                   |
| -------------------------- | ---------------------- |
| DIVIDER                    | 分隔符                 |
| INPUT                      | 输入框                 |
| SEARCH_HELPER              | 搜索帮助               |
| MULTIPLE_SEARCH_HELPER     | 搜索帮助，多选         |
| TREE_TABLE_HELPER          | 左树右表搜索帮助       |
| MULTIPLE_TREE_TABLE_HELPER | 左树右表搜索帮助，多选 |
| RANGE_INPUT                | 输入框区间             |
| INPUT_NUMBER               | 数值类型输入框         |
| RANGE_INPUT_NUMBER         | 数值类型输入框区间     |
| TREE_SELECT                | 树选择器               |
| MULTIPLE_TREE_SELECT       | 树选择器，多选         |
| CASCADER                   | 级联选择器             |
| MULTIPLE_CASCADER          | 级联选择器多选         |
| SELECT                     | 下拉选择器             |
| MULTIPLE_SELECT            | 下拉选择器，多选       |
| REGION_SELECT              | 地区选择器，支持街道   |
| CITY_SELECT                | 城市选择器             |
| SWITCH                     | 开关类型               |
| RADIO                      | 单选按钮               |
| CHECKBOX                   | 复选框                 |
| MULTIPLE_CHECKBOX          | 复选框，多选           |
| TEXT_AREA                  | 文本域                 |
| IMMEDIATE                  | 及时反馈 - 搜索帮助    |
| DATE                       | 日期类型               |
| RANGE_DATE                 | 日期区间类型，单独选择 |
| TIME                       | 时间类型               |
| RANGE_TIME                 | 时间区间类型           |
| UPLOAD_IMG                 | 图片上传，支持裁剪压缩 |
| UPLOAD_FILE                | 附件上传               |
| TINYMCE                    | 富文本编辑器           |

### form_item

| 参数            | 说明                                                   | 类型                             | 默认值   |
| --------------- | ------------------------------------------------------ | -------------------------------- | -------- |
| type            | 字段类型，[配置项](#form_item_type)，必要参数          | string                           | -        |
| fieldName       | 字段数据名，不能重复，必要参数                         | string                           | -        |
| label           | label 名称，支持下拉选 lable，[配置项](#label_options) | string \| object                 | -        |
| labelWidth      | label 标签宽度                                         | number \| string                 | 80       |
| tooltip         | label 表述信息                                         | string                           | -        |
| options         | 表单字段的详细配置，[配置项](#options)                 | object                           | -        |
| searchHelper    | 输入框类型搜索帮助的配置，[配置项](#search_helper)     | object                           | -        |
| request         | 请求配置项，用于获取表单列表数据，[配置项](#request)   | object                           | -        |
| upload          | 附件上传的配置，[配置项](#upload)                      | object                           | -        |
| extra           | 表单项尾部描述信息，[配置项](#extra)                   | object                           | -        |
| hidden          | 是否隐藏，不占页面空间                                 | boolean                          | -        |
| invisible       | 是否可见，占页面空间                                   | boolean                          | -        |
| noAuth          | 表单字段权限控制                                       | boolean                          | -        |
| disabled        | 是否禁用                                               | boolean                          | -        |
| readOnly        | 是否只读                                               | boolean                          | -        |
| placeholder     | 表单元素的 placeholder 原生属性                        | string \| string[]               | -        |
| allowClear      | 是否显示清空按钮                                       | boolean                          | -        |
| validateTrigger | 设置字段校验的时机                                     | string \| string[]               | onChange |
| rules           | 校验规则，[配置项](#rules)                             | array                            | -        |
| selfCol         | 自身占据的列数，数值 24 表示占据整行                   | number                           | 1        |
| offsetLeft      | 左侧的偏移列数                                         | number                           | -        |
| offsetRight     | 右侧的偏移列数                                         | number                           | -        |
| style           | 设置 css 样式                                          | styleObject                      | -        |
| className       | 自定义类名                                             | string                           | -        |
| bordered        | 表单项边框                                             | boolean                          | true     |
| collapse        | 分隔符的 展开/收起 配置，[配置项](#collapse)           | object                           | -        |
| noResetable     | 是否不可被重置(暂时未实现)                             | boolean                          | -        |
| render          | 自定义表单项                                           | function(formItem, ctx): JSXNode | -        |
| onChange        | 表单字段 change 事件                                   | function(value, others?)         | -        |
| onBlur          | 表单字段 blur 事件                                     | function(value)                  | -        |
| onEnter         | 表单字段 enter 事件                                    | function(value)                  | -        |

### rules

| 参数      | 说明           | 类型                            | 默认值 |
| --------- | -------------- | ------------------------------- | ------ |
| required  | 是否必填       | boolean                         | -      |
| message   | 提示信息       | string                          | -      |
| min       | 最小长度       | number                          | -      |
| max       | 最大长度       | number                          | -      |
| pattern   | 正则表达式匹配 | RegExp                          | -      |
| validator | 自定义校验方法 | function(rule, value, callback) | -      |

注意：其他参数请参考 https://ant.design/components/form-cn/#API

### options

| 参数             | 说明                                                   | 表单类型                             | 类型                                  | 默认值               |
| ---------------- | ------------------------------------------------------ | ------------------------------------ | ------------------------------------- | -------------------- |
| itemList         | 下拉框的列表数据，[配置项](#dict)                      | SELECT \| MULTIPLE_CHECKBOX \| RADIO | array                                 | -                    |
| prefix           | 带有前缀图标                                           | INPUT                                | ReactNode                             | -                    |
| suffix           | 带有后缀图标                                           | INPUT                                | ReactNode                             | -                    |
| maxLength        | 内容最大长度                                           | INPUT                                | number                                | -                    |
| password         | 是否为密码类型                                         | INPUT                                | boolean                               | -                    |
| toUpper          | 输入框文本自动转大写                                   | INPUT                                | boolean                               | -                    |
| pattern          | 输入框文本的正则校验规则                               | INPUT                                | RegExp                                | -                    |
| secretType       | 值保密类型，[配置项](#secret_type)                     | INPUT                                | string                                | -                    |
| step             | 每次改变步数                                           | INPUT_NUMBER                         | number                                | 1                    |
| min              | 最小值                                                 | INPUT_NUMBER                         | number                                | 0                    |
| max              | 最大值                                                 | INPUT_NUMBER                         | number                                | -                    |
| controls         | 是否显示增减按钮                                       | INPUT_NUMBER                         | boolean                               | true                 |
| precision        | 数值精度                                               | INPUT_NUMBER                         | number                                | -                    |
| formatter        | 格式输入框展示值的格式                                 | INPUT_NUMBER                         | function(value: number): string       | -                    |
| parser           | 转换回数字的方式，和 formatter 搭配使用                | INPUT_NUMBER                         | (value: string) => string             | -                    |
| falseValue       | 非选中的值                                             | CHECKBOX \| SWITCH                   | string \| number                      | '0'                  |
| trueValue        | 选中的值                                               | CHECKBOX \| SWITCH                   | string \| number                      | '1'                  |
| showCount        | 是否展示字数                                           | TEXT_AREA                            | boolean                               | -                    |
| autoSize         | 自适应内容高度，可设置文本域高度，[配置项](#auto_size) | TEXT_AREA                            | object                                | -                    |
| dateType         | 日期控件的类型，[配置项](#date_type)                   | DATE \| TIME                         | string                                | 'date'               |
| minDateTime      | 最小日期，小于该时间的日期段将被禁用                   | DATE \| TIME                         | string                                | -                    |
| maxDateTime      | 最大日期，大于该时间的日期段将被禁用                   | DATE \| TIME                         | string                                | -                    |
| shortCuts        | 时间控件快捷选择功能                                   | DATE \| RANGE_DATE                   | boolean                               | true                 |
| disableds        | 日期类型控件的禁用                                     | RANGE_DATE \| RANGE_TIME             | [boolean, boolean]                    | -                    |
| timeType         | 时间格式，[配置项](#time_type)                         | TIME                                 | string                                | 'hour-minute-second' |
| hourStep         | 小时选项间隔                                           | TIME                                 | number                                | 1                    |
| minuteStep       | 分钟选项间隔                                           | TIME                                 | number                                | 1                    |
| secondStep       | 秒选项间隔                                             | TIME                                 | number                                | 1                    |
| filterable       | 是否开启自动检索功能                                   | SELECT                               | boolean                               | true                 |
| collapseTags     | 是否折叠 tag 标签                                      | SELECT                               | boolean                               | -                    |
| maxTagTextLength | 最大显示的 tag 文本长度                                | SELECT                               | number                                | -                    |
| checkStrategy    | 定义返回数据的策略                                     | MULTIPLE_TREE_SELECT                 | SHOW_ALL \| SHOW_PARENT \| SHOW_CHILD | SHOW_CHILD           |
| openPyt          | 是否开启拼音头检索                                     | SELECT                               | boolean                               | true                 |
| changeOnSelect   | 点选每级菜单选项值都会发生变化                         | CASCADER                             | boolean                               | -                    |
| hideHeader       | 是否隐藏表头                                           | IMMEDIATE                            | boolean                               | -                    |
| onlySelect       | 是否只能选择                                           | IMMEDIATE                            | boolean                               | -                    |
| columns          | 及时反馈下拉列表的配置，[配置项](#columns)             | IMMEDIATE                            | array                                 | -                    |
| fieldAliasMap    | 同 searchHelper                                        | IMMEDIATE                            | function(): object \| object          | -                    |
| extraAliasMap    | 同 searchHelper                                        | IMMEDIATE                            | function(): object \| object          | -                    |
| multiple         | 多文件上传                                             | UPLOAD_FILE \| UPLOAD_IMG            | boolean                               | true                 |
| maxCount         | 最大上传数量                                           | UPLOAD_FILE \| UPLOAD_IMG            | number                                | -                    |
| fileSize         | 限制上传附件的大小，不指定，图片类型不开启裁剪功能     | UPLOAD_FILE \| UPLOAD_IMG            | number                                | -                    |
| fileTypes        | 限制上传附件的类型                                     | UPLOAD_FILE \| UPLOAD_IMG            | string[]                              | -                    |
| onRemove         | 附件被移除事件                                         | UPLOAD_FILE \| UPLOAD_IMG            | function(file)                        | -                    |
| fixedSize        | 裁剪框的宽高比，空数组则不约束裁剪框的宽高比           | UPLOAD_IMG                           | array                                 | [1.5, 1]             |
| quality          | 裁剪图片的压缩比例                                     | UPLOAD_IMG                           | 0 - 1                                 | 1                    |
| tinymceHeight    | 富文本编辑器高度                                       | TINYMCE                              | number \| string                      | -                    |

### date_type

| 参数      | 说明           | 类型   | 格式                |
| --------- | -------------- | ------ | ------------------- |
| date      | 日期类型，默认 | tring  | YYYY-MM-DD HH:mm:ss |
| datetime  | 日期时间类型   | tring  | YYYY-MM-DD HH:mm:ss |
| exactdate | 严格日期类型   | string | YYYY-MM-DD          |
| week      | 周类型         | string | YYYY-MM-DD          |
| month     | 月份类型       | string | YYYY-MM             |
| quarter   | 季度类型       | string | YYYY-[Q]Q           |
| year      | 年份类型       | string | YYYY                |

### time_type

| 参数               | 说明                | 类型  | 格式     |
| ------------------ | ------------------- | ----- | -------- |
| hour               | 小时 格式           | tring | HH       |
| hour-minute        | 小时:分钟 格式      | tring | HH:mm    |
| hour-minute-second | 小时:分钟:秒钟 格式 | tring | HH:mm:ss |

### fetch

| 参数        | 说明                                                 | 类型                      | 默认值  |
| ----------- | ---------------------------------------------------- | ------------------------- | ------- |
| api         | ajax 接口，必要参数                                  | func                      | -       |
| params      | 接口参数，必要参数                                   | object                    | -       |
| dataKey     | 数据的 key，支持 `a.b.c` 的路径写法                  | string                    | records |
| beforeFetch | 查询接口的前置钩子，返回 true 执行查询、false 不执行 | function(params): boolean | -       |
| valueKey    | 数据值的字段名                                       | string                    | value   |
| textKey     | 文本的字段名                                         | string                    | text    |

### auth_config

| 参数  | 说明                                  | 类型   | 默认值 |
| ----- | ------------------------------------- | ------ | ------ |
| fetch | 获取权限的接口，[配置项](#auth_fetch) | object | -      |

### auth_fetch

| 参数    | 说明                                                        | 类型   | 默认值 |
| ------- | ----------------------------------------------------------- | ------ | ------ |
| api     | ajax 接口，必要参数                                         | func   | -      |
| params  | 接口参数                                                    | object | -      |
| dataKey | 表单字段权限的数据路径，值为不可见列 `fieldName` 组成的数组 | string | -      |

### dict

| 参数     | 说明                 | 类型    |
| -------- | -------------------- | ------- |
| text     | 数字字典的文本，必要 | string  |
| value    | 数据字典的值，必要   | string  |
| disabled | 是否禁用             | boolean |
| children | 树结构               | array   |

### auto_size

| 参数    | 说明     | 类型   | 默认值 |
| ------- | -------- | ------ | ------ |
| minRows | 最小行数 | number | 1      |
| maxRows | 最大行数 | number | 3      |

### secret_type

| 参数     | 说明     |
| -------- | -------- |
| name     | 姓名     |
| phone    | 手机号   |
| IDnumber | 身份证号 |
| bankCard | 银行卡号 |

### search_helper

| 参数             | 说明                                                                          | 类型                             | 默认值 |
| ---------------- | ----------------------------------------------------------------------------- | -------------------------------- | ------ |
| filters          | 顶部筛选条件配置，参考 Form 组件，必要参数                                    | array                            | -      |
| table            | 列表组件配置，[配置项](#helper_table)，必要参数                               | object                           | -      |
| tree             | 左侧树组件配置，[配置项](#helper_tree)                                        | object                           | -      |
| request          | 请求配置项，用于获取表单列表数据，[配置项](#request)                          | object                           | -      |
| initialValue     | 筛选条件初始值                                                                | object                           | -      |
| width            | 搜索帮助面板宽度                                                              | number \| string                 | -      |
| onlySelect       | 是否只能选择                                                                  | boolean                          | true   |
| closeRemoteMatch | 关闭服务端匹配功能                                                            | boolean                          | -      |
| fieldAliasMap    | 表单字段与回传数据字段的映射，[配置项](#field_alias)， 必要参数               | function(): object \| object     | -      |
| filterAliasMap   | 输入框与筛选器条件的映射，返回 筛选器 fieldName 列表                          | function(): string[] \| string[] | -      |
| extraAliasMap    | 尾部描述信息设置，表单字段与回传数据字段的映射，[配置项](#field_alias)        | function(): object \| object     | -      |
| beforeOpen       | 打开搜索帮助的前置钩子，若返回 false 或者返回 Promise 且被 reject，则阻止打开 | function(cell, row, column)      | -      |
| closed           | 关闭搜索帮助的后置钩子                                                        | function(row)                    | -      |

### helper_table

| 参数    | 说明                        | 类型   | 默认值 |
| ------- | --------------------------- | ------ | ------ |
| columns | 同 Table，[配置项](#column) | array  | -      |
| fetch   | 同 Table，[配置项](#fetch)  | object | -      |

### helper_tree

| 参数           | 说明                                                            | 类型                         | 默认值 |
| -------------- | --------------------------------------------------------------- | ---------------------------- | ------ |
| tableParamsMap | 查询字段与回传数据字段的映射，[配置项](#field_alias)， 必要参数 | function(): object \| object | -      |
| fetch          | 同 Table，[配置项](#fetch)                                      | object                       | -      |

### field_alias

| 属性名 key            | 属性值 value |
| --------------------- | ------------ |
| 表单字段名(fieldName) | 数据字段     |

### label_options

| 参数 | 说明           | 类型   | 默认值 |
| ---- | -------------- | ------ | ------ |
| type | label 表单类型 | SELECT | -      |

注意：除了 type 的其他配置，参考 [配置项](#form_item)

### extra

| 参数       | 说明                 | 类型             | 默认值 |
| ---------- | -------------------- | ---------------- | ------ |
| labelWidth | 尾部描述信息容器宽度 | number \| string | -      |
| isTooltip  | 是否使用 Tooltip     | boolean          | -      |
| style      | 额外的 css 样式设置  | CSSProperties    | -      |

### request

| 参数      | 说明                     | 类型                        | 默认值 |
| --------- | ------------------------ | --------------------------- | ------ |
| fetchApi  | 请求的接口方法，必要参数 | async function              | -      |
| formatter | 格式化请求参数的方法     | function(params): newParams | -      |

说明： 其他参数, 参考 [配置项](#fetch)

### upload

`只对 UPLOAD_IMG|UPLOAD_FILE 有效`

| 参数            | 说明                                | 类型    | 默认值 |
| --------------- | ----------------------------------- | ------- | ------ |
| action          | 上传的地址，必要参数                | string  | -      |
| headers         | 接口请求的 header 头                | object  | -      |
| params          | 上传接口的参数                      | object  | -      |
| withCredentials | 上传请求时是否携带 cookie           | boolean | -      |
| dataKey         | 数据的 key，支持 `a.b.c` 的路径写法 | string  | -      |

`文件上传前后端数据交互的格式`

| 参数 | 说明     | 类型   | 默认值 |
| ---- | -------- | ------ | ------ |
| name | 文件名称 | string | -      |
| url  | 文件地址 | string | -      |

### collapse

`只对 DIVIDER 有效`

| 参数          | 说明                                                              | 类型                     | 默认值 |
| ------------- | ----------------------------------------------------------------- | ------------------------ | ------ |
| defaultExpand | 默认的展开状态                                                    | boolean                  | -      |
| showLimit     | 默认显示表单项的数量                                              | number                   | -      |
| remarkItems   | 指定被隐藏的表单作为摘要显示到分隔符区域，[配置项](#remark_items) | array                    | -      |
| onCollapse    | 展开/收起 状态改变时的回调事件                                    | function(collapse: bool) | -      |

### remark_items

| 参数      | 说明                        | 类型   | 默认值 |
| --------- | --------------------------- | ------ | ------ |
| fieldName | 表单项的字段名(fieldName)   | string | -      |
| showLabel | 是否显示表单项的 label 名称 | string | -      |
