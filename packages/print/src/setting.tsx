/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-28 13:32:32
 */
import React, { Component } from 'react';
import ConfigContext from '../../config-provider/context';
import { t } from '../../locale';
import config from './config';
import type { QmFormRef } from '../../index';

import { QmForm, QmFormItem, QmButton } from '../../index';

type IProps = {
  setting: {
    distance: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
    pageSize: string;
    direction: 'vertical' | 'horizontal';
    doubleSide: number;
    doubleSideType: 'auto' | 'manual';
    fixedLogo: number;
  };
  onChange: (data: IProps['setting']) => void;
  onClose: () => void;
};

type IState = {
  formList: QmFormItem[];
};

class Setting extends Component<IProps, IState> {
  static contextType = ConfigContext;

  public formRef = React.createRef<QmFormRef>();

  createFormList = (): QmFormItem[] => {
    return [
      {
        type: 'DIVIDER',
        fieldName: '_1',
        label: t('qm.print.setPanel.printParameter'),
      },
      {
        type: 'SELECT',
        label: t('qm.print.setPanel.pagerType'),
        fieldName: 'pageSize',
        options: {
          itemList: [
            { text: 'A2', value: '420*594' },
            { text: 'A3', value: '420*297' },
            { text: 'A4', value: '210*297' },
            { text: 'A5', value: '210*148' },
            { text: t('qm.print.setPanel.carbonPaper'), value: '241*280' },
          ],
        },
      },
      {
        type: 'RADIO',
        label: t('qm.print.setPanel.printDirection'),
        fieldName: 'direction',
        options: {
          itemList: [
            { text: t('qm.print.setPanel.vertical'), value: 'vertical' },
            { text: t('qm.print.setPanel.horizontal'), value: 'horizontal' },
          ],
        },
      },
      {
        type: 'CHECKBOX',
        // label: t('qm.print.setPanel.doublePrint'),
        fieldName: 'doubleSide',
        label: {
          type: 'SELECT',
          fieldName: 'doubleSideType',
          options: {
            itemList: [
              { text: t('qm.print.setPanel.autoDoublePrint'), value: 'auto' },
              { text: t('qm.print.setPanel.manualDoublePrint'), value: 'manual' },
            ],
          },
          disabled: !this.props.setting.doubleSide,
        },
        options: {
          trueValue: 1,
          falseValue: 0,
        },
        onChange: (val) => {
          const { formList } = this.state;
          const labelOption = formList.find((x) => x.fieldName === 'doubleSide')!.label as QmFormItem;
          labelOption.disabled = !val;
          this.setState({ formList });
        },
      },
      {
        type: 'CHECKBOX',
        label: t('qm.print.setPanel.fixedLogo'),
        fieldName: 'fixedLogo',
        options: {
          trueValue: 1,
          falseValue: 0,
        },
      },
      {
        type: 'DIVIDER',
        fieldName: '_2',
        label: t('qm.print.setPanel.printMargin'),
      },
      {
        type: 'INPUT_NUMBER',
        label: t('qm.print.setPanel.leftMargin'),
        fieldName: 'disleft',
        options: {
          min: config.defaultDistance,
          step: 0.05,
          precision: 2,
        },
        extra: {
          labelWidth: 80,
        },
        rules: [{ required: true, message: t('qm.print.setPanel.noEmpty') }],
      },
      {
        type: 'INPUT_NUMBER',
        label: t('qm.print.setPanel.rightMargin'),
        fieldName: 'disright',
        options: {
          min: config.defaultDistance,
          step: 0.05,
          precision: 2,
        },
        extra: {
          labelWidth: 80,
        },
        rules: [{ required: true, message: t('qm.print.setPanel.noEmpty') }],
      },
      {
        type: 'INPUT_NUMBER',
        label: t('qm.print.setPanel.topMargin'),
        fieldName: 'distop',
        options: {
          min: config.defaultDistance,
          step: 0.05,
          precision: 2,
        },
        extra: {
          labelWidth: 80,
        },
        rules: [{ required: true, message: t('qm.print.setPanel.noEmpty') }],
      },
      {
        type: 'INPUT_NUMBER',
        label: t('qm.print.setPanel.bottomMargin'),
        fieldName: 'disbottom',
        options: {
          min: config.defaultDistance,
          step: 0.05,
          precision: 2,
        },
        extra: {
          labelWidth: 80,
        },
        rules: [{ required: true, message: t('qm.print.setPanel.noEmpty') }],
      },
    ];
  };

  getInitialvalue = () => {
    const { setting } = this.props;
    const { distance } = setting;
    return Object.assign(
      {},
      {
        disleft: distance.left,
        disright: distance.right,
        distop: distance.top,
        disbottom: distance.bottom,
        pageSize: setting.pageSize,
        direction: setting.direction,
        doubleSide: setting.doubleSide,
        doubleSideType: setting.doubleSideType,
        fixedLogo: setting.fixedLogo,
      }
    );
  };

  getInitialExtra = () => {
    return {
      disleft: t('qm.print.setPanel.sizeUnit'),
      disright: t('qm.print.setPanel.sizeUnit'),
      distop: t('qm.print.setPanel.sizeUnit'),
      disbottom: t('qm.print.setPanel.sizeUnit'),
    };
  };

  state: IState = {
    formList: this.createFormList(),
  };

  confirmHandle = async () => {
    const [err, data] = await this.formRef.current!.GET_FORM_DATA();
    if (err) return;
    this.props.onChange({
      distance: {
        left: data.disleft,
        right: data.disright,
        top: data.distop,
        bottom: data.disbottom,
      },
      pageSize: data.pageSize,
      direction: data.direction,
      doubleSide: data.doubleSide,
      doubleSideType: data.doubleSideType,
      fixedLogo: data.fixedLogo,
    });
    this.cancelHandle();
  };

  cancelHandle = () => {
    this.props.onClose();
  };

  render(): React.ReactElement {
    const { formList } = this.state;
    return (
      <>
        <QmForm
          ref={this.formRef}
          items={formList}
          initialValues={this.getInitialvalue()}
          initialExtras={this.getInitialExtra()}
          labelWidth={120}
          cols={2}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            borderTop: '1px solid #d9d9d9',
            padding: '10px 15px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <QmButton onClick={() => this.cancelHandle()} style={{ marginRight: 8 }}>
            {t('qm.dialog.close')}
          </QmButton>
          <QmButton type="primary" onClick={() => this.confirmHandle()}>
            {t('qm.dialog.confirm')}
          </QmButton>
        </div>
      </>
    );
  }
}

export default Setting;
