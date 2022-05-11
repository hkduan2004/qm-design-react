/*
 * @Author: 焦质晔
 * @Date: 2021-12-27 20:41:41
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 20:43:25
 */
import React from 'react';
import classNames from 'classnames';
import { pickBy } from 'lodash-es';
import TableContext from '../context';
import { convertToRows, getCellValue, createWhereSQL, getGroupValidData } from '../utils';
import { where } from '../filter-sql';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';
import config from '../config';
import useUpdateEffect from '../../../hooks/useUpdateEffect';

import type { IColumn, IDerivedColumn, IFilter, ISorter } from '../table/types';
import type { Nullable } from '../../../_utils/types';

import HeadFilter from '../filter';
import Resizable from '../resizable';
import AllSelection from '../selection/all';
import AllExpandable from '../expandable/all';
import CaretUpIcon from '../icon/caretup';
import CaretDownIcon from '../icon/caretdown';
import { Tooltip } from '../../../antd';
import { InfoCircleOutlined } from '@ant-design/icons';

type IHeaderProps = {
  tableColumns: IColumn[];
  flattenColumns: IColumn[];
  sorter: ISorter;
  filters: IFilter;
};

const TableHeader: React.FC<IHeaderProps> = (props) => {
  const { tableColumns, flattenColumns, sorter, filters } = props;
  const {
    getRowKey,
    tableProps,
    tableRef,
    layout,
    scrollY,
    superFilters,
    selectionKeys,
    rightFixedColumns,
    firstDataIndex,
    isFetch,
    isTreeTable,
    isGroupSubtotal,
    tableChange,
    setSorter,
    setElementStore,
    resetTableScroll,
    getStickyLeft,
    getStickyRight,
    createGroupData,
    createTableFullData,
  } = React.useContext(TableContext)!;
  const { ellipsis, resizable, multipleSort, rowSelection, expandable } = tableProps;
  const [ascend, descend] = config.sortDirections;

  const tableHeadRef = React.useRef<HTMLDivElement>(null);

  const isClientSorter = React.useMemo(() => {
    return !isFetch;
  }, [isFetch]);

  const isClientFilter = React.useMemo(() => {
    return !isFetch;
  }, [isFetch]);

  const showExpandAll = React.useMemo(() => {
    return !expandable?.hideExpandAll;
  }, [expandable]);

  const showSelectAll = React.useMemo(() => {
    return isFetch ? !!rowSelection?.fetchAllRowKeys : !rowSelection?.hideSelectAll;
  }, [isFetch, rowSelection]);

  useUpdateEffect(() => {
    sorterHandle();
    tableChange();
    resetTableScroll();
  }, [sorter]);

  useUpdateEffect(() => {
    filterHandle();
    tableChange();
    resetTableScroll();
  }, [filters]);

  useUpdateEffect(() => {
    filterHandle();
    tableChange();
    resetTableScroll();
  }, [superFilters]);

  React.useEffect(() => {
    createElementStore();
  }, []);

  // =========================================

  const createElementStore = () => {
    setElementStore(`$header`, tableHeadRef.current!);
  };

  const renderColgroup = () => {
    const { gutterWidth } = layout;
    return (
      <colgroup>
        {flattenColumns.map((column) => {
          const { dataIndex, width, renderWidth } = column;
          return <col key={dataIndex} style={{ width: `${width || renderWidth}px`, minWidth: `${width || renderWidth}px` }} />;
        })}
        {scrollY && <col style={{ width: `${gutterWidth}px`, minWidth: `${gutterWidth}px` }} />}
      </colgroup>
    );
  };

  const renderRows = (columnRows: Array<IColumn[]>) => {
    const { isIE } = tableRef.current;
    const cls = [
      `gutter`,
      {
        [`cell-fix-right`]: !!rightFixedColumns.length,
      },
    ];
    const stys = !isIE
      ? {
          right: rightFixedColumns.length ? 0 : '',
        }
      : null;
    return columnRows.map((columns, rowIndex) => (
      <tr key={rowIndex} className={`header--row`}>
        {columns.map((column, columnIndex) => renderColumn(column, columnIndex, columns))}
        {scrollY && <th className={classNames(cls)} style={{ ...stys }}></th>}
      </tr>
    ));
  };

  const renderColumn = (column: IColumn, columnIndex: number, columns: IColumn[]) => {
    const { isIE } = tableRef.current;
    const { gutterWidth } = layout;
    const { dataIndex, colSpan, rowSpan, fixed, align, sorter: isSorter, filter, required, headRender } = column;
    if (colSpan === 0) {
      return null;
    }
    const isEllipsis = column.ellipsis ?? ellipsis;
    const cls = [
      `header--column`,
      {
        [`col--ellipsis`]: isEllipsis,
        [`col--center`]: align === 'center',
        [`col--right`]: align === 'right',
        [`column--required`]: !!required,
        [`column-has-sorter`]: isSorter,
        [`column-has-filter`]: filter,
        [`column--sort`]: !!sorter[dataIndex],
        [`cell-fix-left`]: !isIE && fixed === 'left',
        [`cell-fix-right`]: !isIE && fixed === 'right',
        [`cell-fix-left-last`]: !isIE && fixed === 'left' && !columns[columnIndex + 1]?.fixed,
        [`cell-fix-right-first`]: !isIE && fixed === 'right' && !columns[columnIndex - 1]?.fixed,
      },
    ];
    const stys = !isIE
      ? {
          left: fixed === 'left' ? `${getStickyLeft(dataIndex)}px` : '',
          right: fixed === 'right' ? `${getStickyRight(dataIndex) + (scrollY ? gutterWidth : 0)}px` : '',
        }
      : null;
    const isResizable = resizable && ![config.expandableColumn, config.selectionColumn].includes(dataIndex);

    return (
      <th
        key={dataIndex}
        className={classNames(cls)}
        colSpan={colSpan}
        rowSpan={rowSpan}
        style={{ ...stys }}
        onClick={(ev) => thClickHandle(ev, column)}
      >
        <div className={`cell--wrapper`}>
          {headRender ? (
            <div className={`cell--text cell`}>{headRender(column, tableRef.current.tableFullData)}</div>
          ) : (
            <>
              <div className={`cell--text`}>{renderCell(column)}</div>
              {filter ? renderFilter(column) : null}
            </>
          )}
        </div>
        {isResizable && <Resizable column={column} />}
      </th>
    );
  };

  const renderCell = (column: IColumn) => {
    const { dataIndex, type, sorter: isSorter, title, description } = column as IDerivedColumn;
    if (dataIndex === config.selectionColumn && type === 'checkbox') {
      if (type === 'checkbox') {
        // AllSelection -> 受控组件
        return <div className={`cell`}>{showSelectAll ? <AllSelection selectionKeys={selectionKeys} /> : t('qm.table.config.selectionText')}</div>;
      }
      if (type === 'radio') {
        return <div className={`cell`}>{title}</div>;
      }
    }
    const vNodes: React.ReactElement[] = [];
    vNodes.push(
      <div key={0} className={`cell`} title={title}>
        {isTreeTable && dataIndex === firstDataIndex && showExpandAll ? <AllExpandable /> : null}
        {dataIndex === config.expandableColumn && showExpandAll ? <AllExpandable /> : title}
      </div>
    );
    if (description) {
      vNodes.push(
        <Tooltip key={1} placement="top" title={description}>
          <InfoCircleOutlined className={`tip`} />
        </Tooltip>
      );
    }
    if (isSorter) {
      vNodes.push(renderSorter(sorter[dataIndex]));
    }
    return vNodes;
  };

  const renderSorter = (orderText: Nullable<string>) => {
    const ascCls = [
      `svgicon cell--sorter__asc`,
      {
        [`actived`]: orderText === ascend,
      },
    ];
    const descCls = [
      `svgicon cell--sorter__desc`,
      {
        [`actived`]: orderText === descend,
      },
    ];
    return (
      <div key={2} className={`cell--sorter`} title={t('qm.table.sorter.text')}>
        <span className={classNames(ascCls)}>
          <CaretUpIcon />
        </span>
        <span className={classNames(descCls)}>
          <CaretDownIcon />
        </span>
      </div>
    );
  };

  const renderFilter = (column: IColumn) => {
    return <HeadFilter column={column} filters={filters} />;
  };

  const thClickHandle = (ev: React.MouseEvent<HTMLTableCellElement>, column: IColumn) => {
    const { sorter: isSorter, dataIndex } = column;
    if (isSorter) {
      const current = sorter[dataIndex];
      const orderText = current ? (current === descend ? null : descend) : ascend;
      // 设置排序值
      if (!multipleSort) {
        setSorter(Object.assign({}, { [dataIndex]: orderText }));
      } else {
        // 后点击的排序列，key 排在最后
        delete sorter[dataIndex];
        setSorter(Object.assign({}, sorter, { [dataIndex]: orderText }));
      }
    }
  };

  // 表头排序
  const sorterHandle = () => {
    if (!isClientSorter) return;
    clientSorter();
  };

  // 客户端排序
  const clientSorter = (noRest?: boolean) => {
    const validSorter = pickBy(sorter, (val) => val !== null) as Record<string, string>;
    for (const key in validSorter) {
      const column = flattenColumns.find((column) => column.dataIndex === key);
      if (!column) {
        delete validSorter[key];
        continue;
      }
      doSortHandle(column, validSorter[key]);
    }
    if (noRest) return;
    // 还原排序数据
    if (!Object.keys(validSorter).length) {
      doSortHandle({ dataIndex: 'index' }, ascend);
    }
  };

  // 排序算法
  const doSortHandle = (column: Partial<IColumn>, orderText: string) => {
    const { tableFullData } = tableRef.current;
    const { dataIndex, sorter } = column;
    const sortFn = (a, b) => {
      const start = getCellValue(a, dataIndex!);
      const end = getCellValue(b, dataIndex!);
      if (!Number.isNaN(start - end)) {
        return orderText === ascend ? start - end : end - start;
      }
      return orderText === ascend ? start.toString().localeCompare(end.toString()) : end.toString().localeCompare(start.toString());
    };
    const result = !isGroupSubtotal
      ? tableFullData.sort(typeof sorter === 'function' ? sorter : sortFn).slice(0)
      : createGroupData(getGroupValidData(tableFullData).sort(typeof sorter === 'function' ? sorter : sortFn));
    createTableFullData(result);
  };

  // 表头筛选
  const filterHandle = () => {
    if (!isClientFilter) return;
    clientFilter();
  };

  // 客户端筛选
  const clientFilter = () => {
    const { tableOriginData } = tableRef.current;
    const sql = !superFilters.length ? createWhereSQL(filters) : createWhereSQL(superFilters);
    const result =
      sql !== ''
        ? !isGroupSubtotal
          ? where(tableOriginData, sql, isTreeTable)
          : createGroupData(where(getGroupValidData(tableOriginData), sql, isTreeTable))
        : tableOriginData;
    createTableFullData(result);
    clientSorter(true);
  };

  const columnRows = convertToRows(tableColumns);

  const prefixCls = getPrefixCls('table');

  const { tableBodyWidth } = layout;

  return (
    <div ref={tableHeadRef} className={`${prefixCls}--header-wrapper`}>
      <table className={`${prefixCls}--header`} cellSpacing="0" cellPadding="0" style={{ width: tableBodyWidth ? `${tableBodyWidth}px` : '' }}>
        {renderColgroup()}
        <thead>{renderRows(columnRows)}</thead>
      </table>
    </div>
  );
};

export default TableHeader;
