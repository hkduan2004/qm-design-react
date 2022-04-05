/*
 * @Author: 焦质晔
 * @Date: 2022-03-12 19:00:26
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-12 19:03:23
 */
// https://github.com/ant-design/ant-design/issues/26190#issuecomment-703673400
import dayjs from 'dayjs';

import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

dayjs.extend(weekday);
dayjs.extend(localeData);
