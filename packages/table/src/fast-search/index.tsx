/*
 * @Author: 焦质晔
 * @Date: 2022-01-06 14:31:17
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-17 16:34:52
 */
import React from 'react';
import TableContext from '../context';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';
import { SizeHeight } from '../../../_utils/types';

import Setting from './setting';
import { QmModal } from '../../../index';
import { MonitorOutlined } from '@ant-design/icons';

const FastSearch: React.FC = () => {
  const { tableProps, $size } = React.useContext(TableContext)!;

  const [visible, setVisible] = React.useState<boolean>(false);

  const prefixCls = getPrefixCls('table');

  const wrapProps = {
    visible,
    title: t('qm.table.fastSearch.settingTitle'),
    width: 600,
    loading: false,
    bodyStyle: { paddingBottom: `${SizeHeight[$size] + 20}px` },
    onClose: () => setVisible(false),
  };

  return (
    <>
      <span className={`${prefixCls}-super-search`} title={t('qm.table.fastSearch.text')} onClick={() => setVisible(true)}>
        <i className={`svgicon icon`}>
          <MonitorOutlined />
        </i>
      </span>
      <QmModal {...wrapProps}>
        <Setting onClose={() => setVisible(false)} />
      </QmModal>
    </>
  );
};

export default FastSearch;
