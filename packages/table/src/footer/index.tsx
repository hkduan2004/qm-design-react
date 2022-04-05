/*
 * @Author: 焦质晔
 * @Date: 2021-12-27 20:41:41
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-02 11:00:38
 */
import React from 'react';
import classNames from 'classnames';
import TableContext from '../context';
import { getCellValue } from '../utils';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';

import type { IColumn, IRecord } from '../table/types';

type IFootProps = {
  summationRows: Record<string, string | number>[];
  flattenColumns: IColumn[];
};

const TableFooter: React.FC<IFootProps> = (props) => {
  const { summationRows, flattenColumns } = props;
  const {
    getRowKey,
    tableProps,
    tableRef,
    sorter,
    layout,
    scrollY,
    leftFixedColumns,
    rightFixedColumns,
    setElementStore,
    getStickyLeft,
    getStickyRight,
  } = React.useContext(TableContext)!;
  const { footRender } = tableProps;

  const tableFootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    createElementStore();
  }, []);

  // =========================================

  const createElementStore = () => {
    setElementStore(`$footer`, tableFootRef.current!);
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

  const renderRows = () => {
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
    return summationRows.map((row, index) => (
      <tr key={index} className={`footer--row`}>
        {flattenColumns.map((column, index) => renderCell(column, row, index))}
        {scrollY && <td className={classNames(cls)} style={{ ...stys }}></td>}
      </tr>
    ));
  };

  const renderCell = (column: IColumn, row: IRecord, index: number) => {
    const { isIE } = tableRef.current;
    const { gutterWidth } = layout;
    const { dataIndex, fixed, align, summation } = column;
    const cls = [
      `footer--column`,
      `col--ellipsis`,
      {
        [`col--center`]: align === 'center',
        [`col--right`]: align === 'right',
        [`column--sort`]: !!sorter[dataIndex],
        [`cell-fix-left`]: !isIE && fixed === 'left',
        [`cell-fix-right`]: !isIE && fixed === 'right',
        [`cell-fix-left-last`]: !isIE && fixed === 'left' && leftFixedColumns[leftFixedColumns.length - 1].dataIndex === dataIndex,
        [`cell-fix-right-first`]: !isIE && fixed === 'right' && rightFixedColumns[0].dataIndex === dataIndex,
      },
    ];
    const stys = !isIE
      ? {
          left: fixed === 'left' ? `${getStickyLeft(dataIndex)}px` : '',
          right: fixed === 'right' ? `${getStickyRight(dataIndex) + (scrollY ? gutterWidth : 0)}px` : '',
        }
      : null;
    const text = summation?.render ? summation.render(tableRef.current.tableFullData) : getCellValue(row, `${dataIndex}_text`);
    const cellValue = index === 0 && text === '' ? t('qm.table.config.summaryText') : text;
    return (
      <td key={dataIndex} title={cellValue} className={classNames(cls)} style={{ ...stys }}>
        <div className={`cell`}>{cellValue}</div>
      </td>
    );
  };

  const prefixCls = getPrefixCls('table');

  const { tableBodyWidth } = layout;

  return (
    <div ref={tableFootRef} className={`${prefixCls}--footer-wrapper`}>
      {footRender ? (
        footRender(flattenColumns, tableRef.current.tableFullData)
      ) : (
        <table className={`${prefixCls}--footer`} cellSpacing="0" cellPadding="0" style={{ width: tableBodyWidth ? `${tableBodyWidth}px` : '' }}>
          {renderColgroup()}
          <tfoot>{renderRows()}</tfoot>
        </table>
      )}
    </div>
  );
};

export default TableFooter;
