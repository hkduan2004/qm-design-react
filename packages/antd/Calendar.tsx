/*
 * @Author: 焦质晔
 * @Date: 2021-08-14 09:53:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-12 18:59:36
 */
import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';
import generateCalendar from 'antd/es/calendar/generateCalendar';
import 'antd/es/calendar/style';

const Calendar = generateCalendar<Dayjs>(dayjsGenerateConfig as any);

export default Calendar;
