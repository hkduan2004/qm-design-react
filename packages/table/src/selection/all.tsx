/*
 * @Author: 焦质晔
 * @Date: 2021-12-28 16:51:50
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-02 11:05:01
 */
import React from 'react';
import { intersection, union, xor } from 'lodash-es';
import TableContext from '../context';
import { get } from '../../../_utils/util';
import { t } from '../../../locale';
import type { IRowKey } from '../table/types';

import { Checkbox, Menu, Dropdown } from '../../../antd';
import { DownOutlined } from '@ant-design/icons';

// intersection -> 交集(去重)
// union -> 并集(去重)
// xor -> 补集(并集 + 除了交集)

type IAllSelectionProps = {
  selectionKeys: IRowKey[];
};

const AllSelection: React.FC<IAllSelectionProps> = (props) => {
  const { selectionKeys } = props;
  const { tableRef, tableProps, pagination, fetchParams, setSelectionKeys, setSpinning } = React.useContext(TableContext)!;
  const { rowSelection } = tableProps;

  const isFilterable = React.useMemo(() => {
    return rowSelection?.filterable ?? true;
  }, [rowSelection]);

  const filterAllRowKeys = React.useMemo(() => {
    const { allTableData, allRowKeys } = tableRef.current;
    const disabled = rowSelection!.disabled;
    return allRowKeys.filter((_, index) => !disabled?.(allTableData[index]));
  }, [tableRef.current.allRowKeys]);

  const indeterminate = React.useMemo(() => {
    // 性能待优化
    return selectionKeys.length > 0 && selectionKeys.length < (rowSelection?.fetchAllRowKeys ? pagination.total : filterAllRowKeys.length);
  }, [selectionKeys.length, filterAllRowKeys.length, pagination.total]);

  const selectable = React.useMemo(() => {
    return !indeterminate && selectionKeys.length > 0;
  }, [indeterminate, selectionKeys.length]);

  // ===========================================

  const getAllSelectionKeys = async () => {
    const fetch = rowSelection!.fetchAllRowKeys!;
    let rowKeys: IRowKey[] = [];
    setSpinning(true);
    try {
      const res = await fetch.api(fetchParams);
      if (res.code === 200) {
        rowKeys = Array.isArray(res.data) ? res.data : get(res.data, fetch.dataKey!) ?? [];
      }
    } catch (err) {
      // ...
    }
    setSpinning(false);
    return rowKeys;
  };

  const changeHandle = async (value: boolean) => {
    let results: IRowKey[] = [];
    if (rowSelection?.fetchAllRowKeys) {
      results = value ? await getAllSelectionKeys() : [];
    } else {
      // 性能待优化
      results = value ? filterAllRowKeys.slice(0) : [];
    }
    setSelectionKeys(results);
  };

  const selectAllHandle = () => {
    changeHandle(true);
  };

  const invertHandle = async () => {
    let results: IRowKey[] = [];
    if (rowSelection?.fetchAllRowKeys) {
      results = xor(selectionKeys, await getAllSelectionKeys());
    } else {
      results = xor(selectionKeys, filterAllRowKeys);
    }
    setSelectionKeys(results);
  };

  const clearAllHandle = () => {
    changeHandle(false);
  };

  const renderContent = () => {
    const items = [
      {
        key: 1,
        label: t('qm.table.selection.all'),
        onClick: () => selectAllHandle(),
      },
      {
        key: 2,
        label: t('qm.table.selection.invert'),
        onClick: () => invertHandle(),
      },
      {
        key: 3,
        label: t('qm.table.selection.clear'),
        onClick: () => clearAllHandle(),
      },
    ];
    return <Menu items={items} />;
  };

  return (
    <div className={`cell--selection`}>
      <Checkbox
        checked={selectable}
        indeterminate={indeterminate}
        disabled={!filterAllRowKeys.length}
        onChange={(ev) => changeHandle(ev.target.checked)}
      />
      {isFilterable && (
        <Dropdown overlay={renderContent()}>
          <DownOutlined className={`svgicon icon`} />
        </Dropdown>
      )}
    </div>
  );
};

export default AllSelection;
