/*
 * @Author: 焦质晔
 * @Date: 2021-08-17 08:27:05
 * @Last Modified by:   焦质晔
 * @Last Modified time: 2021-08-17 08:27:05
 */
import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';
import generatePicker from 'antd/es/date-picker/generatePicker';
import 'antd/es/date-picker/style/index';

const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig as any);

export default DatePicker;
