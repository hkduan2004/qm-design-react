/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-03 13:56:16
 */
import React from 'react';
import classNames from 'classnames';
import SplitContext from './context';
import ConfigContext from '../../config-provider/context';
import { debounce, noop, isFragment, isValidElement } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import useUpdateEffect from '../../hooks/useUpdateEffect';

import type { ISplitContext } from './context';
import type { QmSplitPaneProps } from './split-pane';

import ResizeBar from './resize-bar';
import SplitPane from './split-pane';

type IProps = {
  direction?: 'horizontal' | 'vertical';
  defaultValue?: number | string;
  uniqueKey?: string;
  className?: string;
  style?: React.CSSProperties;
  onDragStart?: (offset: number) => void;
  onDrag?: (offset: number) => void;
  onDragEnd?: (offset: number) => void;
  children?: React.ReactNode;
};

export type QmSplitProps = IProps;

const QmSplit: React.FC<IProps> & { Pane: React.FunctionComponent<QmSplitPaneProps> } = (props) => {
  const { direction = 'horizontal', defaultValue = '50%', uniqueKey, className, style, onDragStart, onDrag = noop, onDragEnd } = props;
  const { global } = React.useContext(ConfigContext)!;

  const splitRef = React.useRef<HTMLDivElement>(null);

  const isValidUnit = (value: string) => {
    return ['px', 'em', 'vw', 'vh', '%'].some((unit) => value.endsWith(unit));
  };

  const formatValue = (value: number | string) => {
    return Number(value) > 0 ? `${value}px` : isValidUnit(value.toString()) ? value.toString() : `${Number.parseFloat(value as string)}px`;
  };

  const toNumber = (value: string) => {
    return Number.parseInt(value, 10);
  };

  const createMinValue = (C: React.ReactElement) => {
    const val = Number.parseInt(C.props?.min || 0);
    return val >= 0 ? val : 0;
  };

  const spliterKey = React.useMemo(() => {
    return uniqueKey ? `split_${uniqueKey}` : '';
  }, [uniqueKey]);

  const [dragging, setDragging] = React.useState<boolean>(false);

  const [offset, setOffset] = React.useState<string>(formatValue(defaultValue));

  const dragDebouncer = debounce(onDrag, 10);

  const dragHandle = (value: string) => {
    setOffset(value);
    dragDebouncer(toNumber(value));
  };

  useUpdateEffect(() => {
    if (dragging) {
      onDragStart?.(toNumber(offset));
    } else {
      onDragEnd?.(toNumber(offset));
      localStorage.setItem(spliterKey, offset);
      saveSplitConfig(spliterKey, offset);
    }
  }, [dragging]);

  React.useEffect(() => {
    getLocalValue();
  }, []);

  // =============================================

  const getLocalValue = () => {
    if (!spliterKey) return;
    const localValue = localStorage.getItem(spliterKey);
    if (!localValue) {
      getSplitConfig(spliterKey)
        .then((result) => {
          localStorage.setItem(spliterKey, formatValue(result || defaultValue));
          getLocalValue();
        })
        .catch(() => {});
    } else {
      setOffset(formatValue(localValue));
    }
  };

  const getSplitConfig = async (key: string): Promise<string | void> => {
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

  const saveSplitConfig = async (key: string, value) => {
    const fetchFn = global?.['saveComponentConfigApi'];
    if (!fetchFn) return;
    try {
      await fetchFn({ [key]: value });
    } catch (err) {
      // ...
    }
  };

  // =============================================

  const context = React.useMemo<ISplitContext>(
    () => ({
      splitRef,
      direction,
      dragging,
    }),
    [direction, dragging]
  );

  const validChildren: React.ReactElement[] = [];

  React.Children.map(props.children, (node: React.ReactElement) => {
    if (!isValidElement(node) || isFragment(node)) return;
    if ((node.type as any)?.displayName === 'QmSplitPane') {
      validChildren.push(node);
    }
  });

  const [F, L] = validChildren;

  const minValues = React.useMemo(() => {
    return [createMinValue(F), createMinValue(L)];
  }, [F, L]);

  const prefixCls = getPrefixCls('split');

  const cls = {
    [prefixCls]: true,
    vertical: direction === 'vertical',
  };

  return (
    <SplitContext.Provider value={context}>
      <div ref={splitRef} className={classNames(cls, className)} style={style}>
        <SplitPane {...F.props} offset={offset} />
        <ResizeBar minValues={minValues} onDragChange={(bool) => setDragging(bool)} onDragging={dragHandle} />
        <SplitPane {...L.props} />
      </div>
    </SplitContext.Provider>
  );
};

QmSplit.Pane = SplitPane;
QmSplit.displayName = 'QmSplit';

export default QmSplit;
