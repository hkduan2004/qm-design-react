/*
 * @Author: 焦质晔
 * @Date: 2022-01-09 13:53:52
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-10 10:01:20
 */
import React from 'react';
import classNames from 'classnames';
import { isEqual } from 'lodash-es';
import TableContext from '../context';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';
import { BUILT_IN_PLACEMENTS, MIN_POPPER_WIDTH } from '../table/types';
import useUpdateEffect from '../../../hooks/useUpdateEffect';

import type { IColumn } from '../table/types';

import { ReactSortable } from 'react-sortablejs';
import { Checkbox } from '../../../antd';
import { SettingOutlined, HolderOutlined } from '@ant-design/icons';
import Trigger from 'rc-trigger';

type IDefineProps = {
  columns: IColumn[];
  onChange: (columns: IColumn[]) => void;
};

const Define: React.FC<IDefineProps> = (props) => {
  const { columns, onChange } = props;
  const { $size } = React.useContext(TableContext)!;

  const colGroups = React.useRef<IColumn[][]>([]); // 表头跨列分组
  const [visible, setVisible] = React.useState<boolean>(false);
  const [realColumns, setRealColumns] = React.useState<IColumn[]>(columns);

  useUpdateEffect(() => {
    changeHandle();
  }, [realColumns]);

  React.useEffect(() => {
    createColGroups();
  }, [columns]);

  const createColGroups = () => {
    const results: IColumn[][] = [];
    columns.forEach((column, i) => {
      const colSpan = column.colSpan!;
      if (colSpan > 1 && columns.slice(i + 1, i + colSpan).every(({ colSpan }) => colSpan === 0)) {
        results.push(columns.slice(i, i + colSpan));
      }
    });
    colGroups.current = results;
  };

  const changeHandle = () => {
    const resultColumns: IColumn[] = [];
    realColumns.forEach((column) => {
      const { colSpan, dataIndex } = column;
      if (colSpan === 0) return;
      if (colSpan === 1) {
        return resultColumns.push(column);
      }
      const groupIndex = colGroups.current.findIndex((group) => group.map((x) => x.dataIndex).includes(dataIndex));
      if (groupIndex === -1) {
        return resultColumns.push(column);
      }
      resultColumns.push(
        ...colGroups[groupIndex].map(({ dataIndex }, index) => {
          const target = realColumns.find((x) => x.dataIndex === dataIndex)!;
          if (index > 0) {
            if (typeof column.hidden !== 'undefined') {
              target.hidden = column.hidden;
            }
          }
          return target;
        })
      );
    });
    onChange?.(resultColumns);
  };

  const renderListItem = (column: IColumn, type: string) => {
    const { colSpan } = column;
    if (colSpan === 0) {
      return <li key={column.dataIndex} style={{ display: 'none' }} />;
    }
    const cls = [`svgicon`, `handle`, `${type}-handle`];
    return (
      <li key={column.dataIndex} className={`item`}>
        <Checkbox
          disabled={column.required}
          checked={!column.hidden}
          onChange={(ev) => {
            const { checked } = ev.target;
            column.hidden = !checked;
            setRealColumns([...realColumns]);
          }}
        />
        <i className={classNames(cls)} title={t('qm.table.columnFilter.draggable')}>
          <HolderOutlined />
        </i>
        <span className={`text`} title={column.title}>
          {column.title}
        </span>
      </li>
    );
  };

  const renderColumnFilter = () => {
    return (
      <div className={`column-filter--wrap`} style={{ overflowY: 'auto', maxHeight: `calc(100vh - 10px)` }}>
        <div className={`main`}>
          <ReactSortable
            itemKey="dataIndex"
            handle=".main-handle"
            tag="ul"
            animation={200}
            list={realColumns as any}
            setList={(list) => {
              const dis1: string[] = list.map((x) => x.dataIndex);
              const dis2: string[] = realColumns.map((x) => x.dataIndex);
              if (isEqual(dis1, dis2)) return;
              setRealColumns(list as unknown as IColumn[]);
            }}
          >
            {realColumns.map((column) => renderListItem(column, 'main'))}
          </ReactSortable>
        </div>
      </div>
    );
  };

  // ===============================================

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const prefixCls = getPrefixCls('table');

  const popperCls = {
    [`${prefixCls}__popper`]: true,
    [`column-filter__popper`]: true,
    [`${prefixCls}--lg`]: $size === 'large',
    [`${prefixCls}--sm`]: $size === 'small',
  };

  const filterCls = [
    `${prefixCls}-column-filter`,
    {
      [`selected`]: visible,
    },
  ];

  return (
    <Trigger
      action={['click']}
      popupVisible={visible}
      popup={renderColumnFilter()}
      popupClassName={classNames(popperCls)}
      popupStyle={{ minWidth: MIN_POPPER_WIDTH }}
      onPopupVisibleChange={handleVisibleChange}
      builtinPlacements={BUILT_IN_PLACEMENTS}
      prefixCls="ant-select-dropdown"
      popupPlacement="bottomLeft"
      popupTransitionName="ant-slide-up"
    >
      <span className={classNames(filterCls)} title={t('qm.table.columnFilter.text')}>
        <i className={`svgicon icon`}>
          <SettingOutlined />
        </i>
        <span>{t('qm.table.columnFilter.text')}</span>
      </span>
    </Trigger>
  );
};

export default Define;
