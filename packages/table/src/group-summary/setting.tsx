/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 14:21:04
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-16 20:47:01
 */
import React from 'react';
import classNames from 'classnames';
import localforage from 'localforage';
import ConfigContext from '../../../config-provider/context';
import TableContext from '../context';
import { createUidKey } from '../utils';
import { t } from '../../../locale';
import { warn } from '../../../_utils/error';
import { getPrefixCls } from '../../../_utils/prefix';
import { DEFAULT_DISTANCE } from '../table/types';
import useUpdateEffect from '../../../hooks/useUpdateEffect';
import config from '../config';

import type { TableRef, IColumn, IRecord } from '../table/types';
import type { IDict } from '../../../_utils/types';

import Table from '../table';
import Result from './result';
import { QmButton, QmModal, QmEmpty } from '../../../index';
import { Input } from '../../../antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';

type ISettingProps = {
  onClose: () => void;
};

const Setting: React.FC<ISettingProps> = (props) => {
  const { onClose } = props;
  const { global } = React.useContext(ConfigContext)!;
  const { tableProps, $size, flattenColumns } = React.useContext(TableContext)!;
  const { uniqueKey } = tableProps;

  const groupTableRef = React.useRef<TableRef>(null);
  const summaryTableRef = React.useRef<TableRef>(null);

  const [visible, setVisible] = React.useState<boolean>(false);

  const [savedItems, setSavedItems] = React.useState<IRecord[]>([]);

  const [inputName, setInputName] = React.useState<string>('');

  const [currentKey, setCurrentKey] = React.useState<string>('');

  useUpdateEffect(() => {
    if (currentKey) {
      const { group, summary } = savedItems.find((x) => x.value === currentKey)!.list;
      setGroupList(group);
      setSummaryList(summary);
    } else {
      setGroupList([]);
      setSummaryList([]);
    }
  }, [currentKey]);

  React.useEffect(() => {
    createGroupSummaryConfig();
  }, []);

  const groupSummaryKey = React.useMemo(() => {
    return uniqueKey ? `summary_${uniqueKey}` : '';
  }, [uniqueKey]);

  const flatColumns = React.useMemo(() => {
    return flattenColumns.filter(
      (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
    );
  }, [flattenColumns]);

  // 分组项 字典
  const groupItems: IDict[] = flatColumns.filter((x) => !x.groupSummary).map((x) => ({ text: x.title, value: x.dataIndex }));

  // 汇总列 字典
  const summaryItems: IDict[] = [
    config.groupSummary.total,
    ...flatColumns.filter((x) => !!x.groupSummary).map((x) => ({ text: x.title, value: x.dataIndex })),
  ];

  // 计算公式 字典
  const formulaItems: IDict[] = [
    { text: t('qm.table.groupSummary.sumText'), value: 'sum' },
    { text: t('qm.table.groupSummary.maxText'), value: 'max' },
    { text: t('qm.table.groupSummary.minText'), value: 'min' },
    { text: t('qm.table.groupSummary.avgText'), value: 'avg' },
    { text: t('qm.table.groupSummary.countText'), value: 'count' },
  ];

  const createGroupColumns = (): IColumn[] => {
    return [
      {
        title: t('qm.table.groupSummary.operation'),
        dataIndex: '__action__',
        fixed: 'left',
        width: 80,
        render: (text, row) => {
          return (
            <div>
              <QmButton
                type="text"
                onClick={() => {
                  groupTableRef.current!.REMOVE_RECORDS(row);
                }}
              >
                {t('qm.table.groupSummary.removeText')}
              </QmButton>
            </div>
          );
        },
      },
      {
        dataIndex: 'group',
        title: t('qm.table.groupSummary.groupItem'),
        width: 200,
        editRender: (row) => {
          return {
            type: 'select',
            editable: true,
            items: groupItems.map((x) => ({
              ...x,
              disabled: groupList.findIndex((k) => k.group === x.value) > -1,
            })),
          };
        },
      },
    ];
  };

  const createSummaryColumns = (): IColumn[] => {
    return [
      {
        title: t('qm.table.groupSummary.operation'),
        dataIndex: '__action__',
        fixed: 'left',
        width: 80,
        render: (text, row) => {
          return (
            <div>
              <QmButton
                type="text"
                onClick={() => {
                  summaryTableRef.current!.REMOVE_RECORDS(row);
                }}
              >
                {t('qm.table.groupSummary.removeText')}
              </QmButton>
            </div>
          );
        },
      },
      {
        dataIndex: 'summary',
        title: t('qm.table.groupSummary.summaryColumn'),
        width: 200,
        editRender: (row) => {
          return {
            type: 'select',
            editable: true,
            items: summaryItems.map((x) => ({
              ...x,
              disabled: summaryList.findIndex((k) => k.summary === x.value) > -1,
            })),
            onChange: (cell) => {
              row[`formula`] = '';
            },
          };
        },
      },
      {
        dataIndex: 'formula',
        title: t('qm.table.groupSummary.calcFormula'),
        width: 150,
        editRender: (row) => {
          return {
            type: 'select',
            editable: true,
            items: row.summary === config.groupSummary.total.value ? formulaItems.slice(formulaItems.length - 1) : formulaItems,
          };
        },
      },
    ];
  };

  const [groupList, setGroupList] = React.useState<IRecord[]>([]);
  const [groupColumns, setGroupColumns] = React.useState<IColumn[]>(createGroupColumns());

  const [summaryList, setSummaryList] = React.useState<IRecord[]>([]);
  const [summaryColumns, setSummaryColumns] = React.useState<IColumn[]>(createSummaryColumns());

  const confirmDisabled = React.useMemo(() => {
    const isGroup = groupList.length && groupList.every((x) => Object.values(x).every((k) => k !== ''));
    const isSummary = summaryList.length && summaryList.every((x) => Object.values(x).every((k) => k !== ''));
    return !(isGroup && isSummary);
  }, [groupList, summaryList]);

  const toggleHandle = (key: string) => {
    setCurrentKey(key !== currentKey ? key : '');
  };

  const createGroupSummaryConfig = async () => {
    if (!groupSummaryKey) return;
    let res = await localforage.getItem(groupSummaryKey);
    if (!res) {
      res = await getGroupSummaryConfig(groupSummaryKey);
      if (Array.isArray(res)) {
        await localforage.setItem(groupSummaryKey, res);
      }
    }
    if (Array.isArray(res) && res.length) {
      setSavedItems(res);
      setCurrentKey(res[0].value);
    }
  };

  const saveConfigHandle = async () => {
    if (!groupSummaryKey) {
      return warn('Table', '必须设置组件参数 `uniqueKey` 才能保存');
    }
    const uuid = createUidKey();
    const _savedItems = [
      ...savedItems,
      {
        text: inputName,
        value: uuid,
        list: {
          group: groupList.filter((x) => !!x.group),
          summary: summaryList.filter((x) => !!x.summary),
        },
      },
    ];
    setSavedItems(_savedItems);
    setCurrentKey(uuid);
    setInputName('');
    await localforage.setItem(groupSummaryKey, _savedItems);
    await saveGroupSummaryConfig(groupSummaryKey, _savedItems);
  };

  const removeSavedHandle = async (key: string) => {
    if (!key) return;
    const _savedItems = savedItems.filter((x) => x.value !== key);
    setSavedItems(_savedItems);
    if (key === currentKey) {
      setCurrentKey('');
    }
    await localforage.setItem(groupSummaryKey, _savedItems);
    await saveGroupSummaryConfig(groupSummaryKey, _savedItems);
  };

  const getGroupSummaryConfig = async (key: string) => {
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

  const saveGroupSummaryConfig = async (key: string, value: unknown) => {
    const fetchFn = global?.['saveComponentConfigApi'];
    if (!fetchFn) return;
    try {
      await fetchFn({ [key]: value });
    } catch (err) {
      // ...
    }
  };

  const prefixCls = getPrefixCls('table');

  const wrapProps = {
    visible,
    title: t('qm.table.groupSummary.resultText'),
    loading: false,
    onClose: () => setVisible(false),
  };

  return (
    <div className={`${prefixCls}-group-summary__setting`}>
      <div className={`main`}>
        <div style={{ width: '30%' }}>
          <Table
            ref={groupTableRef}
            size={$size}
            columns={groupColumns}
            dataSource={groupList}
            rowKey={(record) => record.index}
            height={350}
            showFastSearch={false}
            showFullScreen={false}
            showColumnDefine={false}
            columnsChange={(columns) => setGroupColumns(columns)}
            onDataChange={(data) => {
              setGroupList(data);
            }}
          >
            <QmButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                groupTableRef.current!.INSERT_RECORDS({});
              }}
              style={{ marginRight: 0 }}
            />
          </Table>
        </div>
        <div className={`container line`}>
          <Table
            ref={summaryTableRef}
            size={$size}
            columns={summaryColumns}
            dataSource={summaryList}
            rowKey={(record) => record.index}
            height={350}
            showFastSearch={false}
            showFullScreen={false}
            showColumnDefine={false}
            columnsChange={(columns) => setSummaryColumns(columns)}
            onDataChange={(data) => {
              setSummaryList(data);
            }}
          >
            <QmButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                summaryTableRef.current!.INSERT_RECORDS({});
              }}
              style={{ marginRight: 0 }}
            />
          </Table>
        </div>
        <div className={`saved line`}>
          <div className={`form-wrap`}>
            <Input
              size={$size}
              value={inputName}
              placeholder={t('qm.table.groupSummary.configText')}
              disabled={confirmDisabled}
              onChange={(ev) => {
                const { value } = ev.target;
                setInputName(value);
              }}
            />
            <QmButton type="primary" disabled={!inputName || confirmDisabled} style={{ marginLeft: '10px' }} onClick={() => saveConfigHandle()}>
              {t('qm.table.groupSummary.saveButton')}
            </QmButton>
          </div>
          <div className={`card-wrap`}>
            <h5 style={{ height: `${config.rowHeightMaps[$size]}px` }}>
              <span>{t('qm.table.groupSummary.savedSetting')}</span>
            </h5>
            <ul>
              {savedItems.map((x) => (
                <li key={x.value} className={classNames({ selected: x.value === currentKey })} title={x.text} onClick={() => toggleHandle(x.value)}>
                  <span className={`title`}>{x.text}</span>
                  <i
                    className={`svgicon close`}
                    title={t('qm.table.groupSummary.removeText')}
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
      <QmModal {...wrapProps}>
        <Result columns={flatColumns} group={groupList} summary={summaryList} />
      </QmModal>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 9,
          borderTop: '1px solid #d9d9d9',
          padding: '10px 15px',
          background: '#fff',
          textAlign: 'right',
        }}
      >
        <QmButton onClick={() => onClose()} style={{ marginRight: 8 }}>
          {t('qm.table.groupSummary.closeButton')}
        </QmButton>
        <QmButton type="primary" disabled={confirmDisabled} onClick={() => setVisible(true)}>
          {t('qm.table.groupSummary.confirmButton')}
        </QmButton>
      </div>
    </div>
  );
};

export default Setting;
