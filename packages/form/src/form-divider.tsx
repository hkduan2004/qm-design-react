/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-13 23:33:48
 */
import React, { Component } from 'react';
import FormContext from './context';
import { noop } from '../../_utils/util';
import type { IFormItem } from './types';

import { Form } from '../../antd';
import { QmDivider } from '../../index';

type IProps = {
  option: IFormItem;
};

class FormDivider extends Component<IProps> {
  static contextType = FormContext;

  render(): React.ReactElement {
    const { $$form } = this.context;
    const { type, label, fieldName, style = {}, collapse = {} } = this.props.option;

    const { viewData, expand } = $$form.state;
    const { showLimit, remarkItems = [], onCollapse = noop } = collapse;

    const result: any[] = [];
    if (remarkItems.length) {
      const blockItems = $$form.getBlockDerivedItems();
      const blockList = blockItems.find((arr) => arr[0].fieldName === fieldName) ?? [];
      const index = showLimit ?? blockList.length - 1;
      blockList.slice(index + 1).forEach((x) => {
        const item = remarkItems.find((k) => k.fieldName === x.fieldName);
        if (!item) return;
        const label: string = item.showLabel ? `${x.label}：` : '';
        const textVal: string = viewData[x.fieldName] ?? '';
        if (textVal === '') return;
        result.push({ ...x, text: `${label}${textVal}` });
      });
    }

    return (
      <Form.Item labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
        <QmDivider
          id={fieldName}
          label={label as string}
          extra={result.map((x) => x.text).join(' | ')}
          style={{ ...style }}
          collapse={expand[fieldName]}
          onCollapseChange={(collapse) => {
            $$form.setState((prevState) => ({ expand: Object.assign({}, prevState.expand, { [fieldName]: collapse }) }));
            onCollapse(collapse);
          }}
        />
      </Form.Item>
    );
  }
}

export default FormDivider;
