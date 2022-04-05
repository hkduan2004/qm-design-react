/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 13:39:52
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 16:22:50
 */
import React from 'react';
import classNames from 'classnames';
import { sleep } from '../packages/_utils/util';
import { getTableData, getTableKeys, getSummationData, getSelectData, getTreeData, getRegionData, getTableAuth } from './api/test';

import { QmConfigProvider, QmTable, QmButton, QmForm, QmSplit, QmDrawer, QmPrint, Button } from '../packages';
import { PlusOutlined } from '@ant-design/icons';

import tableData from '@/mock/tableData';
import PrintTemplate from './print-template';

import './app.less';

let printList = [];
for (let i = 0; i < 60; i++) {
  printList[i] = i;
}

const data = [
  {
    key: 1,
    name: 'John Brown sr.',
    age: 60,
    address: 'New York No. 1 Lake Park',
    children: [
      {
        key: 11,
        name: 'John Brown',
        age: 42,
        address: 'New York No. 2 Lake Park',
      },
      {
        key: 12,
        name: 'John Brown jr.',
        age: 30,
        address: 'New York No. 3 Lake Park',
        children: [
          {
            key: 121,
            name: 'Jimmy Brown',
            age: 16,
            address: 'New York No. 3 Lake Park',
          },
        ],
      },
      {
        key: 13,
        name: 'Jim Green sr.',
        age: 72,
        address: 'London No. 1 Lake Park',
        children: [
          {
            key: 131,
            name: 'Jim Green',
            age: 42,
            address: 'London No. 2 Lake Park',
            children: [
              {
                key: 1311,
                name: 'Jim Green jr.',
                age: 25,
                address: 'London No. 3 Lake Park',
              },
              {
                key: 1312,
                name: 'Jimmy Green sr.',
                age: 18,
                address: 'London No. 4 Lake Park',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 2,
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
];

const App = () => {
  const tableRef = React.useRef(null);
  const createFilterList = () => {
    return [
      {
        type: 'INPUT',
        label: '条件1',
        tooltip: 'Label 描述信息',
        fieldName: 'a',
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
          uniqueKey: 'SPA1001_SH_01',
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
            {
              type: 'INPUT',
              label: '条件3',
              fieldName: 'a3',
            },
            {
              type: 'INPUT',
              label: '条件4',
              fieldName: 'a4',
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
            rowKey: (record) => record.id,
            fetch: {
              api: getTableData,
              params: {},
              dataKey: 'records',
            },
          },
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
        dataIndex: 'index',
        width: 100,
        fixed: 'left',
        sorter: true,
        render: (text) => {
          return text + 1;
        },
      },
      {
        title: '姓名',
        dataIndex: 'name',
        width: 200,
      },
      {
        title: '年龄',
        dataIndex: 'age',
        width: 200,
        sorter: true,
        precision: 0,
        filter: {
          type: 'number',
        },
      },
      {
        title: '地址',
        dataIndex: 'address',
        width: 200,
        filter: {
          type: 'text',
        },
        editRender: (row) => {
          return {
            type: 'text',
          };
        },
      },
    ];
  };
  const [filterList, setFilterList] = React.useState(createFilterList());
  const [columns, setColumns] = React.useState(createTableColumns());
  const [fetchParams, setFetchParams] = React.useState({});
  const [visible, setVisible] = React.useState(false);

  const printClick = async () => {
    await sleep(1000);
  };

  return (
    <QmConfigProvider size={'middle'} locale={'zh-cn'}>
      <div style={{ padding: 10, paddingBottom: 0 }}>
        <QmForm
          uniqueKey="demo"
          formType="search"
          items={filterList}
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
        <QmTable
          ref={tableRef}
          uniqueKey="demo"
          height={'auto'}
          rowKey={(row) => row.key}
          columns={columns}
          dataSource={data}
          // fetch={{
          //   api: getTableData,
          //   params: fetchParams,
          //   dataKey: 'records',
          // }}

          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: [1311],
            checkStrictly: false,
            // fetchAllRowKeys: {
            //   api: getTableKeys,
            //   dataKey: 'recordKeys',
            // },
            onChange: (val, rows) => {
              console.log(123, val, rows);
            },
          }}
          exportExcel={{ fileName: '导出文件.xlsx' }}
          tablePrint={{}}
          columnsChange={(columns) => setColumns(columns)}
        >
          <QmPrint templateRender={() => <PrintTemplate dataSource={printList} />} click={printClick}>
            打印
          </QmPrint>
          <QmButton type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
            新建
          </QmButton>
        </QmTable>
        <QmDrawer visible={visible} title="新建信息" onClose={() => setVisible(false)}>
          <div style={{ height: 1000 }}>asdasd</div>
        </QmDrawer>
      </div>
    </QmConfigProvider>
  );
};
export default App;
