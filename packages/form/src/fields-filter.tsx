/*
 * @Author: 焦质晔
 * @Date: 2021-08-28 11:04:13
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-01-12 19:28:14
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { xor, isEqual } from 'lodash-es';
import FormContext from './context';
import ConfigContext from '../../config-provider/context';
import { isUndefined } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { t } from '../../locale';
import type { IFormItem } from './types';

import { ReactSortable } from 'react-sortablejs';
import { Dropdown, Checkbox } from '../../antd';
import { UnorderedListOutlined, HolderOutlined } from '@ant-design/icons';

type IProps = {
  uniqueKey?: string;
  items: IFormItem[];
  fieldsChange?: (items: IFormItem[]) => void;
};

type IState = {
  visible: boolean;
};

class FieldsFilter extends Component<IProps, IState> {
  static contextType = ConfigContext;

  private linkRef = React.createRef<HTMLAnchorElement>();

  public state: IState = {
    visible: false,
  };

  get formUniqueKey() {
    return this.props.uniqueKey ? `form_${this.props.uniqueKey}` : '';
  }

  componentDidMount() {
    this.initLocalfields();
  }

  async getTableFieldsConfig(key: string): Promise<unknown[] | void> {
    const $global = this.context.global;
    const fetchFn = $global?.['getComponentConfigApi'];
    if (!fetchFn) return;
    try {
      const res = await fetchFn({ key });
      if (res.code === 200) {
        return res.data;
      }
    } catch (err) {
      // ...
    }
    return;
  }

  async saveTableColumnsConfig(key: string, value: Partial<IFormItem>[]): Promise<void> {
    const $global = this.context.global;
    const fetchFn = $global?.['saveComponentConfigApi'];
    if (!fetchFn) return;
    try {
      await fetchFn({ [key]: value });
    } catch (err) {
      // ...
    }
  }

  getLocalFields(): Array<IFormItem> | void {
    if (!this.formUniqueKey) return;
    // 本地存储
    const localFields: IFormItem[] = JSON.parse(localStorage.getItem(this.formUniqueKey) as string);
    // 服务端获取
    if (!localFields) {
      this.getTableFieldsConfig(this.formUniqueKey)
        .then((result) => {
          if (!result) {
            return this.setLocalFields(this.props.items);
          }
          localStorage.setItem(this.formUniqueKey, JSON.stringify(result));
          this.initLocalfields();
        })
        .catch(() => {});
    }
    if (!localFields) return;
    const diffs: unknown[] = xor(
      localFields.map((x) => x.fieldName),
      this.props.items.map((x) => x.fieldName)
    );
    if (diffs.length > 0) {
      return this.props.items.map((item) => {
        const { fieldName } = item;
        const target = localFields.find((x) => x.fieldName === fieldName);
        if (!target) {
          return item;
        }
        if (!isUndefined(target.hidden)) {
          item.hidden = target.hidden;
        }
        return item;
      });
    }
    return localFields.map((x) => {
      const target = this.props.items.find((k) => k.fieldName === x.fieldName);
      return { ...target, ...x };
    });
  }

  setLocalFields(list: IFormItem[]) {
    if (!this.formUniqueKey) return;
    const result = list.map((x) => {
      const target: Partial<IFormItem> = {};
      if (!isUndefined(x.hidden)) {
        target.hidden = x.hidden;
      }
      return {
        fieldName: x.fieldName,
        ...target,
      };
    });
    const localFields: IFormItem[] = JSON.parse(localStorage.getItem(this.formUniqueKey) as string);
    if (isEqual(result, localFields)) return;
    // 本地存储
    localStorage.setItem(this.formUniqueKey, JSON.stringify(result));
    // 服务端存储
    this.saveTableColumnsConfig(this.formUniqueKey, result);
  }

  initLocalfields() {
    // 获取本地 list
    const localFields = this.getLocalFields();
    if (!localFields) return;
    this.changeHandle(localFields);
  }

  changeHandle(items: IFormItem[]) {
    const { fieldsChange } = this.props;
    fieldsChange?.(items.filter((x) => !x.noAuth));
  }

  popup() {
    const { items } = this.props;
    const formItems = items.filter((x) => !x.noAuth);
    return (
      <FormContext.Consumer>
        {(context) => {
          const $$form = context!.$$form;
          return (
            <div className={classNames('ant-dropdown-menu', 'fields-list')}>
              <ReactSortable
                itemKey="fieldName"
                handle=".handle"
                tag="ul"
                animation={200}
                list={formItems as any}
                setList={(list) => {
                  const fns1: string[] = list.map((x) => x.fieldName);
                  const fns2: string[] = formItems.map((x) => x.fieldName);
                  if (isEqual(fns1, fns2)) return;
                  $$form.setExpandHandle(true);
                  this.changeHandle(list as unknown as IFormItem[]);
                  this.setLocalFields(list as unknown as IFormItem[]);
                }}
              >
                {formItems.map((item) => (
                  <li key={item.fieldName} className="item">
                    <Checkbox
                      disabled={(item.rules?.findIndex((x) => x.required) as number) > -1}
                      checked={!item.hidden}
                      onChange={(ev) => {
                        const { checked } = ev.target;
                        item.hidden = !checked;
                        this.changeHandle(formItems);
                        this.setLocalFields(formItems);
                      }}
                    />
                    <HolderOutlined className="handle" title={t('qm.form.draggable')} />
                    <span className="title">{$$form.getFormItemLabel(item.label)}</span>
                  </li>
                ))}
              </ReactSortable>
            </div>
          );
        }}
      </FormContext.Consumer>
    );
  }

  render(): React.ReactElement {
    const { visible } = this.state;
    const prefixCls = getPrefixCls('form-fields-filter');
    return (
      <FormContext.Consumer>
        {(context) => {
          const { $size } = context!.$$form;
          const cls = {
            [prefixCls]: true,
            [`${prefixCls}--lg`]: $size === 'large',
            [`${prefixCls}--sm`]: $size === 'small',
          };
          return (
            <Dropdown
              overlayClassName={classNames(cls)}
              overlay={this.popup()}
              trigger={['click']}
              placement="bottomRight"
              overlayStyle={{
                minWidth: 150,
              }}
              getPopupContainer={() => this.linkRef.current as HTMLElement}
              visible={visible}
              onVisibleChange={(visible) => {
                this.setState({ visible });
              }}
            >
              <a ref={this.linkRef} style={{ padding: '5px 0' }}>
                <UnorderedListOutlined />
              </a>
            </Dropdown>
          );
        }}
      </FormContext.Consumer>
    );
  }
}

export default FieldsFilter;
