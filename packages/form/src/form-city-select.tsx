/*
 * @Author: 焦质晔
 * @Date: 2021-07-23 14:05:48
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-02-27 11:58:37
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import FormContext from './context';
import ConfigContext from '../../config-provider/context';
import scrollIntoView from 'scroll-into-view-if-needed';
import pinyin from '../../pinyin/index';
import { getPrefixCls } from '../../_utils/prefix';
import { noop, getParserWidth } from '../../_utils/util';
import { t } from '../../locale';
import { DEFAULT_LABEL_WIDTH, BUILT_IN_PLACEMENTS } from './types';
import type { IFormItem } from './types';
import type { IDict } from '../../_utils/types';

import Trigger from 'rc-trigger';
import { Form, Row, Col, Input, Radio, Select } from '../../antd';

import chinaData from 'china-area-data';

type IProps = {
  option: IFormItem;
};

type IState = {
  visible: boolean;
  select_type: string;
  active_key: string;
};

type ICitySelectProps<T = string> = IProps & {
  value?: T;
  onChange?: (value: T) => void;
  onValuesChange: (value: T, text: T) => void;
};

type ICity = {
  l: string;
  n: string;
  c: string;
  p: string;
  children?: ICity[];
};

const zxsCodes: string[] = ['110000', '120000', '310000', '500000']; // 直辖市
const gaCodes: string[] = ['810000', '820000']; // 港澳

const provinceLetter: IDict[] = [
  { text: 'A', value: 'A' },
  { text: 'F', value: 'F' },
  { text: 'G', value: 'G' },
  { text: 'H', value: 'H' },
  { text: 'J', value: 'J' },
  { text: 'L', value: 'L' },
  { text: 'N', value: 'N' },
  { text: 'Q', value: 'Q' },
  { text: 'S', value: 'S' },
  { text: 'T', value: 'T' },
  { text: 'X', value: 'X' },
  { text: 'Y', value: 'Y' },
  { text: 'Z', value: 'Z' },
  { text: '直辖市', value: 'Z1' },
  { text: '港澳', value: 'Z2' },
];

const cityLetter: IDict[] = [
  { text: 'A', value: 'A' },
  { text: 'B', value: 'B' },
  { text: 'C', value: 'C' },
  { text: 'D', value: 'D' },
  { text: 'E', value: 'E' },
  { text: 'F', value: 'F' },
  { text: 'G', value: 'G' },
  { text: 'H', value: 'H' },
  { text: 'J', value: 'J' },
  { text: 'K', value: 'K' },
  { text: 'L', value: 'L' },
  { text: 'M', value: 'M' },
  { text: 'N', value: 'N' },
  { text: 'P', value: 'P' },
  { text: 'Q', value: 'Q' },
  { text: 'R', value: 'R' },
  { text: 'S', value: 'S' },
  { text: 'T', value: 'T' },
  { text: 'W', value: 'W' },
  { text: 'X', value: 'X' },
  { text: 'Y', value: 'Y' },
  { text: 'Z', value: 'Z' },
  { text: '直辖市', value: 'Z1' },
  { text: '港澳', value: 'Z2' },
];

const createPyt = (input: string): string => {
  return pinyin
    .parse(input)
    .map((v) => {
      if (v.type === 2) {
        return v.target.toLowerCase().slice(0, 1);
      }
      return v.target;
    })
    .join('');
};

const formatChinaData = (data: any, key: string, step = 1): ICity[] | undefined => {
  if (step > 2 || !data[key]) return;
  const codes: string[] = key === '86' ? Object.keys(data[key]).filter((x) => ![...zxsCodes, ...gaCodes].includes(x)) : Object.keys(data[key]);
  return codes.map((x) => ({
    l: createPyt(data[key][x].slice(0, 1)).toUpperCase(),
    n: data[key][x],
    c: x,
    p: key,
    children: formatChinaData(data, x, step + 1),
  }));
};

const createOtherData = (data: any, codes: string[]): ICity[] => {
  return codes.map((x) => ({
    l: createPyt(data['86'][x].slice(0, 1)).toUpperCase(),
    n: data['86'][x],
    c: x,
    p: '86',
    children: undefined,
  }));
};

class VCitySelect extends Component<ICitySelectProps, IState> {
  static contextType = FormContext;

  private searchRef = React.createRef<any>();
  private scrollRef = React.createRef<HTMLDivElement>();

  private zxsAndGa;
  private provinces;
  private allCities;
  private letterCities;

  public state: IState = {
    visible: false,
    select_type: '0', // 0 -> 按省份    1 -> 按城市
    active_key: '',
  };

  constructor(props: ICitySelectProps) {
    super(props);
    this.zxsAndGa = this.createZxsAndGa();
    this.provinces = this.createProvince();
    this.allCities = this.createAllCity();
    this.letterCities = this.createCity();
  }

  componentDidMount() {
    this.setInputReadonly();
  }

  handleVisibleChange = (visible: boolean) => {
    this.setState({ visible });
  };

  triggerChange = (value: string) => {
    const { onChange, onValuesChange } = this.props;
    onChange?.(value);
    onValuesChange(value, this.createTextValue(value));
    this.handleVisibleChange(false);
  };

  setInputReadonly() {
    this.searchRef.current!.input.setAttribute('readonly', 'readonly');
  }

  scrollHandle(val: string) {
    this.setState({ active_key: val });
    scrollIntoView(this[`${val}Ref`] as HTMLElement, {
      block: 'start',
      behavior: 'smooth',
      boundary: this.scrollRef.current,
    });
  }

  clickHadnle(val: string) {
    this.triggerChange(val);
  }

  createTextValue(val: string | undefined) {
    return this.allCities.find((x) => x.c === val)?.n || '';
  }

  createZxsAndGa(): ICity[] {
    return [
      { l: 'Z1', n: '直辖市', c: '', p: '', children: createOtherData(chinaData, zxsCodes) },
      { l: 'Z2', n: '港澳', c: '', p: '', children: createOtherData(chinaData, gaCodes) },
    ];
  }

  createProvince(): ICity[] {
    const result: ICity[] = formatChinaData(chinaData, '86') ?? [];
    return result.concat(this.zxsAndGa);
  }

  createAllCity(): ICity[] {
    const result: ICity[] = [];
    this.provinces.forEach((x) => result.push(...x.children));
    return result;
  }

  createCity(): ICity[] {
    const result: ICity[] = cityLetter
      .filter((x) => x.value !== 'Z1' && x.value !== 'Z2')
      .map((x) => {
        return {
          l: x.value,
          n: x.text,
          c: '',
          p: '',
          children: this.allCities.filter((x) => ![...zxsCodes, ...gaCodes].includes(x.c)).filter((k) => k.l === x.value),
        };
      });
    return result.concat(this.zxsAndGa);
  }

  renderType() {
    const { select_type } = this.state;
    return (
      <Radio.Group
        size="small"
        buttonStyle="solid"
        value={select_type}
        onChange={(ev) => {
          const { value } = ev.target;
          this.setState({ select_type: value, active_key: '' }, () => {
            this.scrollRef.current!.scrollTop = 0;
          });
        }}
      >
        <Radio.Button value="0">{t('qm.form.citySelectType.0')}</Radio.Button>
        <Radio.Button value="1">{t('qm.form.citySelectType.1')}</Radio.Button>
      </Radio.Group>
    );
  }

  renderLetter() {
    const { active_key, select_type } = this.state;
    const letters: IDict[] = select_type === '0' ? provinceLetter : cityLetter;
    return letters.map((x) => (
      <li key={x.value} className={classNames({ tag: !0, actived: x.value === active_key })} onClick={() => this.scrollHandle(x.value)}>
        {x.text}
      </li>
    ));
  }

  renderSelect() {
    const { value } = this.props;
    return (
      <Select
        size="small"
        placeholder={t('qm.form.selectPlaceholder')}
        style={{ width: '200px' }}
        showSearch
        filterOption={(input, option) => {
          const text = (option?.children || '') as string;
          return text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        value={value || undefined}
        onChange={(val: string) => {
          this.triggerChange(val);
        }}
      >
        {this.allCities.map((x) => (
          <Select.Option key={x.c} value={x.c}>
            {x.n}
          </Select.Option>
        ))}
      </Select>
    );
  }

  renderCity(val: string | undefined) {
    const { select_type } = this.state;
    const cites: ICity[] = select_type === '0' ? this.provinces : this.letterCities;
    return cites.map((x, i) => (
      <div key={i}>
        <dt ref={(ref) => (this[`${x.l}Ref`] = ref)}>{x.n}：</dt>
        <dd>
          {x.children?.map((k) => (
            <li key={k.c} className={classNames({ actived: k.c === val })} onClick={() => this.clickHadnle(k.c)}>
              {k.n}
            </li>
          ))}
        </dd>
      </div>
    ));
  }

  render() {
    const { visible } = this.state;
    const { value } = this.props;
    const {
      options = {},
      style = {},
      placeholder = t('qm.form.selectPlaceholder'),
      bordered = true,
      allowClear = true,
      readOnly,
      disabled,
    } = this.props.option;
    const prefixCls = getPrefixCls('form-city-select');

    const minWidth = this.searchRef.current ? (this.searchRef.current.input.parentNode as HTMLElement).offsetWidth : 300;

    const contentNode = (
      <div className="container" style={{ ...style }}>
        <div className="city-drop">
          <div className="city-drop-toper">
            <div className="city-drop-toper__type">{this.renderType()}</div>
            <div className="city-drop-toper__search">{this.renderSelect()}</div>
          </div>
          <div className="city-drop-letter">{this.renderLetter()}</div>
          <div ref={this.scrollRef} className="city-drop-list">
            <dl>{this.renderCity(value)}</dl>
          </div>
        </div>
      </div>
    );

    return (
      <ConfigContext.Consumer>
        {(context) => {
          const cls = {
            [prefixCls]: true,
            [`${prefixCls}--lg`]: context?.size === 'large',
            [`${prefixCls}--sm`]: context?.size === 'small',
          };
          return (
            <Trigger
              action={!disabled ? ['click'] : []}
              popupVisible={!disabled ? visible : false}
              popup={contentNode}
              popupClassName={classNames(cls)}
              popupStyle={{ minWidth, ...style }}
              onPopupVisibleChange={this.handleVisibleChange}
              builtinPlacements={BUILT_IN_PLACEMENTS}
              prefixCls="ant-select-dropdown"
              popupPlacement="bottomLeft"
              popupTransitionName="ant-slide-up"
            >
              <Input
                ref={this.searchRef}
                placeholder={placeholder}
                allowClear={allowClear}
                bordered={bordered}
                readOnly={readOnly}
                disabled={disabled}
                value={this.createTextValue(value)}
                onChange={(ev) => {
                  const { value } = ev.target;
                  this.triggerChange(value);
                }}
              />
            </Trigger>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}

class FormCitySelect extends Component<IProps> {
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
              <VCitySelect
                option={this.props.option}
                onValuesChange={(value, text) => {
                  onChange(value);
                  $$form.setViewValue(fieldName, text);
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

export default FormCitySelect;
