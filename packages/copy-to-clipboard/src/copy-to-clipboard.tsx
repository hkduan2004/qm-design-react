/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-10-15 09:25:49
 */
import React from 'react';
import copy from 'copy-to-clipboard';
import { t } from '../../locale';
import { cloneElement } from '../../_utils/cloneElement';

import { message } from '../../antd';

type IProps = {
  text: string;
  showMessage?: boolean;
  options?: {
    debug?: boolean;
    message?: string;
    format?: string;
  };
  onCopy?: (text: string, result: boolean) => void;
  children?: React.ReactNode;
};

export type QmCopyToClipboardProps = IProps;

const CopyToClipboard: React.FC<IProps> = (props) => {
  const { text, options, showMessage = true, onCopy } = props;

  const clickHandle = (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const elem = React.Children.only(props.children) as React.ReactElement;
    const result = copy(text, options);
    onCopy?.(text, result);
    if (result && showMessage) {
      message.success(t('qm.clipboard.success'));
    }
    if (elem && elem.props && typeof elem.props.onClick === 'function') {
      elem.props.onClick(ev);
    }
  };

  return cloneElement(props.children, { onClick: clickHandle });
};

CopyToClipboard.displayName = 'CopyToClipboard';

export default CopyToClipboard;
