/*
 * @Author: 焦质晔
 * @Date: 2020-02-28 23:04:58
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-28 14:04:31
 */
import PropTypes from 'prop-types';
import { isNumber } from '../../../_utils/util';
import { isValidComponentSize, isValidWidthUnit } from '../../../_utils/validators';
import { throwError } from '../../../_utils/error';
import { ITableProps } from './types';

const columnItem = {
  dataIndex: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired, // 列标题
  description: PropTypes.string, // 列描述
  colSpan: PropTypes.number, // 表头列合并,设置为 0 时，不渲染
  width: PropTypes.number, // 列宽度/最小宽度
  fixed: PropTypes.oneOf(['left', 'right']), // 列固定（IE 下无效）
  align: PropTypes.oneOf(['left', 'center', 'right']), // 设置列的对齐方式
  printFixed: PropTypes.bool, // 打印时，是否固定列
  hidden: PropTypes.bool, // 是否隐藏列
  noAuth: PropTypes.bool, // 列权限控制
  ellipsis: PropTypes.bool, // 超过宽度将自动省略
  className: PropTypes.string, // 列样式类名
  children: PropTypes.array, // 内嵌 children，以渲染分组表头
  sorter: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]), // 列排序
  // 列筛选
  filter: PropTypes.shape({
    type: PropTypes.oneOf(['text', 'textarea', 'checkbox', 'radio', 'number', 'date']).isRequired, // 列筛选类型
    // 筛选字典项
    items: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
  }),
  precision: PropTypes.number, // 数值类型字段的精度
  formatType: PropTypes.oneOf([
    'date',
    'datetime',
    'dateShortTime',
    'finance',
    'percent',
    'secret-name',
    'secret-phone',
    'secret-IDnumber',
    'secret-bankNumber',
  ]), // 字段的格式化类型
  required: PropTypes.bool, // 可编辑列是否必填
  editRender: PropTypes.func, // 可编辑单元格，参数: row, column; 返回值类型: object
  // 数据字典项
  dictItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  // 底部合计
  summation: PropTypes.shape({
    sumBySelection: PropTypes.bool, // 是否通过选择列合计
    displayWhenNotSelect: PropTypes.bool, // 未选择时，显示合计结果
    dataKey: PropTypes.string, // 服务端合计的数据字段名(路径)
    unit: PropTypes.string, // 合计字段的单位
    render: PropTypes.func, // 自定义渲染方法
  }),
  // 分组汇总
  groupSummary: PropTypes.shape({
    dataKey: PropTypes.string, // 服务端合计的数据字段名(路径)
    unit: PropTypes.string, // 合计字段的单位
    render: PropTypes.func, // 自定义渲染方法
  }),
  headRender: PropTypes.func, // 表头渲染方法
  render: PropTypes.func, // 列渲染方法，参数: text, row, column, rowIndex, cellIndex; 返回值类型: JSX
};

/**
 * editRender: 返回值
 * {
 *   type: PropTypes.oneOf(['text', 'number', 'select', 'select-multiple', 'checkbox', 'switch', 'search-helper', 'search-helper-multiple', 'date', 'datetime', 'time']).isRequired,
 *   items: PropTypes.arrayOf(PropTypes.shape({
 *     text: PropTypes.string,
 *     value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
 *   })),
 *   editable: PropTypes.bool,
 *   disabled: PropTypes.bool, // true -> 禁用编辑功能，默认为非编辑状态，且禁止切换
 *   extra: PropTypes.shape({
 *     maxLength: PropTypes.number,
 *     showCount: PropTypes.bool,
 *     readOnly: PropTypes.bool,
 *     max: PropTypes.number,
 *     min: PropTypes.number,
 *     trueValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 *     falseValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 *     minDateTime: PropTypes.string,
 *     maxDateTime: PropTypes.string,
 *     text: PropTypes.string,
 *     disabled: PropTypes.bool // 表单禁用状态
 *     allowClear: PropTypes.bool
 *   }),
 *   helper: PropTypes.shape({
 *     filters: PropTypes.object,
 *     table: PropTypes.object,
 *     initialValue: PropTypes.object,
 *     width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
 *     closeRemoteMatch: PropTypes.bool,
 *     fieldAliasMap: PropTypes.func,
 *     filterAliasMap: PropTypes.func,
 *     beforeOpen: PropTypes.func,
 *     closed: PropTypes.func
 *   }),
 *   rules: PropTypes.arrayOf(PropTypes.shape({
 *     required: PropTypes.bool,
 *     message: PropTypes.string,
 *     validator: PropTypes.func // 自定义校验规则，参数: val(表单项的值); 返回值类型: bool
 *   })),
 *   onInput: PropTypes.func,
 *   onChange: PropTypes.func,
 *   onEnter: PropTypes.func,
 * }
 */

