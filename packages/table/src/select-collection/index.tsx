/*
 * @Author: 焦质晔
 * @Date: 2022-01-06 10:22:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-06 14:40:12
 */
import React from 'react';
import { get } from 'lodash-es';
import TableContext from '../context';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';

import Result from './result';
import { QmModal } from '../../../index';
import { CheckSquareOutlined } from '@ant-design/icons';

import type { IColumn, IRowKey } from '../table/types';

type ISelectCollectionProps = {
  columns: IColumn[];
};

const SelectCollection: React.FC<ISelectCollectionProps> = (props) => {
  const { columns } = props;
  const { tableProps, isFetch, setSelectionKeys } = React.useContext(TableContext)!;
  const { rowSelection } = tableProps;

  const [visible, setVisible] = React.useState<boolean>(false);

  React.useEffect(() => {
    getSelectionRows();
  }, []);

  const getSelectionRows = async () => {
    const { fetchSelectedRowKeys: fetch, disabled } = rowSelection!;
    if (!(isFetch && fetch)) return;
    try {
      const res = await fetch.api(fetch.params);
      if (res.code === 200) {
        const results: IRowKey[] = Array.isArray(res.data) ? res.data : get(res.data, fetch.dataKey!) ?? [];
        setSelectionKeys(results);
      }
    } catch (err) {
      // ...
    }
  };

  const prefixCls = getPrefixCls('table');

  const wrapProps = {
    visible,
    title: t('qm.table.selectCollection.settingTitle'),
    loading: false,
    bodyStyle: { paddingBottom: '52px' },
    onClose: () => setVisible(false),
  };

  return (
    <>
      <span className={`${prefixCls}-select-collection`} title={t('qm.table.selectCollection.text')} onClick={() => setVisible(true)}>
        <i className={`svgicon icon`}>
          <CheckSquareOutlined />
        </i>
      </span>
      <QmModal {...wrapProps}>
        <Result columns={columns} onClose={() => setVisible(false)} />
      </QmModal>
    </>
  );
};

export default SelectCollection;
