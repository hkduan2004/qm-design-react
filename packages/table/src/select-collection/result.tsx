/*
 * @Author: 焦质晔
 * @Date: 2022-01-06 10:58:43
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-16 20:43:34
 */
import React from 'react';
import TableContext from '../context';
import { t } from '../../../locale';
import config from '../config';

import Table from '../table';
import { QmButton } from '../../../index';

import type { IColumn } from '../table/types';

type IResultProps = {
  columns: IColumn[];
  onClose: () => void;
};

const Result: React.FC<IResultProps> = (props) => {
  const { columns, onClose } = props;
  const { tableProps, tableRef, $size, selectionKeys, setSelectionKeys } = React.useContext(TableContext)!;
  const { rowKey } = tableProps;

  const filterColumns = (columns: IColumn[]) => {
    return columns.map((column) => {
      const item: IColumn = {
        dataIndex: column.dataIndex,
        title: column.title,
        width: column.width,
        precision: column.precision,
        dictItems: column.dictItems ?? [],
        render: column.render,
      };
      if (Array.isArray(column.children)) {
        item.children = filterColumns(column.children);
      }
      return item;
    });
  };

  const createColumns = () => {
    return [
      {
        title: t('qm.table.groupSummary.index'),
        dataIndex: 'pageIndex',
        width: 80,
        render: (text: number) => {
          return text + 1;
        },
      },
      ...filterColumns(
        columns.filter(
          (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
        )
      ),
    ];
  };

  const createTableList = () => {
    return tableRef.current.selectionRows.map((row) => {
      const item = {
        ...row,
        children: undefined,
      };
      return item;
    });
  };

  const [tableColumns, setTableColumns] = React.useState<IColumn[]>(createColumns());

  const [tableList] = React.useState(createTableList());

  return (
    <>
      <Table
        size={$size}
        columns={tableColumns}
        dataSource={tableList}
        rowKey={rowKey}
        minHeight={338}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectionKeys,
          onChange: (val) => setSelectionKeys(val),
        }}
        webPagination={true}
        ignorePageIndex={true}
        showFastSearch={false}
        showTableImport={false}
        showSelectCollection={false}
        showFullScreen={false}
        showColumnDefine={false}
        columnsChange={(columns) => setTableColumns(columns)}
      />
      <div style={{ height: 10 }} />
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
        <QmButton onClick={() => onClose()}>{t('qm.table.selectCollection.closeButton')}</QmButton>
      </div>
    </>
  );
};

export default Result;
