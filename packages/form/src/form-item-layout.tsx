/*
 * @Author: 焦质晔
 * @Date: 2022-05-25 11:18:53
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-05-25 11:48:28
 */
import React from 'react';
import { Row, Col } from '../../antd';

const DEFAULT_GUTTER = 8;

const FormItemLayout: React.FC<any> = (props) => {
  return (
    <Row wrap={false} gutter={DEFAULT_GUTTER}>
      <Col flex={`auto`}>{props.render(props)}</Col>
      {props.extra}
    </Row>
  );
};

FormItemLayout.displayName = 'FormItemLayout';

export default FormItemLayout;
