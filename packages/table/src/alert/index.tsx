/*
 * @Author: 焦质晔
 * @Date: 2021-12-28 21:56:19
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-17 15:32:24
 */
import React from 'react';
import classNames from 'classnames';
import TableContext from '../context';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';

import { InfoCircleFilled } from '@ant-design/icons';

type IAlertProps = {
  total: number;
};

const Alert: React.FC<IAlertProps> = (props) => {
  const { total } = props;
  const {
    tableProps,
    selectionKeys,
    isHeadSorter,
    isHeadFilter,
    clearTableSorter,
    clearTableFilter,
    clearSuperFilters,
    clearRowSelection,
    clearRowHighlight,
  } = React.useContext(TableContext)!;
  const { rowSelection, rowHighlight } = tableProps;

  const showClear = React.useMemo(() => {
    return !!(isHeadSorter || isHeadFilter || rowSelection || rowHighlight);
  }, [isHeadSorter, isHeadFilter, rowSelection, rowHighlight]);

  const clearHandle = () => {
    // 清空表头排序
    clearTableSorter();
    // 清空表头筛选
    clearTableFilter();
    // 清空高级检索
    clearSuperFilters();
    // 清空列选中
    clearRowSelection();
    // 清空行高亮
    clearRowHighlight();
  };

  const prefixCls = getPrefixCls('table');
  const cls = {
    [`${prefixCls}__alert`]: true,
  };

  return (
    <div className={classNames(cls)}>
      <i className={`svgicon icon`}>
        <InfoCircleFilled />
      </i>
      <span>
        {t('qm.table.alert.total', { total })}
        {rowSelection ? `，${t('qm.table.alert.selected', { total: selectionKeys.length })}` : ''}
      </span>
      {showClear && <em onClick={clearHandle}>{t('qm.table.alert.clear')}</em>}
    </div>
  );
};

export default Alert;
