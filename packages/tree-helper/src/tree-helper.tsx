/*
 * @Author: 焦质晔
 * @Date: 2022-01-11 17:57:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-27 13:01:39
 */
import React from 'react';
import { get } from 'lodash-es';
import ConfigContext from '../../config-provider/context';
import { t } from '../../locale';
import { debounce } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { deepMapList } from '../../form/src/utils';
import { SizeHeight } from '../../_utils/types';
import useResizeObserve from '../../hooks/useResizeObserve';
import useUpdateEffect from '../../hooks/useUpdateEffect';

import type { IFetch, IRecord, ICheckStrategy } from '../../table/src/table/types';
import type { ComponentSize } from '../../_utils/types';

import { QmButton, QmSpin, Tree, Input } from '../../index';

type IProps = {
  size?: ComponentSize;
  multiple?: boolean;
  defaultSelectedKeys?: string[];
  tree?: {
    fetch?: IFetch & { valueKey?: string; textKey?: string };
    asyncLoad?: boolean; // 按需加载
    checkStrictly?: boolean;
    checkStrategy?: ICheckStrategy;
    defaultExpandAll?: boolean;
  };
  onClose: (data: IRecord | null) => void;
};

export type QmTreeHelperProps = IProps;

// ===========================
const getParentKey = (key: string, tree: IRecord[]) => {
  let parentKey: string | undefined;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.value === key)) {
        parentKey = node.value;
      } else {
        const pk = getParentKey(key, node.children);
        pk && (parentKey = pk);
      }
    }
  }
  return parentKey;
};
const getAllParentKey = (tree: IRecord[]) => {
  const result: string[] = [];
  tree.forEach((x) => {
    if (x.children) {
      result.push(...getAllParentKey(x.children));
    }
    if (x.children) {
      result.push(x.value);
    }
  });
  return result;
};
const deepFind = (arr: IRecord[], fn: (node: IRecord) => boolean): IRecord[] => {
  const result: IRecord[] = [];
  arr.forEach((x) => {
    if (x.children) {
      result.push(...deepFind(x.children, fn));
    }
    if (fn(x)) {
      result.push(x);
    }
  });
  return result;
};
const treeFilter = (tree: IRecord[], fn: (node: IRecord) => boolean) => {
  // 使用map复制一下节点，避免修改到原树
  return tree
    .map((node) => ({ ...node }))
    .filter((node) => {
      node.children = node.children && treeFilter(node.children, fn);
      return fn(node) || (node.children && node.children.length);
    });
};
const updateTreeData = (list: IRecord[], key: React.Key, valueKey: string, children: IRecord[]): IRecord[] => {
  return list.map((node) => {
    if (node[valueKey] === key) {
      return {
        ...node,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, valueKey, children),
      };
    }
    return node;
  });
};
const getParentKeys = (tree: IRecord[], value: string, valueKey: string) => {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i][valueKey] === value) {
      return [value];
    }
    if (Array.isArray(tree[i].children)) {
      const temp = getParentKeys(tree[i].children, value, valueKey);
      if (temp) {
        return [tree[i][valueKey], temp].flat();
      }
    }
  }
};
// ===========================

