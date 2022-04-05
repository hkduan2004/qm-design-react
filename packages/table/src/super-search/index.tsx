/*
 * @Author: 焦质晔
 * @Date: 2022-01-06 14:31:17
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-06 14:45:00
 */
import React from 'react';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';

import Result from './result';
import { QmModal } from '../../../index';
import { FunnelPlotOutlined } from '@ant-design/icons';

const SuperSearch: React.FC = () => {
  const [visible, setVisible] = React.useState<boolean>(false);

  const prefixCls = getPrefixCls('table');

  const wrapProps = {
    visible,
    title: t('qm.table.highSearch.settingTitle'),
    loading: false,
    bodyStyle: { paddingBottom: '52px' },
    onClose: () => setVisible(false),
  };

  return (
    <>
      <span className={`${prefixCls}-super-search`} title={t('qm.table.highSearch.text')} onClick={() => setVisible(true)}>
        <i className={`svgicon icon`}>
          <FunnelPlotOutlined />
        </i>
      </span>
      <QmModal {...wrapProps}>
        <Result onClose={() => setVisible(false)} />
      </QmModal>
    </>
  );
};

export default SuperSearch;
