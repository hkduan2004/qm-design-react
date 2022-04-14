/*
 * @Author: 焦质晔
 * @Date: 2022-01-11 17:57:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-27 13:01:39
 */
import React from 'react';
import { get, merge } from 'lodash-es';
import ConfigContext from '../../config-provider/context';
import { t } from '../../locale';
import { warn } from '../../_utils/error';
import { debounce, trueNoop } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { deepMapList } from '../../form/src/utils';
import { SizeHeight } from '../../_utils/types';
import useResizeObserve from '../../hooks/useResizeObserve';
import useUpdateEffect from '../../hooks/useUpdateEffect';

import type { IFormItem, IFormData } from '../../form/src/types';
import type { IFetch, IColumn, IRowKey, IRecord } from '../../table/src/table/types';
import type { ComponentSize, Nullable } from '../../_utils/types';

import { QmSplit, QmForm, QmTable, QmButton, Tree, Input } from '../../index';

type IProps = {
  size?: ComponentSize;
  uniqueKey?: string;
  initialValue?: IFormData;
  multiple?: boolean;
  filters?: IFormItem[];
  table?: {
    fetch?: IFetch;
    columns?: IColumn[];
    rowKey?: ((row: IRecord, index: number) => IRowKey) | IRowKey;
    webPagination?: boolean;
  };
  tree?: {
    fetch?: IFetch & { valueKey?: string; textKey?: string };
    tableParamsMap?: (() => Record<string, string>) | Record<string, string>;
  };
  onClose: (data: IRecord | null) => void;
};

export type QmTreeTableHelperProps = IProps;

// ===========================
const getParentKey = (key: string, tree: IRecord[]) => {
  let parentKey: string | undefined;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.value === key)) {
        parentKey = node.value;
      } else {
        const pk = getParentKey(key, node.children);
        pk && (parentKey = pk);
      }
    }
  }
  return parentKey;
};
const getAllParentKey = (tree: IRecord[]) => {
  const result: string[] = [];
  tree.forEach((x) => {
    if (x.children) {
      result.push(...getAllParentKey(x.children));
    }
    if (x.children) {
      result.push(x.value);
    }
  });
  return result;
};
const deepFind = (arr: IRecord[], fn: (node: IRecord) => boolean): Nullable<IRecord> => {
  let res: Nullable<IRecord> = null;
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i].children)) {
      res = deepFind(arr[i].children, fn);
    }
    if (res) {
      return res;
    }
    if (fn(arr[i])) {
      return arr[i];
    }
  }
  return res;
};
const treeFilter = (tree: IRecord[], fn: (node: IRecord) => boolean) => {
  // 使用map复制一下节点，避免修改到原树
  return tree
    .map((node) => ({ ...node }))
    .filter((node) => {
      node.children = node.children && treeFilter(node.children, fn);
      return fn(node) || (node.children && node.children.length);
    });
};
// ===========================

