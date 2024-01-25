import React from 'react'
import dayjs from 'dayjs';

import { ACTIVITY } from 'src/constants/config';

const ActivityLogsForm = ({
  logsData = [],
  isInvoiceDetail = false,
}) => {
  const renderLogsData = (index, item) => {
    const logsName = ACTIVITY.LOGS.LABEL[item.type]
    const actionName = ACTIVITY.LOGS.ACTION[item.action_type]
    const logsTime = dayjs(item.created_at).format('DD MMM YYYY, h:mma')
    const username = item?.username
    return (
      <div key={index} className="logsBoxForm">
        <div className="logsBoxForm__content">
          <img
            className="logsBoxForm__icon"
            src={`/icons/brown-${isInvoiceDetail ? 'invoice.svg' : 'quotation.svg'}`}
            alt="activity icon"
          />
          <div className="logsBoxForm__activity">
            <div className="logsBoxForm__activity--info">
              <span className="logsBoxForm__activity--name">{logsName || 'Item'}</span>
              <span className="logsBoxForm__activity--action">{actionName || ''}</span>
            </div>
            <div className="logsBoxForm__activity--created">
              <span className="logsBoxForm__activity--date">{logsTime || ''}</span>
              <img src="/icons/dot.svg" alt="dot" />
              <span className="logsBoxForm__activity--role">{username || ''}</span>
            </div>
          </div>
        </div>
        {(index === logsData.length - 1) ? null : <div className="logsBoxForm__divider"></div>}
      </div>
    );
  }

  return (
    <div className="activityLogsForm">
      <div className="activityLogsForm__header">ACTIVITY LOGS</div>
      <div className="activityLogsForm__body">
        {logsData.map((item, index) => renderLogsData(index, item))}
      </div>
    </div>
  )
}

export default ActivityLogsForm
