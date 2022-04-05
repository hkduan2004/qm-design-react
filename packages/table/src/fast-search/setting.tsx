/*
 * @Author: 焦质晔
 * @Date: 2022-01-06 10:58:43
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 21:04:46
 */
import React from 'react';
import omit from 'omit.js';
import classNames from 'classnames';
import localforage from 'localforage';
import { omitBy } from 'lodash-es';
import ConfigContext from '../../../config-provider/context';
import TableContext from '../context';
import { t } from '../../../locale';
import { warn } from '../../../_utils/error';
import { getCellValue, createUidKey, deepGetRowkey, getAllTableData } from '../utils';
import { isEmpty } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { SizeHeight } from '../../../_utils/types';
import { DEFAULT_DISTANCE } from '../table/types';
import config from '../config';
import useUpdateEffect from '../../../hooks/useUpdateEffect';

import type { IColumn, IRecord, IRowKey } from '../table/types';

import { QmButton, QmTabs, QmForm, QmFormItem, QmEmpty, Modal, Checkbox, Input } from '../../../index';
import { CloseCircleOutlined } from '@ant-design/icons';

type ISettingProps = {
  onClose: () => void;
};

type IMatchConfig = {
  case: number;
  fullchar: number;
};

type IFilters = Record<string, any>;

type IFastConfig = {
  text: string;
  value: string;
  list: {
    filters: IFilters;
    config: IMatchConfig;
  };
};

const isDate = (value: any) => {
  if (typeof value !== 'string') {
    return false;
  }
  return /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?$/.test(value as string);
};

