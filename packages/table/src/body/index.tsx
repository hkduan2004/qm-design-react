/*
 * @Author: 焦质晔
 * @Date: 2021-12-25 17:30:54
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-19 20:40:33
 */
import React from 'react';
import classNames from 'classnames';
import addEventListener from 'add-dom-event-listener';
import { isEqual } from 'lodash-es';
import TableContext from '../context';
import { deepFindRowKey, getCellValue, getVNodeText, parseHeight, isArrayContain, getAllTableData, deepGetRowkey } from '../utils';
import { isObject, isValidElement, camelize, noop, trueNoop } from '../../../_utils/util';
import { prevent } from '../../../_utils/dom';
import { warn } from '../../../_utils/error';
import { getPrefixCls } from '../../../_utils/prefix';
import { EMPTY_MIN_HEIGHT } from '../table/types';
import TableManager from '../manager';
import useValueFormat from './useValueFormat';
import useUpdateEffect from '../../../hooks/useUpdateEffect';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useForceUpdate from '../../../hooks/useForceUpdate';
import config from '../config';

import type { IColumn, IRecord, IRowColSpan, IRowKey, IClicked, TableBodyRef } from '../table/types';
import type { IDict } from '../../../_utils/types';

import { ReactSortable } from 'react-sortablejs';
import Selection from '../selection';
import Expandable from '../expandable';
import CellEdit from '../edit';

type IBodyProps = {
  tableData: IRecord[];
  flattenColumns: IColumn[];
};

