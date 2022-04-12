/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-12 18:05:29
 */
import React, { Component } from 'react';
import localforage from 'localforage';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { merge } from 'lodash-es';
import PreviewContext from './context';
import ConfigContext from '../../config-provider/context';
import { getLodop } from './LodopFuncs';
import { isObject } from '../../_utils/util';
import { t } from '../../locale';
import { warn } from '../../_utils/error';
import { getPrefixCls } from '../../_utils/prefix';

import config from './config';
import Container from './container';
import Setting from './setting';
import type { IDict } from '../../_utils/types';

import { QmButton, QmModal, Select, InputNumber, Pagination, Slider, message } from '../../index';
import { PrinterOutlined, SettingOutlined, DownloadOutlined } from '@ant-design/icons';

type IProps = {
  templateRender?: () => React.Component;
  uniqueKey?: string;
  defaultConfig?: Record<string, any>;
  preview?: boolean;
  closeOnPrinted?: boolean;
  onClose?: () => void;
};

type IState = {
  visible: boolean;
  form: {
    printerName: number;
    printerType: 'laser' | 'stylus';
    copies: number;
    scale: number;
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
  };
  printPage: number | undefined;
  currentPage: number;
  totalPage: number;
};

class Preview extends Component<IProps, IState> {
  static contextType = ConfigContext;

  private provide = {
    $$preview: this,
  };

  public containRef = React.createRef<any>();

  state: IState = {
    visible: false,
    form: {
      printerName: -1,
      printerType: this.props.defaultConfig?.printerType || 'laser',
      copies: this.props.defaultConfig?.copies || 1,
      scale: 1,
      setting: {
        distance: {
          left: config.defaultDistance,
          right: config.defaultDistance,
          top: config.defaultDistance,
          bottom: config.defaultDistance,
        },
        pageSize: '210*297',
        direction: this.props.defaultConfig?.direction || 'vertical',
        doubleSide: 0,
        doubleSideType: 'auto',
        fixedLogo: 0,
      },
    },
    printPage: undefined,
    currentPage: 1,
    totalPage: 0,
  };

  get printerTypeItems(): IDict[] {
    return [
      { text: t('qm.print.laserPrinter'), value: 'laser' },
      { text: t('qm.print.stylusPrinter'), value: 'stylus' },
    ];
  }

  get printerItems() {
    const LODOP = getLodop();
    const result = [{ text: t('qm.print.defaultPrinter'), value: -1 }];
    try {
      const iPrinterCount = LODOP.GET_PRINTER_COUNT();
      for (let i = 0; i < iPrinterCount; i++) {
        result.push({ text: LODOP.GET_PRINTER_NAME(i), value: i });
      }
    } catch (err) {
      warn('qm-print', `[ClientPrint]: 请安装 LODOP 打印插件`);
    }
    return result;
  }

  get isWindowsPrinter() {
    const {
      form: { printerName },
    } = this.state;
    // Windows 内置打印机
    const regExp = /OneNote|Microsoft|Fax/;
    return !regExp.test(this.printerItems.find((x) => x.value === printerName)!.text);
  }

  get pageSize() {
    return this.state.form.setting.pageSize.split('*').map((x) => Number(x));
  }

  get printerKey() {
    return this.props.uniqueKey ? `print_${this.props.uniqueKey}` : '';
  }

  async componentDidMount() {
    if (!this.props.uniqueKey) return;
    try {
      let res: any = await localforage.getItem(this.printerKey);
      if (!res) {
        res = await this.getPrintConfig(this.printerKey);
        if (isObject(res)) {
          await localforage.setItem(this.printerKey, res);
        }
      }
      if (isObject(res) && Object.keys(res).length) {
        merge(this.state.form, {
          ...res,
          printerName: this.printerItems.find((x) => x.text === res.printerName)?.value ?? -1,
        });
      }
    } catch (err) {
      // ...
    }
  }

  pageChangeHandle = (val: number) => {
    this.setState({ currentPage: val }, () => {
      this.containRef.current!.createPreviewDom();
    });
  };

  exportClickHandle = () => {
    this.doExport(this.containRef.current!.createExportHtml());
  };

  printClickHandle = async () => {
    this.doPrint(this.containRef.current!.createPrintHtml(this.state.printPage));
    if (!this.props.uniqueKey) return;
    // 存储配置信息
    try {
      const printConfig = {
        ...this.state.form,
        printerName: this.printerItems.find((x) => x.value === this.state.form.printerName)!.text,
      };
      await localforage.setItem(this.printerKey, printConfig);
      await this.savePrintConfig(this.printerKey, printConfig);
    } catch (err) {
      // ...
    }
  };

  doClose = () => {
    this.props.onClose?.();
  };

  getPrintConfig = async (key: string) => {
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
  };

  savePrintConfig = async (key: string, value) => {
    const $global = this.context.global;
    const fetchFn = $global?.['saveComponentConfigApi'];
    if (!fetchFn) return;
    try {
      await fetchFn({ [key]: value });
    } catch (err) {
      // ...
    }
  };

