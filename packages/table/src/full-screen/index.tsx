/*
 * @Author: 焦质晔
 * @Date: 2021-12-30 15:47:35
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-30 16:03:52
 */
import React from 'react';
import TableContext from '../context';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';

import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';

type IFullScreenProps = {
  isFullScreen: boolean;
};

const FullScreen: React.FC<IFullScreenProps> = (props) => {
  const { isFullScreen } = props;

  const { setFullScreen } = React.useContext(TableContext)!;

  const prefixCls = getPrefixCls('table');

  return (
    <span
      className={`${prefixCls}-full-screen`}
      title={!isFullScreen ? t('qm.table.screen.full') : t('qm.table.screen.cancelFull')}
      onClick={() => {
        setFullScreen(!isFullScreen);
      }}
    >
      <i className={`svgicon icon`}>{!isFullScreen ? <FullscreenOutlined /> : <FullscreenExitOutlined />}</i>
    </span>
  );
};

export default FullScreen;
