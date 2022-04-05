/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-12-25 17:58:23
 */
import React, { Component } from 'react';
import FormContext from './context';
import { noop, getParserWidth, get } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH } from './types';
import type { IFormItem } from './types';

import { Form, Row, Col } from '../../antd';
import { DownloadOutlined } from '@ant-design/icons';
import { QmUploadFile } from '../../index';

type IProps = {
  option: IFormItem;
};

export interface UploadFile {
  uid: string;
  name: string;
  fileName?: string;
  url?: string;
  thumbUrl?: string;
  status?: 'error' | 'success' | 'done' | 'uploading' | 'removed';
}

type IUploadFileProps<T = UploadFile> = IProps & {
  value?: T[];
  onChange?: (value: T[]) => void;
  onValuesChange: (value: T[]) => void;
};

const VUploadFile: React.FC<IUploadFileProps> = (props) => {
  const { value, onChange, onValuesChange } = props;
  const { options = {}, upload = {}, style = {}, disabled } = props.option;
  const { multiple = true, maxCount = 1, fileTypes, fileSize, onRemove = noop } = options;
  const { action, headers, params, withCredentials = false, dataKey = '' } = upload;

  const triggerChange = (value) => {
    const results = value.map((x) => ({
      uid: x.uid,
      name: x.name,
      url: x.url || (!dataKey ? x.response?.data : get(x.response?.data, dataKey)) || '',
      status: x.status,
    }));
    onChange?.(results);
    onValuesChange(results);
  };

  return (
    <QmUploadFile
      name="file"
      action={action}
      multiple={multiple}
      headers={headers}
      data={params}
      withCredentials={withCredentials}
      maxCount={maxCount}
      fileTypes={fileTypes}
      fileSize={fileSize}
      disabled={disabled}
      showUploadList={{
        showDownloadIcon: true,
        downloadIcon: <DownloadOutlined />,
      }}
      fileList={value}
      onChange={({ file, fileList }) => {
        triggerChange(fileList);
      }}
      onRemove={onRemove}
    />
  );
};

class FormUploadFile extends Component<IProps> {
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
              <VUploadFile
                option={this.props.option}
                onValuesChange={(value) => {
                  onChange(value);
                  $$form.setViewValue(fieldName, '');
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

export default FormUploadFile;