  // ====================================

  createStyle = () => {
    return `
      <style type="text/css">
        table {
          width: 100%;
          border-spacing: 0;
          border-collapse: collapse;
          table-layout: fixed;
        }
        table tr td {
          padding: 2px;
          line-height: 1.2;
          word-wrap: break-word;
        }
        .fs12 {
          font-size: 12px;
        }
        .fs13 {
          font-size: 13px;
        }
        .fs14 {
          font-size: 14px;
        }
        .fw500 {
          font-weight: 500;
        }
        .fw700 {
          font-weight: 700;
        }
        .fl {
          float: left;
        }
        .fr {
          float: right;
        }
        .tc {
          text-align: center;
        }
        .tr {
          text-align: right;
        }
        .bor {
          border: 1px solid #000;
        }
        .bor-t {
          border-top: 1px solid #000;
        }
        .bor-b {
          border-bottom: 1px solid #000;
        }
        .bor-l {
          border-left: 1px solid #000;
        }
        .bor-r {
          border-right: 1px solid #000;
        }
        .no-bor {
          border: none !important;
        }
      </style>
    `;
  };

  doPrint = (__html__) => {
    const LODOP = getLodop();

    if (!LODOP) return;

    const { uniqueKey, closeOnPrinted } = this.props;
    const {
      form: { setting, printerName, printerType, copies },
    } = this.state;
    const { pageSize } = this;
    const { defaultDistance } = config;
    const { left, right, top, bottom } = setting.distance;

    // 初始化
    LODOP.PRINT_INIT(uniqueKey ?? Math.random().toString().slice(2));

    // 设置打印机
    LODOP.SET_PRINTER_INDEX(printerName);

    // 指定打印份数
    LODOP.SET_PRINT_COPIES(copies);

    // 双面打印
    if (setting.doubleSide) {
      if (setting.doubleSideType === 'auto') {
        LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 2);
        LODOP.SET_PRINT_MODE('PRINT_DEFAULTSOURCE', 1);
      } else {
        LODOP.SET_PRINT_MODE('DOUBLE_SIDED_PRINT', 1);
      }
    }

    // 完打印后，关闭预览窗口
    LODOP.SET_PRINT_MODE('AUTO_CLOSE_PREWINDOW', 1);

