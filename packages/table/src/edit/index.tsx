/*
 * @Author: 焦质晔
 * @Date: 2022-01-01 13:30:19
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-29 11:13:16
 */
import React from 'react';
import classNames from 'classnames';
import { merge, get, uniqBy, isEqual } from 'lodash-es';
import TableContext from '../context';
import { formatDate, getCellValue, getDate, setCellValue } from '../utils';
import { t } from '../../../locale';
import { warn } from '../../../_utils/error';
import { isObject, nextTick, trueNoop } from '../../../_utils/util';
import { SizeHeight } from '../../../_utils/types';
import { DATE_FORMAT, DATE_TIME_FORMAT, DEFAULT_FALSE_VALUE, DEFAULT_TRUE_VALUE, TIME_FORMAT } from '../table/types';
import useForceUpdate from '../../../hooks/useForceUpdate';

import type { IColumn, IRecord, IRowKey, IEditerReturn } from '../table/types';
import type { IDict } from '../../../_utils/types';

import { QmModal, QmSearchHelper, QmTreeHelper, Button } from '../../../index';
import { Input, Select, DatePicker, TimePicker, Checkbox, Switch } from '../../../antd';
import { SearchOutlined } from '@ant-design/icons';
import InputNumber from './InputNumber';

const { Search } = Input;

type ICellEditProps = {
  column: IColumn;
  record: IRecord;
  rowKey: IRowKey;
  columnKey: string;
  clicked: [IRowKey, string] | [];
  text: string | number;
};

