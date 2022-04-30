/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 17:05:56
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-16 20:45:04
 */
import React from 'react';
import dayjs from 'dayjs';
import { maxBy, minBy, sumBy } from 'lodash-es';
import TableContext from '../context';
import { getCellValue, groupByProps, setCellValue } from '../utils';
import { t } from '../../../locale';
import config from '../config';

import type { IColumn, IFetchParams, IRecord } from '../table/types';

import Table from '../table';

type IResultProps = {
  columns: IColumn[];
  group: IRecord[];
  summary: IRecord[];
};

const Result: React.FC<IResultProps> = (props) => {
  const { columns, group, summary } = props;
  const { tableRef, tableProps, $size, pagination, fetchParams, isFetch } = React.useContext(TableContext)!;
  const { fetch } = tableProps;

  const formatColumn = (dataIndex: string): Partial<IColumn> => {
    const column = columns.find((x) => x.dataIndex === dataIndex)!;
    return {
      title: column.title,
      precision: column.precision,
      dictItems: column.dictItems ?? [],
    };
  };

  const groupColumns = group.map((x) => ({
    dataIndex: x.group,
    ...formatColumn(x.group),
  })) as IColumn[];

  const summaryColumns = summary.map((x) => {
    if (x.summary === config.groupSummary.total.value) {
      return { dataIndex: x.summary, title: config.groupSummary.total.text, formula: x.formula };
    }
    return { dataIndex: x.summary, ...formatColumn(x.summary), formula: x.formula };
  }) as Array<IColumn & { formula: string }>;

  const createFetchParams = React.useMemo<IFetchParams>(() => {
    return Object.assign({}, fetchParams, {
      [config.sorterFieldName]: undefined,
      [config.groupSummary.summaryFieldName]: summary.map((x) => `${x.formula}|${x.summary}`).join(','),
      [config.groupSummary.groupbyFieldName]: group.map((x) => x.group).join(','),
      usedJH: 2, // 分组合计 -> 2
      [config.currentPageName]: 1,
    });
  }, [fetchParams, group, summary]);

  const createTableColumns = (groupColumns: IColumn[], summaryColumns: Array<IColumn & { formula: string }>): IColumn[] => {
    return [
      {
        title: t('qm.table.groupSummary.index'),
        dataIndex: 'pageIndex',
        width: 80,
        render: (text: number) => {
          return text + 1;
        },
      },
      ...groupColumns.map((x) => ({
        title: x.title,
        dataIndex: x.dataIndex,
        dictItems: x.dictItems,
      })),
      ...summaryColumns.map((x) => {
        const groupSummary = columns.find((k) => k.dataIndex === x.dataIndex)?.groupSummary;
        let summation: any = groupSummary ? { summation: groupSummary } : null;
        if (x.dataIndex === config.groupSummary.total.value) {
          summation = { dataIndex: config.groupSummary.recordTotalIndex, summation: { render: () => pagination.total } };
        }
        return {
          ...x,
          ...(x.formula === 'count' || x.formula === 'sum' ? summation : null),
        };
      }),
    ];
  };

  const createvTableData = (list: IRecord[]): IRecord[] => {
    const result = groupByProps(
      list,
      group.map((x) => x.group)
    );
    // =================
    const res: IRecord[] = [];
    result.forEach((arr) => {
      const record: any = {};
      tableColumns.forEach((x) => {
        const { dataIndex } = x;
        if (dataIndex === 'index') return;
        setCellValue(record, dataIndex, getCellValue(arr[0], dataIndex));
      });
      summary.forEach((x) => {
        const key = x.summary !== config.groupSummary.total.value ? x.summary : config.groupSummary.recordTotalIndex;
        const fn = x.formula;
        if (fn === 'count') {
          setCellValue(record, key, arr.length);
        }
        if (fn === 'sum') {
          setCellValue(record, key, sumBy(arr, key));
        }
        if (fn === 'max') {
          setCellValue(record, key, maxBy(arr, key)[key]);
        }
        if (fn === 'min') {
          setCellValue(record, key, minBy(arr, key)[key]);
        }
        if (fn === 'avg') {
          setCellValue(record, key, (sumBy(arr, key) / arr.length).toFixed(2));
        }
      });
      res.push(record);
    });
    // =================
    return res;
  };

  const [tableColumns, setTableColumns] = React.useState<IColumn[]>(createTableColumns(groupColumns, summaryColumns));

  const [tableData] = React.useState<IRecord[]>(!isFetch ? createvTableData(tableRef.current.tableFullData) : []);

  const wrapProps = {
    size: $size,
    height: 400,
    ...(isFetch
      ? {
          fetch: {
            api: fetch!.api,
            params: createFetchParams,
            dataKey: fetch?.dataKey,
          },
        }
      : {
          dataSource: tableData,
        }),
    columns: tableColumns,
    rowKey: (record) => record.index,
    showFastSearch: false,
    showTableImport: false,
    exportExcel: {
      fileName: `${dayjs().format('YYYYMMDDHHmmss')}.xlsx`,
    },
    tablePrint: {
      showLogo: true,
    },
    columnsChange: (columns) => setTableColumns(columns),
  };

  return <Table {...wrapProps} />;
};

export default Result;
