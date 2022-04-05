/*
 * @Author: 焦质晔
 * @Date: 2022-01-06 10:58:43
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-17 13:50:14
 */
import React from 'react';
import omit from 'omit.js';
import classNames from 'classnames';
import localforage from 'localforage';
import ConfigContext from '../../../config-provider/context';
import TableContext from '../context';
import { isBracketBalance } from '../filter-sql';
import { createUidKey, createWhereSQL } from '../utils';
import { t } from '../../../locale';
import { warn } from '../../../_utils/error';
import { getPrefixCls } from '../../../_utils/prefix';
import { DEFAULT_DISTANCE } from '../table/types';
import useUpdateEffect from '../../../hooks/useUpdateEffect';
import config from '../config';

import Table from '../table';
import { QmButton, QmEmpty } from '../../../index';
import { Input } from '../../../antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';

import type { TableRef, IColumn, IEditerType, IFilterType, ISuperFilter } from '../table/types';
import type { IDict } from '../../../_utils/types';

type IResultProps = {
  onClose: () => void;
};

type ISuperConfig = {
  text: string;
  value: string;
  list: ISuperFilter[];
};

const Result: React.FC<IResultProps> = (props) => {
  const { onClose } = props;
  const { global } = React.useContext(ConfigContext)!;
  const { tableProps, $size, flattenColumns, setSuperFilters, clearTableFilter } = React.useContext(TableContext)!;
  const { uniqueKey } = tableProps;

  const superTableRef = React.useRef<TableRef>(null);

  const [tableData, setTableData] = React.useState<ISuperFilter[]>([]);

  const [savedItems, setSavedItems] = React.useState<ISuperConfig[]>([]);

  const [inputName, setInputName] = React.useState<string>('');

  const [currentKey, setCurrentKey] = React.useState<string>('');

  useUpdateEffect(() => {
    currentKey ? setTableData(savedItems.find((x) => x.value === currentKey)!.list) : setTableData([]);
  }, [currentKey]);

  React.useEffect(() => {
    createSuperSearchConfig();
  }, []);

  const highSearchKey = React.useMemo(() => {
    return uniqueKey ? `superSearch_${uniqueKey}` : '';
  }, [uniqueKey]);

  const filterColumns = React.useMemo(() => {
    return flattenColumns.filter((column) => !!column.filter);
  }, [flattenColumns]);

  const query = createWhereSQL(tableData);

  const confirmDisabled = React.useMemo(() => {
    return !(query && isBracketBalance(query));
  }, [query]);

  const logicDicts: IDict[] = [
    { value: 'and', text: t('qm.table.highSearch.andText') },
    { value: 'or', text: t('qm.table.highSearch.orText') },
  ];
  const fieldDicts: IDict[] = flattenColumns.filter((column) => !!column.filter).map((x) => ({ value: x.dataIndex, text: x.title }));

  const isMultipleSelect = (type: string) => {
    return ['in', 'nin'].includes(type);
  };

  const getConditionType = (type?: IFilterType, isMultiple?: boolean) => {
    let __type__: IEditerType;
    switch (type) {
      case 'number':
        __type__ = 'number';
        break;
      case 'date':
        __type__ = 'date';
        break;
      case 'checkbox':
      case 'radio':
        __type__ = isMultiple ? 'select-multiple' : 'select';
        break;
      case 'text':
      default:
        __type__ = 'text';
        break;
    }
    return __type__;
  };

  const getExpressionHandle = (type?: IFilterType) => {
    let result: IDict[] = [];
    switch (type) {
      case 'date':
      case 'number':
        result = [
          { value: '>', text: t('qm.table.highSearch.gtText') },
          { value: '<', text: t('qm.table.highSearch.ltText') },
          { value: '>=', text: t('qm.table.highSearch.gteText') },
          { value: '<=', text: t('qm.table.highSearch.lteText') },
          { value: '==', text: t('qm.table.highSearch.eqText') },
          { value: '!=', text: t('qm.table.highSearch.neqText') },
        ];
        break;
      case 'checkbox':
      case 'radio':
        result = [
          { value: 'in', text: t('qm.table.highSearch.inText') },
          { value: 'nin', text: t('qm.table.highSearch.ninText') },
          { value: '==', text: t('qm.table.highSearch.eqText') },
          { value: '!=', text: t('qm.table.highSearch.neqText') },
        ];
        break;
      case 'text':
      default:
        result = [
          { value: 'like', text: t('qm.table.highSearch.likeText') },
          { value: '==', text: t('qm.table.highSearch.eqText') },
          { value: '!=', text: t('qm.table.highSearch.neqText') },
        ];
        break;
    }
    return result;
  };

  const createColumns = (): IColumn[] => {
    return [
      {
        title: t('qm.table.highSearch.operation'),
        dataIndex: '__action__',
        fixed: 'left',
        width: 80,
        render: (text, row) => {
          return (
            <div>
              <QmButton
                type="text"
                onClick={() => {
                  superTableRef.current!.REMOVE_RECORDS(row);
                }}
              >
                {t('qm.table.highSearch.removeText')}
              </QmButton>
            </div>
          );
        },
      },
      {
        title: t('qm.table.highSearch.bracket'),
        dataIndex: 'bracketLeft',
        align: 'right',
        width: 80,
        render: (text, row) => {
          return <span style={{ fontSize: '20px' }}>{text}</span>;
        },
      },
      {
        title: t('qm.table.highSearch.fieldName'),
        dataIndex: 'fieldName',
        required: true,
        editRender: (row) => {
          return {
            type: 'select',
            editable: true,
            items: fieldDicts,
            rules: [{ required: true, message: t('qm.table.highSearch.noEmpty') }],
            onChange: (cell) => {
              const dataIndex = Object.values(cell)[0];
              const filterType = filterColumns.find((x) => x.dataIndex === dataIndex)?.filter!.type;
              const expressionItems = getExpressionHandle(filterType);
              // 重置 字段类型
              row[`fieldType`] = filterType;
              // 重置 运算
              row[`expression`] = dataIndex ? expressionItems[0]?.value : '';
              // 重置 条件值
              row[`condition`] = isMultipleSelect(row[`expression`]) ? [] : '';
              // 重置 括号
              if (!dataIndex) {
                row[`bracketLeft`] = row[`bracketRight`] = '';
              }
            },
          };
        },
      },
      {
        title: t('qm.table.highSearch.fieldType'),
        dataIndex: 'fieldType',
        width: 100,
        hidden: true,
      },
      {
        title: t('qm.table.highSearch.expression'),
        dataIndex: 'expression',
        width: 120,
        required: true,
        editRender: (row) => {
          const filterType = filterColumns.find((x) => x.dataIndex === row[`fieldName`])?.filter!.type;
          return {
            type: 'select',
            editable: true,
            items: getExpressionHandle(filterType),
            extra: {
              disabled: !row[`fieldName`],
              clearable: false,
            },
            onChange: () => {
              // 重置 条件值
              row[`condition`] = isMultipleSelect(row[`expression`]) ? [] : '';
            },
          };
        },
      },
      {
        title: t('qm.table.highSearch.condition'),
        dataIndex: 'condition',
        width: 160,
        editRender: (row) => {
          const column = filterColumns.find((x) => x.dataIndex === row[`fieldName`]);
          const filterType = column?.filter!.type;
          const dictItems = column?.filter?.items ?? column?.dictItems ?? [];
          return {
            type: getConditionType(filterType, isMultipleSelect(row[`expression`])),
            editable: true,
            items: dictItems,
            extra: {
              disabled: !row[`fieldName`],
            },
          };
        },
      },
      {
        title: t('qm.table.highSearch.bracket'),
        dataIndex: 'bracketRight',
        width: 80,
        render: (text, row) => {
          return <span style={{ fontSize: '20px' }}>{text}</span>;
        },
      },
      {
        title: t('qm.table.highSearch.logic'),
        dataIndex: 'logic',
        width: 100,
        required: true,
        editRender: (row) => {
          return {
            type: 'select',
            editable: true,
            items: logicDicts,
            extra: {
              disabled: !row[`fieldName`],
              clearable: false,
            },
          };
        },
      },
    ];
  };

  const [columns, setColumns] = React.useState<IColumn[]>(createColumns());

  const toggleBracket = (row: ISuperFilter, column: IColumn) => {
    const { dataIndex } = column;
    if (!row[`fieldName`] || !['bracketLeft', 'bracketRight'].includes(dataIndex)) return;
    if (dataIndex === 'bracketLeft') {
      row[dataIndex] = !row[dataIndex] ? '(' : '';
    }
    if (dataIndex === 'bracketRight') {
      row[dataIndex] = !row[dataIndex] ? ')' : '';
    }
    // 重要
    setTableData([...tableData]);
  };

  const toggleHandle = (key: string) => {
    setCurrentKey(key !== currentKey ? key : '');
  };

  const createSuperFilters = () => {
    return tableData.map((x) => omit(x, ['index', 'pageIndex'] as any)) as ISuperFilter[];
  };

  const confirmHandle = () => {
    clearTableFilter();
    setSuperFilters(createSuperFilters());
    onClose();
  };

  const createSuperSearchConfig = async () => {
    if (!highSearchKey) return;
    let res = await localforage.getItem(highSearchKey);
    if (!res) {
      res = await getHighSearchConfig(highSearchKey);
      if (Array.isArray(res)) {
        await localforage.setItem(highSearchKey, res);
      }
    }
    if (Array.isArray(res) && res.length) {
      setSavedItems(res);
      setCurrentKey(res[0].value);
    }
  };

  const saveConfigHandle = async () => {
    if (!highSearchKey) {
      return warn('Table', '必须设置组件参数 `uniqueKey` 才能保存');
    }
    const uuid = createUidKey();
    const _savedItems = [...savedItems, { text: inputName, value: uuid, list: tableData.filter((x) => !!x.fieldName) }];
    setSavedItems(_savedItems);
    setCurrentKey(uuid);
    setInputName('');
    await localforage.setItem(highSearchKey, _savedItems);
    await saveHighSearchConfig(highSearchKey, _savedItems);
  };

  const removeSavedHandle = async (key: string) => {
    if (!key) return;
    const _savedItems = savedItems.filter((x) => x.value !== key);
    setSavedItems(_savedItems);
    if (key === currentKey) {
      setCurrentKey('');
    }
    await localforage.setItem(highSearchKey, _savedItems);
    await saveHighSearchConfig(highSearchKey, _savedItems);
  };

  const getHighSearchConfig = async (key: string) => {
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

  const saveHighSearchConfig = async (key: string, value: unknown) => {
    const fetchFn = global?.['saveComponentConfigApi'];
    if (!fetchFn) return;
    try {
      await fetchFn({ [key]: value });
    } catch (err) {
      // ...
    }
  };

  const prefixCls = getPrefixCls('table');

  return (
    <div className={`${prefixCls}-super-search__setting`}>
      <div className={`main`}>
        <div className={`container`}>
          <Table
            ref={superTableRef}
            size={$size}
            columns={columns}
            dataSource={tableData}
            rowKey={(record) => record.index}
            height={350}
            showFastSearch={false}
            showFullScreen={false}
            showColumnDefine={false}
            columnsChange={(columns) => setColumns(columns)}
            onRowClick={toggleBracket}
            onDataChange={(data) => {
              setTableData(data as unknown as ISuperFilter[]);
            }}
          >
            <QmButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                superTableRef.current!.INSERT_RECORDS({ bracketLeft: '', bracketRight: '', logic: 'and' });
              }}
              style={{ marginRight: 0 }}
            />
          </Table>
          {config.highSearch.showSQL && query && <code className={`lang-js`}>{query}</code>}
        </div>
        <div className={`saved line`}>
          <div className={`form-wrap`}>
            <Input
              size={$size}
              value={inputName}
              placeholder={t('qm.table.highSearch.configText')}
              disabled={confirmDisabled}
              onChange={(ev) => {
                const { value } = ev.target;
                setInputName(value);
              }}
            />
            <QmButton type="primary" disabled={!inputName || confirmDisabled} style={{ marginLeft: '10px' }} onClick={() => saveConfigHandle()}>
              {t('qm.table.highSearch.saveButton')}
            </QmButton>
          </div>
          <div className={`card-wrap`}>
            <h5 style={{ height: `${config.rowHeightMaps[$size]}px` }}>
              <span>{t('qm.table.highSearch.savedSetting')}</span>
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
          {t('qm.table.highSearch.closeButton')}
        </QmButton>
        <QmButton type="primary" disabled={confirmDisabled} onClick={() => confirmHandle()}>
          {t('qm.table.highSearch.searchButton')}
        </QmButton>
      </div>
    </div>
  );
};

export default Result;
