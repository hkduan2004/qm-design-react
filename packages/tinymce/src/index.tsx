/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-15 16:43:01
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ConfigContext from '../../config-provider/context';
import { noop, isNumber } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { throwError } from '../../_utils/error';
import { isValidComponentSize, isValidWidthUnit } from '../../_utils/validators';
import type { ComponentSize, CSSProperties } from '../../_utils/types';

import { Editor, IAllProps as IEditorProps } from './components/Editor';

type IProps = {
  value?: string;
  size?: ComponentSize;
  height?: number | string;
  tinymceScriptSrc?: string;
  disabled?: boolean;
  plugins?: string[] | string;
  toolbar?: string[] | string;
  className?: string;
  style?: CSSProperties;
  onChange?: (value: string) => void;
};

export type QmTinymceProps = IProps;

enum ELocale {
  'zh-cn' = 'zh_CN',
  'en' = 'en',
}

class QmTinymce extends Component<IProps> {
  static contextType = ConfigContext;

  static propTypes = {
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmTinymce', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    height: (props, propName, componentName) => {
      if (!(isNumber(props[propName]) || isValidWidthUnit(props[propName]))) {
        return throwError('QmTinymce', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
  };

  static defaultProps = {
    height: 400,
    plugins:
      'preview importcss searchreplace autolink directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
    toolbar:
      'undo redo | formatselect | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen preview print | lists image media table template link unlink anchor codesample code | ltr rtl',
  };

  render(): React.ReactElement {
    const { size, className, style, height, tinymceScriptSrc, plugins, toolbar, disabled, value, onChange = noop } = this.props;
    const $global = this.context.global;
    const $locale = this.context.locale;
    const $size = size || this.context.size || '';

    const prefixCls = getPrefixCls('tinymce');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--lg`]: $size === 'large',
      [`${prefixCls}--sm`]: $size === 'small',
    };

    const init = {
      height,
      plugins,
      toolbar,
      menubar: 'file edit view insert format tools table help',
      language: ELocale[$locale],
      images_upload_handler: (blobInfo, success, failure): void => {
        const formData: FormData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        const img = `data:image/jpeg;base64,${blobInfo.base64()}`;
        success(img);
      },
    };

    const wrapProps: IEditorProps = {
      init,
      value,
      disabled,
      tinymceScriptSrc: tinymceScriptSrc || $global?.tinymce?.scriptSrc || undefined,
      onEditorChange: (content, editor): void => {
        onChange(editor.getContent());
      },
    };

    return (
      <div className={classNames(cls, className)} style={style}>
        <Editor {...wrapProps} />
      </div>
    );
  }
}

export default QmTinymce;
