/*
 * @Author: 焦质晔
 * @Date: 2021-12-28 13:12:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-29 11:15:59
 */
import React from 'react';
import classNames from 'classnames';
import TableContext from '../context';
import { getPrefixCls } from '../../../_utils/prefix';
import { formatDate, getDate } from '../utils';
import { isEmpty } from '../../../_utils/util';
import { t } from '../../../locale';
import { warn } from '../../../_utils/error';
import { BUILT_IN_PLACEMENTS, DATE_FORMAT, MIN_POPPER_WIDTH } from '../table/types';
import type { IColumn, IFilter } from '../table/types';

import { QmButton } from '../../../index';
import { Space, Input, InputNumber, DatePicker, Radio, Checkbox } from '../../../antd';
import Trigger from 'rc-trigger';
import FilterIcon from '../icon/filter';

type IHeadFilterProps = {
  column: IColumn;
  filters: IFilter;
};

const HeadFilter: React.FC<IHeadFilterProps> = (props) => {
  const { column, filters } = props;
  const { $size, setFilters, clearSuperFilters } = React.useContext(TableContext)!;

  const textRef = React.useRef<any>(null);
  const numberRef = React.useRef<any>(null);
  const textareaRef = React.useRef<any>(null);

  const [visible, setVisible] = React.useState<boolean>(false);
  const [filterState, setFilterState] = React.useState<IFilter>({});

  const dataKey = React.useMemo(() => {
    const { dataIndex, filter } = column;
    return `${dataIndex}|${filter!.type}`;
  }, [column]);

  const isActived = React.useMemo(() => {
    let res = !1; // 假设非激活状态
    for (const key in filters[dataKey]) {
      if (!isEmpty(filters[dataKey][key])) {
        res = !0;
        break;
      }
    }
    return res;
  }, [dataKey, filters]);

  React.useEffect(() => {
    if (visible) {
      isEmpty(filters[dataKey]) && clearFilter();
      setTimeout(() => createFocus(), 50);
    }
  }, [visible]);

  // ============================================

  const clearFilter = () => {
    setFilterState({});
  };

  const createFocus = () => {
    const type = column.filter!.type;
    switch (type) {
      case 'text':
        textRef.current!.focus();
        break;
      case 'number':
        numberRef.current!.focus();
        break;
      case 'textarea':
        textareaRef.current!.focus();
        break;
      default:
        break;
    }
  };

  const filterEmptyValue = (values: IFilter) => {
    for (const dataKey in values) {
      for (const key in values[dataKey]) {
        if (isEmpty(values[dataKey][key])) {
          delete values[dataKey][key];
        }
      }
      if (!Object.keys(values[dataKey]).length) {
        delete values[dataKey];
      }
    }
    return values;
  };

  const doFinish = (values?: IFilter) => {
    values && setFilterState(values);
    clearSuperFilters();
    setFilters(filterEmptyValue({ ...filters, ...filterState, ...values }));
    handleVisibleChange(false);
  };

  const doReset = () => {
    doFinish({ [dataKey]: {} });
  };

  const handle = {
    text: (column: IColumn) => {
      const { title } = column;
      return (
        <Input
          ref={textRef}
          size={$size}
          placeholder={t('qm.table.filter.searchText', { text: title })}
          style={{ width: '180px' }}
          value={filterState[dataKey]?.[`like`] ?? ''}
          onChange={(ev) => {
            const { value } = ev.target;
            setFilterState((prev) => Object.assign({}, prev, { [dataKey]: { [`like`]: value } }));
          }}
          onKeyDown={(ev) => {
            if (ev.keyCode === 13) {
              doFinish();
            }
          }}
        />
      );
    },
    textarea: (column: IColumn) => {
      const { title } = column;
      return (
        <Input.TextArea
          ref={textareaRef}
          size={$size}
          placeholder={t('qm.table.filter.searchAreaText', { text: title })}
          style={{ width: '220px' }}
          value={filterState[dataKey]?.[`likes`] ?? ''}
          onChange={(ev) => {
            const { value } = ev.target;
            setFilterState((prev) => Object.assign({}, prev, { [dataKey]: { [`likes`]: value } }));
          }}
          onKeyDown={(ev) => {
            if (ev.keyCode === 13) {
              doFinish();
            }
          }}
        />
      );
    },
    number: (column: IColumn) => {
      const inputPropsFn = (mark: string) => ({
        value: filterState[dataKey]?.[mark] ?? '',
        onChange: (value) => {
          setFilterState((prev) => Object.assign({}, prev, { [dataKey]: Object.assign({}, prev[dataKey], { [mark]: value }) }));
        },
        onKeyDown: (ev) => {
          if (ev.keyCode === 13) {
            doFinish();
          }
        },
      });
      return (
        <ul>
          <li>
            <span>&gt;&nbsp;</span>
            <InputNumber
              ref={numberRef}
              size={$size}
              {...inputPropsFn('>')}
              placeholder={t('qm.table.filter.gtPlaceholder')}
              style={{ width: '150px' }}
            />
          </li>
          <li>
            <span>&lt;&nbsp;</span>
            <InputNumber size={$size} {...inputPropsFn('<')} placeholder={t('qm.table.filter.ltPlaceholder')} style={{ width: '150px' }} />
          </li>
          <li>
            <span>=&nbsp;</span>
            <InputNumber size={$size} {...inputPropsFn('==')} placeholder={t('qm.table.filter.eqPlaceholder')} style={{ width: '150px' }} />
          </li>
          <li>
            <span>!=</span>
            <InputNumber size={$size} {...inputPropsFn('!=')} placeholder={t('qm.table.filter.neqPlaceholder')} style={{ width: '150px' }} />
          </li>
        </ul>
      );
    },
    date: (column: IColumn) => {
      const inputPropsFn = (mark: string) => ({
        value: getDate(filterState[dataKey]?.[mark], DATE_FORMAT),
        format: DATE_FORMAT,
        onChange: (value) => {
          setFilterState((prev) =>
            Object.assign({}, prev, { [dataKey]: Object.assign({}, prev[dataKey], { [mark]: formatDate(value, DATE_FORMAT) }) })
          );
        },
        onKeyDown: (ev) => {
          if (ev.keyCode === 13) {
            doFinish();
          }
        },
      });
      return (
        <ul>
          <li>
            <span>&gt;&nbsp;</span>
            <DatePicker size={$size} {...inputPropsFn('>')} placeholder={t('qm.table.filter.gtPlaceholder')} style={{ width: '150px' }} />
          </li>
          <li>
            <span>&lt;&nbsp;</span>
            <DatePicker size={$size} {...inputPropsFn('<')} placeholder={t('qm.table.filter.ltPlaceholder')} style={{ width: '150px' }} />
          </li>
          <li>
            <span>=&nbsp;</span>
            <DatePicker size={$size} {...inputPropsFn('==')} placeholder={t('qm.table.filter.eqPlaceholder')} style={{ width: '150px' }} />
          </li>
          <li>
            <span>!=</span>
            <DatePicker size={$size} {...inputPropsFn('!=')} placeholder={t('qm.table.filter.neqPlaceholder')} style={{ width: '150px' }} />
          </li>
        </ul>
      );
    },
    radio: (column: IColumn) => {
      const { filter, dictItems = [] } = column;
      const itemList = filter!.items || dictItems;
      return (
        <ul>
          <Radio.Group
            style={{ width: '100%' }}
            value={filterState[dataKey]?.[`==`]}
            onChange={(ev) => {
              const { value } = ev.target;
              setFilterState((prev) => Object.assign({}, prev, { [dataKey]: { [`==`]: value } }));
            }}
          >
            {itemList.map((x) => (
              <li key={x.value}>
                <Radio value={x.value} disabled={x.disabled}>
                  {x.text}
                </Radio>
              </li>
            ))}
          </Radio.Group>
        </ul>
      );
    },
    checkbox: (column: IColumn) => {
      const { filter, dictItems = [] } = column;
      const itemList = filter!.items || dictItems;
      return (
        <ul>
          <Checkbox.Group
            style={{ width: '100%' }}
            value={filterState[dataKey]?.[`in`]}
            onChange={(values) => {
              setFilterState((prev) => Object.assign({}, prev, { [dataKey]: { [`in`]: values } }));
            }}
          >
            {itemList.map((x) => (
              <li key={x.value}>
                <Checkbox value={x.value} disabled={x.disabled}>
                  {x.text}
                </Checkbox>
              </li>
            ))}
          </Checkbox.Group>
        </ul>
      );
    },
  };

  const renderContent = () => {
    const type = column.filter!.type;
    const renderFormItem = handle[type];
    if (!renderFormItem) {
      warn('Table', '表头筛选的类型 `type` 配置不正确');
      return null;
    }
    return (
      <div className={`head-filter--wrap`} onClick={(ev) => ev.stopPropagation()}>
        <div>{renderFormItem(column)}</div>
        {renderFormButton()}
      </div>
    );
  };

  const renderFormButton = () => {
    return (
      <Space style={{ width: '100%', marginTop: 8, justifyContent: 'flex-end' }}>
        <QmButton size={$size} onClick={() => doReset()}>
          {t('qm.table.filter.reset')}
        </QmButton>
        <QmButton type="primary" size={$size} onClick={() => doFinish()}>
          {t('qm.table.filter.search')}
        </QmButton>
      </Space>
    );
  };

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const prefixCls = getPrefixCls('table');

  const popperCls = {
    [`${prefixCls}__popper`]: true,
    [`${prefixCls}--lg`]: $size === 'large',
    [`${prefixCls}--sm`]: $size === 'small',
  };

  const filterCls = [
    `cell--filter`,
    {
      [`selected`]: visible,
      [`actived`]: isActived,
    },
  ];

  return (
    <Trigger
      action={['click']}
      popupVisible={visible}
      popup={renderContent()}
      popupClassName={classNames(popperCls)}
      popupStyle={{ minWidth: MIN_POPPER_WIDTH }}
      onPopupVisibleChange={handleVisibleChange}
      builtinPlacements={BUILT_IN_PLACEMENTS}
      prefixCls="ant-select-dropdown"
      popupPlacement="bottomRight"
      popupTransitionName="ant-slide-up"
    >
      <div className={classNames(filterCls)} title={t('qm.table.filter.text')} onClick={(ev) => ev.stopPropagation()}>
        <span className={`svgicon icon`}>
          <FilterIcon />
        </span>
      </div>
    </Trigger>
  );
};

export default HeadFilter;
