/*
 * @Author: 焦质晔
 * @Date: 2021-12-26 09:35:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-01 16:23:48
 */
import React from 'react';
import classNames from 'classnames';
import ConfigContext from '../../../config-provider/context';
import TableContext from '../context';
import config from '../config';
import { getPrefixCls } from '../../../_utils/prefix';

import { Pagination } from '../../../antd';
import type { IPaginationConfig } from '../table/types';

type IPagerProps = {
  current: number;
  pageSize: number;
  total: number;
  config?: Pick<IPaginationConfig, 'pageSizeOptions' | 'showSizeChanger' | 'showQuickJumper'>;
  onChange: (current: number, pageSize: number) => void;
};

enum EPageSize {
  small = 'small',
  middle = 'default',
  large = 'default',
}

const TablePager: React.FC<IPagerProps> = (props) => {
  const { current, pageSize, total, config: pagerConfig, onChange } = props;

  const { global } = React.useContext(ConfigContext)!;
  const { $size, setElementStore } = React.useContext(TableContext)!;

  const pagerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    createElementStore();
  }, []);

  const createElementStore = () => {
    setElementStore(`$pager`, pagerRef.current!);
  };

  const triggerChange = (current: number, pageSize: number) => {
    onChange(current, pageSize);
  };

  const showSizeChanger = pagerConfig?.showSizeChanger || config.pagination.showSizeChanger;
  const showQuickJumper = pagerConfig?.showQuickJumper || config.pagination.showQuickJumper;
  const pageSizeOptions = pagerConfig?.pageSizeOptions || global?.table?.pagination?.pageSizeOptions || config.pagination.pageSizeOptions;

  const prefixCls = getPrefixCls('table');
  const cls = {
    [`${prefixCls}-pager`]: true,
  };

  return (
    <div ref={pagerRef} className={classNames(cls)}>
      <Pagination
        size={EPageSize[$size]}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        pageSizeOptions={pageSizeOptions as unknown as string[]}
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={triggerChange}
        onShowSizeChange={triggerChange}
      />
    </div>
  );
};

export default TablePager;