const TreeTableHelper: React.FC<IProps> = (props) => {
  const { uniqueKey, multiple, initialValue, filters = [], table, tree, onClose } = props;
  const { size } = React.useContext(ConfigContext)!;
  const $size = React.useMemo(() => props.size ?? size ?? '', [props.size, size]);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const currentPage = React.useRef<number>(1);
  const tableSize = useResizeObserve(wrapperRef);

  const createColumns = (): IColumn[] => {
    return [
      {
        title: t('qm.searchHelper.orderIndex'),
        dataIndex: 'pageIndex',
        width: 80,
        render: (text: number) => {
          return <span>{text + 1}</span>;
        },
      },
      ...(table?.columns ?? []),
    ];
  };

  const [record, setRecord] = React.useState<IRecord | IRecord[]>();
  const [rowKeys, setRowKeys] = React.useState<IRowKey[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [tableHeight, setTableHeight] = React.useState<number>(300);
  const [formItems, setFormItems] = React.useState<IFormItem[]>(filters);
  const [columns, setColumns] = React.useState<IColumn[]>(createColumns());
  const [fetchParams, setFetchParams] = React.useState<IFetch['params']>(merge({}, table?.fetch?.params, initialValue));
  const [tableList, setTableList] = React.useState<IRecord[]>([]);

  const calcTableHeight = () => {
    const $outer = wrapperRef.current!.parentNode as HTMLElement;
    const $former = $outer.querySelector('.form-wrap') as HTMLElement;
    setTableHeight($outer.offsetHeight - $former.offsetHeight - SizeHeight[$size] * 2 - (SizeHeight[$size] + 20) - 10 * 4);
  };

  const resizeObserveHandler = debounce(calcTableHeight, 5);

  useUpdateEffect(() => {
    resizeObserveHandler();
  }, [tableSize.width]);

  // ===========================================================

  const filterChangeHandle = (val: IFormData) => {
    setFetchParams(Object.assign({}, fetchParams, val));
  };

  const getTableData = async () => {
    if (!table?.webPagination || !table?.fetch?.api) return;
    const { api: fetchApi, dataKey, beforeFetch = trueNoop } = table.fetch;
    if (!beforeFetch(fetchParams!)) return;
    // console.log(`ajax 请求参数：`, this.fetch.params);
    setLoading(true);
    try {
      const res = await fetchApi(fetchParams);
      if (res.code === 200) {
        const items = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        setTableList(items);
      }
    } catch (err) {
      // ...
    }
    setLoading(false);
  };

  const rowEnterHandler = (record: IRecord) => {
    if (multiple) return;
    setRecord(record);
    onClose(record);
  };

  React.useEffect(() => {
    getTableData();
  }, [fetchParams]);

  // =========================================
  const [treeData, setTreeData] = React.useState<IRecord[]>([]);
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
  const treeDataOrigin = React.useRef<IRecord[]>(treeData);
  const responseList = React.useRef<IRecord[]>([]);

  const getTreeData = async () => {
    if (!tree?.fetch) return;
    const { api: fetchApi, params, dataKey, valueKey = 'value', textKey = 'text' } = tree.fetch;
    try {
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !dataKey ? res.data : get(res.data, dataKey, []);
        const results = deepMapList(dataList, valueKey, textKey);
        setTreeData(results);
        treeDataOrigin.current = results;
        responseList.current = dataList;
      }
    } catch (err) {
      // ...
    }
  };

  const doTableFetch = (row: IRecord) => {
    if (!tree?.tableParamsMap) {
      return warn('QmTreeTableHelper', '需要配置 `tree.tableParamsMap` 选项');
    }
    const alias = typeof tree.tableParamsMap === 'function' ? tree.tableParamsMap() : tree.tableParamsMap;
    // 请求参数
    const params: Record<string, any> = {};
    for (const key in alias) {
      params[key] = get(row, alias[key]);
    }
    setFetchParams(Object.assign({}, fetchParams, params));
  };

  useUpdateEffect(() => {
    setExpandedKeys(getAllParentKey(treeData));
  }, [treeData]);

  React.useEffect(() => {
    getTreeData();
  }, []);

  const expandHandle = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
  };

  const changeHandle = (value: string) => {
    const results = treeFilter(treeDataOrigin.current, (node) => {
      if (!value) return true;
      return node.text.indexOf(value) !== -1;
    });
    setTreeData(results);
  };

  const prefixCls = getPrefixCls('tree-table');

  const tableProps = !table?.webPagination
    ? {
        fetch: {
          ...table?.fetch,
          params: fetchParams,
        } as IFetch,
      }
    : {
        dataSource: tableList,
        loading,
        webPagination: true,
        onChange: (pagination, _, __, ___, { currentDataSource }) => {
          if (multiple) return;
          if (pagination.current !== currentPage.current) {
            currentPage.current = pagination.current;
            currentDataSource.length && setRowKeys([currentDataSource[0].pageIndex]);
          }
        },
      };

  return (
    <div ref={wrapperRef} className={`${prefixCls}--wrapper`}>
      <QmSplit defaultValue={200} style={{ height: '100%' }}>
        <QmSplit.Pane min={100} style={{ overflowY: 'auto' }}>
          <Input.Search style={{ marginBottom: 8 }} placeholder={t('qm.form.inputPlaceholder')} onChange={(ev) => changeHandle(ev.target.value)} />
          <Tree
            fieldNames={{ title: 'text', key: 'value', children: 'children' }}
            defaultExpandAll
            expandedKeys={expandedKeys}
            treeData={treeData}
            onExpand={expandHandle}
            onSelect={(selectedKeys: string[]) => {
              if (!tree?.fetch) return;
              const { valueKey = 'value' } = tree.fetch;
              const row = deepFind(responseList.current, (node) => get(node, valueKey) === selectedKeys[0]);
              if (!row) return;
              doTableFetch(row);
            }}
          />
        </QmSplit.Pane>
        <QmSplit.Pane className={`split-pane`}>
          <div className={`form-wrap`}>
            <QmForm
              items={formItems}
              initialValues={initialValue}
              uniqueKey={uniqueKey ? `helper_${uniqueKey}` : uniqueKey}
              formType="search"
              isAutoFocus={false}
              fieldsChange={(items) => setFormItems(items)}
              onCollapse={() => calcTableHeight()}
              onFinish={(values) => filterChangeHandle(values)}
            />
          </div>
          <div>
            <QmTable
              height={tableHeight}
              columns={columns}
              rowKey={'pageIndex'}
              {...tableProps}
              rowSelection={{
                type: !multiple ? 'radio' : 'checkbox',
                clearableAfterFetched: !multiple,
                selectedRowKeys: rowKeys,
                onChange: (_, rows) => {
                  setRecord(!multiple ? rows[0] : rows);
                },
              }}
              columnsChange={(columns) => setColumns(columns)}
              onRowDblclick={rowEnterHandler}
              onRowEnter={rowEnterHandler}
              onDataLoad={(list) => {
                if (multiple) return;
                list.length && setRowKeys([list[0].pageIndex]);
              }}
            />
          </div>
        </QmSplit.Pane>
      </QmSplit>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 9,
          height: `${SizeHeight[$size] + 20}px`,
          borderTop: '1px solid #d9d9d9',
          padding: '10px 15px',
          background: '#fff',
          textAlign: 'right',
          boxSizing: 'border-box',
        }}
      >
        <QmButton onClick={() => onClose(null)} style={{ marginRight: 8 }}>
          {t('qm.dialog.close')}
        </QmButton>
        <QmButton type="primary" disabled={!record} onClick={() => onClose(record!)}>
          {t('qm.dialog.confirm')}
        </QmButton>
      </div>
    </div>
  );
};

TreeTableHelper.displayName = 'TreeTableHelper';

export default TreeTableHelper;
