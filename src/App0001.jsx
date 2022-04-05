/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 13:39:52
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-28 16:06:45
 */
import React, { Component } from 'react';
import classNames from 'classnames';

import { getTableData, getTableKeys, getSummationData, getSelectData, getTreeData, getRegionData } from './api/test';

import {
  QmConfigProvider,
  QmButton,
  QmSpace,
  QmDivider,
  QmSplit,
  QmCountup,
  QmEmpty,
  QmSpin,
  QmDownload,
  QmAnchor,
  QmTabs,
  QmDrawer,
  QmModal,
  QmForm,
  QmTinymce,
  QmUploadImg,
  QmTable,
} from '../packages';

import './app.less';

class App extends Component {
  formRef = React.createRef();

  state = {
    size: 'middle',
    locale: 'zh-cn',
    isShow: true,
    visible: false,
    visible2: false,
    items: [
      // {
      //   type: 'DIVIDER',
      //   fieldName: 'a000',
      //   label: '分隔符标题',
      //   collapse: {
      //     defaultExpand: false,
      //     showLimit: 4,
      //     remarkItems: [{ fieldName: 'f' }, { fieldName: 'j', showLabel: true }],
      //   }
      // },
      {
        type: 'INPUT',
        fieldName: 'a',
        labelWidth: 100,
        label: {
          type: 'SELECT',
          fieldName: 'aa',
          options: {
            itemList: [
              { value: '0', text: '选项1' },
              { value: '1', text: '选项2' },
            ],
          },
        },
        // rules: [{ required: true }],
        // extra: {
        //   labelWidth: 100,
        //   // isTooltip: true
        // }
      },
      {
        type: 'INPUT_NUMBER',
        fieldName: 'b',
        label: '标签2',
        tooltip: '描述信息',
        options: {
          formatter: (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          parser: (value) => value.replace(/\$\s?|(,*)/g, ''),
        },
        extra: {
          labelWidth: 100,
        },
      },
      {
        type: 'RANGE_INPUT',
        fieldName: 'c1|c2',
        label: '标签3',
      },
      {
        type: 'RANGE_INPUT_NUMBER',
        fieldName: 'd1|d2',
        label: '标签4',
      },
      {
        type: 'CHECKBOX',
        fieldName: 'e',
        label: '标签5',
        options: {
          trueValue: '1',
          falseValue: '0',
        },
      },
      {
        type: 'MULTIPLE_CHECKBOX',
        fieldName: 'f',
        label: '标签6',
        options: {
          itemList: [
            { value: '0', text: '选项1' },
            { value: '1', text: '选项2' },
          ],
        },
      },
      {
        type: 'RADIO',
        fieldName: 'g',
        label: '标签7',
        options: {
          itemList: [
            { value: '0', text: '选项1' },
            { value: '1', text: '选项2' },
          ],
        },
      },
      {
        type: 'SWITCH',
        fieldName: 'h',
        label: '标签8',
        options: {
          trueValue: '1',
          falseValue: '0',
        },
      },
      {
        type: 'TEXT_AREA',
        fieldName: 'i',
        label: '标签9',
        options: {
          showCount: true,
          maxLength: 100,
          autoSize: {
            minRows: 3,
            maxRows: 6,
          },
        },
      },
      {
        type: 'DATE',
        fieldName: 'j',
        label: '标签10',
        options: {
          dateType: 'date',
          // minDateTime: '2021-08-13',
          // maxDateTime: '2021-08-16'
        },
      },
      {
        type: 'RANGE_DATE',
        fieldName: 'k',
        label: '标签11',
        options: {
          dateType: 'date',
          // minDateTime: '2021-08-13',
          // maxDateTime: '2021-08-16'
        },
      },
      {
        type: 'TIME',
        fieldName: 'l',
        label: '标签12',
        options: {
          timeType: 'hour',
        },
      },
      {
        type: 'RANGE_TIME',
        fieldName: 'm1|m2',
        label: '标签13',
        options: {
          timeType: 'hour-minute',
        },
      },
      {
        type: 'SELECT',
        fieldName: 'n',
        label: '标签14',
        options: {
          // itemList: []
        },
        request: {
          fetchApi: getSelectData,
          params: {},
          dataKey: 'records',
          valueKey: 'value',
          textKey: 'text',
        },
      },
      {
        type: 'MULTIPLE_SELECT',
        fieldName: 'o',
        label: '标签15',
        options: {
          // itemList: []
        },
        request: {
          fetchApi: getSelectData,
          params: {},
          dataKey: 'records',
          valueKey: 'value',
          textKey: 'text',
        },
      },
      {
        type: 'IMMEDIATE',
        fieldName: 'p',
        label: '标签16',
        options: {
          columns: [
            { dataIndex: 'text', title: '姓名' },
            { dataIndex: 'value', title: '价格' },
          ],
          fieldAliasMap: () => {
            return { p: 'text', mmm: 'value' };
          },
          extraAliasMap: () => {
            return { p: 'text' };
          },
        },
        request: {
          fetchApi: getSelectData,
          params: {},
          dataKey: 'records',
        },
        extra: {
          labelWidth: 100,
        },
      },
      {
        type: 'TREE_SELECT',
        fieldName: 'q',
        label: '标签17',
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
                    { text: '铁西区', value: '330202' },
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
        type: 'MULTIPLE_TREE_SELECT',
        fieldName: 'r1|r2',
        label: '标签18',
        request: {
          fetchApi: getTreeData,
          params: {},
          dataKey: 'records',
        },
      },
      {
        type: 'CASCADER',
        fieldName: 's',
        label: '标签19',
        request: {
          fetchApi: getTreeData,
          params: {},
          dataKey: 'records',
        },
      },
      {
        type: 'CITY_SELECT',
        fieldName: 't',
        label: '标签20',
      },
      {
        type: 'REGION_SELECT',
        fieldName: 'u',
        label: '标签21',
        request: {
          fetchApi: getSelectData,
          params: {},
          dataKey: 'records',
        },
      },
      {
        type: 'UPLOAD_FILE',
        fieldName: 'v',
        label: '标签22',
        options: {
          maxCount: 2,
        },
        upload: {
          action: 'http://127.0.0.1:3000/api/design/upload',
          dataKey: '',
        },
      },
      {
        type: 'UPLOAD_IMG',
        fieldName: 'w',
        label: '标签23',
        options: {
          maxCount: 2,
        },
        upload: {
          action: 'http://127.0.0.1:3000/api/design/upload',
          dataKey: '',
        },
      },
    ],
    a: {
      aa: '1',
      bb: '2',
    },
    text: '',
    fileList: [],
  };

  clickHandle = async () => {
    // this.setState({ size: 'large', locale: 'en' });
  };

  closeHandle = () => {
    this.setState({ visible: false, visible2: false });
  };

  render() {
    const { size, locale, isShow, visible, visible2, items } = this.state;
    return (
      <QmConfigProvider size={size} locale={locale}>
        {/* <QmUploadImg action="http://127.0.0.1:3000/api/design/upload" fileList={this.state.fileList} onChange={({ fileList }) => {
          this.setState({ fileList });
        }} /> */}
        {/* <QmTinymce value={this.state.text} onChange={(content) => {
          this.setState({ text: content })
        }} /> */}
        <QmButton
          onClick={() => {
            this.setState({ a: { aa: '3' } });
            // console.log(Object.assign({}, { a: { aa: 1, bb: 2 } }, { a: { aa: 3 } }));
            // this.setState((prevState) => {
            //   prevState.items.find(x => x.fieldName === 'n').options.itemList = [
            //     { value: '2', text: '选项3' },
            //     { value: '3', text: '选项4' }
            //   ];
            //   return { items: prevState.items };
            // })
            this.formRef.current.SET_FIELDS_VALUE({
              w: [
                {
                  name: 'jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
                  url: 'http://127.0.0.1:3000/upload_2c5462ce23e56feffbd22d67647826cb.png',
                  status: 'done',
                },
              ],
            });
          }}
        >
          自定义按钮 {this.state.a.aa + '||' + this.state.a.bb}
        </QmButton>
        <QmForm
          ref={this.formRef}
          uniqueKey="jzy1"
          formType="search"
          items={items}
          initialValues={{ aa: '0' }}
          initialExtras={{ b: '描述信息描述信息' }}
          fieldsChange={(list) => {
            this.setState({ items: list });
          }}
          onFinish={(values) => {
            console.log(11, values);
          }}
        />
        <QmButton
          onClick={() => {
            this.setState((prevState) => {
              return { visible2: !prevState.visible2 };
            });
          }}
        >
          自定义按钮
        </QmButton>
        <QmModal visible={visible2} title="标题" bodyStyle={{ paddingBottom: '50px' }} onClose={this.closeHandle}>
          <div style={{ height: '1000px' }}>asdasdasd</div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '50px',
              padding: '0 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              background: '#fff',
              borderTop: '1px solid #e8e8e8',
            }}
          >
            <QmButton size="small" onClick={this.onClose} style={{ marginRight: 10 }}>
              Cancel
            </QmButton>
            <QmButton size="small" onClick={this.onClose} type="primary">
              Submit
            </QmButton>
          </div>
        </QmModal>
        <QmButton
          onClick={() => {
            this.setState((prevState) => {
              return { visible: !prevState.visible };
            });
          }}
        >
          自定义按钮
        </QmButton>
        <QmDrawer visible={visible} title="标题" bodyStyle={{ paddingBottom: '50px' }} onClose={this.closeHandle}>
          <div style={{ height: '1000px' }}>asdasdasd</div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '50px',
              padding: '0 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              background: '#fff',
              borderTop: '1px solid #e8e8e8',
            }}
          >
            <QmButton size="small" onClick={this.onClose} style={{ marginRight: 10 }}>
              Cancel
            </QmButton>
            <QmButton size="small" onClick={this.onClose} type="primary">
              Submit
            </QmButton>
          </div>
        </QmDrawer>
        <QmTabs
          defaultActiveKey="1"
          onChange={(key) => {
            console.log(11, key);
          }}
        >
          <QmTabs.TabPane tab="Tab 1" key="1">
            Content of Tab Pane 1
          </QmTabs.TabPane>
          <QmTabs.TabPane tab="Tab 2" key="2">
            Content of Tab Pane 2
          </QmTabs.TabPane>
          <QmTabs.TabPane tab="Tab 3" key="3">
            Content of Tab Pane 3
          </QmTabs.TabPane>
        </QmTabs>
        <QmAnchor
          style={{ height: '200px' }}
          labelList={[
            { id: 'div1', label: '标题1' },
            { id: 'div2', label: '标题2' },
          ]}
        >
          <div id="div1" style={{ height: '300px' }}>
            111
          </div>
          <div id="div2" style={{ height: '300px' }}>
            222
          </div>
        </QmAnchor>
        <QmButton
          onClick={() => {
            this.setState((prevState) => {
              return { isShow: !prevState.isShow };
            });
          }}
        >
          自定义按钮
        </QmButton>
        <QmAnchor style={{ height: '200px' }}>
          <QmAnchor.Item label="标题1" showDivider>
            <div style={{ height: '300px' }}>111</div>
          </QmAnchor.Item>
          {this.state.isShow ? (
            <QmAnchor.Item label="标题2" showDivider>
              <div style={{ height: '300px' }}>222</div>
            </QmAnchor.Item>
          ) : null}
          <QmAnchor.Item label="标题3" showDivider>
            <div style={{ height: '300px' }}>333</div>
          </QmAnchor.Item>
          <div>hello</div>
          123
          {/* asd */}
          <>asd</>
        </QmAnchor>
        <QmDownload />
        {/* <QmSpin>
          <div style={{height: '100px'}}>容器</div>
        </QmSpin> */}
        <QmEmpty />
        <QmCountup start={0} end={1000} />
        <QmDivider label="hello"></QmDivider>
        <QmSpace>
          <QmButton confirm={{}} click={this.clickHandle}>
            自定义按钮
          </QmButton>
          <QmButton confirm={{}} click={this.clickHandle}>
            自定义按钮
          </QmButton>
        </QmSpace>
        <QmSplit split="vertical" defaultSize={200} minSize={100} maxSize={600} style={{ height: '200px' }}>
          <QmSplit.Pane className="a">11111</QmSplit.Pane>
          <QmSplit.Pane className="b">22222</QmSplit.Pane>
        </QmSplit>
      </QmConfigProvider>
    );
  }
}

export default App;