const TreeHelper: React.FC<IProps> = (props) => {
  const { multiple, defaultSelectedKeys = [], tree = {}, onClose } = props;
  const { size } = React.useContext(ConfigContext)!;
  const $size = React.useMemo(() => props.size ?? size ?? '', [props.size, size]);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const tableSize = useResizeObserve(wrapperRef);

  const [record, setRecord] = React.useState<IRecord | IRecord[]>();
  const [treeHeight, setTreeHeight] = React.useState<number>(300);
  const [loading, setLoading] = React.useState<boolean>(false);

  const calcTableHeight = () => {
    const $outer = wrapperRef.current!.parentNode!.children[0] as HTMLElement;
    const $filter = $outer.querySelector('.input-wrap') as HTMLElement;
    setTreeHeight($outer.offsetHeight - $filter.offsetHeight - 10);
  };

  const resizeObserveHandler = debounce(calcTableHeight, 5);

  useUpdateEffect(() => {
    resizeObserveHandler();
  }, [tableSize.width]);

  // ===========================================================

  const [treeData, setTreeData] = React.useState<IRecord[]>([]);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [isLoaded, setLoaded] = React.useState<boolean>(false);
  const treeDataOrigin = React.useRef<IRecord[]>(treeData);
  const responseList = React.useRef<IRecord[]>([]);
  const allParentKeys = React.useRef<string[]>([]);

  const createTreeData = (treeData: IRecord[], dataList: IRecord[]) => {
    setTreeData(treeData);
    treeDataOrigin.current = treeData;
    responseList.current = dataList;
    allParentKeys.current = getAllParentKey(treeData);
  };

  const createDefaultKeys = (treeData: IRecord[]): string[] => {
    if (multiple) {
      return defaultSelectedKeys;
    }
    const rows = deepFind(treeData, (node) => defaultSelectedKeys.includes(node[`text`]));
    if (rows.length === 1) {
      return [rows[0][`value`]];
    }
    return [];
  };

  const getTreeData = async () => {
    if (!tree.fetch) return;
    const { api: fetchApi, params, dataKey, valueKey = 'value', textKey = 'text' } = tree.fetch;
    try {
      setLoading(true);
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        const results = deepMapList(dataList, valueKey, textKey);
        createTreeData(results, dataList);
        setSelectedKeys(createDefaultKeys(results));
        setLoaded(true);
      }
    } catch (err) {
      // ...
    }
    setLoading(false);
  };

  const onLoadData = async ({ key, children }: any) => {
    if (!tree.fetch || children) return;
    const { api: fetchApi, params, dataKey, valueKey = 'value', textKey = 'text' } = tree.fetch;
    try {
      const res = await fetchApi({ ...params, [valueKey]: key });
      if (res.code === 200) {
        const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        const results = updateTreeData(treeData, key, 'value', deepMapList(dataList, valueKey, textKey));
        createTreeData(results, updateTreeData(responseList.current, key, valueKey, dataList));
      }
    } catch (err) {
      // ...
    }
  };

  const createParentKeys = (key: string): string[] => {
    return getParentKeys(treeData, key, 'value')?.slice(0, -1) || [];
  };

  useUpdateEffect(() => {
    const { defaultExpandAll = true, checkStrategy = 'SHOW_CHILD' } = tree;
    const results: string[] = [];
    selectedKeys.forEach((x) => {
      if (!multiple) {
        results.push(...createParentKeys(x));
      } else {
        if (checkStrategy === 'SHOW_ALL') {
          !allParentKeys.current.includes(x) && results.push(...createParentKeys(x));
        }
        if (checkStrategy === 'SHOW_CHILD') {
          results.push(...createParentKeys(x));
        }
        if (checkStrategy === 'SHOW_PARENT') {
          // ..
        }
      }
    });
    setExpandedKeys(defaultExpandAll ? allParentKeys.current : [...new Set(results)]);
  }, [isLoaded]);

  React.useEffect(() => {
    getTreeData();
  }, []);

  const expandHandle = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
  };

  const changeHandle = (value: string) => {
    const results = treeFilter(treeDataOrigin.current, (node) => {
      if (!value) return true;
      return node.text.indexOf(value) !== -1;
    });
    setInputValue(value);
    setTreeData(results);
  };

  const prefixCls = getPrefixCls('tree-helper');

  return (
    <div ref={wrapperRef} className={`${prefixCls}--wrapper`}>
      <Input.Search
        value={inputValue}
        className={`input-wrap`}
        style={{ marginBottom: 8 }}
        placeholder={t('qm.form.inputPlaceholder')}
        onChange={(ev) => changeHandle(ev.target.value)}
      />
      <QmSpin spinning={loading}>
        <Tree
          fieldNames={{ title: 'text', key: 'value', children: 'children' }}
          multiple={multiple}
          checkable={multiple}
          selectable={!multiple}
          height={treeHeight}
          checkStrictly={!!tree.checkStrictly}
          selectedKeys={selectedKeys}
          checkedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          treeData={treeData}
          loadData={tree.asyncLoad ? onLoadData : undefined}
          filterTreeNode={(node: any) => {
            if (!inputValue) {
              return false;
            }
            return node.text.indexOf(inputValue) !== -1;
          }}
          onExpand={expandHandle}
          onSelect={(selectedKeys: string[]) => {
            const { valueKey = 'value' } = tree.fetch || {};
            setSelectedKeys(selectedKeys);
            const rows = deepFind(responseList.current, (node) => selectedKeys.includes(get(node, valueKey)));
            setRecord(!multiple ? rows[0] : rows);
          }}
          onCheck={(selectedKeys: string[]) => {
            const { valueKey = 'value' } = tree.fetch || {};
            const { checkStrictly, checkStrategy = 'SHOW_CHILD' } = tree;
            if (checkStrictly) {
              selectedKeys = (selectedKeys as any).checked;
            }
            setSelectedKeys(selectedKeys);
            if (checkStrategy === 'SHOW_CHILD') {
              selectedKeys = selectedKeys.filter((x) => !allParentKeys.current.includes(x));
            }
            if (checkStrategy === 'SHOW_PARENT') {
              // ...
            }
            const rows = deepFind(responseList.current, (node) => selectedKeys.includes(get(node, valueKey)));
            setRecord(!multiple ? rows[0] : rows);
          }}
        />
      </QmSpin>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 9,
          height: `${SizeHeight[$size] + 20}px`,
          borderTop: '1px solid #d9d9d9',
          padding: '10px 15px',
          background: '#fff',
          textAlign: 'right',
          boxSizing: 'border-box',
        }}
      >
        <QmButton onClick={() => onClose(null)} style={{ marginRight: 8 }}>
          {t('qm.dialog.close')}
        </QmButton>
        <QmButton type="primary" disabled={!record} onClick={() => onClose(record!)}>
          {t('qm.dialog.confirm')}
        </QmButton>
      </div>
    </div>
  );
};

TreeHelper.displayName = 'TreeHelper';

export default TreeHelper;
