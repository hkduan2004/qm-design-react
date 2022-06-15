/*
 * @Author: 焦质晔
 * @Date: 2022-04-28 08:29:16
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-17 14:19:04
 */
import React from 'react';
import classNames from 'classnames';
import TableContext from '../context';
import useExport from '../export/useExport';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { sleep } from '../../../_utils/util';
import config from '../config';

import type { IColumn, IRecord } from '../table/types';
import type { QmFormRef } from '../../../index';

import SelectFile from './SelectFile';
import { QmButton, QmForm, QmFormItem } from '../../../index';

type ISettingProps = {
  columns: IColumn[];
  onClose: () => void;
};

const Setting: React.FC<ISettingProps> = (props) => {
  const { columns, onClose } = props;
  const { tableRef, createTableData } = React.useContext(TableContext)!;

  const { importXLSX } = useExport();

  const formRef = React.useRef<QmFormRef>(null);

  const [loading, setLoading] = React.useState<boolean>(false);

  const [disabled, setDisabled] = React.useState<boolean>(true);

  const createColumns = (columns: IColumn[]) => {
    return columns.filter(
      (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
    );
  };

  const createFormItems = (): QmFormItem[] => {
    return [
      {
        type: 'INPUT',
        label: t('qm.table.export.fileName'),
        fieldName: 'fileName',
        render: (_, instance) => {
          const { fileName } = instance.GET_FIELDS_VALUE(['fileName']);
          return (
            <>
              {!fileName ? (
                <SelectFile
                  fileType={instance.state.formData.fileType}
                  onChange={(fileName, file) => {
                    instance.SET_FIELDS_VALUE({ fileName, file });
                    file && setDisabled(false);
                  }}
                />
              ) : (
                <span>{fileName}</span>
              )}
            </>
          );
        },
      },
      {
        type: 'SELECT',
        label: t('qm.table.export.fileType'),
        fieldName: 'fileType',
        allowClear: false,
        options: {
          itemList: [{ text: 'xlsx', value: 'xlsx' }],
        },
      },
      {
        type: 'SELECT',
        label: t('qm.table.import.importType'),
        fieldName: 'importType',
        allowClear: false,
        options: {
          itemList: [
            { text: t('qm.table.import.fillText'), value: 'fill' },
            { text: t('qm.table.import.addText'), value: 'add' },
            { text: t('qm.table.import.insertText'), value: 'insert' },
          ],
        },
        onChange: (val) => {
          formItems.find((x) => x.fieldName === 'posIndex')!.hidden = val !== 'insert';
          setFormItems([...formItems]);
        },
      },
      {
        type: 'INPUT_NUMBER',
        label: t('qm.table.import.insertPos'),
        fieldName: 'posIndex',
        hidden: true,
        rules: [{ required: true }],
        options: {
          min: 1,
          max: tableRef.current!.tableFullData.length,
          formatter: (value) => `第 ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          parser: (value) => value.replace(/第\s?|(,*)/g, ''),
        },
        extra: {
          labelWidth: 50,
        },
      },
    ];
  };

  const initialValue: Record<string, any> = {
    fileType: 'xlsx',
    importType: 'fill',
  };
  const initialExtra: Record<string, string> = {
    posIndex: '条',
  };

  const [formItems, setFormItems] = React.useState<QmFormItem[]>(createFormItems());

  const confirmHandle = async () => {
    const [err, data] = await formRef.current!.GET_FORM_DATA();
    if (err) return;
    setLoading(true);
    importXLSX({ columns: createColumns(columns), file: data.file }, (records: IRecord[]) => {
      const { tableFullData, store } = tableRef.current;
      if (data.importType === 'fill') {
        createTableData(records);
      }
      if (data.importType === 'add') {
        createTableData([...tableFullData, ...records]);
      }
      if (data.importType === 'insert') {
        const { tableFullData } = tableRef.current!;
        const v = data.posIndex;
        const results: IRecord[] = tableFullData.slice(0, v).concat(records).concat(tableFullData.slice(v));
        createTableData(results);
      }
      // 添加表格操作记录
      records.forEach((row) => {
        store.addToInserted(row);
      });
    });
    await sleep(1000);
    setLoading(false);
    onClose();
  };

  const prefixCls = getPrefixCls('table');

  return (
    <div className={`${prefixCls}-import__setting`}>
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
        <QmButton type="primary" loading={loading} disabled={disabled} onClick={() => confirmHandle()}>
          {t('qm.table.import.text')}
        </QmButton>
      </div>
    </div>
  );
};

export default Setting;