    // 激光打印机，分页
    if (printerType === 'laser') {
      // 纵向
      if (setting.direction === 'vertical') {
        // LODOP.SET_PRINT_PAGESIZE(1, pageSize[0] * 10, pageSize[1] * 10, '');
        LODOP.SET_PRINT_PAGESIZE(1);
      }
      // 横向
      if (setting.direction === 'horizontal') {
        // LODOP.SET_PRINT_PAGESIZE(2, pageSize[0] * 10, pageSize[1] * 10, '');
        LODOP.SET_PRINT_PAGESIZE(2);
        LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1);
      }
    }

    // 针式打印机，连续打印
    if (printerType === 'stylus') {
      LODOP.SET_PRINT_PAGESIZE(3, pageSize[0] * 10, bottom * 100 * 2, '');
    }

    // 设置边距 增加表格项
    LODOP.ADD_PRINT_TABLE(
      `${(top - defaultDistance) * 10}mm`,
      `${(left - defaultDistance) * 10}mm`,
      `RightMargin: ${(right - defaultDistance) * 10}mm`,
      `BottomMargin: ${printerType !== 'stylus' ? (bottom - defaultDistance) * 10 : 0}mm`,
      this.createStyle() + __html__
    );

    // 监听事件
    LODOP.On_Return = (TaskID, Value) => {
      // useDispatch.apply(this._, ['QmPrint', 'print', Value]);
      if (Value) {
        closeOnPrinted && this.doClose();
      } else {
        message.error(t('qm.print.printError'));
      }
    };

    // 打印
    if (process.env.NODE_ENV === 'development') {
      LODOP.PREVIEW();
    } else {
      LODOP.PRINT();
    }
  };

  doExport = (__html__) => {
    const LODOP = getLodop();

    if (!LODOP) return;

    const { uniqueKey, closeOnPrinted } = this.props;
    const {
      form: { setting },
    } = this.state;

    LODOP.PRINT_INIT(uniqueKey ?? Math.random().toString().slice(2));

    LODOP.On_Return = (TaskID, Value) => {
      // useDispatch.apply(this._, ['QmPrint', 'export', Value]);
      if (Value) {
        closeOnPrinted && this.doClose();
      } else {
        message.error(t('qm.print.exportError'));
      }
    };

    LODOP.ADD_PRINT_TABLE(0, 0, 'RightMargin: 0', 'BottomMargin: 0', this.createStyle() + __html__);

    // 横向打印   1-纵向, 2-横向
    LODOP.SET_SAVE_MODE('Orientation', setting.direction === 'vertical' ? 1 : 2);
    // 缩放比例
    // LODOP.SET_SAVE_MODE('Zoom', 71);

    LODOP.SAVE_TO_FILE(`${dayjs().format('YYYYMMDDHHmmss')}.xlsx`);
  };

  // ====================================

  render(): React.ReactElement {
    const { preview, templateRender } = this.props;
    const { visible, form, currentPage, totalPage, printPage } = this.state;

    const prefixCls = getPrefixCls('print-preview');

    const dialogProps = {
      visible,
      title: t('qm.print.pageSetting'),
      width: '50%',
      loading: false,
      containerStyle: { paddingBottom: '52px' },
      onClose: () => {
        this.setState({ visible: false });
      },
    };
    const cls = {
      [prefixCls]: true,
    };

    return preview ? (
      <>
        <div className={classNames(cls)}>
          <div className={`outer`}>
            <div className={`header`}>
              <span>
                {t('qm.print.printer')}：
                <Select
                  value={form.printerName}
                  onChange={(val) => {
                    this.setState((prev) =>
                      merge({}, prev, {
                        form: { printerName: val },
                      })
                    );
                  }}
                  style={{ width: '120px' }}
                >
                  {this.printerItems.map((x) => (
                    <Select.Option key={x.value} value={x.value}>
                      {x.text}
                    </Select.Option>
                  ))}
                </Select>
              </span>
              <span>
                {t('qm.print.type')}：
                <Select
                  value={form.printerType}
                  onChange={(val) => {
                    this.setState((prev) =>
                      merge({}, prev, {
                        form: {
                          printerType: val,
                          setting: { pageSize: val === 'stylus' ? '241*280' : '210*297' },
                        },
                      })
                    );
                  }}
                  style={{ width: '120px' }}
                >
                  {this.printerTypeItems.map((x) => (
                    <Select.Option key={x.value} value={x.value}>
                      {x.text}
                    </Select.Option>
                  ))}
                </Select>
              </span>
              <span>
                {t('qm.print.copies')}：
                <InputNumber
                  value={form.copies}
                  min={1}
                  precision={0}
                  onChange={(val) => {
                    this.setState((prev) =>
                      merge({}, prev, {
                        form: {
                          copies: val ?? 1,
                        },
                      })
                    );
                  }}
                  style={{ width: '50px' }}
                />
              </span>
              <span>
                {t('qm.print.printPage.0')}
                <InputNumber
                  value={printPage}
                  min={1}
                  max={totalPage}
                  precision={0}
                  onChange={(val) => {
                    this.setState({ printPage: val ?? undefined });
                  }}
                  style={{ width: '50px', marginLeft: '4px', marginRight: '4px' }}
                />
                {t('qm.print.printPage.1')}
              </span>
              <span>
                <Pagination size="small" current={currentPage} pageSize={1} total={totalPage} onChange={this.pageChangeHandle} />
              </span>
              <span>
                <QmButton type="text" icon={<SettingOutlined />} className="text-btn" onClick={() => this.setState({ visible: true })}>
                  {t('qm.print.setting')}
                </QmButton>
              </span>
              <span>
                <QmButton type="text" icon={<DownloadOutlined />} className="text-btn" onClick={() => this.exportClickHandle()}>
                  {t('qm.print.export')}
                </QmButton>
              </span>
              <span>
                <QmButton icon={<PrinterOutlined />} type="primary" onClick={this.printClickHandle}>
                  {t('qm.print.print')}
                </QmButton>
              </span>
            </div>
            <div className={`main`}>
              <PreviewContext.Provider value={this.provide}>
                <Container ref={this.containRef} templateRender={templateRender} directPrint={false} />
              </PreviewContext.Provider>
            </div>
            <div className={`footer`}>
              <span>
                {t('qm.print.scale')}：
                <Slider
                  value={form.scale}
                  step={0.1}
                  min={0.5}
                  max={1.5}
                  onChange={(val) => {
                    this.setState((prev) =>
                      merge({}, prev, {
                        form: { scale: val },
                      })
                    );
                  }}
                />
                <em className={`scale-text`}>{`${Math.floor(form.scale * 100)}%`}</em>
              </span>
              <span>
                {t('qm.print.paper')}：{this.pageSize[0]}mm * {this.pageSize[1]}mm
              </span>
              <span>
                {t('qm.print.pageNumber')}：{t('qm.print.pagination', { currentPage, totalPage })}
              </span>
            </div>
          </div>
        </div>
        <QmModal {...dialogProps}>
          <Setting
            setting={form.setting}
            onChange={(data) => {
              this.setState((prev) => merge({}, prev, { form: { setting: data } }));
            }}
            onClose={() => {
              this.setState({ visible: false });
            }}
          />
        </QmModal>
      </>
    ) : (
      <PreviewContext.Provider value={this.provide}>
        <Container ref={this.containRef} templateRender={templateRender} directPrint={true} />
      </PreviewContext.Provider>
    );
  }
}

export default Preview;
