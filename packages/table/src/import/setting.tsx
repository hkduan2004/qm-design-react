/*
 * @Author: 焦质晔
 * @Date: 2022-04-28 08:29:16
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-28 14:01:31
 */
import React from 'react';
import classNames from 'classnames';
import TableContext from '../context';
import useExport from '../export/useExport';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { sleep } from '../../../_utils/util';
import config from '../config';

import SelectFile from './SelectFile';
import { QmButton, QmForm, QmFormItem } from '../../../index';

import { IColumn, IRecord } from '../table/types';

type ISettingProps = {
  columns: IColumn[];
  onClose: () => void;
};

const Setting: React.FC<ISettingProps> = (props) => {
  const { columns, onClose } = props;
  const { tableRef } = React.useContext(TableContext)!;

  const { importXLSX } = useExport();

  const formRef = React.useRef<QmForm>(null);

  const [loading, setLoading] = React.useState<boolean>(false);

  const createColumns = (columns: IColumn[]) => {
    return columns.filter(
      (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
    );
  };

  const createFormItems = (): QmFormItem[] => {
    return [
      {
        type: 'INPUT',
        label: '文件名',
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
        label: '文件类型',
        fieldName: 'fileType',
        allowClear: false,
        options: {
          itemList: [{ text: 'xlsx', value: 'xlsx' }],
        },
      },
      {
        type: 'SELECT',
        label: '导入模式',
        fieldName: 'importType',
        allowClear: false,
        options: {
          itemList: [
            { text: '新增', value: 'add' },
            { text: '插入', value: 'insert' },
          ],
        },
        onChange: (val) => {
          formItems.find((x) => x.fieldName === 'posIndex')!.hidden = val === 'add';
          setFormItems([...formItems]);
        },
      },
      {
        type: 'INPUT_NUMBER',
        label: '插入位置',
        fieldName: 'posIndex',
        hidden: true,
        options: {
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
    importType: 'add',
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
      // console.log(22, records);
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
        <QmButton type="primary" loading={loading} onClick={() => confirmHandle()}>
          {t('qm.table.import.text')}
        </QmButton>
      </div>
    </div>
  );
};

export default Setting;
