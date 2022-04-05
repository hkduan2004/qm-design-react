/*
 * @Author: 焦质晔
 * @Date: 2022-02-27 21:15:15
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-01 13:03:53
 */
import React from 'react';

const PrintTemplate = (props) => {
  const { dataSource = [] } = props;
  return (
    <table cellSpacing="0" cellPadding="0" border="0" className="fs13">
      <tr>
        <td colSpan="4" className="bor">
          标题1
        </td>
        <td colSpan="4" className="bor">
          标题2
        </td>
        <td colSpan="4" className="bor">
          标题3
        </td>
        <td colSpan="4" className="bor">
          标题4
        </td>
        <td colSpan="4" className="bor">
          标题5
        </td>
        <td colSpan="4" className="bor">
          标题6
        </td>
      </tr>
      {dataSource.map((x, i) => (
        <tr key={i}>
          <td colSpan="4" className="bor">
            内容{x}
          </td>
          <td colSpan="4" className="bor">
            内容{x}
          </td>
          <td colSpan="4" className="bor">
            内容{x}
          </td>
          <td colSpan="4" className="bor">
            内容{x}
          </td>
          <td colSpan="4" className="bor">
            内容{x}
          </td>
          <td colSpan="4" className="bor">
            内容{x}
          </td>
        </tr>
      ))}
    </table>
  );
};

export default PrintTemplate;
