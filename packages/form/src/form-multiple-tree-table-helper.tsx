/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-27 13:47:51
 */
import React, { Component } from 'react';
import { merge } from 'lodash-es';
import FormContext from './context';
import { noop, trueNoop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { warn } from '../../_utils/error';
import { SizeHeight } from '../../_utils/types';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';
import type { IDict } from '../../_utils/types';

import { QmModal, QmTreeTableHelper } from '../../index';
import { Form, Row, Col, Select, Button } from '../../antd';

import { SearchOutlined } from '@ant-design/icons';

type IProps = {
  option: IFormItem;
};

type IState = {
  visible: boolean;
  itemList: IDict[];
};

type IMultipleTreeHelperProps<T = Array<string | number>> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T, text: string) => void;
};

class VMultipleTreeHelper extends Component<IMultipleTreeHelperProps, IState> {
  static contextType = FormContext;

  // 搜索帮助配置参数
  public searchHelper: IFormItem['searchHelper'];

  // 表单字段映射
  public alias: Record<string, string>;

  public state: IState = {
    visible: false,
    itemList: [],
  };

  constructor(props: IMultipleTreeHelperProps) {
    super(props);
    this.initialHandle();
  }

  // 初始化方法
  initialHandle = () => {
    const { searchHelper } = this.props.option;
    this.searchHelper = searchHelper || {};
    const fieldAliasMap = this.searchHelper.fieldAliasMap;
    if (!fieldAliasMap) {
      warn('QmForm', 'searchHelper 需要配置 `fieldAliasMap` 选项');
    }
    this.alias = typeof fieldAliasMap === 'function' ? fieldAliasMap() : fieldAliasMap || {};
    if (!(Object.keys(this.alias).includes('valueKey') && Object.keys(this.alias).includes('textKey'))) {
      warn('QmForm', 'fieldAliasMap 选项必须包含自身 `valueKey` 和  `textKey`');
    }
  };

  setVisible = (visible: boolean, cb?: () => void) => {
    this.setState({ visible }, () => cb?.());
  };

  setItemList = (list: IDict[]) => {
    this.setState({ itemList: list });
  };

  // 打开搜索帮助面板
  openSearchHelper = (cb?: () => void) => {
    const { $$form } = this.context;
    const { beforeOpen } = this.searchHelper!;
    // 打开的前置钩子
    const open = beforeOpen ?? trueNoop;
    const before = open($$form.state.formData);
    if ((before as Promise<void>)?.then) {
      (before as Promise<void>)
        .then(() => {
          this.setVisible(true);
          cb?.();
        })
        .catch(() => {});
    } else if (before !== false) {
      this.setVisible(true);
      cb?.();
    }
  };

  // 搜索帮助关闭，回显值事件
  closeSearchHelper = (data: Record<string, any>[]) => {
    const { textKey, valueKey } = this.alias;
    const itemList = data.map((x) => ({ text: x[textKey], value: x[valueKey] }));
    this.setItemList(itemList);
    this.triggerChange(itemList.map((x) => x.value));
    const { closed } = this.searchHelper!;
    this.setVisible(false, () => {
      closed?.(data);
    });
  };

  createViewText() {
    return this.state.itemList
      .filter((x) => this.props.value?.includes(x.value))
      .map((x) => x.text)
      .join(',');
  }

  triggerChange = (value: Array<string | number>) => {
    const { onChange, onValuesChange } = this.props;
    onChange?.(value);
    onValuesChange(value, this.createViewText());
  };

  render() {
    const { $$form } = this.context;
    const { visible, itemList } = this.state;
    const { value } = this.props;
    const {
      options = {},
      searchHelper = {},
      style = {},
      placeholder = t('qm.form.selectPlaceholder'),
      bordered = true,
      allowClear = true,
      readOnly,
      disabled,
    } = this.props.option;
    const { collapseTags, maxTagTextLength } = options;

    const dialogProps = {
      visible,
      title: t('qm.searchHelper.text'),
      width: searchHelper.width ?? '65%',
      loading: false,
      bodyStyle: { paddingBottom: `${SizeHeight[$$form.$size] + 20}px` },
      onClose: () => {
        this.setVisible(false);
      },
    };

    const helperProps = {
      ...searchHelper,
      size: $$form.$size,
      multiple: true,
      initialValue: merge({}, searchHelper.initialValue),
      onClose: (data) => {
        if (data) {
          this.closeSearchHelper(data);
        } else {
          this.setVisible(false);
        }
      },
    };

    return (
      <>
        <span className={`ant-input-group-wrapper ant-input-search search-helper-multiple`}>
          <span className={`ant-input-wrapper ant-input-group`}>
            <Select
              mode={'multiple'}
              maxTagCount={collapseTags ? 'responsive' : undefined}
              maxTagTextLength={maxTagTextLength}
              open={false}
              value={value}
              placeholder={placeholder}
              bordered={bordered}
              allowClear={allowClear}
              disabled={disabled}
              style={{ width: '100%' }}
              onKeyUp={(ev) => {
                if (ev.keyCode === 13) {
                  ev.preventDefault();
                  this.openSearchHelper();
                }
              }}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onDoubleClick={() => {
                this.openSearchHelper();
              }}
              onChange={(val) => {
                this.triggerChange(val);
              }}
            >
              {itemList.map((x) => (
                <Select.Option key={x.value} value={x.value}>
                  {x.text}
                </Select.Option>
              ))}
            </Select>
            <span className={`ant-input-group-addon`}>
              <Button
                className={'ant-input-search-button'}
                disabled={disabled}
                icon={<SearchOutlined />}
                onClick={() => {
                  this.openSearchHelper();
                }}
              />
            </span>
          </span>
        </span>
        <QmModal {...dialogProps}>
          <QmTreeTableHelper {...helperProps} />
        </QmModal>
      </>
    );
  }
}

class FormMultipleTreeHelper extends Component<IProps> {
  static contextType = FormContext;

  render(): React.ReactElement {
    const { $$form } = this.context;
    const {
      type,
      label,
      tooltip,
      fieldName,
      invisible,
      options = {},
      labelWidth = $$form.props.labelWidth,
      extra,
      rules = [],
      onChange = noop,
    } = this.props.option;

    return (
      <Form.Item
        label={$$form.renderFormLabel(label)}
        tooltip={tooltip}
        hidden={invisible}
        labelCol={{ flex: getParserWidth(labelWidth) }}
        required={$$form.getFormItemRequired(rules)}
      >
        <Row wrap={false} gutter={8}>
          <Col flex="auto">
            <Form.Item
              name={fieldName}
              noStyle
              rules={rules}
              messageVariables={{
                label: $$form.getFormItemLabel(label),
              }}
            >
              <VMultipleTreeHelper
                option={this.props.option}
                onValuesChange={(value, text) => {
                  onChange(value);
                  $$form.setViewValue(fieldName, text);
                }}
              />
            </Form.Item>
          </Col>
          {extra && <Col flex={getParserWidth(extra.labelWidth || DEFAULT_LABEL_WIDTH)}>{$$form.renderFormItemExtra({ fieldName, ...extra })}</Col>}
        </Row>
      </Form.Item>
    );
  }
}

export default FormMultipleTreeHelper;
