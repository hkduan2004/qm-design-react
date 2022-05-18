/*
 * @Author: 焦质晔
 * @Date: 2022-05-17 13:03:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-17 15:45:21
 */
import React from 'react';
import TableContext from '../context';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';
import { setCellValue } from '../utils';

import type { IColumn, IRecord } from '../table/types';

import { QmButton, QmForm, QmFormItem } from '../../../index';

type ISettingProps = {
  columns: IColumn[];
  onClose: () => void;
};

const Setting: React.FC<ISettingProps> = (props) => {
  const { columns, onClose } = props;
  const { tableRef, tableBodyRef, dataChange } = React.useContext(TableContext)!;

  const formRef = React.useRef<QmForm>(null);

  const createFormItems = (): QmFormItem[] => {
    return [
      {
        type: 'INPUT_NUMBER',
        label: t('qm.table.clipboard.rowIndex'),
        fieldName: 'rowIndex',
        options: {
          min: 1,
        },
        extra: {
          labelWidth: 50,
        },
        rules: [{ required: true }],
      },
      {
        type: 'SELECT',
        label: t('qm.table.clipboard.colIndex'),
        fieldName: 'dataIndex',
        options: {
          itemList: columns.map((x, i) => ({ value: i, text: x.title })),
        },
        rules: [{ required: true }],
        extra: {
          labelWidth: 50,
        },
      },
      {
        type: 'TEXT_AREA',
        label: t('qm.table.clipboard.content'),
        fieldName: 'content',
        placeholder: t('qm.table.clipboard.placeholder'),
        options: {
          autoSize: {
            minRows: 4,
          },
        },
        rules: [{ required: true }],
      },
    ];
  };

  const [formItems, setFormItems] = React.useState<QmFormItem[]>(createFormItems());

  const initialValue: Record<string, any> = {};

  const initialExtra: Record<string, string> = {
    rowIndex: '行',
    dataIndex: '列',
  };

  const confirmHandle = async () => {
    const [err, data] = await formRef.current!.GET_FORM_DATA();
    if (err) return;
    const { tableFullData, store } = tableRef.current;
    // 解析 excel 数据
    const rows = data.content.replace(/(\r|\n)$/, '').split(/\r|\n/);
    rows.forEach((row, index) => {
      const vals = row.split(/\t/);
      vals.forEach((x, i) => {
        const record: IRecord = tableFullData[data.rowIndex - 1 + index];
        const column: IColumn = columns[data.dataIndex + i];
        if (record && column) {
          setCellValue(record, column.dataIndex, x);
          store.addToUpdated(record);
        }
      });
    });
    tableBodyRef.current!.forceUpdate();
    dataChange();
    onClose();
  };

  const prefixCls = getPrefixCls('table');

  return (
    <div className={`${prefixCls}-clipboard__setting`}>
      <h3 className={`info`}>{t('qm.table.clipboard.supportText')}</h3>
      <QmForm ref={formRef} initialValues={initialValue} initialExtras={initialExtra} items={formItems} cols={1} labelWidth={100} />
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
        <QmButton onClick={() => onClose()} style={{ marginRight: 8 }}>
          {t('qm.table.export.closeButton')}
        </QmButton>
        <QmButton type="primary" onClick={() => confirmHandle()}>
          {t('qm.table.clipboard.text')}
        </QmButton>
      </div>
    </div>
  );
};

export default Setting;
