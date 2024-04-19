import React from 'react'
import dayjs from 'dayjs';

import { ACTIVITY } from 'src/constants/config';

const ActivityLogsForm = ({
  logsData = [],
  logsNameList = [],
  actionNameList = [],
}) => {
  const renderLogsData = (index, item) => {
    const logsName = logsNameList[item?.type]
    const actionName = actionNameList[item?.action_type]
    const logsTime = item?.created_at && dayjs(item?.created_at).format('DD MMM YYYY, h:mma')
    const username = item?.username || item?.user?.username
    const icon = ACTIVITY.LOGS.ICON_TYPE[item.type] || ACTIVITY.DEFAULT_ICON;

    return (
      item &&
      <div key={index} className="logsBoxForm">
        <div className="logsBoxForm__left">
          <img
            className="logsBoxForm__icon"
            src={icon}
            alt="activity icon"
          />
          {(index === logsData.length - 1) ? null : <div className="logsBoxForm__divider"></div>}
        </div>
        <div className="logsBoxForm__right">
          <div className="logsBoxForm__info">
            <div>{logsName || 'Item'}</div>
            <div className="logsBoxForm__detail">
              <div className="logsBoxForm__action">{actionName || ''}</div>
            </div>
          </div>
          <div className="logsBoxForm__created">
            <span >{logsTime || ''}</span>
            <img src="/icons/dot.svg" alt="dot" />
            <span>{username || ''}</span>
          </div>
        </div>
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
