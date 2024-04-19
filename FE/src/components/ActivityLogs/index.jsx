import React from 'react';
import dayjs from 'dayjs';

import { CUSTOMERS } from 'src/constants/config';

const ActivityLogs = ({ logsData = [] }) => {
  const renderLogsData = (index, item) => {
    const iconSrc = CUSTOMERS.LOGS.ICON[item?.type]
    const logsName = CUSTOMERS.LOGS.LABEL[item?.type]
    const actionName = CUSTOMERS.LOGS.ACTION[item?.action_type]
    const logsTime = dayjs(item?.created_at).format('DD MMM YYYY, h:mma')
    const username = item?.user?.username

    let logFileName = '';
    if (item?.type === CUSTOMERS.TYPE_VALUE.QUOTATION) {
      logFileName = item?.quotation?.reference_no;
    } else if (item?.type === CUSTOMERS.TYPE_VALUE.INVOICE) {
      logFileName = item?.quotation?.invoice_no;
    } else if (item?.type === CUSTOMERS.TYPE_VALUE.CUSTOMER) {
      logFileName = item?.action_type === CUSTOMERS.ACTION_CREATE_VALUE ? '' : 'Information';
    }

    return (
      item &&
      <div key={index} className="logsBox">
        <div className="logsBox__content">
          <img
            className="logsBox__icon"
            src={iconSrc}
            alt={logsName}
          />
          <div className="logsBox__activity">
            <div className="logsBox__activity--info">
              <span className="logsBox__activity--name">{logsName || ''}</span>
              {logFileName && (
                <span className="logsBox__activity--code">{logFileName || ''}</span>
              )}
              <span className="logsBox__activity--action">{actionName || ''}</span>
            </div>
            <div className="logsBox__activity--created">
              <span className="logsBox__activity--date">{logsTime || ''}</span>
              <img src="/icons/dot.svg" alt="dot" />
              <span className="logsBox__activity--role">{username || ''}</span>
            </div>
          </div>
        </div>
        {(index === logsData.length - 1) ? null : <div className="logsBox__divider"></div>}
      </div>
    );
  }

  return (
    <div className="activityLogs">
      <div className="activityLogs__header">ACTIVITY LOGS</div>
      <div className="activityLogs__body">
        {logsData.map((item, index) => renderLogsData(index, item))}
      </div>
    </div>
  )
}

export default ActivityLogs
