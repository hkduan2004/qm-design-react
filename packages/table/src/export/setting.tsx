/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 12:44:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-10 09:46:19
 */
import React from 'react';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import TableContext from '../context';
import { t } from '../../../locale';
import { sleep } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { DEFAULT_FILENAME_FORMAT } from '../table/types';

import { IColumn } from '../table/types';

import Define from './define';
import { QmButton, QmForm, QmFormItem } from '../../../index';

type ISettingProps = {
  defaultValue: any;
  onClose: () => void;
  onOk: (data: any) => void;
};

const Setting: React.FC<ISettingProps> = (props) => {
  const { defaultValue, onClose, onOk } = props;
  const { tableProps, pagination, showSummary } = React.useContext(TableContext)!;
  const { rowSelection } = tableProps;

  const formRef = React.useRef<QmForm>(null);

  const [loading, setLoading] = React.useState<boolean>(false);

  const getInitialvalue = () => {
    return Object.assign(
      {},
      {
        fileName: `${dayjs().format(DEFAULT_FILENAME_FORMAT)}.xlsx`,
        fileType: 'xlsx',
        sheetName: 'sheet1',
        exportType: 'all',
        'startIndex|endIndex': [1, pagination.total],
        footSummation: showSummary ? 1 : 0,
        useStyle: 0,
      },
      defaultValue,
      {
        columns: cloneDeep(defaultValue.columns || []),
      }
    );
  };

  const createFormItems = (): QmFormItem[] => {
    return [
      {
        type: 'INPUT',
        label: t('qm.table.export.fileName'),
        fieldName: 'fileName',
      },
      {
        type: 'SELECT',
        label: t('qm.table.export.fileType'),
        fieldName: 'fileType',
        options: {
          itemList: [
            { text: 'xlsx', value: 'xlsx' },
            { text: 'csv', value: 'csv' },
          ],
        },
      },
      {
        type: 'INPUT',
        label: t('qm.table.export.sheetName'),
        fieldName: 'sheetName',
      },
      {
        type: 'RANGE_INPUT_NUMBER',
        fieldName: 'startIndex|endIndex',
        label: {
          type: 'SELECT',
          fieldName: 'exportType',
          options: {
            itemList: [
              { text: t('qm.table.export.all'), value: 'all' },
              { text: t('qm.table.export.selected'), value: 'selected', disabled: rowSelection?.type !== 'checkbox' },
              { text: t('qm.table.export.custom'), value: 'custom' },
            ],
          },
          onChange: (val: string): void => {
            formItems.find((x) => x.fieldName === 'startIndex|endIndex')!.disabled = val !== 'custom';
            setFormItems([...formItems]);
          },
        },
        options: {
          min: 1,
        },
        disabled: true,
      },
      {
        type: 'INPUT',
        label: t('qm.table.columnFilter.text'),
        fieldName: 'columns',
        render: (_, instance) => {
          return (
            <Define
              columns={instance.state.formData.columns}
              onChange={(columns: IColumn[]): void => {
                instance.SET_FIELDS_VALUE({ columns });
              }}
            />
          );
        },
      },
      {
        type: 'CHECKBOX',
        label: t('qm.table.export.footSummation'),
        fieldName: 'footSummation',
        disabled: !showSummary,
        options: {
          trueValue: 1,
          falseValue: 0,
        },
      },
      {
        type: 'CHECKBOX',
        label: t('qm.table.export.useStyle'),
        fieldName: 'useStyle',
        options: {
          trueValue: 1,
          falseValue: 0,
        },
      },
    ];
  };

  const initialValue = React.useMemo(() => getInitialvalue(), []);

  const [formItems, setFormItems] = React.useState<QmFormItem[]>(createFormItems());

  const confirmHandle = async () => {
    const [err, data] = await formRef.current!.GET_FORM_DATA();
    if (err) return;
    setLoading(true);
    for (const key in data) {
      if (key === 'footSummation' || key === 'useStyle') {
        data[key] = !!data[key];
      }
    }
    onOk(data);
    await sleep(1000);
    setLoading(false);
    onClose();
  };

  const prefixCls = getPrefixCls('table');

  return (
    <div className={`${prefixCls}-export__setting`}>
      <QmForm ref={formRef} initialValues={initialValue} items={formItems} cols={1} labelWidth={100} />
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
          {t('qm.table.export.text')}
        </QmButton>
      </div>
    </div>
  );
};

export default Setting;
