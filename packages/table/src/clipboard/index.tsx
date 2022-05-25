/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 11:07:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 12:42:37
 */
import React from 'react';
import classNames from 'classnames';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';
import config from '../config';

import type { IColumn } from '../table/types';

import { QmModal } from '../../../index';
import { CopyOutlined } from '@ant-design/icons';
import Setting from './setting';

type ITableClipboardProps = {
  flattenColumns: IColumn[];
};

const TableClipboard: React.FC<ITableClipboardProps> = (props) => {
  const { flattenColumns } = props;

  const [visible, setVisible] = React.useState<boolean>(false);

  const createColumns = (columns: IColumn[]) => {
    return columns.filter(
      (column) => ![config.expandableColumn, config.selectionColumn, 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex)
    );
  };

  const columns = React.useMemo<IColumn[]>(() => {
    return createColumns(flattenColumns);
  }, [flattenColumns]);

  const prefixCls = getPrefixCls('table');

  const cls = {
    [`${prefixCls}-clipboard`]: true,
  };

  const wrapProps = {
    visible,
    title: t('qm.table.clipboard.settingTitle'),
    width: 600,
    height: 'auto',
    loading: false,
    bodyStyle: { paddingBottom: '52px' },
    onClose: () => setVisible(false),
  };

  return (
    <>
      <span className={classNames(cls)} title={t('qm.table.clipboard.text')} onClick={() => setVisible(true)}>
        <i className={`svgicon icon`}>
          <CopyOutlined />
        </i>
      </span>
      <QmModal {...wrapProps}>
        <Setting columns={columns} onClose={() => setVisible(false)} />
      </QmModal>
    </>
  );
};

export default TableClipboard;
