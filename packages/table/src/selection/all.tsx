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

import { Checkbox, Menu, Dropdown, Tooltip } from '../../../antd';
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons';

// intersection -> 交集(去重)
// union -> 并集(去重)
// xor -> 补集(并集 + 除了交集)

type IAllSelectionProps = {
  selectionKeys: IRowKey[];
};

const AllSelection: React.FC<IAllSelectionProps> = (props) => {
  const { selectionKeys } = props;
  const { tableRef, tableProps, getRowKey, pagination, fetchParams, setSelectionKeys, setSpinning, isWebPagination } =
    React.useContext(TableContext)!;
  const { rowSelection } = tableProps;
  const { fetchAllRowKeys, onSelectAll } = rowSelection!;

  // 创建内存分页的列表数据
  const createCurrentPageList = () => {
    const { tableFullData } = tableRef.current;
    const { current, pageSize } = pagination;
    return !isWebPagination ? tableFullData : tableFullData.slice((current - 1) * pageSize, current * pageSize);
  };

  const getAllRowKeys = () => {
    const { allTableData, allRowKeys } = tableRef.current;
    const { selectAllOnCurrentPage, disabled = (x) => false } = rowSelection!;
    return !selectAllOnCurrentPage
      ? allRowKeys.filter((_, index) => !disabled(allTableData[index]))
      : createCurrentPageList()
          .filter((x) => !disabled(x))
          .map((x) => getRowKey(x, x.index));
  };

  const _allRowKeys: IRowKey[] = getAllRowKeys();

  const isCurrentPage = React.useMemo(() => {
    return rowSelection!.selectAllOnCurrentPage ?? false;
  }, [rowSelection]);

  const isFilterable = React.useMemo(() => {
    return (rowSelection!.filterable ?? true) && !isCurrentPage;
  }, [rowSelection, isCurrentPage]);

  const indeterminate = React.useMemo(() => {
    // 性能待优化
    return selectionKeys.length > 0 && selectionKeys.length < (fetchAllRowKeys ? pagination.total : _allRowKeys.length);
  }, [selectionKeys.length, _allRowKeys.length, pagination.total]);

  const selectable = React.useMemo(() => {
    return !indeterminate && selectionKeys.length > 0;
  }, [indeterminate, selectionKeys.length]);

  const getAllSelectionKeys = async () => {
    const fetch = fetchAllRowKeys!;
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
    if (fetchAllRowKeys) {
      results = value ? await getAllSelectionKeys() : [];
    } else {
      // 性能待优化
      results = value ? _allRowKeys.slice(0) : [];
    }
    setSelectionKeys(results);
    onSelectAll?.(value, results);
  };

  const selectAllHandle = () => {
    changeHandle(true);
  };

  const invertHandle = async () => {
    let results: IRowKey[] = [];
    if (fetchAllRowKeys) {
      results = xor(selectionKeys, await getAllSelectionKeys());
    } else {
      results = xor(selectionKeys, _allRowKeys);
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
        disabled={!_allRowKeys.length}
        onChange={(ev) => changeHandle(ev.target.checked)}
      />
      {isFilterable && (
        <Dropdown overlay={renderContent()}>
          <DownOutlined className={`svgicon icon`} />
        </Dropdown>
      )}
      {isCurrentPage && (
        <Tooltip placement="top" title={t('qm.table.selection.currentPage')}>
          <InfoCircleOutlined className={`info`} />
        </Tooltip>
      )}
    </div>
  );
};

export default AllSelection;