export const propTypes = {
  // 列配置，必要参数
  columns: PropTypes.arrayOf(PropTypes.shape(columnItem)).isRequired,
  // 表格列变化事件，必要参数
  columnsChange: PropTypes.func,
  // 数据数组，内存分页
  dataSource: PropTypes.array,
  // 表格行 key 的取值
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  // 表格尺寸
  size: (props, propName, componentName) => {
    if (!(isValidComponentSize(props[propName] || '') || props[propName] === 'default')) {
      return throwError('QmForm', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
    }
  },
  // 表格的高度
  height: (props, propName, componentName) => {
    if (!(isNumber(props[propName]) || isValidWidthUnit(props[propName]) || props[propName] === 'auto')) {
      return throwError('QmForm', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
    }
  },
  // 表格的最小高度
  minHeight: (props, propName, componentName) => {
    if (!(isNumber(props[propName]) || isValidWidthUnit(props[propName]))) {
      return throwError('QmForm', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
    }
  },
  // 表格的最大高度
  maxHeight: (props, propName, componentName) => {
    if (!(isNumber(props[propName]) || isValidWidthUnit(props[propName]))) {
      return throwError('QmForm', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
    }
  },
  // 是否带有纵向边框
  border: PropTypes.bool,
  // 是否为斑马纹
  stripe: PropTypes.bool,
  // 向后台请求数据的接口
  fetch: PropTypes.shape({
    api: PropTypes.func.isRequired, // api 接口
    params: PropTypes.object.isRequired, // 接口参数
    beforeFetch: PropTypes.func, // 接口前置钩子，返回 false 表示取消请求
    afterFetch: PropTypes.func, // 接口后置钩子，返回处理之后的数据
    stopToFirst: PropTypes.bool, // 阻止跳回第一页
    dataKey: PropTypes.string, // 数据路径
  }),
  // 页面是否加载中
  loading: PropTypes.bool,
  // 所有列是否允许拖动列宽调整大小
  resizable: PropTypes.bool,
  // 各种配置的本地存储，值不能重复
  uniqueKey: PropTypes.string,
  // 自定义类选择器名
  customClass: PropTypes.string,
  // 是否显示表头
  showHeader: PropTypes.bool,
  // 设置所有内容过长时显示为省略号
  ellipsis: PropTypes.bool,
  // 给行附加样式
  rowStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  // 给单元格附加样式
  cellStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  // 合并行或列的计算方法
  spanMethod: PropTypes.func,
  // 列表项拖拽排序
  rowDraggable: PropTypes.bool,
  // 列表项是否可选择
  rowSelection: PropTypes.shape({
    type: PropTypes.oneOf(['checkbox', 'radio']).isRequired, // 选择类型
    defaultSelectedRowKeys: PropTypes.array, // 默认选中项的 key 数组
    selectedRowKeys: PropTypes.array, // 选中项的 key 数组，支持动态赋值
    hideSelectAll: PropTypes.bool, // 隐藏表头全选勾选框
    checkStrictly: PropTypes.bool, // true -> 节点选择完全受控（父子数据选中状态不再关联）
    filterable: PropTypes.bool, // 是否显示筛选箭头
    clearableAfterFetched: PropTypes.bool, // 重新检索之后，是否清空已选择
    // 请求选中行数据并回显
    fetchSelectedRowKeys: PropTypes.shape({
      api: PropTypes.func.isRequired, // api 接口
      params: PropTypes.object, // 接口参数
      dataKey: PropTypes.string, // 数据路径
    }),
    // 请求所有行数据的 rowKey，在点击全选时回显
    fetchAllRowKeys: PropTypes.shape({
      api: PropTypes.func.isRequired, // api 接口
      params: PropTypes.object, // 接口参数
      dataKey: PropTypes.string, // 数据路径
    }),
    disabled: PropTypes.func, // 是否允许行选择，参数：row，返回值 bool
    onChange: PropTypes.func, // 选中项发生变化时触发
  }),
  // 列表行高亮选中
  rowHighlight: PropTypes.shape({
    currentRowKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // 当前高亮行的 key
    disabled: PropTypes.func, // 是否允许行高亮，参数：row，返回值 bool
    onChange: PropTypes.func, // 高亮行发生变化时触发
  }),
  // 树表格配置
  treeConfig: PropTypes.shape({
    virtual: PropTypes.bool, // 是否开启虚拟滚动
  }),
  // 展开行配置项
  expandable: PropTypes.shape({
    defaultExpandAllRows: PropTypes.bool, // 默认展开所有行
    defaultExpandedRowKeys: PropTypes.array, // 默认展开 行的 key 数组
    expandedRowKeys: PropTypes.array, // 展开行的 key 数组，支持动态赋值
    hideExpandAll: PropTypes.bool, // 隐藏展开所有
    rowExpandable: PropTypes.func, // 是否允许行展开，参数：row，返回值 bool
    expandedRowClassName: PropTypes.string, // 展开行的 className
    expandedRowRender: PropTypes.func, // 额外的展开行渲染方法
    onExpand: PropTypes.func, // 点击展开图标时触发
    onChange: PropTypes.func, // 展开的行变化时触发
  }),
  // 合计功能
  summation: PropTypes.shape({
    // 分组合计
    groupItems: PropTypes.arrayOf(
      PropTypes.shape({
        dataIndex: PropTypes.string.isRequired,
        titleIndex: PropTypes.string,
        color: PropTypes.string,
        backgroundColor: PropTypes.string,
      })
    ),
    fetch: PropTypes.shape({
      api: PropTypes.func.isRequired, // api 接口
      params: PropTypes.object, // 接口参数
      dataKey: PropTypes.string, // 数据路径
    }),
    onChange: PropTypes.func, // 字段合计变化时触发
  }),
  // 底部自定义渲染
  footRender: PropTypes.func,
  // 忽略行数据 pageIndex 的创建
  ignorePageIndex: PropTypes.bool,
  // 多列排序
  multipleSort: PropTypes.bool,
  // 是否为滚动分页
  scrollPagination: PropTypes.bool,
  // 是否为前端内存分页
  webPagination: PropTypes.bool,
  // 分页配置参数
  paginationConfig: PropTypes.shape({
    current: PropTypes.number, // 当前页数
    pageSize: PropTypes.number, // 每页显示条目个数
    pageSizeOptions: PropTypes.array, // 个数选择器的选项设置
    showSizeChanger: PropTypes.bool, // 是否展示 pageSize 切换器
    showQuickJumper: PropTypes.bool, // 是否可以快速跳转至某页
  }),
  // 导出表格数据
  exportExcel: PropTypes.shape({
    fileName: PropTypes.string, // 导出的文件名，需包含扩展名[xlsx|csv]
    fetch: PropTypes.shape({
      api: PropTypes.func.isRequired, // api 接口
      params: PropTypes.object, // 接口参数
    }),
    cellStyle: PropTypes.bool, // 是否给单元格添加样式
  }),
  // 表格打印
  tablePrint: PropTypes.shape({
    showLogo: PropTypes.bool, // 是否显示 Logo
  }),
  // 表格权限
  authConfig: PropTypes.shape({
    fetch: PropTypes.shape({
      api: PropTypes.func.isRequired, // api 接口
      params: PropTypes.object, // 接口参数
      columnDataKey: PropTypes.string, // 列权限的数据路径
      exportDataKey: PropTypes.string, // 导出权限的数据路径
      importDataKey: PropTypes.string, // 导入权限的数据路径
      printDataKey: PropTypes.string, // 打印权限的数据路径
    }),
  }),
  // 顶部按钮插槽的对其方式
  topSpaceAlign: PropTypes.oneOf(['left', 'right']),
  // 是否显示表格顶部信息
  showAlert: PropTypes.bool,
  // 是否显示全屏按钮
  showFullScreen: PropTypes.bool,
  // 是否显示刷新按钮
  showRefresh: PropTypes.bool,
  // 是否显示导入按钮
  showTableImport: PropTypes.bool,
  // 是否显示行选合集
  showSelectCollection: PropTypes.bool,
  // 是否显示高级检索
  showSuperSearch: PropTypes.bool,
  // 是否显示数据定位查找
  showFastSearch: PropTypes.bool,
  // 是否显示分组汇总
  showGroupSummary: PropTypes.bool,
  // 是否显示列定义
  showColumnDefine: PropTypes.bool,
  // 只显示图标，不显示文字
  onlyShowIcon: PropTypes.bool,
  // 事件监听
  onChange: PropTypes.func,
  onDataChange: PropTypes.func,
  onDataLoad: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowDblclick: PropTypes.func,
  onRowContextmenu: PropTypes.func,
  onRowEnter: PropTypes.func,
  onScrollEnd: PropTypes.func,
};

export const defaultProps: ITableProps = {
  columns: [],
  dataSource: [],
  rowKey: 'id',
  border: true,
  resizable: true,
  showHeader: true,
  ellipsis: true,
  multipleSort: true,
  topSpaceAlign: 'right',
  showAlert: true,
  showFullScreen: true,
  showRefresh: true,
  showSelectCollection: true,
  showSuperSearch: true,
  showFastSearch: true,
  showGroupSummary: true,
  showColumnDefine: true,
};

/**
 * 事件：
 * onChange: 分页、排序、筛选、高级检索、行拖动排序 变化时触发，参数：pagination, filters, sorter, superFilters, { currentDataSource: tableData }
 * onDataChange: 表格单元格编辑、新增、删除数据时触发，参数 tableData
 * onDataLoad: 表格数据加载后触发，参数 tableData
 * onRowClick: 行单击事件，参数 row, column, event
 * onRowDblclick: 行双击事件，参数 row, column, event
 * onRowContextmenu: 行右键单击事件，row, column, event
 * onRowEnter: 行选中(单选) 或 行高亮 回车时触发，参数 row, event
 * onScrollEnd: 滚动条滚动至底部时触发，参数 event
 */

/**
 * 方法：
 * CALCULATE_HEIGHT: 计算表格高度
 * DO_REFRESH: 刷新表格数据，同时会清空列选中状态
 * INSERT_RECORDS: 插入表格行数据，参数 row|rows
 * REMOVE_RECORDS: 移除表格数据，参数 rowKeys|rows|row
 * VALIDATE_FIELDS: 触发表格中的表单字段校验，返回值：object
 * FORCE_UPDATE: 组件强制更新
 * GET_LOG: 获取操作记录，非空校验、格式校验、数据操作记录，返回值：object
 * SET_FIELDS_VALUE: 设置表格字段值 - 通常用于自定义单元格渲染，参数 row, values
 * CLEAR_LOG: 清空表格操作记录
 * CLEAR_TABLE_DATA: 清空表格数据
 * SCROLL_TO_RECORD: 滚动到指定数据行，参数 rowKey
 * SCROLL_TO_COLUMN: 滚动到指定表格列，参数 dataIndex
 */

// 清空高级检索: 1. fetch.params 变化  2. headFilters 变化  3. 点击清空按钮
