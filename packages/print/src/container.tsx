/*
 * @Author: 焦质晔
 * @Date: 2022-01-11 17:57:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-01 14:08:36
 */
import React from 'react';
import classNames from 'classnames';
import PreviewContext from './context';
import ConfigContext from '../../config-provider/context';
import { getPrefixCls } from '../../_utils/prefix';
import { sleep } from '../../_utils/util';
import { warn } from '../../_utils/error';
import { mmToPx, pxToMm, insertBefore, isPageBreak } from './utils';
import useUpdateEffect from '../../hooks/useUpdateEffect';
import config from './config';

import type { Nullable } from '../../_utils/types';

import { QmSpin } from '../../index';

type IProps = {
  templateRender?: () => React.Component;
  directPrint?: boolean;
};

type ContainerRef = {
  createPreviewDom: () => void;
  createExportHtml: () => void;
  createPrintHtml: (pageNumber?: number) => void;
  SHOW_PREVIEW: () => void;
  DIRECT_PRINT: () => void;
};

type IDistance = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

const Container = React.forwardRef<ContainerRef, IProps>((props, ref) => {
  const { templateRender, directPrint } = props;
  const { global } = React.useContext(ConfigContext)!;
  const { $$preview } = React.useContext(PreviewContext)!;
  const { state: previewState, isWindowsPrinter, pageSize } = $$preview;

  const containRef = React.useRef<HTMLDivElement>(null);
  const elementStore = React.useRef<Record<string, HTMLElement>>({});
  const elementHtmls = React.useRef<string[]>([]);
  const elementHeights = React.useRef<number[]>([]);
  const previewHtmls = React.useRef<string[][]>([]);

  const [loading, setLoading] = React.useState<boolean>(true);

  const setElementStore = () => {
    elementStore.current['templateEl'] = containRef.current!.querySelector('.origin-template')!.children[0] as HTMLElement;
    elementStore.current['previewEl'] = containRef.current!.querySelector('.workspace') as HTMLElement;
  };

  // 公开方法
  React.useImperativeHandle(ref, () => ({
    createPreviewDom,
    createExportHtml,
    createPrintHtml,
    SHOW_PREVIEW,
    DIRECT_PRINT,
  }));

  useUpdateEffect(() => {
    createWorkspace();
  }, [previewState.form.printerType, previewState.form.setting.direction, previewState.form.setting.distance, previewState.form.setting.fixedLogo]);

  React.useEffect(() => {
    setElementStore();
  }, []);

  // ===============================================================

  const pagePrintWidth = React.useMemo<number>(() => {
    const {
      form: {
        setting: { direction },
      },
    } = previewState;
    const paddingX: number = isWindowsPrinter ? config.defaultDistance * 10 + config.defaultDistance * 10 : 0;
    const pageWidth: number = direction === 'vertical' ? pageSize[0] : pageSize[1];
    return pageWidth - paddingX;
  }, [previewState, isWindowsPrinter, pageSize]);

  const pagePrintHeight = React.useMemo<number>(() => {
    const {
      form: {
        setting: { direction },
      },
    } = previewState;
    const paddingY: number = isWindowsPrinter ? config.defaultDistance * 10 + config.defaultDistance * 10 : 0;
    const pageHeight: number = direction === 'vertical' ? pageSize[1] : pageSize[0];
    return pageHeight - paddingY;
  }, [previewState, isWindowsPrinter, pageSize]);

  const workspaceWidth = React.useMemo<number>(() => {
    const {
      form: {
        setting: { distance },
      },
    } = previewState;
    return mmToPx(pagePrintWidth - (distance.left - config.defaultDistance) * 10 - (distance.right - config.defaultDistance) * 10);
  }, [previewState, pagePrintWidth]);

  const workspaceHeight = React.useMemo<number>(() => {
    const {
      form: {
        setting: { distance },
      },
    } = previewState;
    return mmToPx(pagePrintHeight - (distance.top - config.defaultDistance) * 10 - (distance.bottom - config.defaultDistance) * 10);
  }, [previewState, pagePrintHeight]);

  const scaleSize: number = previewState.form.scale;

  const pageDistance = React.useMemo<IDistance>(() => {
    const {
      form: {
        setting: { distance },
      },
    } = previewState;
    return {
      left: mmToPx(distance.left * 10),
      right: mmToPx(distance.right * 10),
      top: mmToPx(distance.top * 10),
      bottom: mmToPx(distance.bottom * 10),
    };
  }, [previewState]);

  const workspaceStyle = React.useMemo<React.CSSProperties>(() => {
    const {
      form: { printerType },
    } = previewState;
    const { left, right, top, bottom } = pageDistance;
    const offsetWidth: number = workspaceWidth + left + right;
    const defaultOffsetLeft: number = config.previewWidth - offsetWidth <= 0 ? 0 : (config.previewWidth - offsetWidth) / 2;
    const stepOffsetLeft: number = Math.abs(((1 - scaleSize) * offsetWidth) / 2);
    let offsetLeft = 0;
    if (scaleSize > 1) {
      offsetLeft = stepOffsetLeft > defaultOffsetLeft ? -1 * defaultOffsetLeft : -1 * stepOffsetLeft;
    }
    if (scaleSize < 1) {
      offsetLeft =
        offsetWidth - stepOffsetLeft * 2 > config.previewWidth
          ? 0
          : defaultOffsetLeft > 0
          ? stepOffsetLeft
          : (config.previewWidth - (offsetWidth - stepOffsetLeft * 2)) / 2;
    }
    return {
      width: `${workspaceWidth}px`,
      height: `${printerType === 'stylus' ? 'auto' : workspaceHeight + 'px'}`,
      paddingLeft: `${left}px`,
      paddingRight: `${right}px`,
      paddingTop: `${top}px`,
      paddingBottom: `${bottom}px`,
      transform: `translateX(${offsetLeft}px) scale(${scaleSize})`,
      opacity: loading ? 0 : 1,
    };
  }, [previewState, loading, pageDistance, scaleSize, workspaceHeight, workspaceWidth]);

  const isManualPageBreak = elementHtmls.current.some((x) => isPageBreak(x));

  // =================================================================
  const createPageBreak = () => {
    return `<tr type="page-break" style="page-break-after: always;"></tr>`;
  };

  const createLogo = () => {
    const leftLogoUrl: string = global?.['print']?.leftLogo ?? '';
    const rightLogoUrl: string = global?.['print']?.rightLogo ?? '';
    const __html__: string[] = [
      `<tr style="height: ${config.logoHeight}px;">`,
      `<td colspan="8" align="left" style="vertical-align: top;">`,
      leftLogoUrl ? `<img src="${leftLogoUrl}" border="0" height="46" />` : '',
      `</td>`,
      `<td colspan="16" align="right" style="vertical-align: top;">`,
      rightLogoUrl ? `<img src="${rightLogoUrl}" border="0" height="46" />` : '',
      `</td>`,
      `</tr>`,
    ];
    return __html__.join('');
  };

  const createTdCols = () => {
    let __html__ = '<tr style="height: 0;">';
    // 24 栅格列
    for (let i = 0; i < 24; i++) {
      __html__ += `<td width="${100 / 24}%" style="width: ${100 / 24}%; padding: 0;"></td>`;
    }
    __html__ += '</tr>';
    return __html__;
  };

  const createTemplateCols = () => {
    let oNewTr: Nullable<HTMLTableRowElement> = document.createElement('tr');
    oNewTr.setAttribute('type', 'template-cols');
    oNewTr.style.height = '0';
    oNewTr.innerHTML = createTdCols()
      .replace(/<tr[^>]+>/, '')
      .replace(/<\/tr>/, '');
    insertBefore(oNewTr, elementStore.current['templateEl']);
    oNewTr = null;
  };

  const createNodeStyle = () => {
    const allTableTrs = elementStore.current['templateEl'].children as unknown as HTMLTableRowElement[];
    const elementHtmlsTemp: string[] = [];
    const elementHeightsTemp: number[] = [];
    for (let i = 0; i < allTableTrs.length; i++) {
      const type = allTableTrs[i].getAttribute('type');
      if (type === 'template-cols') continue;
      const height = allTableTrs[i].clientHeight;
      allTableTrs[i].style.height = height + 'px';
      elementHeightsTemp.push(height);
      elementHtmlsTemp.push(allTableTrs[i].outerHTML);
    }
    elementHeights.current = elementHeightsTemp;
    elementHtmls.current = elementHtmlsTemp;
  };

  const createWorkspace = () => {
    if (!elementHtmls.current.length) return;

    const {
      form: { setting, printerType },
    } = previewState;

    // 直接打印
    if (directPrint) {
      return previewHtmls.current.push([createTdCols(), createLogo(), ...elementHtmls.current]);
    }

    // 页面高度
    const pageHeight: number = setting.fixedLogo ? workspaceHeight - config.logoHeight : workspaceHeight;

    // 临时数组
    let tmpArr: string[] = [];
    previewHtmls.current = [];

    // 针式打印机  连续打印
    if (printerType === 'stylus') {
      previewHtmls.current.push([createTdCols(), ...(setting.fixedLogo ? [createLogo()] : []), ...elementHtmls.current]);
    } else {
      let sum = 0;
      for (let i = 0, len = elementHeights.current.length; i < len; i++) {
        const item = elementHtmls.current[i];
        const h = elementHeights.current[i];

        if (!setting.fixedLogo && i === 0) {
          sum += config.logoHeight;
        }

        sum += h;

        // 计算
        if (sum <= pageHeight) {
          tmpArr.push(item);
        } else {
          previewHtmls.current.push([createTdCols(), ...(setting.fixedLogo ? [createLogo()] : []), ...tmpArr]);
          tmpArr = [];
          sum = 0;
          i -= 1;
        }

        // 最后一页
        if (i === len - 1 && tmpArr.length) {
          previewHtmls.current.push([createTdCols(), ...(setting.fixedLogo ? [createLogo()] : []), ...tmpArr]);
        }
      }
    }

    // 不固定 logo
    if (!setting.fixedLogo) {
      previewHtmls.current[0]?.splice(1, 0, createLogo());
    }

    // 分页符
    for (let i = 0, len = previewHtmls.current.length; i < len; i++) {
      if (i === len - 1) break;
      previewHtmls.current[i].push(createPageBreak());
    }

    // 处理分页
    $$preview.setState({ currentPage: 1, totalPage: previewHtmls.current.length });

    // 预览
    createPreviewDom();
  };

  const createPreviewDom = () => {
    const { currentPage } = previewState;
    let __html__ = `<table cellspacing="0" cellpadding="0" border="0" class="${elementStore.current['templateEl'].className}">`;
    __html__ += previewHtmls.current[currentPage - 1]?.join('') ?? '';
    __html__ += `</table>`;
    elementStore.current['previewEl'].innerHTML = __html__;
    // // 滚动条返回顶部
    (elementStore.current['previewEl'].parentNode as HTMLElement).scrollTop = 0;
  };

  const createPrintHtml = (printPageNumber?: number) => {
    let __html__ = `<table cellspacing="0" cellpadding="0" border="0" class="${elementStore.current['templateEl'].className}">`;
    if (typeof printPageNumber !== 'undefined') {
      const curData = [...previewHtmls.current[printPageNumber - 1]];
      __html__ += curData.join('');
    } else {
      for (let i = 0; i < previewHtmls.current.length; i++) {
        __html__ += previewHtmls.current[i].join('');
      }
    }
    __html__ += `</table>`;
    return __html__;
  };

  const createExportHtml = () => {
    const exportHtmls: string[] = [];
    for (let i = 0; i < elementHtmls.current.length; i++) {
      exportHtmls[i] = elementHtmls.current[i]
        .replace(/[\r\n]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/(<td[^>]+>)\s+/, '$1')
        .replace(/\s+(<\/td>)/, '$1');
    }
    return '<table>' + createLogo() + createTdCols() + exportHtmls.join('') + '</table>';
  };

  // 加载完成打印模板组件，创建预览工作区
  const SHOW_PREVIEW = async () => {
    if (elementStore.current['templateEl']?.tagName !== 'TABLE') {
      return throwError();
    }
    if (elementStore.current['previewEl'].innerHTML) return;
    createTemplateCols();
    await sleep(0);
    createNodeStyle();
    createWorkspace();
    setLoading(false);
  };

  const DIRECT_PRINT = async () => {
    if (elementStore.current['templateEl']?.tagName !== 'TABLE') {
      return throwError();
    }
    createTemplateCols();
    await sleep(0);
    createNodeStyle();
    createWorkspace();
    setLoading(false);
    $$preview.doPrint(createPrintHtml());
    await sleep(0);
    $$preview.doClose();
  };

  const throwError = () => {
    warn('QmPrint', '[PrintTemplate] 打印模板组件的根元素必须是 `table` 节点');
  };

  const prefixCls = getPrefixCls('print-container');

  const cls = {
    [prefixCls]: true,
    'no-visible': directPrint,
  };

  return (
    <div ref={containRef} className={classNames(cls)}>
      <QmSpin wrapperClassName="spin" spinning={loading} tip="Loading...">
        <div className={`preview`}>
          {/* 隐藏原始的打印模板内容 */}
          <div
            className={`origin-template`}
            style={{
              width: `${workspaceWidth}px`,
              marginLeft: `-${Math.floor(workspaceWidth / 2)}px`,
            }}
          >
            {templateRender?.()}
          </div>
          {/* 预览工作区 */}
          <div className={`workspace`} style={workspaceStyle} />
        </div>
      </QmSpin>
    </div>
  );
});

Container.displayName = 'Container';

export default Container;
