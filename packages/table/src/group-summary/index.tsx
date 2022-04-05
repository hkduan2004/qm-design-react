/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 14:07:55
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-09 18:09:07
 */
import React from 'react';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';

import Setting from './setting';
import { QmModal } from '../../../index';
import { PieChartOutlined } from '@ant-design/icons';

const GroupSummary: React.FC = () => {
  const [visible, setVisible] = React.useState<boolean>(false);

  const prefixCls = getPrefixCls('table');

  const wrapProps = {
    visible,
    title: t('qm.table.groupSummary.settingTitle'),
    loading: false,
    bodyStyle: { paddingBottom: '52px' },
    onClose: () => setVisible(false),
  };

  return (
    <>
      <span className={`${prefixCls}-group-summary`} title={t('qm.table.groupSummary.text')} onClick={() => setVisible(true)}>
        <i className={`svgicon icon`}>
          <PieChartOutlined />
        </i>
      </span>
      <QmModal {...wrapProps}>
        <Setting onClose={() => setVisible(false)} />
      </QmModal>
    </>
  );
};

export default GroupSummary;
