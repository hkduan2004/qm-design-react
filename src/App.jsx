/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 13:39:52
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-06-01 20:19:52
 */
import React from 'react';
import classNames from 'classnames';
import { sleep } from '../packages/_utils/util';
import {
  getTableData,
  getTableKeys,
  getSummationData,
  getSelectData,
  getTreeData,
  getRegionData,
  getTableAuth,
  getSearchHelperConfig,
} from './api/test';

import { QmConfigProvider, QmTable, QmButton, QmForm, QmSplit, QmDrawer, QmPrint, Button, QmCopyToClipboard, QmCollapse } from '../packages';
import { PlusOutlined, FormOutlined } from '@ant-design/icons';

import tableData from '@/mock/tableData';
import PrintTemplate from './print-template';

import './app.less';

let printList = [];
for (let i = 0; i < 60; i++) {
  printList[i] = i;
}

const App = () => {
  const tableRef = React.useRef(null);
  const formRef = React.useRef(null);
  const createFilterList = () => {
    return [
      {
        type: 'INPUT',
        label: '条件1',
        tooltip: 'Label 描述信息',
        fieldName: 'a',
      },
      {
        type: 'TREE_TABLE_HELPER',
        label: '条件zxc',
        fieldName: 'bbb',
        searchHelper: {
          filters: [
            {
              type: 'INPUT',
              label: '条件1',
              fieldName: 'a1',
            },
            {
              type: 'INPUT',
              label: '条件2',
              fieldName: 'a2',
            },
          ],
          table: {
            columns: [
              {
                title: '创建时间',
                dataIndex: 'date',
              },
              {
                title: '姓名',
                dataIndex: 'person.name',
              },
            ],
            fetch: {
              api: getTableData,
              params: {},
              dataKey: 'records',
            },
          },
          tree: {
            tableParamsMap: () => {
              return { a1: 'text', a2: 'value' };
            },
            fetch: {
              api: getTreeData,
              params: {},
              dataKey: 'records',
              valueKey: 'value',
              textKey: 'text',
            },
          },
          fieldAliasMap: () => {
            return { bbb: 'date', code: 'id', c: 'date' };
          },
          extraAliasMap: () => {
            return { bbb: 'date', c: 'date' };
          },
        },
        extra: {
          labelWidth: 80,
        },
      },
      {
        type: 'MULTIPLE_TREE_TABLE_HELPER',
        label: '条件zxc',
        fieldName: 'ccc',
        searchHelper: {
          filters: [
            {
              type: 'INPUT',
              label: '条件1',
              fieldName: 'a1',
            },
            {
              type: 'INPUT',
              label: '条件2',
              fieldName: 'a2',
            },
          ],
          table: {
            columns: [
              {
                title: '创建时间',
                dataIndex: 'date',
              },
              {
                title: '姓名',
                dataIndex: 'person.name',
              },
            ],
            fetch: {
              api: getTableData,
              params: {},
              dataKey: 'records',
            },
            rowKey: 'id',
          },
          tree: {
            tableParamsMap: () => {
              return { a1: 'text', a2: 'value' };
            },
            fetch: {
              api: getTreeData,
              params: {},
              dataKey: 'records',
              valueKey: 'value',
              textKey: 'text',
            },
          },
          request: {
            fetchApi: getTableData,
            params: { currentPage: 1, pageSize: 500 },
            dataKey: 'records',
          },
          fieldAliasMap: () => {
            return { valueKey: 'id', textKey: 'date' };
          },
        },
      },
      {
        type: 'MULTIPLE_CASCADER',
        label: '条件23',
        fieldName: 'b23',
        options: {
          itemList: [
            {
              text: '浙江省',
              value: '330000',
              children: [
                {
                  text: '杭州市',
                  value: '330100',
                  children: [
                    { text: '清河区', value: '330201' },
                    { text: '银河区', value: '330202' },
                  ],
                },
              ],
            },
            {
              text: '江苏省',
              value: '320000',
              children: [{ text: '苏州市', value: '320101', children: [{ text: '沧浪区', value: '320502' }] }],
            },
          ],
        },
      },
      {
        type: 'SEARCH_HELPER',
        label: '条件2',
        fieldName: 'b',
        searchHelper: {
          name: 'sh-1001',
          getServerConfig: getSearchHelperConfig,
          // fetch: {
          //   api: getTableData,
          //   params: { currentPage: 1, pageSize: 500 },
          //   dataKey: 'records',
          // },
          // filters: [
          //   {
          //     type: 'INPUT',
          //     label: '条件1',
          //     fieldName: 'a1',
          //   },
          //   {
          //     type: 'INPUT',
          //     label: '条件2',
          //     fieldName: 'a2',
          //   },
          //   {
          //     type: 'INPUT',
          //     label: '条件3',
          //     fieldName: 'a3',
          //   },
          //   {
          //     type: 'INPUT',
          //     label: '条件4',
          //     fieldName: 'a4',
          //   },
          // ],
          // table: {
          //   columns: [
          //     {
          //       title: '创建时间',
          //       dataIndex: 'date',
          //     },
          //     {
          //       title: '姓名',
          //       dataIndex: 'person.name',
          //     },
          //   ],
          //   rowKey: (record) => record.id,
          //   fetch: {
          //     api: getTableData,
          //     // params: { currentPage: 1, pageSize: 500 },
          //     dataKey: 'records',
          //   },
          //   // webPagination: true,
          // },
          filterAliasMap: () => {
            return ['a1'];
          },
          fieldAliasMap: () => {
            return { b: 'date', code: 'id', c: 'date' };
          },
          extraAliasMap: () => {
            return { b: 'date', c: 'date' };
          },
        },
        extra: {
          labelWidth: 80,
        },
      },
      {
        type: 'INPUT',
        label: '条件3',
        fieldName: 'c',
        extra: {
          labelWidth: 80,
        },
      },
      {
        type: 'SELECT',
        label: '条件4',
        fieldName: 'd',
        request: {
          fetchApi: getSelectData,
          params: {},
          dataKey: 'records',
          valueKey: 'value',
          textKey: 'text',
        },
      },
      {
        type: 'MULTIPLE_TREE_SELECT',
        label: '条件5',
        fieldName: 'e',
        request: {
          fetchApi: getTreeData,
          params: {},
          dataKey: 'records',
        },
      },
      {
        type: 'REGION_SELECT',
        label: '条件6',
        fieldName: 'f',
        request: {
          fetchApi: getSelectData,
          params: {},
          dataKey: 'records',
          valueKey: 'value',
          textKey: 'text',
        },
      },
      {
        type: 'CITY_SELECT',
        label: '条件7',
        fieldName: 'g',
      },
      {
        type: 'IMMEDIATE',
        label: '条件8',
        fieldName: 'h',
        request: {
          fetchApi: getTableData,
          params: {
            currentPage: 1,
            pageSize: 10,
          },
          dataKey: 'records',
        },
        options: {
          columns: [
            { dataIndex: 'person.name', title: '姓名' },
            { dataIndex: 'price', title: '价格' },
          ],
          fieldAliasMap: () => {
            return { h: 'date', c: 'date', id: 'id' };
          },
        },
      },
    ];
  };
  const createTableColumns = () => {
    return [
      {
        title: '操作',
        dataIndex: '__action__', // 操作列的 dataIndex 的值不能改
        fixed: 'left',
        width: 100,
        render: (text, row) => {
          return (
            <div>
              <el-button type="text">编辑</el-button>
              <el-button type="text">查看</el-button>
            </div>
          );
        },
      },
      {
        title: '序号',
        description: '数据索引',
        dataIndex: 'pageIndex',
        printFixed: true,
        width: 80,
        sorter: true,
        render: (text) => {
          return text + 1;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'date',
        width: 220,
        sorter: true,
        filter: {
          type: 'date',
        },
        editRender: (row) => {
          return {
            type: 'datetime',
          };
        },
      },
      {
        title: '个人信息',
        dataIndex: 'person',
        children: [
          {
            title: '姓名',
            dataIndex: 'person.name',
            width: 200,
            required: true,
            sorter: true,
            filter: {
              type: 'text',
            },
            editRender: (row) => {
              const obj = {
                type: 'tree-helper',
                helper: {
                  tree: {
                    fetch: {
                      api: getTreeData,
                      params: {},
                      dataKey: 'records',
                      valueKey: 'value',
                      textKey: 'text',
                    },
                    // asyncLoad: true,
                  },
                  fieldAliasMap: () => {
                    return { 'person.name': 'text', 'person.age': 'value' };
                  },
                },
                rules: [{ required: true, message: '姓名不能为空' }],
              };
              return obj;
            },
          },
          // {
          //   title: '姓名',
          //   dataIndex: 'person.nameids',
          //   width: 200,
          //   required: true,
          //   sorter: true,
          //   filter: {
          //     type: 'text',
          //   },
          //   editRender: (row) => {
          //     const obj = {
          //       type: 'tree-helper-multiple',
          //       helper: {
          //         tree: {
          //           fetch: {
          //             api: getTreeData,
          //             params: {},
          //             dataKey: 'records',
          //             valueKey: 'value',
          //             textKey: 'text',
          //           },
          //           // asyncLoad: true,
          //         },
          //         fieldAliasMap: () => {
          //           return { textKey: 'text', valueKey: 'value' };
          //         },
          //       },
          //       items: row.person.nameids.map((x, i) => ({ text: row.person.names[i], value: x })),
          //       rules: [{ required: true, message: '姓名不能为空' }],
          //       onChange: (a, b, c, d) => {
          //         // console.log(a, b, c, d);
          //         row.person.names = c.map((x) => x.text);
          //       },
          //     };
          //     return obj;
          //   },
          // },
          // {
          //   title: '姓名',
          //   dataIndex: 'person.nameids',
          //   width: 200,
          //   required: true,
          //   sorter: true,
          //   filter: {
          //     type: 'text',
          //   },
          //   editRender: (row) => {
          //     const obj = {
          //       type: 'search-helper-multiple',
          //       editable: true,
          //       extra: { collapseTags: true },
          //       helper: {
          //         filters: [
          //           {
          //             type: 'INPUT',
          //             label: '条件1',
          //             fieldName: 'a1',
          //           },
          //         ],
          //         table: {
          //           columns: [
          //             {
          //               title: '创建时间',
          //               dataIndex: 'date',
          //             },
          //             {
          //               title: '姓名',
          //               dataIndex: 'person.name',
          //             },
          //           ],
          //           rowKey: 'id',
          //           fetch: {
          //             api: getTableData,
          //             params: {},
          //             dataKey: 'records',
          //           },
          //         },
          //         fieldAliasMap: () => {
          //           return { textKey: 'date', valueKey: 'id' };
          //         },
          //       },
          //       items: row.person.nameids.map((x, i) => ({ text: row.person.names[i], value: x })),
          //       rules: [{ required: true, message: '姓名不能为空' }],
          //       onChange: (a, b, c, d) => {
          //         console.log(a, b, c, d);
          //       },
          //     };
          //     return obj;
          //   },
          // },
          {
            title: '性别',
            dataIndex: 'person.sex',
            width: 100,
            dictItems: [
              { text: '男', value: '1' },
              { text: '女', value: '0' },
            ],
          },
          {
            title: '年龄',
            dataIndex: 'person.age',
            width: 100,
            sorter: true,
            filter: {
              type: 'number',
            },
          },
        ],
      },
      {
        title: '价格',
        dataIndex: 'price',
        width: 150,
        precision: 2,
        required: true,
        sorter: true,
        groupSummary: {},
        filter: {
          type: 'number',
        },
        editRender: (row) => {
          return {
            type: 'number',
            extra: {
              max: 1000,
            },
            rules: [{ required: true, message: '价格不能为空' }],
          };
        },
      },
      {
        title: '数量',
        dataIndex: 'num',
        width: 150,
        required: true,
        sorter: true,
        summation: {
          dataKey: 'num',
          unit: '个',
        },
        groupSummary: {},
        filter: {
          type: 'number',
        },
        editRender: (row) => {
          return {
            type: 'number',
            extra: {
              max: 1000,
            },
            rules: [{ required: true, message: '数量不能为空' }],
          };
        },
      },
      {
        title: '总价',
        dataIndex: 'total',
        width: 150,
        precision: 2,
        align: 'right',
        sorter: true,
        groupSummary: {},
        filter: {
          type: 'number',
        },
        summation: {
          sumBySelection: true,
          unit: '元',
        },
        render: (text, row) => {
          row.total = row.price * row.num;
          return <span>{row.total.toFixed(2)}</span>;
        },
      },
      {
        title: '是否选择',
        dataIndex: 'choice',
        align: 'center',
        width: 150,
        editRender: (row) => {
          return {
            type: 'checkbox',
            editable: true,
            extra: {
              trueValue: 1,
              falseValue: 0,
              disabled: true,
            },
          };
        },
        dictItems: [
          { text: '选中', value: 1 },
          { text: '非选中', value: 0 },
        ],
      },
      {
        title: '状态',
        dataIndex: 'state',
        colSpan: 2,
        width: 150,
        filter: {
          type: 'radio',
        },
        editRender: (row) => {
          return {
            type: 'select',
          };
        },
        dictItems: [
          { text: '已完成', value: 1 },
          { text: '进行中', value: 2 },
          { text: '未完成', value: 3 },
        ],
      },
      {
        title: '业余爱好',
        dataIndex: 'hobby',
        colSpan: 0,
        width: 150,
        filter: {
          type: 'checkbox',
        },
        editRender: (row) => {
          return {
            type: 'select-multiple',
          };
        },
        dictItems: [
          { text: '篮球', value: 1 },
          { text: '足球', value: 2 },
          { text: '乒乓球', value: 3 },
          { text: '游泳', value: 4 },
        ],
      },
      {
        title: '地址',
        dataIndex: 'address',
        width: 200,
        filter: {
          type: 'textarea',
        },
        editRender: (row) => {
          return {
            type: 'text',
            editable: true,
            extra: {
              suffix: (
                <FormOutlined
                  onClick={() => {
                    console.log(123, row.address);
                  }}
                />
              ),
            },
          };
        },
      },
    ];
  };
  const [filterList, setFilterList] = React.useState(createFilterList());
  const [columns, setColumns] = React.useState(createTableColumns());
  const [fetchParams, setFetchParams] = React.useState({});
  const [visible, setVisible] = React.useState(false);
  const [visible2, setVisible2] = React.useState(false);

  const [tableList, setTableList] = React.useState(tableData.data.items);

  const printClick = async () => {
    await sleep(1000);
    formRef.current.SET_FIELDS_VALUE({ ccc: [21, 22, 23] });
    // tableRef.current.SET_SELECTION_ROWS([{ id: 21 }, { id: 22 }]);
  };

  return (
    <QmConfigProvider size={'middle'} locale={'zh-cn'}>
      <div style={{ padding: 10, paddingBottom: 0 }}>
        <QmForm
          ref={formRef}
          authCode="spa1001.form.f01"
          uniqueKey="demo"
          formType="search"
          items={filterList}
          // initialValues={{ ccc: [21, 22, 23] }}
          fieldsChange={(items) => setFilterList(items)}
          onFinish={(values) => {
            console.log(111, values);
            setFetchParams(values);
          }}
          onValuesChange={(a, b) => {
            console.log(222, a, b);
          }}
          onCollapse={() => tableRef.current.CALCULATE_HEIGHT()}
        />
        {/* <QmCollapse label="标题标题" containerStyle={{ paddingTop: 30 }}>
          <div>111</div>
          <div>222</div>
        </QmCollapse> */}
        <QmTable
          ref={tableRef}
          authCode={'spa1001.table.t01'}
          uniqueKey="demo"
          height={400}
          rowKey={'id'}
          columns={columns}
          // dataSource={tableList}
          // webPagination
          fetch={{
            api: getTableData,
            params: fetchParams,
            dataKey: 'records',
          }}
          rowSelection={{
            type: 'checkbox',
            // selectAllOnCurrentPage: true,
            // selectFirstRowOnChange: true,
            // selectedRowKeys: [],
            // fetchAllRowKeys: {
            //   api: getTableKeys,
            //   dataKey: 'recordKeys',
            // },
            disabled: (row) => {
              return row.id === 3;
            },
            onChange: (val, rows) => {
              console.log(123, val, rows);
            },
          }}
          exportExcel={{ fileName: '导出文件.xlsx' }}
          tablePrint={{}}
          columnsChange={(columns) => setColumns(columns)}
        >
          <QmCopyToClipboard text={'hello\nworld'}>
            <Button>复制</Button>
          </QmCopyToClipboard>
          <QmPrint templateRender={() => <PrintTemplate dataSource={printList} />} click={printClick}>
            打印
          </QmPrint>
          <QmButton
            authCode="spa1001.button.b01"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              printClick();
            }}
          >
            新建
          </QmButton>
        </QmTable>
        <QmDrawer visible={visible} title="新建信息" onClose={() => setVisible(false)}>
          <div style={{ height: 1000 }}>
            <QmButton onClick={() => setVisible2(true)}>按钮</QmButton>
            <QmDrawer visible={visible2} title="新建信息" onClose={() => setVisible2(false)}>
              <div>asdasd</div>
            </QmDrawer>
          </div>
        </QmDrawer>
      </div>
    </QmConfigProvider>
  );
};
export default App;
