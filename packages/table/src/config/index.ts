/*
 * @Author: 焦质晔
 * @Date: 2020-03-02 21:21:13
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-09-04 10:00:51
 */
const config = {
  // 表格列的默认最小宽度
  defaultColumnWidth: 80,
  // 选择列的宽度
  selectionColumnWidth: 50,
  // 行高的映射表
  rowHeightMaps: {
    large: 42,
    middle: 34,
    small: 26,
  },
  // 排序方式
  sortDirections: ['ascend', 'descend'],
  // 分页
  pagination: {
    current: 1,
    pageSize: 20,
    pageSizeOptions: [10, 20, 30, 40, 50],
    showSizeChanger: true,
    showQuickJumper: true,
  },
  // 汇总
  groupSummary: {
    total: { text: '记录数', value: '*' },
    recordTotalIndex: 'nRecordsCount', // 记录数对应的后台数据的 key
    summaryFieldName: 'tsummary',
    groupbyFieldName: 'tgroupby',
  },
  // 高级检索
  highSearch: {
    showSQL: false,
  },
  // 树表格
  treeTable: {
    textIndent: 17, // 缩进 17px
  },
  // 后台返回数据的路径
  dataKey: 'records',
  // 后台返回合计的路径
  summationKey: 'summation',
  // 后台返回总条数的 key
  totalKey: 'total',
  // 虚拟滚动的阀值
  virtualScrollY: 150,
  // 表头排序的参数名
  sorterFieldName: 'tsortby',
  // 表头筛选的参数名
  filterFieldName: 'twhere',
  // 分页的参数名
  currentPageName: 'currentPage',
  // 分页的参数名
  pageSizeName: 'pageSize',
  // 是否显示筛选字段类型
  showFilterType: true,
  // 打印纸的宽度 A4 -> 1040px
  printWidth: 1040,
  // 操作列 dataIndex
  operationColumn: '__action__',
  // 选择列 dataIndex
  selectionColumn: '__selection__',
  // 展开列 dataIndex
  expandableColumn: '__expandable__',
  // 忽略合计的数据行标记
  summaryIgnore: 'sumIgnored',
};

export default config;
