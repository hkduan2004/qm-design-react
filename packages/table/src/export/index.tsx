/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 11:07:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-28 12:33:19
 */
import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { get } from 'lodash-es';
import ConfigContext from '../../../config-provider/context';
import TableContext from '../context';
import {
  columnsFlatMap,
  convertToRows,
  filterTableColumns,
  getCellValue,
  setCellValue,
  getGroupValidData,
  getVNodeText,
  createFilterColumns,
} from '../utils';
import { isValidElement } from '../../../_utils/util';
import { download } from '../../../_utils/download';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';
import { DEFAULT_FILENAME_FORMAT } from '../table/types';
import useExport from './useExport';
import config from '../config';

import type { IColumn, IRecord } from '../table/types';

import { QmModal } from '../../../index';
import Setting from './setting';
import { DownloadOutlined } from '@ant-design/icons';

export type IOptions = {
  fileName: string;
  fileType: 'xlsx' | 'csv';
  sheetName: string;
  exportType: 'all' | 'selected' | 'custom';
  columns: IColumn[];
  startIndex: number;
  endIndex: number;
  footSummation: boolean;
  useStyle: boolean;
};

type ITableExportProps = {
  tableColumns: IColumn[];
};

const TableExport: React.FC<ITableExportProps> = (props) => {
  const { tableColumns } = props;
  const { global } = React.useContext(ConfigContext)!;
  const { tableRef, tableBodyRef, tableProps, flattenColumns, pagination, fetchParams, isFetch, isGroupSubtotal, showSummary, getSpan } =
    React.useContext(TableContext)!;
  const { exportExcel, fetch, showHeader } = tableProps;

  const [visible, setVisible] = React.useState<boolean>(false);
  const [exporting, setExporting] = React.useState<boolean>(false);

  const serviceExport = !!exportExcel?.fetch?.api;

  const disabledState = React.useMemo(() => {
    return !pagination.total || exporting;
  }, [pagination.total, exporting]);

  const headColumns = React.useMemo(() => {
    return filterTableColumns(tableColumns, [config.expandableColumn, config.selectionColumn, config.operationColumn]);
  }, [tableColumns]);

  const flatColumns = React.useMemo(() => {
    return filterTableColumns(flattenColumns, [config.expandableColumn, config.selectionColumn, config.operationColumn]);
  }, [flattenColumns]);

  const createDataList = (list: IRecord[]) => {
    return list.map((x, i) => {
      const item: IRecord = { ...x, index: i, pageIndex: i };
      flatColumns.forEach((column, index) => {
        const { dataIndex } = column;
        if (dataIndex === 'index' || dataIndex === 'pageIndex') return;
        setCellValue(item, dataIndex, getCellValue(item, dataIndex));
      });
      return item;
    });
  };

  const calcSummationValues = (columns: IColumn[], tableData: IRecord[]): Record<string, number>[] => {
    const { summaries } = tableRef.current;
    const result: Record<string, number> = {};
    columns
      .filter((x) => !!x.summation)
      .forEach((column) => {
        const { dataIndex } = column;
        let value: number;
        // 服务端合计
        if (Object.keys(summaries).includes(dataIndex)) {
          value = Number(getCellValue(summaries, dataIndex));
        } else {
          const dataList: IRecord[] = !isGroupSubtotal ? tableData : getGroupValidData(tableData);
          value = dataList.reduce((prev, curr) => {
            if (curr?.[config.summaryIgnore]) {
              return prev;
            }
            const value = Number(getCellValue(curr, dataIndex));
            if (!Number.isNaN(value)) {
              return prev + value;
            }
            return prev;
          }, 0);
        }
        setCellValue(result, dataIndex, value);
      });
    return [result];
  };

  const renderCell = (row: IRecord, rowIndex: number, column: IColumn, columnIndex: number) => {
    const { precision, formatType } = column;
    let result: string | number = tableBodyRef.current!.renderCellTitle(column, row, rowIndex, columnIndex);
    // 处理 number 类型
    if (precision! >= 0 && !formatType && result !== '') {
      result = Number(result);
    }
    return result;
  };

  const { exportXLSX, exportCSV } = useExport();

  const getTableData = async (options: IOptions) => {
    const { fileName, fileType, exportType, startIndex = 1, endIndex } = options;
    const { allTableData, selectionRows } = tableRef.current;
    let tableList: IRecord[] = [];

    if (isFetch) {
      setExporting(true);
      const { api, dataKey } = fetch!;
      try {
        const res = await api({ ...fetchParams, [config.currentPageName]: 1, [config.pageSizeName]: pagination.total });
        if (res.code === 200) {
          tableList = createDataList(Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? []);
        }
      } catch (err) {
        // ...
      }
      setExporting(false);
    } else {
      tableList = allTableData.slice(0);
    }

    if (exportType === 'selected') {
      tableList = selectionRows.slice(0);
    }
    if (exportType === 'custom') {
      tableList = tableList.slice(startIndex - 1, endIndex ? endIndex : undefined);
    }
    if (fileType === 'xlsx') {
      const blob = await exportXLSX(options, tableList, calcSummationValues, renderCell);
      download(blob, `${fileName}.xlsx`);
      recordExportLog(`${fileName}.xlsx`);
    }
    if (fileType === 'csv') {
      const blob = exportCSV(options, _toTable(options, tableList));
      download(blob, `${fileName}.csv`);
      recordExportLog(`${fileName}.csv`);
    }
  };

  const exportHandle = async (fileName: string) => {
    setExporting(true);
    try {
      const res = await exportExcel!.fetch!.api({
        columns: flatColumns.map((column) => {
          const { title, dataIndex, hidden } = column;
          const { type } = column.filter || {};
          return { title, dataIndex, type, hidden };
        }),
        ...fetchParams,
        tsortby: undefined,
        tsummary: undefined,
        tgroupby: undefined,
        [config.currentPageName]: undefined,
        [config.pageSizeName]: undefined,
      });
      if (res.data) {
        download(res.data, fileName);
        recordExportLog(fileName);
      }
    } catch (err) {
      // ...
    }
    setExporting(false);
  };

  const recordExportLog = (fileName: string) => {
    const fetchFn = global?.['table']?.recordExportLog;
    try {
      fetchFn?.({ fileName });
    } catch (err) {
      // ...
    }
  };

  const _toTable = (options: IOptions, dataList: IRecord[]) => {
    const { columns, footSummation } = options;
    const columnRows = convertToRows(columns);
    const flatColumns = columnsFlatMap(columns);
    let html = `<table width="100%" border="0" cellspacing="0" cellpadding="0">`;
    html += `<colgroup>${flatColumns
      .map(({ width, renderWidth }) => `<col style="width:${width || renderWidth || config.defaultColumnWidth}px">`)
      .join('')}</colgroup>`;
    if (showHeader) {
      html += [
        `<thead>`,
        columnRows
          .map(
            (columns) =>
              `<tr>${columns
                .map((column) => {
                  const { rowSpan, colSpan } = column;
                  if (colSpan === 0) {
                    return null;
                  }
                  return `<th colspan="${colSpan}" rowspan="${rowSpan}">${column.title}</th>`;
                })
                .join('')}</tr>`
          )
          .join(''),
        `</thead>`,
      ].join('');
    }
    if (dataList.length) {
      html += `<tbody>${dataList
        .map(
          (row) =>
            `<tr>${flatColumns
              .map((column, index) => {
                const { rowSpan, colSpan } = getSpan(row, column, row.index, index, dataList);
                if (!rowSpan || !colSpan) {
                  return null;
                }
                return `<td rowspan="${rowSpan}" colspan="${colSpan}">${renderCell(row, row.index, column, index)}</td>`;
              })
              .join('')}</tr>`
        )
        .join('')}</tbody>`;
    }
    if (showSummary && footSummation) {
      html += [
        `<tfoot>`,
        calcSummationValues(flatColumns, dataList)
          .map(
            (row) =>
              `<tr>${flatColumns
                .map((column, index) => {
                  const { dataIndex, summation } = column;
                  const text = summation?.render ? summation.render(dataList) : getCellValue(row, dataIndex);
                  return `<td>${
                    index === 0 && text === '' ? t('qm.table.config.summaryText') : isValidElement(text) ? getVNodeText(text).join('') : text
                  }</td>`;
                })
                .join('')}</tr>`
          )
          .join(''),
        `</tfoot>`,
      ].join('');
    }
    html += '</table>';
    return html;
  };

  const exportFileName = exportExcel?.fileName ?? `${dayjs().format(DEFAULT_FILENAME_FORMAT)}.xlsx`;
  const exportFileType = exportFileName.slice(exportFileName.lastIndexOf('.') + 1).toLowerCase();

  const prefixCls = getPrefixCls('table');

  const cls = {
    [`${prefixCls}-export`]: true,
    disabled: disabledState,
  };

  const wrapProps = {
    visible,
    title: t('qm.table.export.settingTitle'),
    width: 600,
    loading: false,
    bodyStyle: { paddingBottom: '52px' },
    onClose: () => setVisible(false),
  };

  const settingProps = {
    fileName: exportFileName.slice(0, exportFileName.lastIndexOf('.')),
    fileType: exportFileType,
    columns: headColumns,
    useStyle: exportExcel?.cellStyle ? 1 : 0,
  };

  return (
    <>
      <span
        className={classNames(cls)}
        title={t('qm.table.export.text')}
        onClick={() => {
          if (disabledState) return;
          serviceExport ? exportHandle(exportFileName) : setVisible(true);
        }}
      >
        <i className={`svgicon icon`}>
          <DownloadOutlined />
        </i>
      </span>
      <QmModal {...wrapProps}>
        <Setting
          defaultValue={settingProps}
          onClose={() => setVisible(false)}
          onOk={(data: IOptions) => {
            getTableData(Object.assign({}, data, { columns: createFilterColumns(data.columns) }));
          }}
        />
      </QmModal>
    </>
  );
};

export default TableExport;
