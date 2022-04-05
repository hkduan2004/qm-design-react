/*
 * @Author: 焦质晔
 * @Date: 2021-12-30 15:47:35
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-31 14:10:10
 */
import React from 'react';
import TableContext from '../context';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';

import { ReloadOutlined } from '@ant-design/icons';

const Reload: React.FC = () => {
  const { getTableData } = React.useContext(TableContext)!;

  const prefixCls = getPrefixCls('table');

  return (
    <span className={`${prefixCls}-reload`} title={t('qm.table.refresh.text')} onClick={() => getTableData()}>
      <i className={`svgicon icon`}>
        <ReloadOutlined />
      </i>
    </span>
  );
};

export default Reload;