const TableBody = React.forwardRef<TableBodyRef, IBodyProps>((props, ref) => {
  const { tableData, flattenColumns } = props;
  const {
    getRowKey,
    tableProps,
    tableRef,
    editableColumns,
    leftFixedColumns,
    rightFixedColumns,
    firstDataIndex,
    sorter,
    layout,
    showFooter,
    scrollX,
    scrollY,
    selectionKeys,
    rowExpandedKeys,
    highlightKey,
    isPingLeft,
    isPingRight,
    isTableEmpty,
    isTreeTable,
    isGroupSubtotal,
    isWebPagination,
    setElementStore,
    createTableFullData,
    setSelectionKeys,
    setHighlightKey,
    getStickyLeft,
    getStickyRight,
    scrollXToColumn,
    scrollYToRecord,
    rowInViewport,
    tableChange,
    setPingLeft,
    setPingRight,
    setFullScreen,
    findParentRowKeys,
    getAllChildRowKeys,
    triggerScrollYEvent,
    scrollBottomDebouncer,
  } = React.useContext(TableContext)!;
  const {
    height,
    minHeight,
    maxHeight,
    rowSelection,
    rowHighlight,
    treeConfig,
    expandable,
    stripe,
    summation,
    rowStyle,
    cellStyle,
    spanMethod,
    ellipsis,
    showHeader,
    rowDraggable,
    onRowClick,
    onRowDblclick,
    onRowContextmenu,
    onRowEnter,
  } = tableProps;

  const tableBodyRef = React.useRef<HTMLTableElement>(null);
  const ySpaceRef = React.useRef<HTMLDivElement>(null);
  const scrollBarRef = React.useRef({ prevST: 0, prevSL: 0 });
  const utils = useValueFormat();

  const wrapStyle = React.useMemo(() => {
    const { headerHeight, viewportHeight, footerHeight, tableFullHeight, tableAutoHeight } = layout;
    const result: React.CSSProperties = {};
    if (isTableEmpty) {
      Object.assign(result, { minHeight: `${EMPTY_MIN_HEIGHT}px` });
    }
    if (minHeight) {
      Object.assign(result, { minHeight: `${(parseHeight(minHeight) as number) - headerHeight - footerHeight}px` });
    }
    if (maxHeight) {
      Object.assign(result, { maxHeight: `${(parseHeight(maxHeight) as number) - headerHeight - footerHeight}px` });
    }
    if (height || tableFullHeight || tableAutoHeight) {
      return { ...result, height: `${viewportHeight}px` };
    }
    return result;
  }, [height, maxHeight, minHeight, isTableEmpty, layout]);

  const bodyWidth = React.useMemo(() => {
    const { tableBodyWidth, gutterWidth } = layout;
    return tableBodyWidth && scrollY ? tableBodyWidth - gutterWidth : tableBodyWidth;
  }, [layout, scrollY]);

  const innerViewRows = React.useMemo(() => {
    const { scrollYStore } = tableRef.current;
    const { viewportHeight, gutterWidth } = layout;
    return Math.floor((scrollX ? viewportHeight - gutterWidth : viewportHeight) / scrollYStore.rowHeight);
  }, [layout, scrollX]);

  const [clicked, setClicked] = React.useState<IClicked>([]);

  const forceUpdate = useForceUpdate();

  const isOutside = useOutsideClick(tableBodyRef, [`.table-editable__popper`]);

  // 公开方法
  React.useImperativeHandle(ref, () => ({
    renderCellTitle,
    setClickedValues,
    forceUpdate,
  }));

  useUpdateEffect(() => {
    if (isOutside) {
      setClickedValues([]);
    }
  }, [isOutside]);

  useUpdateEffect(() => {
    if (!clicked.length) return;
    TableManager.focus(tableRef.current.uid);
  }, [clicked]);

  React.useEffect(() => {
    createElementStore();
  }, []);

  // ===========================================================

  const scrollEventHandle = (ev: React.SyntheticEvent<HTMLDivElement>) => {
    const { elementStore, scrollYLoad } = tableRef.current;
    const { prevST, prevSL } = scrollBarRef.current;
    const scrollBarWidth = scrollY ? layout.gutterWidth : 0;
    const { scrollTop: st, scrollLeft: sl } = ev.target as HTMLDivElement;
    if (sl !== prevSL) {
      if (showHeader) {
        elementStore[`$header`]!.scrollLeft = sl;
      }
      if (showFooter) {
        elementStore[`$footer`]!.scrollLeft = sl;
      }
      const _isPingLeft = sl > 0;
      const _isPingRight = Math.ceil(sl) + layout.tableWidth < layout.tableBodyWidth + scrollBarWidth;
      if (isPingLeft !== _isPingLeft) {
        setPingLeft(_isPingLeft);
      }
      if (isPingRight !== _isPingRight) {
        setPingRight(_isPingRight);
      }
    }
    if (scrollYLoad && st !== prevST) {
      triggerScrollYEvent(st);
    }
    if (scrollY && st !== prevST) {
      const outerHeight = elementStore[`$tableYspace`]!.offsetHeight || elementStore[`$tableBody`]!.offsetHeight;
      if (Math.ceil(st) + layout.viewportHeight - scrollBarWidth >= outerHeight) {
        scrollBottomDebouncer(ev);
      }
    }
    scrollBarRef.current.prevST = st;
    scrollBarRef.current.prevSL = sl;
  };

  const keyboardEvent = React.useCallback(
    (ev: KeyboardEvent) => {
      const { keyCode } = ev;
      if (tableRef.current.uid !== TableManager.getFocusInstance()?.id) return;
      // Esc
      if (keyCode === 27) {
        setClickedValues([]);
        setHighlightKey('');
        setFullScreen(false);
      }
      if (!clicked.length) return;
      // Enter
      if (keyCode === 13) {
        prevent(ev);
        if (rowSelection?.type === 'radio' || rowHighlight) {
          const rowKey = selectionKeys[0] ?? highlightKey ?? null;
          const row = tableData.find((record) => getRowKey(record, record.index) === rowKey) ?? null;
          row && onRowEnter?.(row, ev);
        }
      }
      // 上  下
      if (keyCode === 38 || keyCode === 40) {
        prevent(ev);
        const { allTableData } = tableRef.current;
        const pageTableData = isWebPagination ? getAllTableData(tableData) : allTableData;
        const total = pageTableData.length;
        let index = pageTableData.findIndex((row) => getRowKey(row, row.index) === clicked[0]);
        const xIndex = keyCode === 38 ? (--index + total) % total : ++index % total;
        const row = pageTableData[xIndex];
        const rowKey = getRowKey(row, row.index);
        // 行单选
        if (rowSelection?.type === 'radio' && !rowSelection.disabled?.(row)) {
          setSelectionKeys([rowKey]);
        }
        // 行高亮
        if (rowHighlight && !rowHighlight.disabled?.(row)) {
          setHighlightKey(rowKey);
        }
        // 滚动条定位
        if (!rowInViewport(xIndex)) {
          if (keyCode === 38) {
            scrollYToRecord(rowKey, xIndex);
          }
          if (keyCode === 40) {
            scrollYToRecord(rowKey, innerViewRows > xIndex + 1 ? 0 : xIndex + 1 - innerViewRows);
          }
        }
        setClickedValues([rowKey, clicked[1]]);
      }
      // Tab
      if (keyCode === 9) {
        prevent(ev);
        // 非可编辑单元格
        if (!editableColumns.length) {
          return setClickedValues([]);
        }
        const total = editableColumns.length;
        let index = editableColumns.findIndex((x) => x.dataIndex === clicked[1]);
        const yIndex = ++index % total;
        const dataIndex = editableColumns[yIndex].dataIndex;
        setClickedValues([clicked[0], dataIndex]);
        scrollXToColumn(dataIndex);
      }
    },
    [clicked, tableData, selectionKeys, editableColumns, innerViewRows]
  );

  React.useEffect(() => {
    const keybordEvent = addEventListener(document, 'keydown', keyboardEvent);
    return () => keybordEvent.remove();
  }, [keyboardEvent]);

  // =================================================================================

  const createElementStore = () => {
    setElementStore(`$tableBody`, tableBodyRef.current!);
    setElementStore(`$tableYspace`, ySpaceRef.current!);
  };

  const cellClickHandle = (ev: React.MouseEvent<HTMLTableCellElement>, row: IRecord, column: IColumn) => {
    const { dataIndex } = column;
    if ([config.expandableColumn, config.operationColumn].includes(dataIndex)) return;
    const rowKey = getRowKey(row, row.index);
    // 设置 clicked 坐标
    setClickedValues([rowKey, dataIndex]);
    // 判断单元格是否可编辑
    const options = column.editRender?.(row, column);
    const isEditable = options && !options.disabled;
    // 正处于编辑状态的单元格
    // const isEditing = this[`${rowKey}_${dataIndex}_ref`]?.isEditing;
    // 行选中
    const { type, checkStrictly = true, disabled = noop } = rowSelection || {};
    if (type && !disabled(row) && !isEditable) {
      if (type === 'radio') {
        setSelectionKeys([rowKey]);
      }
      if (type === 'checkbox') {
        if (isTreeTable && !checkStrictly) {
          setTreeSelectionKeys(rowKey, selectionKeys);
        } else {
          setSelectionKeys(!selectionKeys.includes(rowKey) ? [...selectionKeys, rowKey] : selectionKeys.filter((x) => x !== rowKey));
        }
      }
    }
    // 单击 展开列、可选择列、操作列 不触发行单击事件
    if (['__selection__'].includes(dataIndex)) return;
    // 行高亮
    if (rowHighlight && !rowHighlight.disabled?.(row) && !isEditable) {
      setHighlightKey(rowKey);
    }
    // 行单击
    onRowClick?.(row, column, ev);
  };

  const cellDbclickHandle = (ev: React.MouseEvent<HTMLTableCellElement>, row: IRecord, column: IColumn) => {
    const { dataIndex } = column;
    if ([config.expandableColumn, config.selectionColumn, config.operationColumn].includes(dataIndex)) return;
    onRowDblclick?.(row, column, ev);
  };

  const cellContextmenuHandle = (ev: React.MouseEvent<HTMLTableCellElement>, row: IRecord, column: IColumn) => {
    const { dataIndex } = column;
    if ([config.expandableColumn, config.selectionColumn, config.operationColumn].includes(dataIndex)) return;
    onRowContextmenu?.(row, column, ev);
  };

  const setClickedValues = (arr: IClicked) => {
    if (isEqual(arr, clicked)) return;
    setClicked(arr);
  };

  const setTreeSelectionKeys = (key: IRowKey, arr: IRowKey[]) => {
    // on(选中)  off(取消)
    const state = !arr.includes(key) ? 'on' : 'off';
    const selectedKeys = createTreeSelectionKeys(key, arr, state);
    setSelectionKeys(selectedKeys);
  };

  const createTreeSelectionKeys = (key: IRowKey, arr: IRowKey[], state: string) => {
    const { deriveRowKeys } = tableRef.current;
    const target = deepFindRowKey(deriveRowKeys, key);
    let result: IRowKey[] = [];
    // 后代节点 rowKeys
    const childRowKeys = getAllChildRowKeys(target?.children || []);
    // 祖先节点 rowKeys
    // const parentRowKeys = findParentRowKeys(deriveRowKeys, key);
    const parentRowKeys = deepGetRowkey(deriveRowKeys, key)?.slice(0, -1).reverse() || [];
    // 处理后代节点
    if (state === 'on') {
      result = [...new Set([...arr, key, ...childRowKeys])];
    } else {
      result = arr.filter((x) => ![key, ...childRowKeys].includes(x));
    }
    // 处理祖先节点
    parentRowKeys.forEach((x) => {
      const target = deepFindRowKey(deriveRowKeys, x);
      const isContain = isArrayContain(result, target?.children?.map((k) => k.rowKey) || []);
      if (isContain) {
        result = [...result, x];
      } else {
        result = result.filter((k) => k !== x);
      }
    });
    return result;
  };

  // 判断树节点
  const mayTreeNode = (row: IRecord) => {
    return Array.isArray(row.children) && row.children.length > 0;
  };

  const renderRows = (list: IRecord[], depth = 0) => {
    const rows: React.ReactElement[] = [];
    list.forEach((row, rowIndex) => {
      // 行记录 rowKey
      const rowKey = getRowKey(row, row.index);
      // 普通行
      rows.push(renderRow(row, rowIndex, rowKey, depth));
      // 展开行
      if (expandable?.expandedRowRender) {
        const { expandedRowClassName, rowExpandable = trueNoop } = expandable;
        // 展开状态
        if (rowExpandable(row) && rowExpandedKeys.includes(rowKey)) {
          rows.push(
            <tr key={`expand_${rowKey}`} className={`body--row-expanded`}>
              <td colSpan={flattenColumns.length} className={`body--column`} style={{ paddingLeft: !rowSelection ? `50px` : `100px` }}>
                <div className={classNames(`cell`, expandedRowClassName)}>{expandable.expandedRowRender(row, rowIndex)}</div>
              </td>
            </tr>
          );
        }
      }
      // 树表格
      if (!treeConfig?.virtual && mayTreeNode(row)) {
        // 展开状态
        if (rowExpandedKeys.includes(rowKey)) {
          rows.push(...renderRows(row.children, depth + 1));
        }
      }
    });
    return rows;
  };

  const renderRow = (row: IRecord, rowIndex: number, rowKey: IRowKey, depth = 0) => {
    const cls = [
      `body--row`,
      {
        [`body--row-striped`]: stripe && rowIndex % 2 !== 0,
        [`body--row-selected`]: selectionKeys.includes(rowKey),
        [`body--row-current`]: highlightKey === rowKey,
        ...(isGroupSubtotal ? createGroupRowCls(row._group) : null),
      },
    ];
    return (
      <tr key={rowKey} data-row-key={rowKey} className={classNames(cls)}>
        {flattenColumns.map((column, columnIndex) => renderColumn(column, columnIndex, row, rowIndex, rowKey, depth))}
      </tr>
    );
  };

  const renderColumn = (column: IColumn, columnIndex: number, row: IRecord, rowIndex: number, rowKey: IRowKey, depth: number) => {
    const { isIE } = tableRef.current;
    const { dataIndex, fixed, align, className = '' } = column;
    const { rowSpan, colSpan } = getSpan(row, column, rowIndex, columnIndex);
    const isEllipsis = column.ellipsis ?? ellipsis;
    if (!rowSpan || !colSpan) {
      return null;
    }
    const cls = [
      `body--column`,
      {
        [`col--ellipsis`]: isEllipsis,
        [`col--center`]: align === 'center',
        [`col--right`]: align === 'right',
        [`column--sort`]: !!sorter[dataIndex],
        [`cell-fix-left`]: !isIE && fixed === 'left',
        [`cell-fix-right`]: !isIE && fixed === 'right',
        [`cell-fix-left-last`]: !isIE && fixed === 'left' && leftFixedColumns[leftFixedColumns.length - 1].dataIndex === dataIndex,
        [`cell-fix-right-first`]: !isIE && fixed === 'right' && rightFixedColumns[0].dataIndex === dataIndex,
        [className]: !!className,
      },
    ];
    const stys = !isIE
      ? {
          left: fixed === 'left' ? `${getStickyLeft(dataIndex)}px` : '',
          right: fixed === 'right' ? `${getStickyRight(dataIndex)}px` : '',
        }
      : null;
    const trExtraStys = rowStyle ? (typeof rowStyle === 'function' ? rowStyle(row, rowIndex) : rowStyle) : null;
    const tdExtraStys = cellStyle ? (typeof cellStyle === 'function' ? cellStyle(row, column, rowIndex, columnIndex) : cellStyle) : null;
    const groupStys = isGroupSubtotal ? getGroupStyles(row._group) : null;
    return (
      <td
        key={dataIndex}
        title={isEllipsis ? renderCellTitle(column, row, rowIndex, columnIndex) : undefined}
        rowSpan={rowSpan}
        colSpan={colSpan}
        className={classNames(cls)}
        style={{ ...stys, ...groupStys, ...trExtraStys, ...tdExtraStys }}
        onClick={(ev) => cellClickHandle(ev, row, column)}
        onDoubleClick={(ev) => cellDbclickHandle(ev, row, column)}
        onContextMenu={(ev) => cellContextmenuHandle(ev, row, column)}
      >
        <div className={`cell`}>{renderCell(column, row, rowIndex, columnIndex, rowKey, depth)}</div>
      </td>
    );
  };

  const renderCell = (column: IColumn, row: IRecord, rowIndex: number, columnIndex: number, rowKey: IRowKey, depth: number) => {
    const { dataIndex, editRender, render } = column;
    const cellValue = getCellValue(row, dataIndex);
    if (dataIndex === config.expandableColumn) {
      const { rowExpandable = trueNoop } = expandable!;
      // Expandable -> 受控组件
      return rowExpandable(row) ? <Expandable record={row} rowKey={rowKey} /> : null;
    }
    if (dataIndex === config.selectionColumn) {
      // Selection -> 受控组件
      return <Selection selectionKeys={selectionKeys} column={column} record={row} rowKey={rowKey} />;
    }
    // 单元格文本
    const text = renderText(cellValue, column, row);
    if (editRender) {
      // CellEdit -> UI 组件，无状态组件
      return <CellEdit column={column} record={row} rowKey={rowKey} columnKey={dataIndex} clicked={clicked} text={text} />;
    }
    const vNodeText = render ? render(cellValue, row, column, rowIndex, columnIndex) : text;
    // Tree Expandable + vNodeText
    if (isTreeTable && dataIndex === firstDataIndex) {
      return [
        renderIndent(!treeConfig?.virtual ? depth : row._level),
        <Expandable key="expand" record={row} rowKey={rowKey} style={mayTreeNode(row) ? {} : { visibility: 'hidden' }} />,
        vNodeText,
      ];
    }
    return vNodeText;
  };

  const renderCellTitle = (column: IColumn, row: IRecord, rowIndex: number, columnIndex: number) => {
    const { dataIndex, render } = column;
    if ([config.expandableColumn, config.selectionColumn, config.operationColumn].includes(dataIndex)) {
      return '';
    }
    let title = '';
    const text = getCellValue(row, dataIndex);
    if (typeof render === 'function') {
      const result = render(text, row, column, rowIndex, columnIndex);
      if (isValidElement(result)) {
        title = getVNodeText(result).join('');
      } else {
        title = result as string;
      }
    } else {
      title = renderText(text, column, row).toString();
    }
    return title;
  };

  const renderText = (text: string | number, column: IColumn, row: IRecord) => {
    const { dictItems, precision, formatType, editRender } = column;
    const dicts: IDict[] = dictItems || editRender?.(row, column)?.items || [];
    const target = dicts.find((x) => x.value == text);
    let result = target?.text ?? text ?? '';
    // 数据是数组的情况
    if (Array.isArray(text)) {
      result = text
        .map((x) => {
          const target = dicts.find((k) => k.value == x);
          return target?.text ?? x;
        })
        .join(',');
    }
    // 处理数值精度
    if (precision! >= 0 && result !== '') {
      result = Number(result).toFixed(precision);
    }
    // 处理换行符
    if (typeof result === 'string') {
      result = result.replace(/[\r\n]/g, '');
    }
    // 处理数据格式化
    if (formatType) {
      const render = utils[`${camelize(formatType)}Format`];
      if (!render) {
        warn('Table', '字段的格式化类型 `formatType` 配置不正确');
      } else {
        result = render(result);
      }
    }
    return result;
  };

  const getSpan = (row: IRecord, column: IColumn, rowIndex: number, columnIndex: number): IRowColSpan => {
    let rowSpan = 1;
    let colSpan = 1;
    const fn = spanMethod;
    if (typeof fn === 'function') {
      const result = fn({ row, column, rowIndex, columnIndex, tableData });
      if (Array.isArray(result)) {
        rowSpan = result[0];
        colSpan = result[1];
      } else if (isObject(result)) {
        rowSpan = result.rowSpan;
        colSpan = result.colSpan;
      }
      // 内存分页 或 虚拟滚动 支持动态合并行
      if (row === tableData[0] && rowSpan === 0) {
        rowSpan = 1;
        for (let i = 1; i < tableData.length; i++) {
          const { rowSpan: rs } = getSpan(tableData[i], column, tableData[i].index, columnIndex);
          if (rs > 0) break;
          rowSpan++;
        }
      }
    }
    return { rowSpan, colSpan };
  };

  const renderIndent = (level: number) => {
    return level ? (
      <span key={level} className={`cell--indent indent-level-${level}`} style={{ paddingLeft: `${level * config.treeTable.textIndent}px` }} />
    ) : null;
  };

  const getGroupStyles = (dataIndex: string): React.CSSProperties => {
    const { backgroundColor, color } = summation!.groupItems!.find((x) => x.dataIndex === dataIndex) ?? {};
    return { backgroundColor, color };
  };

  const createGroupRowCls = (dataIndex: string) => {
    const level = summation!.groupItems!.findIndex((x) => x.dataIndex === dataIndex);
    return {
      [`body--row-group_${level + 1}`]: level >= 0 ? true : false,
    };
  };

  const renderBodyXSpace = () => {
    return <div className={`body--x-space`} style={{ width: bodyWidth ? `${bodyWidth}px` : '' }} />;
  };

  const renderBodyYSpace = () => {
    return <div ref={ySpaceRef} className={`body--y-space`} />;
  };

  const renderColgroup = () => {
    return (
      <colgroup>
        {flattenColumns.map((column: IColumn) => {
          const { dataIndex, width, renderWidth } = column;
          return <col key={dataIndex} style={{ width: `${width || renderWidth}px`, minWidth: `${width || renderWidth}px` }} />;
        })}
      </colgroup>
    );
  };

  const setListHandle = (list: IRecord[]) => {
    const rks1 = list.map((x) => getRowKey(x, x.index));
    const rks2 = tableData.map((x) => getRowKey(x, x.index));
    if (isEqual(rks1, rks2)) return;
    const records: IRecord[] = [];
    tableRef.current.tableFullData.forEach((row) => {
      if (tableData.includes(row)) {
        records.push(list.shift() as IRecord);
      } else {
        records.push(row);
      }
    });
    createTableFullData(records);
    tableChange();
  };

  const prefixCls = getPrefixCls('table');

  return (
    <div className={`${prefixCls}--body-wrapper`} style={{ ...wrapStyle }} onScroll={scrollEventHandle}>
      {renderBodyYSpace()}
      {renderBodyXSpace()}
      <table ref={tableBodyRef} className={`${prefixCls}--body`} cellSpacing="0" cellPadding="0" style={{ width: bodyWidth ? `${bodyWidth}px` : '' }}>
        {renderColgroup()}
        {!rowDraggable ? (
          <tbody>{renderRows(tableData)}</tbody>
        ) : (
          <ReactSortable
            itemKey={(row: IRecord) => getRowKey(row, row.index)}
            tag="tbody"
            animation={200}
            list={tableData as any[]}
            setList={setListHandle}
          >
            {tableData.map((row, index) => renderRow(row, index, getRowKey(row, row.index)))}
          </ReactSortable>
        )}
      </table>
    </div>
  );
});

TableBody.displayName = 'TableBody';

export default TableBody;
