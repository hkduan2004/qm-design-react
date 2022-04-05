/*
 * @Author: 焦质晔
 * @Date: 2021-12-31 14:15:29
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-10 15:32:35
 */
import React from 'react';
import classNames from 'classnames';
import { cloneDeep, xor, isEqual } from 'lodash-es';
import ConfigContext from '../../../config-provider/context';
import TableContext from '../context';
import { t } from '../../../locale';
import { getPrefixCls } from '../../../_utils/prefix';
import { BUILT_IN_PLACEMENTS, MIN_POPPER_WIDTH } from '../table/types';
import useUpdateEffect from '../../../hooks/useUpdateEffect';

import type { IColumn, IFixed } from '../table/types';

import { ReactSortable } from 'react-sortablejs';
import { Checkbox } from '../../../antd';
import { QmButton } from '../../../index';
import { SettingOutlined, HolderOutlined, StepBackwardOutlined, StepForwardOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Trigger from 'rc-trigger';

type IColumnFilterProps = {
  columns: IColumn[];
};

const ColumnFilter: React.FC<IColumnFilterProps> = (props) => {
  const { columns } = props;
  const { global } = React.useContext(ConfigContext)!;
  const { tableProps, tableRef, $size } = React.useContext(TableContext)!;
  const { uniqueKey, onlyShowIcon, columnsChange } = tableProps;

  const colGroups = React.useRef<IColumn[][]>([]); // 表头跨列分组
  const columnsRef = React.useRef<IColumn[]>([]);

  const [visible, setVisible] = React.useState<boolean>(false);
  const [leftFixedColumns, setLeftFixedColumns] = React.useState<IColumn[]>(columns.filter((x) => !x.noAuth && x.fixed === 'left'));
  const [rightFixedColumns, setRightFixedColumns] = React.useState<IColumn[]>(columns.filter((x) => !x.noAuth && x.fixed === 'right'));
  const [mainColumns, setMainColumns] = React.useState<IColumn[]>(columns.filter((x) => !x.noAuth && !x.fixed));

  const tableUniqueKey = React.useMemo(() => {
    return uniqueKey ? `table_${uniqueKey}` : '';
  }, [uniqueKey]);

  const realColumns = React.useMemo<IColumn[]>(() => {
    return [...leftFixedColumns, ...mainColumns, ...rightFixedColumns];
  }, [leftFixedColumns, mainColumns, rightFixedColumns]);

  useUpdateEffect(() => {
    createColGroups();
    createColumns(columns);
    setLocalColumns(columns);
  }, [columns]);

  useUpdateEffect(() => {
    if (isEqual(getValidProperty(realColumns), columnsRef.current)) return;
    setColumnsRef(realColumns);
    changeHandle();
  }, [realColumns]);

  React.useEffect(() => {
    setColumnsRef(realColumns);
    initLocalColumns();
  }, []);

  // =========================================

  const getTableColumnsConfig = async (key: string) => {
    const fetchFn = global?.['getComponentConfigApi'];
    if (!fetchFn) return;
    try {
      const res = await fetchFn({ key });
      if (res.code === 200) {
        return res.data;
      }
    } catch (err) {
      // ...
    }
  };

  const saveTableColumnsConfig = async (key: string, value: unknown) => {
    const fetchFn = global?.['saveComponentConfigApi'];
    if (!fetchFn) return;
    try {
      await fetchFn({ [key]: value });
    } catch (err) {
      // ...
    }
  };

  const getLocalColumns = () => {
    if (!tableUniqueKey) return;
    // 本地存储
    const localColumns: IColumn[] = JSON.parse(localStorage.getItem(tableUniqueKey) as string);
    // 服务端获取
    if (!localColumns) {
      getTableColumnsConfig(tableUniqueKey)
        .then((result) => {
          if (!result) {
            return setLocalColumns(columns);
          }
          localStorage.setItem(tableUniqueKey, JSON.stringify(result));
          initLocalColumns();
        })
        .catch(() => {});
    }
    if (!localColumns) return;
    const diffs = xor(
      localColumns.map((x) => x.dataIndex),
      columns.map((x) => x.dataIndex)
    );
    if (diffs.length > 0) {
      return columns.map((column) => {
        const { dataIndex } = column;
        const target = localColumns.find((x) => x.dataIndex === dataIndex);
        if (!target) {
          return column;
        }
        if (typeof target.hidden !== 'undefined') {
          column.hidden = target.hidden;
        }
        if (typeof target.fixed !== 'undefined') {
          column.fixed = target.fixed;
        }
        if (typeof target.width !== 'undefined') {
          column.width = target.width;
        }
        if (typeof target.renderWidth !== 'undefined') {
          column.renderWidth = target.renderWidth;
        }
        return column;
      });
    }
    return localColumns.map((x) => {
      const target = columns.find((k) => k.dataIndex === x.dataIndex)!;
      if (typeof x.fixed === 'undefined') {
        delete target.fixed;
      }
      return { ...target, ...x };
    });
  };

  const setLocalColumns = (columns: IColumn[]) => {
    if (!tableUniqueKey) return;
    const result = columns.map((x) => {
      const target: any = {};
      if (typeof x.hidden !== 'undefined') {
        target.hidden = x.hidden;
      }
      if (typeof x.fixed !== 'undefined') {
        target.fixed = x.fixed;
      }
      if (typeof x.width !== 'undefined') {
        target.width = x.width;
      }
      if (typeof x.renderWidth !== 'undefined') {
        target.renderWidth = x.renderWidth;
      }
      return {
        dataIndex: x.dataIndex,
        ...target,
      };
    });
    const localColumns: IColumn[] = JSON.parse(localStorage.getItem(tableUniqueKey) as string);
    if (isEqual(result, localColumns)) return;
    // 本地存储
    localStorage.setItem(tableUniqueKey, JSON.stringify(result));
    // 服务端存储
    saveTableColumnsConfig(tableUniqueKey, result);
  };

  const initLocalColumns = () => {
    const localColumns = getLocalColumns();
    if (!localColumns) return;
    createColumns(localColumns);
  };

  // =================================================

  const getValidProperty = (columns: IColumn[]): IColumn[] => {
    return columns.map((x) => ({
      dataIndex: x.dataIndex,
      title: x.title,
      hidden: x.hidden,
      fixed: x.fixed,
      width: x.width,
      renderWidth: x.renderWidth,
    }));
  };

  const setColumnsRef = (columns: IColumn[]) => {
    columnsRef.current = getValidProperty(columns);
  };

  const createColumns = (columns: IColumn[]) => {
    setLeftFixedColumns(columns.filter((x) => !x.noAuth && x.fixed === 'left'));
    setRightFixedColumns(columns.filter((x) => !x.noAuth && x.fixed === 'right'));
    setMainColumns(columns.filter((x) => !x.noAuth && !x.fixed));
  };

  const createColGroups = () => {
    const results: IColumn[][] = [];
    columns
      .filter((column) => !column.noAuth)
      .forEach((column, i) => {
        const colSpan = column.colSpan!;
        if (colSpan > 1 && columns.slice(i + 1, i + colSpan).every(({ colSpan }) => colSpan === 0)) {
          results.push(columns.slice(i, i + colSpan));
        }
      });
    colGroups.current = results;
  };

  const resetColumnsHandle = () => {
    const originColumns = cloneDeep(tableRef.current.originColumns);
    createColumns(originColumns);
    columnsChange?.(originColumns);
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
            if (typeof column.fixed !== 'undefined') {
              target.fixed = column.fixed;
            } else if (target.fixed) {
              delete target.fixed;
            }
          }
          return target;
        })
      );
    });
    columns.forEach((column: IColumn, index: number) => {
      if (column.noAuth) {
        resultColumns.splice(index, 0, column);
      }
    });
    columnsChange?.(resultColumns);
  };

  const fixedChangeHandle = (column: IColumn, dir: IFixed) => {
    column.fixed = dir;
    createColumns(columns);
  };

  const cancelFixedHandle = (column: IColumn) => {
    delete column.fixed;
    createColumns(columns);
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
            createColumns(columns);
          }}
        />
        <i className={classNames(cls)} title={t('qm.table.columnFilter.draggable')}>
          <HolderOutlined />
        </i>
        <span className={`text`} title={column.title}>
          {column.title}
        </span>
        {type === 'main' ? (
          <span className={`fixed`}>
            <i className={`svgicon`} title={t('qm.table.columnFilter.fixedLeft')} onClick={() => fixedChangeHandle(column, 'left')}>
              <StepBackwardOutlined />
            </i>
            <i className={`svgicon`} title={t('qm.table.columnFilter.fixedRight')} onClick={() => fixedChangeHandle(column, 'right')}>
              <StepForwardOutlined />
            </i>
          </span>
        ) : (
          <span className={`fixed`}>
            <i className={`svgicon`} title={t('qm.table.columnFilter.cancelFixed')} onClick={() => cancelFixedHandle(column)}>
              <CloseCircleOutlined />
            </i>
          </span>
        )}
      </li>
    );
  };

  const renderColumnFilter = () => {
    return (
      <div className={`column-filter--wrap`} style={{ maxHeight: `calc(100vh - 10px)` }}>
        <div className={`reset`}>
          <QmButton type="text" size="small" onClick={resetColumnsHandle}>
            {t('qm.table.columnFilter.reset')}
          </QmButton>
        </div>
        <div className={`left`}>
          <ReactSortable
            itemKey="dataIndex"
            handle=".left-handle"
            tag="ul"
            animation={200}
            list={leftFixedColumns as any}
            setList={(list) => {
              const dis1: string[] = list.map((x) => x.dataIndex);
              const dis2: string[] = leftFixedColumns.map((x) => x.dataIndex);
              if (isEqual(dis1, dis2)) return;
              setLeftFixedColumns(list as unknown as IColumn[]);
            }}
          >
            {leftFixedColumns.map((column) => renderListItem(column, 'left'))}
          </ReactSortable>
        </div>
        <div className={`divider`} />
        <div className={`main`}>
          <ReactSortable
            itemKey="dataIndex"
            handle=".main-handle"
            tag="ul"
            animation={200}
            list={mainColumns as any}
            setList={(list) => {
              const dis1: string[] = list.map((x) => x.dataIndex);
              const dis2: string[] = mainColumns.map((x) => x.dataIndex);
              if (isEqual(dis1, dis2)) return;
              setMainColumns(list as unknown as IColumn[]);
            }}
          >
            {mainColumns.map((column) => renderListItem(column, 'main'))}
          </ReactSortable>
        </div>
        <div className={`divider`} />
        <div className={`right`}>
          <ReactSortable
            itemKey="dataIndex"
            handle=".right-handle"
            tag="ul"
            animation={200}
            list={rightFixedColumns as any}
            setList={(list) => {
              const dis1: string[] = list.map((x) => x.dataIndex);
              const dis2: string[] = rightFixedColumns.map((x) => x.dataIndex);
              if (isEqual(dis1, dis2)) return;
              setRightFixedColumns(list as unknown as IColumn[]);
            }}
          >
            {rightFixedColumns.map((column) => renderListItem(column, 'right'))}
          </ReactSortable>
        </div>
      </div>
    );
  };

  // ==========================================

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
      popupPlacement="bottomRight"
      popupTransitionName="ant-slide-up"
    >
      <span className={classNames(filterCls)} title={onlyShowIcon ? t('qm.table.columnFilter.text') : undefined}>
        <i className={`svgicon icon`}>
          <SettingOutlined />
        </i>
        {!onlyShowIcon && <span>{t('qm.table.columnFilter.text')}</span>}
      </span>
    </Trigger>
  );
};

export default ColumnFilter;
