/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-08-02 12:06:02
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ConfigContext from '../context';
import { setLocale } from '../../locale';
import { throwError } from '../../_utils/error';
import { isValidComponentSize } from '../../_utils/validators';
import { ConfigProvider } from '../../antd';
import type { IConfig } from '../context';

// QmDesign locale
import zhCN_qm from '../../locale/lang/zh-cn';
import en_qm from '../../locale/lang/en';

// Antd locale
import zhCN_antd from 'antd/lib/locale/zh_CN';
import enGB_antd from 'antd/lib/locale/en_GB';

type IProps = {
  locale: IConfig['locale']; // 多语言
  size: IConfig['size']; // 组件尺寸
  theme?: string; // 主题
  global?: IConfig['global']; // 全局配置
};

type IState = {
  value: IConfig;
};

export type QmConfigProviderProps = IProps;

const messages = {
  [en_qm.name]: {
    qm: en_qm,
    antd: enGB_antd,
  },
  [zhCN_qm.name]: {
    qm: zhCN_qm,
    antd: zhCN_antd,
  },
};

class QmConfigProvider extends Component<IProps, IState> {
  static propTypes = {
    locale: PropTypes.string,
    size: (props, propName, componentName) => {
      if (!isValidComponentSize(props[propName] || '')) {
        return throwError('QmDivider', 'Invalid prop `' + propName + '` supplied to' + ' `' + componentName + '`. Validation failed.');
      }
    },
    theme: PropTypes.string,
    global: PropTypes.object,
  };

  static defaultProps = {
    locale: 'zh-cn', // 默认 zh-cn
    size: 'middle', // 默认 middle
    global: {}, // 默认全局配置
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      value: {
        locale: props.locale,
        size: props.size,
        global: props.global!,
      },
    };
    setLocale(messages[props.locale][`qm`]);
  }

  static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
    const { locale: prevLocale, size: prevSize } = prevState.value;
    const { locale: nextLocale, size: nextSize } = nextProps;
    if (nextLocale !== prevLocale) {
      setLocale(messages[nextLocale][`qm`]);
    }
    if (nextLocale !== prevLocale || nextSize !== prevSize) {
      return {
        value: Object.assign({}, prevState.value, {
          locale: nextLocale,
          size: nextSize,
        }),
      };
    }
    return null;
  }

  render(): React.ReactElement {
    const { global } = this.props;
    const { value } = this.state;
    return (
      <ConfigContext.Provider value={value}>
        <ConfigProvider
          locale={messages[value.locale][`antd`]}
          componentSize={value.size}
          autoInsertSpaceInButton={global!['autoInsertSpaceInButton']}
        >
          {this.props.children}
        </ConfigProvider>
      </ConfigContext.Provider>
    );
  }
}

export default QmConfigProvider;
