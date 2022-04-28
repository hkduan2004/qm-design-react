/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 11:07:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-28 12:35:11
 */
import React from 'react';
import classNames from 'classnames';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';

import type { IColumn } from '../table/types';

import { QmModal } from '../../../index';
import Setting from './setting';
import { UploadOutlined } from '@ant-design/icons';

type ITableImportProps = {
  tableColumns: IColumn[];
};

const TableImport: React.FC<ITableImportProps> = (props) => {
  const { tableColumns } = props;

  const [visible, setVisible] = React.useState<boolean>(false);

  const prefixCls = getPrefixCls('table');

  const cls = {
    [`${prefixCls}-import`]: true,
  };

  const wrapProps = {
    visible,
    title: t('qm.table.import.settingTitle'),
    width: 600,
    height: 'auto',
    loading: false,
    bodyStyle: { paddingBottom: '52px' },
    onClose: () => setVisible(false),
  };

  return (
    <>
      <span className={classNames(cls)} title={t('qm.table.import.text')} onClick={() => setVisible(true)}>
        <i className={`svgicon icon`}>
          <UploadOutlined />
        </i>
      </span>
      <QmModal {...wrapProps}>
        <Setting columns={tableColumns} onClose={() => setVisible(false)} />
      </QmModal>
    </>
  );
};

export default TableImport;
