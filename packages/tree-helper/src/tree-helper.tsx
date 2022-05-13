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

import type { IFetch, IRecord } from '../../table/src/table/types';
import type { ComponentSize } from '../../_utils/types';

import { QmButton, QmSpin, Tree, Input } from '../../index';

type IProps = {
  size?: ComponentSize;
  multiple?: boolean;
  tree?: {
    fetch?: IFetch & { valueKey?: string; textKey?: string };
    asyncLoad?: boolean; // 按需加载
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
// ===========================

const TreeHelper: React.FC<IProps> = (props) => {
  const { multiple, tree, onClose } = props;
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
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState<string>('');
  const treeDataOrigin = React.useRef<IRecord[]>(treeData);
  const responseList = React.useRef<IRecord[]>([]);

  const createTreeData = (treeData: IRecord[], dataList: IRecord[]) => {
    setTreeData(treeData);
    treeDataOrigin.current = treeData;
    responseList.current = dataList;
  };

  const getTreeData = async () => {
    if (!tree?.fetch) return;
    const { api: fetchApi, params, dataKey, valueKey = 'value', textKey = 'text' } = tree.fetch;
    try {
      setLoading(true);
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = Array.isArray(res.data) ? res.data : get(res.data, dataKey!) ?? [];
        const results = deepMapList(dataList, valueKey, textKey);
        createTreeData(results, dataList);
      }
    } catch (err) {
      // ...
    }
    setLoading(false);
  };

  const onLoadData = async ({ key, children }: any) => {
    if (!tree?.fetch || children) return;
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

  useUpdateEffect(() => {
    setExpandedKeys(getAllParentKey(treeData));
  }, [treeData]);

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
          height={treeHeight}
          defaultExpandAll
          expandedKeys={expandedKeys}
          treeData={treeData}
          loadData={tree?.asyncLoad ? onLoadData : undefined}
          filterTreeNode={(node: any) => {
            if (!inputValue) {
              return false;
            }
            return node.text.indexOf(inputValue) !== -1;
          }}
          onExpand={expandHandle}
          onSelect={(selectedKeys: string[]) => {
            if (!tree?.fetch) return;
            const { valueKey = 'value' } = tree.fetch;
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
