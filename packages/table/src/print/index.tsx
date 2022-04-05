/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 10:00:20
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-23 14:52:54
 */
import React from 'react';
import { flatten, groupBy, map, spread, mergeWith, cloneDeep } from 'lodash-es';
import ConfigContext from '../../../config-provider/context';
import TableContext from '../context';
import { convertToRows, deepFindColumn, filterTableColumns, getCellValue } from '../utils';
import { t } from '../../../locale';
import { download } from '../../../_utils/download';
import { getPrefixCls } from '../../../_utils/prefix';
import config from '../config';

import type { IColumn, IDerivedColumn, IRecord } from '../table/types';

import { PrinterOutlined } from '@ant-design/icons';

const defaultHtmlStyle = `
  * {
    margin: 0;
    padding: 0;
  }
  body * {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  table {
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: collapse;
  }
  table--print {
    font-size: 14px;
    text-align: left;
  }
  .table--print th,
  .table--print td {
    padding: 5px;
    border: 1px solid #000;
  }
  .no-border th,
  .no-border td {
    border: 0!important;
  }
  .table--print th[colspan]:not([colspan='1']) {
    text-align: center;
  }
  .page-break {
    page-break-after: always;
  }
`;

type ITablePrintProps = {
  tableColumns: IColumn[];
};

