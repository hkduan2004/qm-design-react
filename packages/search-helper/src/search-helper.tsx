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
import { debounce, sleep, trueNoop } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { SizeHeight } from '../../_utils/types';
import useResizeObserve from '../../hooks/useResizeObserve';
import useUpdateEffect from '../../hooks/useUpdateEffect';

import type { IFormItem, IFormData } from '../../form/src/types';
import type { TableRef, IFetch, IFetchFn, IColumn, IRowKey, IRecord } from '../../table/src/table/types';
import type { ComponentSize } from '../../_utils/types';

import { QmForm, QmTable, QmButton } from '../../index';

type ITableConfig = {
  fetch?: IFetch;
  columns?: IColumn[];
  rowKey?: ((row: IRecord, index: number) => IRowKey) | IRowKey;
  webPagination?: boolean;
};

type IProps = {
  size?: ComponentSize;
  uniqueKey?: string;
  initialValue?: IFormData;
  defaultSelectedKeys?: IRowKey[];
  selectionRows?: IRecord[];
  multiple?: boolean;
  filters?: IFormItem[];
  table?: ITableConfig;
  name?: string;
  getServerConfig?: IFetchFn;
  createTableFetch?: (url: string) => IFetchFn;
  onClose: (data: IRecord | null, keys?: IRowKey[]) => void;
};

export type QmSearchHelperProps = IProps;

const SearchHelper: React.FC<IProps> = (props) => {
  const {
    uniqueKey,
    multiple,
    initialValue,
    selectionRows,
    defaultSelectedKeys = [],
    filters = [],
    table = {},
    name,
    getServerConfig,
    createTableFetch,
    onClose,
  } = props;
  const { size } = React.useContext(ConfigContext)!;
  const $size = React.useMemo(() => props.size ?? size ?? '', [props.size, size]);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<TableRef>(null);
  const tableSize = useResizeObserve(wrapperRef);

  const createColumns = (columns?: IColumn[]): IColumn[] => {
    return [
      {
        title: t('qm.searchHelper.orderIndex'),
        dataIndex: 'pageIndex',
        width: 80,
        render: (text: number) => {
          return <span>{text + 1}</span>;
        },
      },
      ...(!columns ? table.columns || [] : columns),
    ];
  };

  const [tableConf, setTableConf] = React.useState<ITableConfig>(table);
  const [record, setRecord] = React.useState<IRecord | IRecord[]>();
  const [rowKeys, setRowKeys] = React.useState<IRowKey[]>(defaultSelectedKeys);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [tableHeight, setTableHeight] = React.useState<number>(300);
  const [formItems, setFormItems] = React.useState<IFormItem[]>(filters);
  const [columns, setColumns] = React.useState<IColumn[]>(createColumns());
  const [fetchParams, setFetchParams] = React.useState<IFetch['params']>(merge({}, table.fetch?.params, initialValue));
  const [tableList, setTableList] = React.useState<IRecord[]>([]);

  const calcTableHeight = () => {
    const $outer = wrapperRef.current!.parentNode!.children[0] as HTMLElement;
    const $former = $outer.querySelector('.form-wrap') as HTMLElement;
    setTableHeight($outer.offsetHeight - $former.offsetHeight - SizeHeight[$size] * 2 - 10 * 3);
  };

  const resizeObserveHandler = debounce(calcTableHeight, 5);

  useUpdateEffect(() => {
    resizeObserveHandler();
  }, [tableSize.width]);

  React.useEffect(() => {
    getTableData();
  }, [fetchParams]);

  React.useEffect(() => {
    selectionRows && tableRef.current!.SET_SELECTION_ROWS(selectionRows);
  }, [selectionRows]);

  React.useEffect(() => {
    getHelperConfig();
  }, []);

  // ===========================================================

  const getHelperConfig = async () => {
    if (!name) return;
    if (!getServerConfig || !createTableFetch) {
      return warn('searchHelper', '从服务端获取配置信息的时候，`getServerConfig` 和 `createTableFetch` 为必选参数');
    }
    try {
      const res = await getServerConfig({ searchHelperId: name });
      if (res.code === 200) {
        const { filters = [], columns = [], rowKey, webPagination, fetchUrl, fetchParams = {} } = res.data || {};
        // 设置 formItems、columns
        setFormItems(filters);
        setColumns(createColumns(columns));
        setTableConf({
          fetch: {
            api: createTableFetch(fetchUrl),
            dataKey: 'records',
          },
          rowKey: rowKey || tableConf.rowKey,
          webPagination: webPagination || tableConf.webPagination || false,
        });
        filterChangeHandle(fetchParams);
      }
    } catch (e) {
      // ...
    }
  };

  const getTableData = async () => {
    const { webPagination, fetch } = tableConf;
    if (!webPagination || !fetch?.api) return;
    const { api: fetchApi, dataKey, beforeFetch = trueNoop } = fetch;
    if (!beforeFetch(fetchParams!)) return;
    // console.log(`ajax 请求参数：`, this.fetch.params);
    setLoading(true);
    try {
      const res = await fetchApi(fetchParams);
      if (res.code === 200) {
        const items = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        setRowKeys([]);
        await sleep(0);
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

  const filterChangeHandle = (val: IFormData) => {
    setFetchParams(Object.assign({}, fetchParams, val));
  };

  const prefixCls = getPrefixCls('search-helper');

  const tableProps = !tableConf.webPagination
    ? {
        fetch: {
          ...tableConf.fetch,
          params: fetchParams,
        } as IFetch,
      }
    : {
        dataSource: tableList,
        loading,
        webPagination: true,
      };

  return (
    <div ref={wrapperRef} className={`${prefixCls}--wrapper`}>
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
          ref={tableRef}
          height={tableHeight}
          columns={columns}
          rowKey={tableConf.rowKey || 'pageIndex'}
          {...tableProps}
          rowSelection={{
            type: !multiple ? 'radio' : 'checkbox',
            clearableAfterFetched: !multiple,
            selectFirstRowOnChange: true,
            selectedRowKeys: rowKeys,
            onChange: (keys, rows) => {
              setRowKeys(keys);
              setRecord(!multiple ? rows[0] : rows);
            },
          }}
          columnsChange={(columns) => setColumns(columns)}
          onRowDblclick={rowEnterHandler}
          onRowEnter={rowEnterHandler}
        />
      </div>
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
        <QmButton type="primary" disabled={!record} onClick={() => onClose(record!, multiple ? rowKeys : undefined)}>
          {t('qm.dialog.confirm')}
        </QmButton>
      </div>
    </div>
  );
};

SearchHelper.displayName = 'SearchHelper';

export default SearchHelper;
