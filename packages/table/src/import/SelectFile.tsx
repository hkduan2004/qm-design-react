/*
 * @Author: 焦质晔
 * @Date: 2022-04-28 10:51:38
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-28 12:27:57
 */
import React from 'react';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { QmButton } from '../../../index';
import { message } from '../../../antd';

type ISelectFile = {
  fileType: string;
  multiple?: boolean;
  onChange?: (fileName: string, file: File) => void;
};

// 导入
let fileForm: any;
let fileInput: any;

const prefixCls = getPrefixCls('table');

const parseFile = (file: File) => {
  const name = file.name;
  const tIndex = name.lastIndexOf('.');
  const type = name.substring(tIndex + 1, name.length);
  const filename = name.substring(0, tIndex);
  return { filename, type };
};

const readLocalFile = (options): Promise<File> => {
  const opts = Object.assign({}, options);
  // dom 操作
  if (!fileForm) {
    fileForm = document.createElement('form');
    fileInput = document.createElement('input');
    fileForm.className = `${prefixCls}--file-form`;
    fileInput.name = 'file';
    fileInput.type = 'file';
    fileForm.appendChild(fileInput);
    document.body.appendChild(fileForm);
  }

  return new Promise((resolve, reject) => {
    const isAllType = !opts.type;
    fileInput.multiple = !!opts.multiple;
    fileInput.accept = isAllType ? '' : `.${opts.type}`;
    fileInput.onchange = (ev) => {
      const { files } = ev.target;
      const file = files[0];
      let errType = '';
      if (!isAllType) {
        for (let fIndex = 0; fIndex < files.length; fIndex++) {
          const { type } = parseFile(files[fIndex]);
          if (opts.type !== type) {
            errType = type;
            break;
          }
        }
      }
      if (!errType) {
        resolve(file);
      } else {
        message.warning(t('qm.upload.notType', { type: errType }));
        reject();
      }
      document.body.removeChild(fileForm);
      fileForm = null;
      fileInput = null;
    };
    fileForm.reset();
    fileInput.click();
  });
};

const SelectFile: React.FC<ISelectFile> = (props) => {
  const { fileType, onChange } = props;
  const clickHandle = async () => {
    try {
      const file = await readLocalFile({ type: fileType });
      onChange?.(file.name, file);
    } catch (err) {
      // ...
    }
  };

  return <QmButton onClick={() => clickHandle()}>{t('qm.upload.text')}</QmButton>;
};

export default SelectFile;