const TablePrint: React.FC<ITablePrintProps> = (props) => {
  const { tableColumns } = props;
  const { global } = React.useContext(ConfigContext)!;
  const { tableRef, tableBodyRef, tableProps, flattenColumns, summationRows, showSummary, getSpan } = React.useContext(TableContext)!;
  const { tablePrint, showHeader } = tableProps;
  const { isIE } = tableRef.current;

  const leftLogoUrl: string = global?.['print']?.leftLogo ?? '';
  const rightLogoUrl: string = global?.['print']?.rightLogo ?? '';

  const hasPrintLogo = !!(leftLogoUrl || rightLogoUrl);

  const headColumns = React.useMemo(() => {
    return cloneDeep(filterTableColumns(tableColumns, [config.expandableColumn, config.selectionColumn, config.operationColumn]));
  }, [tableColumns]);

  const flatColumns = React.useMemo(() => {
    return cloneDeep(filterTableColumns(flattenColumns, [config.expandableColumn, config.selectionColumn, config.operationColumn]));
  }, [flattenColumns]);

  const printFixedColumns = React.useMemo(() => {
    return cloneDeep(tableColumns.filter((column: IColumn) => column.printFixed));
  }, [tableColumns]);

  const deepCreateColumn = (column: IDerivedColumn, columns: IColumn[]): IDerivedColumn => {
    const parent: IDerivedColumn = Object.assign({}, deepFindColumn(columns, column.parentDataIndex!));
    parent.children = [column];
    if (parent.level && parent.level > 1) {
      return deepCreateColumn(parent, columns);
    }
    return parent;
  };

  const mergeColumns = (columns: IColumn[]): IColumn[] => {
    const keys: string[] = [...new Set(columns.map((x) => x.dataIndex))];
    return keys.map((x) => {
      const res = columns.filter((k) => k.dataIndex === x);
      if (res.length <= 1) {
        return res[0];
      } else {
        return doMerge(res, 'dataIndex')[0];
      }
    });
  };

  const doMerge = (columns: IColumn[], mark: string): IColumn[] => {
    return map(
      groupBy(flatten(columns), mark),
      spread((...rest) => {
        return mergeWith(...(rest as [any, unknown]), (objValue, srcValue) => {
          if (Array.isArray(objValue)) {
            return doMerge(objValue.concat(srcValue), mark);
          }
        });
      })
    );
  };

  const createChunkColumnRows = (chunkColumns: IDerivedColumn[][], tableColumns: IColumn[]): Array<IDerivedColumn[][]> => {
    const res: Array<IDerivedColumn[][]> = [];
    chunkColumns.forEach((columns) => {
      let tmp: IDerivedColumn[] = [];
      columns.forEach((column) => {
        if (column.level === 1) {
          tmp.push(column);
        } else {
          // 深度拆分列
          tmp.push(deepCreateColumn(column, tableColumns));
        }
      });
      // 合并列
      tmp = mergeColumns(tmp);
      res.push(convertToRows(tmp));
    });
    return res;
  };

  const createChunkColumns = (columns: IColumn[]): IColumn[][] => {
    const res: IColumn[][] = [];
    let tmp: IColumn[] = [];
    let sum = 0;
    let i = 0;
    for (; i < columns.length; ) {
      const column = columns[i];
      const w = column.width || column.renderWidth || config.defaultColumnWidth;
      sum += w;
      if (sum <= config.printWidth) {
        tmp.push(column);
        if (i === columns.length - 1) {
          res.push(tmp);
        }
        i++;
      } else if (i > 0) {
        columns.splice(0, i);
        printFixedColumns.length && columns.unshift(...printFixedColumns);
        res.push(tmp);
        tmp = [];
        sum = 0;
        i = 0;
      } else {
        column.width = config.printWidth;
        tmp.push(column);
        res.push(tmp);
        i++;
      }
    }
    return res;
  };

  const downloadFile = (opts: any, content: string) => {
    const { filename, type, isDownload } = opts;
    const name = `${filename}.${type}`;
    if (window.Blob) {
      const blob: Blob = new Blob([content], { type: `text/${type}` });
      if (!isDownload) {
        return Promise.resolve({ type, content, blob });
      }
      download(blob, name);
    }
  };

  const renderCell = (row: IRecord, rowIndex: number, column: IColumn, columnIndex: number) => {
    return tableBodyRef.current!.renderCellTitle(column, row, rowIndex, columnIndex);
  };

  const toHtml = () => {
    const { allTableData } = tableRef.current;
    const chunkFlatColumns = createChunkColumns([...flatColumns]);
    const chunkColumnRows = createChunkColumnRows(chunkFlatColumns, headColumns);
    let html = [
      `<!DOCTYPE html>`,
      `<html>`,
      `<head>`,
      `<meta charset="utf-8">`,
      `<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">`,
      `<style>${defaultHtmlStyle}</style>`,
      `</head>`,
      `<body>`,
    ].join('');
    for (let i = 0; i < chunkFlatColumns.length; i++) {
      html += _toTable(chunkColumnRows[i], chunkFlatColumns[i], allTableData);
      html += `<div class="page-break"></div>`;
    }
    return html + `</body></html>`;
  };

  const _toLogo = () => {
    const __html__: string[] = [
      `<table class="no-border" width="100%" border="0" cellspacing="0" cellpadding="0">`,
      `<tr>`,
      `<td width="50%" align="left">`,
      leftLogoUrl ? `<img src="${leftLogoUrl}" border="0" height="26" />` : '',
      `</td>`,
      `<td width="50%" align="right">`,
      rightLogoUrl ? `<img src="${rightLogoUrl}" border="0" height="38" />` : '',
      `</td>`,
      `</tr>`,
      `</table>`,
    ];
    return __html__.join('');
  };

  const _toTable = (columnRows: Array<IDerivedColumn[]>, flatColumns: IColumn[], dataList: IRecord[]) => {
    const { showLogo = true } = tablePrint!;
    let html = `<table class="table--print" width="100%" border="0" cellspacing="0" cellpadding="0">`;
    html += `<colgroup>${flatColumns
      .map(({ width, renderWidth }) => `<col style="width:${width || renderWidth || config.defaultColumnWidth}px">`)
      .join('')}</colgroup>`;
    if (showHeader) {
      html += [
        `<thead>`,
        showLogo && hasPrintLogo ? `<tr><th colspan="${flatColumns.length}" style="border: 0">${_toLogo()}</th></tr>` : '',
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
    if (showSummary && summationRows.length) {
      html += [
        `<tfoot>`,
        summationRows
          .map(
            (row) =>
              `<tr>${flatColumns
                .map((column, index) => {
                  const { dataIndex, summation } = column;
                  const text = summation?.render ? summation.render(dataList) : getCellValue(row, `${dataIndex}_text`);
                  return `<td>${index === 0 && text === '' ? t('qm.table.config.summaryText') : text}</td>`;
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

  const printHandle = () => {
    const opts = { filename: 'print', type: 'html', isDownload: false };
    downloadFile(opts, toHtml())?.then(({ content, blob }) => {
      let printFrame: any = document.createElement('iframe');
      printFrame.setAttribute('frameborder', '0');
      printFrame.setAttribute('width', '100%');
      printFrame.setAttribute('height', '0');
      printFrame.style.display = 'none';
      document.body.appendChild(printFrame);
      if (isIE) {
        printFrame.contentDocument.write(content);
        printFrame.contentDocument.execCommand('print');
        printFrame.parentNode.removeChild(printFrame);
        printFrame = null;
      } else {
        printFrame.onload = (ev) => {
          if (ev.target.src) {
            ev.target.contentWindow.print();
          }
          setTimeout(() => {
            printFrame.parentNode.removeChild(printFrame);
            printFrame = null;
          });
        };
        printFrame.src = URL.createObjectURL(blob);
      }
    });
  };

  const prefixCls = getPrefixCls('table');

  return (
    <span className={`${prefixCls}-print`} title={t('qm.table.print.text')} onClick={() => printHandle()}>
      <i className={`svgicon icon`}>
        <PrinterOutlined />
      </i>
    </span>
  );
};

export default TablePrint;