const Setting: React.FC<ISettingProps> = (props) => {
  const { onClose } = props;

  const { global } = React.useContext(ConfigContext)!;
  const {
    tableProps,
    tableRef,
    getRowKey,
    $size,
    flattenColumns,
    pagination,
    setPagination,
    scrollYToRecord,
    setHighlightKey,
    setShouldToTop,
    isTreeTable,
    isWebPagination,
  } = React.useContext(TableContext)!;
  const { uniqueKey } = tableProps;

  const form1Ref = React.useRef<QmForm>(null);
  const form2Ref = React.useRef<QmForm>(null);
  const records = React.useRef<IRecord[]>([]);
  const curRowKey = React.useRef<IRowKey>('');
  const curIndex = React.useRef<number>(-1);
  const searchState = React.useRef<string>('stop'); // 状态变量

  useUpdateEffect(() => {
    const { current, pageSize } = pagination;
    const pageData = tableRef.current.tableFullData.slice((current - 1) * pageSize, current * pageSize);
    const v = getAllTableData(pageData).findIndex((x) => getRowKey(x, x.index) === curRowKey.current);
    scrollYToRecord('', v);
  }, [pagination.current]);

  const jumpToByRowkey = (rowKey: IRowKey, index: number) => {
    curRowKey.current = rowKey;
    if (isWebPagination) {
      const { pageSize } = pagination;
      const pageNumber: number = Math.ceil((index + 1) / pageSize);
      setShouldToTop(false);
      setPagination(Object.assign({}, pagination, { current: pageNumber }));
    } else {
      scrollYToRecord(rowKey);
    }
  };

  const geFormItemType = (type: string) => {
    let __type__: QmFormItem['type'];
    switch (type) {
      case 'text':
      case 'textarea':
        __type__ = 'INPUT';
        break;
      case 'number':
        __type__ = 'INPUT_NUMBER';
        break;
      case 'date':
        __type__ = 'DATE';
        break;
      case 'checkbox':
      case 'radio':
        __type__ = 'SELECT';
        break;
      default:
        __type__ = 'INPUT';
        break;
    }
    return __type__;
  };

  const createFormList = (columns: IColumn[]): QmFormItem[] => {
    return columns
      .filter((x) => x?.dataIndex)
      .map((x) => {
        return {
          type: geFormItemType(x.filter!.type),
          fieldName: x.dataIndex,
          label: x.title,
          tooltip: x.description,
          options: {
            dateType: 'exactdate',
            itemList: x.dictItems ?? [],
          },
          onChange: async () => {
            const [_1, data1] = await form1Ref.current!.GET_FORM_DATA();
            const [_2, data2] = await form2Ref.current!.GET_FORM_DATA();
            const data = omitBy(Object.assign({}, data1, data2), isEmpty);
            setFilters(data);
          },
        };
      });
  };

  const initMatchConfig: IMatchConfig = { case: 0, fullchar: 0 };

  const columns = React.useMemo<IColumn[]>(() => {
    return flattenColumns
      .filter((column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex))
      .filter((column) => column.filter);
  }, [flattenColumns]);

  const [filters, setFilters] = React.useState<IFilters>({});
  const [matchConfig, SetMatchConfig] = React.useState<IMatchConfig>(initMatchConfig);
  const [form1Items] = React.useState(createFormList([columns[0]]));
  const [form2Items] = React.useState(createFormList(columns.slice(1)));
  const [total, setTotal] = React.useState<number>(0);
  const isDisabled = React.useMemo(() => !Object.keys(filters).length, [filters]);

  useUpdateEffect(() => {
    searchState.current = 'ready';
  }, [filters, matchConfig]);

  const toggleChecked = (value: Partial<Record<keyof IMatchConfig, boolean>>) => {
    SetMatchConfig(Object.assign({}, matchConfig, value));
  };

  const filterHandle = (condition: IFilters) => {
    const { allTableData } = tableRef.current;
    const results: IRecord[] = [];

    for (let i = 0, len = allTableData.length; i < len; i++) {
      const row = allTableData[i];
      // 假设匹配上了
      let isPass = true;
      for (const key in condition) {
        const { type } = columns.find((x) => x.dataIndex === key)!.filter!;
        let val = getCellValue(row, key);
        let bool = true;
        if (type === 'text' || type === 'textarea') {
          const regExp = new RegExp(!matchConfig.fullchar ? condition[key] : `^${condition[key]}$`, !matchConfig.case ? 'i' : '');
          bool = regExp.test(val);
        } else {
          val = isDate(val) ? val.slice(0, 10) : val;
          bool = val == condition[key];
        }
        // 没有匹配上
        if (!bool) {
          isPass = false;
          break;
        }
      }
      if (isPass) {
        results.push(row);
      }
    }

    return results;
  };

  const confirmHandle = (msg: string, onOk: () => void, onCancel: () => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      Modal.confirm({
        title: t('qm.button.confirmPrompt'),
        content: msg,
        onOk: () => {
          onOk();
          resolve();
        },
        onCancel: () => {
          onCancel();
          resolve();
        },
      });
    });
  };

  const doSearch = async (type: string) => {
    if (!Object.keys(filters).length) {
      return Modal.warning({
        title: t('qm.button.confirmPrompt'),
        content: t('qm.table.fastSearch.queryCondition'),
      });
    }
    if (searchState.current === 'ready') {
      searchState.current = 'stop';
      records.current = filterHandle(filters);
      setTotal(records.current.length);
    }
    if (!records.current.length) {
      setHighlightKey('');
      return Modal.warning({
        title: t('qm.button.confirmPrompt'),
        content: t('qm.table.fastSearch.notMatch'),
      });
    }
    // 处理索引
    if (type === 'next') {
      curIndex.current = curIndex.current < 0 ? 0 : curIndex.current + 1;
      if (curIndex.current > records.current.length - 1) {
        await confirmHandle(
          t('qm.table.fastSearch.toTheEnd'),
          () => (curIndex.current = 0),
          () => (curIndex.current = records.current.length - 1)
        );
      }
    }
    if (type === 'prev') {
      curIndex.current = curIndex.current < 0 ? records.current.length - 1 : curIndex.current - 1;
      if (curIndex.current < 0) {
        await confirmHandle(
          t('qm.table.fastSearch.toStart'),
          () => (curIndex.current = records.current.length - 1),
          () => (curIndex.current = 0)
        );
      }
    }
    // 处理索引 END
    const result = records.current[curIndex.current];
    const rowKey = getRowKey(result, result.index);
    let firstLevelIndex = result.index;
    if (isTreeTable && isWebPagination) {
      const rk = deepGetRowkey(tableRef.current.deriveRowKeys, rowKey)![0];
      firstLevelIndex = tableRef.current.tableFullData.findIndex((x) => getRowKey(x, x.index) === rk);
    }
    jumpToByRowkey(rowKey, firstLevelIndex);
    setHighlightKey(rowKey);
  };

  const clearFilters = () => {
    form1Ref.current!.RESET_FORM();
    form2Ref.current!.RESET_FORM();
  };

  // ======================================================

  const fastSearchKey = React.useMemo(() => {
    return uniqueKey ? `fastSearch_${uniqueKey}` : '';
  }, [uniqueKey]);

  const [savedItems, setSavedItems] = React.useState<IFastConfig[]>([]);

  const [inputName, setInputName] = React.useState<string>('');

  const [currentKey, setCurrentKey] = React.useState<string>('');

  useUpdateEffect(() => {
    if (currentKey) {
      const { filters, config } = savedItems.find((x) => x.value === currentKey)!.list;
      form1Ref.current!.SET_FIELDS_VALUE(
        omit(
          filters,
          form2Items.map((x) => x.fieldName)
        )
      );
      form2Ref.current!.SET_FIELDS_VALUE(
        omit(
          filters,
          form1Items.map((x) => x.fieldName)
        )
      );
      setFilters(filters);
      SetMatchConfig(config);
    } else {
      clearFilters();
      setFilters({});
      SetMatchConfig(initMatchConfig);
    }
  }, [currentKey]);

  React.useEffect(() => {
    createFastSearchConfig();
  }, []);

  const createFastSearchConfig = async () => {
    if (!fastSearchKey) return;
    let res = await localforage.getItem(fastSearchKey);
    if (!res) {
      res = await getFastSearchConfig(fastSearchKey);
      if (Array.isArray(res)) {
        await localforage.setItem(fastSearchKey, res);
      }
    }
    if (Array.isArray(res) && res.length) {
      setSavedItems(res);
      setCurrentKey(res[0].value);
    }
  };

  const toggleHandle = (key: string) => {
    setCurrentKey(key !== currentKey ? key : '');
  };

  const getFastSearchConfig = async (key: string) => {
    const fetchFn = global?.['getComponentConfigApi'];
    if (!fetchFn) return;
    try {
      const res = await fetchFn({ key });
      if (res.code === 200) {
        return res.data;
      }
    } catch (err) {
      // ...
    }
  };

  const saveFastSearchConfig = async (key: string, value: unknown) => {
    const fetchFn = global?.['saveComponentConfigApi'];
    if (!fetchFn) return;
    try {
      await fetchFn({ [key]: value });
    } catch (err) {
      // ...
    }
  };

  const saveConfigHandle = async () => {
    if (!fastSearchKey) {
      return warn('Table', '必须设置组件参数 `uniqueKey` 才能保存');
    }
    const uuid = createUidKey();
    const _savedItems = [
      ...savedItems,
      {
        text: inputName,
        value: uuid,
        list: {
          filters,
          config: matchConfig,
        },
      },
    ];
    setSavedItems(_savedItems);
    setCurrentKey(uuid);
    setInputName('');
    await localforage.setItem(fastSearchKey, _savedItems);
    await saveFastSearchConfig(fastSearchKey, _savedItems);
  };

  const removeSavedHandle = async (key: string) => {
    if (!key) return;
    const _savedItems = savedItems.filter((x) => x.value !== key);
    setSavedItems(_savedItems);
    if (key === currentKey) {
      setCurrentKey('');
    }
    await localforage.setItem(fastSearchKey, _savedItems);
    await saveFastSearchConfig(fastSearchKey, _savedItems);
  };

  // ======================================================

  const prefixCls = getPrefixCls('table');

  return (
    <div className={`${prefixCls}-fast-search__setting`}>
      <div className={`main`}>
        <div className={`top`}>
          <div className={`container`}>
            <QmTabs defaultActiveKey="1" size="small" tabBarExtraContent={<span>{t('qm.table.alert.total', { total })}</span>}>
              <QmTabs.TabPane tab={t('qm.table.fastSearch.tabPanes.0')} key="1" forceRender>
                <QmForm ref={form1Ref} items={form1Items} cols={1} labelWidth={110} />
              </QmTabs.TabPane>
              <QmTabs.TabPane tab={t('qm.table.fastSearch.tabPanes.1')} key="2" forceRender>
                <QmForm ref={form2Ref} items={form2Items} cols={1} labelWidth={110} />
              </QmTabs.TabPane>
            </QmTabs>
          </div>
          <div className={`saved line`}>
            <div className={`form-wrap`}>
              <Input
                size={$size}
                value={inputName}
                placeholder={t('qm.table.highSearch.configText')}
                disabled={isDisabled}
                onChange={(ev) => {
                  const { value } = ev.target;
                  setInputName(value);
                }}
              />
              <QmButton type="primary" disabled={!inputName || isDisabled} style={{ marginLeft: '10px' }} onClick={() => saveConfigHandle()}>
                {t('qm.table.highSearch.saveButton')}
              </QmButton>
            </div>
            <div className={`card-wrap`}>
              <h5 style={{ height: `${config.rowHeightMaps[$size]}px` }}>
                <span>{t('qm.table.fastSearch.savedSetting')}</span>
              </h5>
              <ul>
                {savedItems.map((x) => (
                  <li key={x.value} className={classNames({ selected: x.value === currentKey })} title={x.text} onClick={() => toggleHandle(x.value)}>
                    <span className={`title`}>{x.text}</span>
                    <i
                      className={`svgicon close`}
                      title={t('qm.table.highSearch.removeText')}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        removeSavedHandle(x.value);
                      }}
                    >
                      <CloseCircleOutlined />
                    </i>
                  </li>
                ))}
                {!savedItems.length && (
                  <div style={{ padding: DEFAULT_DISTANCE }}>
                    <QmEmpty />
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className={`bottom`}>
          <div>
            <Checkbox checked={!!matchConfig.case} onChange={(ev) => toggleChecked({ case: ev.target.checked })}>
              {t('qm.table.fastSearch.matchCase')}
            </Checkbox>
            <Checkbox checked={!!matchConfig.fullchar} onChange={(ev) => toggleChecked({ fullchar: ev.target.checked })}>
              {t('qm.table.fastSearch.matchFullchar')}
            </Checkbox>
          </div>
          <div>
            <QmButton onClick={() => clearFilters()}>{t('qm.table.fastSearch.clear')}</QmButton>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          right: 0,
          height: `${SizeHeight[$size] + 20}px`,
          zIndex: 9,
          borderTop: '1px solid #d9d9d9',
          padding: '10px 15px',
          background: '#fff',
          textAlign: 'right',
          boxSizing: 'border-box',
        }}
      >
        <QmButton onClick={() => onClose()} style={{ marginRight: 8 }}>
          {t('qm.table.fastSearch.closeButton')}
        </QmButton>
        <QmButton type="primary" style={{ marginRight: 8 }} onClick={() => doSearch('prev')}>
          {t('qm.table.fastSearch.queryPrev')}
        </QmButton>
        <QmButton type="primary" onClick={() => doSearch('next')}>
          {t('qm.table.fastSearch.queryNext')}
        </QmButton>
      </div>
    </div>
  );
};

export default Setting;