const CellEdit: React.FC<ICellEditProps> = (props) => {
  const { column, record, rowKey, columnKey, clicked, text } = props;
  const { tableRef, tableBodyRef, $size, flattenColumns, doFieldValidate, dataChange } = React.useContext(TableContext)!;

  const editCellRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<any>(null);
  const numberRef = React.useRef<any>(null);
  const searchHelpeRef = React.useRef<any>(null);
  const isChange = React.useRef<boolean>(false);
  const _records = React.useRef<IRecord[]>([]);
  const deriveParams = React.useRef<Record<string, unknown>>({});

  const forceUpdate = useForceUpdate();
  const store = tableRef.current.store;
  const options = column.editRender?.(record, column) as IEditerReturn;

  const [visible, setVisible] = React.useState<boolean>(false);
  const [matching, setMatching] = React.useState<boolean>(false);
  const [shItemList, setShItemList] = React.useState<IDict[]>(options.items || []);

  const editable = (options.editable || isEqual(clicked, [rowKey, columnKey])) && !options.disabled;

  const dataKey = `${rowKey}|${columnKey}`;

  const currentKey = clicked.length === 2 ? `${clicked[0]}|${clicked[1]}` : '';

  const passValidate = ![...store.state.required, ...store.state.validate].some(({ x, y }) => x === rowKey && y === columnKey);

  const requiredText = store.state.required.find(({ x, y }) => x === rowKey && y === columnKey)?.text || '';

  const validateText = store.state.validate.find(({ x, y }) => x === rowKey && y === columnKey)?.text || '';

  const isEditing = editable || !passValidate || visible || matching;

  React.useEffect(() => {
    if (isEditing && currentKey === dataKey) {
      nextTick(() => createFocus());
    }
  }, [currentKey]);

  // ===========================================

  const setVisibleEffect = (visible: boolean, cb?: () => void) => {
    setVisible(visible);
    cb?.();
  };

  const setRecords = (records: IRecord[]) => {
    _records.current = records;
  };

  const createFocus = () => {
    const { type } = options;
    switch (type) {
      case 'text':
        textRef.current?.focus();
        break;
      case 'number':
        numberRef.current?.focus();
        break;
      case 'search-helper':
        searchHelpeRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const createElementClick = (el: HTMLElement) => {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  };

  const handle = {
    text: (row: IRecord, column: IColumn) => {
      const { dataIndex } = column;
      const { type, extra = {}, rules = [], onInput, onChange, onEnter } = options;
      const prevValue = getCellValue(row, dataIndex);
      return (
        <Input
          ref={textRef}
          size={$size}
          value={prevValue}
          maxLength={extra.maxLength}
          showCount={extra.showCount}
          placeholder={t('qm.table.editable.inputPlaceholder')}
          readOnly={extra.readOnly}
          disabled={extra.disabled}
          suffix={extra.suffix}
          onChange={(ev) => {
            const val = ev.target.value ?? '';
            setCellValue(row, dataIndex, val);
            onInput?.({ [dataKey]: val });
            isChange.current = true;
            forceUpdate();
          }}
          onBlur={(ev) => {
            const val = ev.target.value ?? '';
            if (!isChange.current) return;
            isChange.current = false;
            doFieldValidate(rules, val, rowKey, columnKey);
            store.addToUpdated(row);
            onChange?.({ [dataKey]: val }, row);
            dataChange();
          }}
          onKeyUp={(ev: any) => {
            if (ev.keyCode === 13) {
              const val = ev.target.value ?? '';
              onEnter?.({ [dataKey]: val }, row);
            }
          }}
        />
      );
    },
    number: (row: IRecord, column: IColumn) => {
      const { dataIndex, precision } = column;
      const { type, extra = {}, rules = [], onInput, onChange, onEnter } = options;
      const prevValue = getCellValue(row, dataIndex);
      return (
        <InputNumber
          ref={numberRef}
          size={$size}
          value={prevValue}
          min={extra.min}
          max={extra.max}
          precision={precision}
          placeholder={t('qm.table.editable.inputPlaceholder')}
          maxLength={extra.maxLength}
          readOnly={extra.readOnly}
          disabled={extra.disabled}
          onChange={(val) => {
            setCellValue(row, dataIndex, val);
            onInput?.({ [dataKey]: val });
            isChange.current = true;
            forceUpdate();
          }}
          onBlur={(val) => {
            if (!isChange.current) return;
            isChange.current = false;
            setCellValue(row, dataIndex, val);
            doFieldValidate(rules, val, rowKey, columnKey);
            store.addToUpdated(row);
            onChange?.({ [dataKey]: val }, row);
            dataChange();
          }}
          onEnter={(val) => {
            onEnter?.({ [dataKey]: val }, row);
          }}
        />
      );
    },
    select: (row: IRecord, column: IColumn, isMultiple?: boolean) => {
      const { dataIndex, dictItems = [] } = column;
      const { type, extra = {}, rules = [], items, onChange, onEnter } = options;
      const itemList = items || dictItems;
      const prevValue = getCellValue(row, dataIndex);
      let valueTemp = prevValue;
      return (
        <Select
          mode={isMultiple ? 'multiple' : undefined}
          size={$size}
          dropdownClassName={`table-editable__popper`}
          value={prevValue || undefined}
          placeholder={t('qm.table.editable.selectPlaceholder')}
          allowClear={extra.allowClear}
          maxTagCount={extra.collapseTags ? 'responsive' : undefined}
          disabled={extra.disabled}
          style={{ width: '100%' }}
          onChange={(val) => {
            setCellValue(row, dataIndex, val);
            doFieldValidate(rules, val, rowKey, columnKey);
            store.addToUpdated(row);
            forceUpdate();
            onChange?.({ [dataKey]: val }, row);
            dataChange();
          }}
          onSelect={(val) => {
            valueTemp = val;
          }}
          onInputKeyDown={(ev) => {
            if (ev.keyCode === 13) {
              nextTick(() => onEnter?.({ [dataKey]: valueTemp }, row));
            }
          }}
        >
          {itemList.map((x) => (
            <Select.Option key={x.value} value={x.value} disabled={x.disabled}>
              {x.text}
            </Select.Option>
          ))}
        </Select>
      );
    },
    [`select-multiple`]: (row: IRecord, column: IColumn) => {
      return handle.select(row, column, !0);
    },
    date: (row: IRecord, column: IColumn, isDateTime?: boolean) => {
      const { dataIndex } = column;
      const { type, extra = {}, rules = [], onChange } = options;
      const format = isDateTime ? DATE_TIME_FORMAT : DATE_FORMAT;
      const prevValue = getCellValue(row, dataIndex);
      const disabledDate = (current) => {
        const { minDateTime, maxDateTime } = extra;
        if (minDateTime && maxDateTime) {
          return current.isBefore(minDateTime, 'day') || current.isAfter(maxDateTime, 'day');
        }
        if (minDateTime) {
          return current.isBefore(minDateTime, 'day');
        }
        if (maxDateTime) {
          return current.isAfter(maxDateTime, 'day');
        }
        return false;
      };
      return (
        <DatePicker
          showTime={isDateTime}
          size={$size}
          dropdownClassName={`table-editable__popper`}
          value={getDate(prevValue, format) ?? undefined}
          format={format}
          disabledDate={disabledDate}
          placeholder={!isDateTime ? t('qm.table.editable.datePlaceholder') : t('qm.table.editable.datetimePlaceholder')}
          allowClear={extra.allowClear}
          disabled={extra.disabled}
          style={{ width: '100%' }}
          onChange={(date) => {
            const val = formatDate(date, format);
            setCellValue(row, dataIndex, val);
            doFieldValidate(rules, val, rowKey, columnKey);
            store.addToUpdated(row);
            forceUpdate();
            onChange?.({ [dataKey]: val }, row);
            dataChange();
          }}
        />
      );
    },
    datetime: (row: IRecord, column: IColumn) => {
      return handle.date(row, column, !0);
    },
    time: (row: IRecord, column: IColumn) => {
      const { dataIndex } = column;
      const { type, extra = {}, rules = [], onChange } = options;
      const prevValue = getCellValue(row, dataIndex);
      return (
        <TimePicker
          size={$size}
          dropdownClassName={`table-editable__popper`}
          value={getDate(prevValue, TIME_FORMAT) ?? undefined}
          format={TIME_FORMAT}
          placeholder={t('qm.table.editable.datetimePlaceholder')}
          allowClear={extra.allowClear}
          disabled={extra.disabled}
          style={{ width: '100%' }}
          onChange={(time) => {
            const val = formatDate(time, TIME_FORMAT);
            setCellValue(row, dataIndex, val);
            doFieldValidate(rules, val, rowKey, columnKey);
            store.addToUpdated(row);
            forceUpdate();
            onChange?.({ [dataKey]: val }, row);
            dataChange();
          }}
        />
      );
    },
    checkbox: (row: IRecord, column: IColumn) => {
      const { dataIndex } = column;
      const { type, extra = {}, onChange } = options;
      const { trueValue = DEFAULT_TRUE_VALUE, falseValue = DEFAULT_FALSE_VALUE, disabled } = extra;
      const prevValue = getCellValue(row, dataIndex);
      return (
        <Checkbox
          checked={prevValue === trueValue}
          disabled={disabled}
          onChange={(ev) => {
            const val = ev.target.checked ? trueValue : falseValue;
            setCellValue(row, dataIndex, val);
            store.addToUpdated(row);
            forceUpdate();
            onChange?.({ [dataKey]: val }, row);
            dataChange();
          }}
        />
      );
    },
    switch: (row: IRecord, column: IColumn) => {
      const { dataIndex } = column;
      const { type, extra = {}, onChange } = options;
      const { trueValue = DEFAULT_TRUE_VALUE, falseValue = DEFAULT_FALSE_VALUE, disabled } = extra;
      const prevValue = getCellValue(row, dataIndex);
      return (
        <Switch
          checked={prevValue === trueValue}
          disabled={disabled}
          onChange={(checked) => {
            const val = checked ? trueValue : falseValue;
            setCellValue(row, dataIndex, val);
            store.addToUpdated(row);
            forceUpdate();
            onChange?.({ [dataKey]: val }, row);
            dataChange();
          }}
        />
      );
    },
    [`search-helper`]: (row: IRecord, column: IColumn) => {
      const { dataIndex, precision } = column;
      const { type, extra = {}, rules = [], helper = {}, onInput, onChange, onEnter } = options;
      const prevValue = getCellValue(row, dataIndex);

      const fieldAliasMap = helper.fieldAliasMap;
      if (!fieldAliasMap) {
        warn('Table', 'helper 需要配置 `fieldAliasMap` 选项');
      }
      const alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap || {};
      if (!Object.keys(alias).includes(dataIndex)) {
        warn('Table', 'fieldAliasMap 选项必须包含自身 `dataIndex` 值');
      }

      const createFilters = (val: string) => {
        const { filterAliasMap } = helper;
        const filterAlias = typeof filterAliasMap === 'function' ? filterAliasMap() : filterAliasMap ?? [];
        const inputParams: Record<string, unknown> = { [dataIndex]: val };
        filterAlias.forEach((x) => (inputParams[x] = val));
        return inputParams;
      };

      const getHelperData = (val: string): Promise<IRecord[]> => {
        const { table, initialValue = {} } = helper;
        const { beforeFetch = trueNoop } = table!.fetch!;
        setMatching(true);
        return new Promise(async (resolve, reject) => {
          const params: any = merge(
            {},
            table!.fetch!.params,
            {
              ...initialValue,
              ...createFilters(val),
            },
            {
              currentPage: 1,
              pageSize: 500,
            }
          );
          try {
            if (!beforeFetch(params)) {
              reject();
            } else {
              const res = await table!.fetch!.api(params);
              if (res.code === 200) {
                const list = Array.isArray(res.data) ? res.data : get(res.data, table!.fetch!.dataKey!) ?? [];
                resolve(list);
              } else {
                reject();
              }
            }
          } catch (err) {
            reject();
          }
          setMatching(false);
        });
      };

      const todoOpen = (val: string) => {
        deriveParams.current = createFilters(val);
        setVisible(true);
      };

      const openHelperPanel = (val: string, cb?: () => void) => {
        const { beforeOpen } = helper;
        // 打开的前置钩子
        const open = beforeOpen ?? trueNoop;
        const before = open({ [dataKey]: prevValue }, row, column);
        if ((before as Promise<void>)?.then) {
          (before as Promise<void>)
            .then(() => {
              todoOpen(val);
              cb?.();
            })
            .catch(() => {});
        } else if (before !== false) {
          todoOpen(val);
          cb?.();
        }
      };

      const closeHelperHandle = (data: Record<string, any>) => {
        // 其他字段的集合
        const others: Record<string, unknown> = {};
        for (const key in alias) {
          const dataKey = alias[key];
          if (key === dataIndex) continue;
          others[key] = data[dataKey];
        }
        const current = alias[dataIndex] ? data[alias[dataIndex]] : '';
        setHelperValues(current, others);
        const { closed } = helper;
        setVisibleEffect(false, () => createElementClick(editCellRef.current!));
        closed?.(data);
      };

      // 关闭但是没选择数据
      const closeButNotSelect = () => {
        if (isChange.current) {
          !helper.closeRemoteMatch ? setHelperValues('') : setHelperValues(prevValue);
        }
        isChange.current = false;
        setVisibleEffect(false, () => createElementClick(editCellRef.current!));
      };

      const resetHelperValue = (list: IRecord[] = [], val: string) => {
        const records = list.filter((data) => {
          return getCellValue(data, alias[dataIndex]).toString().includes(val);
        });
        if (records.length === 1) {
          return closeHelperHandle(records[0]);
        }
        openHelperPanel(val);
      };

      const setHelperValues = (val = '', others?: any) => {
        // 对其他单元格赋值 & 校验
        if (isObject(others) && Object.keys(others).length) {
          for (const otherDataIndex in others) {
            const otherValue = others[otherDataIndex];
            const otherColumn = flattenColumns.find((column) => column.dataIndex === otherDataIndex);
            if (otherColumn) {
              setCellValue(row, otherDataIndex, otherValue, otherColumn.precision);
              const otherOptions = otherColumn.editRender?.(row, otherColumn);
              if (otherOptions && Array.isArray(otherOptions.rules)) {
                doFieldValidate(otherOptions.rules, otherValue, rowKey, otherDataIndex);
              }
            } else {
              setCellValue(row, otherDataIndex, otherValue);
            }
          }
          // 更新父组件，更新其他单元格值
          tableBodyRef.current!.forceUpdate();
        }
        // 修改当前单元格的值
        setCellValue(row, dataIndex, val, precision);
        doFieldValidate(rules, val, rowKey, columnKey);
        store.addToUpdated(row);
        onChange?.({ [dataKey]: val }, row);
        dataChange();
        // 更新状态变量
        deriveParams.current = {};
        isChange.current = false;
      };

      const dialogProps = {
        visible,
        title: t('qm.searchHelper.text'),
        width: helper.width ?? '60%',
        loading: false,
        bodyStyle: { paddingBottom: `${SizeHeight[$size] + 20}px` },
        onClose: () => {
          closeButNotSelect();
        },
      };

      const helperProps = {
        ...helper,
        size: $size,
        initialValue: merge({}, helper.initialValue, deriveParams.current),
        onClose: (data) => {
          if (data) {
            closeHelperHandle(data);
          } else {
            closeButNotSelect();
          }
        },
      };

      return (
        <>
          <Search
            ref={searchHelpeRef}
            value={prevValue}
            placeholder={t('qm.table.editable.selectPlaceholder')}
            allowClear={extra.allowClear}
            readOnly={extra.readOnly}
            disabled={extra.disabled}
            onBlur={(ev) => {
              const { value } = ev.target;
              if (!isChange.current || visible) return;
              if (value && !helper.closeRemoteMatch && helper.table?.fetch?.api) {
                return getHelperData(value)
                  .then((list) => resetHelperValue(list, value))
                  .catch(() => setHelperValues(''));
              }
              setHelperValues(value);
            }}
            onChange={(ev) => {
              const { value } = ev.target;
              setCellValue(row, dataIndex, value);
              onInput?.({ [dataKey]: value });
              isChange.current = true;
              forceUpdate();
            }}
            onKeyUp={(ev: any) => {
              if (ev.keyCode === 13) {
                const val = ev.target.value ?? '';
                onEnter?.({ [dataKey]: val }, row);
              }
            }}
            onDoubleClick={(ev) => {
              const { value } = ev.target as HTMLInputElement;
              openHelperPanel(value);
            }}
            onSearch={(value, ev) => {
              if (ev?.type !== 'click') return;
              // 放大镜
              if ((ev.target as HTMLElement).tagName !== 'INPUT') {
                openHelperPanel(value);
              } else {
                setHelperValues('');
              }
            }}
          />
          <QmModal {...dialogProps}>
            <QmSearchHelper {...helperProps} />
          </QmModal>
        </>
      );
    },
    [`search-helper-multiple`]: (row: IRecord, column: IColumn) => {
      const { dataIndex } = column;
      const { type, items = [], extra = {}, rules = [], helper = {}, onInput, onChange, onEnter } = options;
      const prevValue = getCellValue(row, dataIndex);

      const fieldAliasMap = helper.fieldAliasMap;
      if (!fieldAliasMap) {
        warn('Table', 'helper 需要配置 `fieldAliasMap` 选项');
      }
      const alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap || {};
      if (!(Object.keys(alias).includes('valueKey') && Object.keys(alias).includes('textKey'))) {
        warn('QmForm', 'fieldAliasMap 选项必须包含自身 `valueKey` 和  `textKey`');
      }

      // 打开搜索帮助面板
      const openSearchHelper = (cb?: () => void) => {
        const { beforeOpen } = helper;
        // 打开的前置钩子
        const open = beforeOpen ?? trueNoop;
        const before = open({ [dataKey]: prevValue }, row, column);
        if ((before as Promise<void>)?.then) {
          (before as Promise<void>)
            .then(() => {
              setVisible(true);
              cb?.();
            })
            .catch(() => {});
        } else if (before !== false) {
          setVisible(true);
          cb?.();
        }
      };

      // 搜索帮助关闭，回显值事件
      const closeSearchHelper = (data: Record<string, any>[]) => {
        const { textKey, valueKey } = alias;
        setRecords(uniqBy([..._records.current, ...data], valueKey));
        const itemList = uniqBy([...items, ..._records.current.map((x) => ({ text: x[textKey], value: x[valueKey] }))], 'value');
        setShItemList(itemList);
        setHelperValues(itemList.map((x) => x.value));
        const { closed } = helper;
        setVisibleEffect(false, () => createElementClick(editCellRef.current!));
        closed?.(_records.current);
      };

      const closeButNotSelect = () => {
        setVisibleEffect(false, () => createElementClick(editCellRef.current!));
      };

      const setHelperValues = (value: Array<string | number>) => {
        // 修改当前单元格的值
        setCellValue(row, dataIndex, value);
        doFieldValidate(rules, value, rowKey, columnKey);
        store.addToUpdated(row);
        onChange?.({ [dataKey]: value }, row, _records.current);
        dataChange();
      };

      const dialogProps = {
        visible,
        title: t('qm.searchHelper.text'),
        width: helper.width ?? '60%',
        loading: false,
        bodyStyle: { paddingBottom: `${SizeHeight[$size] + 20}px` },
        onClose: () => {
          closeButNotSelect();
        },
      };

      const helperProps = {
        ...helper,
        size: $size,
        multiple: true,
        initialValue: merge({}, helper.initialValue),
        defaultSelectedKeys: prevValue,
        onClose: (data) => {
          if (data) {
            closeSearchHelper(data);
          } else {
            closeButNotSelect();
          }
        },
      };

      return (
        <>
          <span className={`ant-input-group-wrapper ant-input-search search-helper-multiple`}>
            <span className={`ant-input-wrapper ant-input-group`}>
              <Select
                mode={'multiple'}
                open={false}
                value={prevValue}
                placeholder={t('qm.table.editable.selectPlaceholder')}
                allowClear={extra.allowClear}
                maxTagCount={extra.collapseTags ? 'responsive' : undefined}
                disabled={extra.disabled}
                style={{ width: '100%' }}
                onKeyUp={(ev) => {
                  if (ev.keyCode === 13) {
                    onEnter?.({ [dataKey]: prevValue }, row);
                  }
                }}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                onDoubleClick={() => {
                  openSearchHelper();
                }}
                onChange={(value) => {
                  const { valueKey } = alias;
                  setRecords(_records.current.filter((x) => value.includes(x[valueKey])));
                  setHelperValues(value);
                  forceUpdate();
                }}
              >
                {shItemList.map((x) => (
                  <Select.Option key={x.value} value={x.value}>
                    {x.text}
                  </Select.Option>
                ))}
              </Select>
              <span className={`ant-input-group-addon`}>
                <Button
                  className={'ant-input-search-button'}
                  disabled={extra.disabled}
                  icon={<SearchOutlined />}
                  onClick={() => {
                    openSearchHelper();
                  }}
                />
              </span>
            </span>
          </span>
          <QmModal {...dialogProps}>
            <QmSearchHelper {...helperProps} />
          </QmModal>
        </>
      );
    },
    [`tree-helper`]: (row: IRecord, column: IColumn) => {
      const { dataIndex, precision } = column;
      const { type, extra = {}, rules = [], helper = {}, onChange, onEnter } = options;
      const prevValue = getCellValue(row, dataIndex);

      const fieldAliasMap = helper.fieldAliasMap;
      if (!fieldAliasMap) {
        warn('Table', 'helper 需要配置 `fieldAliasMap` 选项');
      }

      const alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap || {};
      if (!Object.keys(alias).includes(dataIndex)) {
        warn('Table', 'fieldAliasMap 选项必须包含自身 `dataIndex` 值');
      }

      // 打开搜索帮助面板
      const openSearchHelper = (cb?: () => void) => {
        const { beforeOpen } = helper;
        // 打开的前置钩子
        const open = beforeOpen ?? trueNoop;
        const before = open({ [dataKey]: prevValue }, row, column);
        if ((before as Promise<void>)?.then) {
          (before as Promise<void>)
            .then(() => {
              setVisible(true);
              cb?.();
            })
            .catch(() => {});
        } else if (before !== false) {
          setVisible(true);
          cb?.();
        }
      };

      // 搜索帮助关闭，回显值事件
      const closeSearchHelper = (data: Record<string, any>) => {
        // 其他字段的集合
        const others: Record<string, unknown> = {};
        for (const key in alias) {
          const dataKey = alias[key];
          if (key === dataIndex) continue;
          others[key] = data[dataKey];
        }
        const current = alias[dataIndex] ? data[alias[dataIndex]] : '';
        setHelperValues(current, others);
        const { closed } = helper;
        setVisibleEffect(false, () => createElementClick(editCellRef.current!));
        closed?.(data);
      };

      const closeButNotSelect = () => {
        setVisibleEffect(false, () => createElementClick(editCellRef.current!));
      };

      const setHelperValues = (val = '', others?: any) => {
        // 对其他单元格赋值 & 校验
        if (isObject(others) && Object.keys(others).length) {
          for (const otherDataIndex in others) {
            const otherValue = others[otherDataIndex];
            const otherColumn = flattenColumns.find((column) => column.dataIndex === otherDataIndex);
            if (otherColumn) {
              setCellValue(row, otherDataIndex, otherValue, otherColumn.precision);
              const otherOptions = otherColumn.editRender?.(row, otherColumn);
              if (otherOptions && Array.isArray(otherOptions.rules)) {
                doFieldValidate(otherOptions.rules, otherValue, rowKey, otherDataIndex);
              }
            } else {
              setCellValue(row, otherDataIndex, otherValue);
            }
          }
          // 更新父组件，更新其他单元格值
          tableBodyRef.current!.forceUpdate();
        }
        // 修改当前单元格的值
        setCellValue(row, dataIndex, val, precision);
        doFieldValidate(rules, val, rowKey, columnKey);
        store.addToUpdated(row);
        onChange?.({ [dataKey]: val }, row);
        dataChange();
      };

      const dialogProps = {
        visible,
        title: t('qm.searchHelper.text'),
        width: helper.width ?? '30%',
        loading: false,
        bodyStyle: { paddingBottom: `${SizeHeight[$size] + 20}px` },
        onClose: () => {
          closeButNotSelect();
        },
      };

      const helperProps = {
        ...helper,
        size: $size,
        onClose: (data) => {
          if (data) {
            closeSearchHelper(data);
          } else {
            closeButNotSelect();
          }
        },
      };

      return (
        <>
          <Search
            value={prevValue}
            allowClear={extra.allowClear ?? true}
            readOnly={extra.readOnly}
            disabled={extra.disabled}
            placeholder={t('qm.table.editable.selectPlaceholder')}
            onChange={(ev) => {
              const { value } = ev.target;
              if (value) return;
              forceUpdate();
            }}
            onKeyUp={(ev: any) => {
              if (ev.keyCode === 13) {
                const val = ev.target.value ?? '';
                onEnter?.({ [dataKey]: val }, row);
              }
            }}
            onDoubleClick={() => {
              openSearchHelper();
            }}
            onSearch={(_, ev) => {
              if (ev?.type !== 'click') return;
              // 放大镜
              if ((ev.target as HTMLElement).tagName !== 'INPUT') {
                openSearchHelper();
              } else {
                setHelperValues('');
              }
            }}
          />
          <QmModal {...dialogProps}>
            <QmTreeHelper {...helperProps} />
          </QmModal>
        </>
      );
    },
  };

  const renderEditCell = () => {
    const { type } = options;
    const render = handle[type];
    if (!render) {
      warn('Table', '单元格编辑的类型 `type` 配置不正确');
      return null;
    }
    const cls = [
      `cell--edit`,
      {
        [`is-error`]: !passValidate,
      },
    ];
    return (
      <div ref={editCellRef} className={classNames(cls)}>
        {render(record, column)}
        {!passValidate && <div className={`cell-error`}>{requiredText || validateText}</div>}
      </div>
    );
  };

  const renderCell = () => {
    return <span className={`cell--text`}>{text}</span>;
  };

  return isEditing ? renderEditCell() : renderCell();
};

export default CellEdit;
