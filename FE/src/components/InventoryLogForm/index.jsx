import React from 'react'
import dayjs from 'dayjs';

import { ACTIVITY, INVENTORY } from 'src/constants/config';

const InventoryLogForm = ({
  logsData = [],
}) => {
  const getFieldLabel = (field, changedValue) => {
    const labels = {
      'price': 'S$ ' + changedValue,
      'coating_price': 'S$ ' + changedValue,
      'profile': INVENTORY.PROFILES[changedValue]?.label || changedValue,
      'price_unit': INVENTORY.PRICE_UNIT[changedValue]?.label || changedValue,
      'service_type': INVENTORY.SERVICE[changedValue]?.label || changedValue,
      'door_window_type': INVENTORY.WINDOW_TYPE[changedValue]?.label || changedValue,
      'coating_price_unit': INVENTORY.COATING_PRICE_UNIT[changedValue]?.label || changedValue,
    };
    return labels[field] || changedValue;
  };

  const formatMessage = (field, oldValue, newValue) => (
    <span className="logsBoxForm__activity--message">
      from <b>{getFieldLabel(field, oldValue)}</b> to <b>{getFieldLabel(field, newValue)}</b>
    </span>
  );

  const renderMessageChanged = (message) => {
    switch (message.field) {
      case INVENTORY.LABEL.ITEM:
      case INVENTORY.LABEL.CODE:
      case INVENTORY.LABEL.PRICE:
      case INVENTORY.LABEL.WEIGHT:
      case INVENTORY.LABEL.PROFILE:
      case INVENTORY.LABEL.PRICE_UNIT:
      case INVENTORY.LABEL.MIN_SIZE:
      case INVENTORY.LABEL.RAW_LENGTH:
      case INVENTORY.LABEL.SERVICE_TYPE:
      case INVENTORY.LABEL.COATING_PRICE:
      case INVENTORY.LABEL.DOOR_WINDOW_TYPE:
      case INVENTORY.LABEL.COATING_PRICE_UNIT:
        return formatMessage(message.field, message.oldValue, message.newValue);

      case INVENTORY.LABEL.INNER_SIDE:
      case INVENTORY.LABEL.OUTER_SIDE:
        return (
          <span className="logsBoxForm__activity--message">
            {message.newValue === INVENTORY.CHECKED ? 'edited to ticked' : 'edited to unticked'}
          </span>
        );
      default:
        return null;
    }
  };

  const renderLogMessage = (message, index, actionType, logsTime, username) => {
    const fieldName = INVENTORY.ACTIVITY.FIELD_NAME.find(name => name.value === message.field)?.label
    return (
      <div key={index} className="logsBoxForm__activity--box">
        <div className="logsBoxForm__activity--info">
          <span className="logsBoxForm__activity--name">{fieldName || 'Item'}</span>
          <span className="logsBoxForm__activity--action">{actionType}</span><br />
          <span className="logsBoxForm__activity--action">
            {renderMessageChanged(message)}
          </span>
        </div>
        <div className="logsBoxForm__activity--created">
          <span className="logsBoxForm__activity--date">{logsTime || ''}</span>
          <img src="/icons/dot.svg" alt="dot" />
          <span className="logsBoxForm__activity--role">{username || ''}</span>
        </div>
      </div>
    )
  }

  const renderLogsData = (index, item) => {
    const username = item.username;
    const changedMessages = JSON.parse(item.message);
    const logsTime = dayjs(item.created_at).format('DD MMM YYYY, h:mma');
    const isIncludePriceChanged = changedMessages?.find(msg => msg.field === 'price');
    const actionType = ACTIVITY.LOGS.MATERIAL_ACTION[item.action_type]

    return (
      <div key={index} className="logsBoxForm">
        <div className="logsBoxForm__content">
          <div className="logsBoxForm__content--left" >
            <img
              className="logsBoxForm__icon"
              src={`/icons/${isIncludePriceChanged ? 'price.svg' : 'brown-quotation.svg'}`}
              alt="activity icon"
            />
            {!(index === logsData.length - 1) && <div className="logsBoxForm__divider"></div>}
          </div>
          {changedMessages?.length > 0 ? (
            <div className="logsBoxForm__activity">
              {changedMessages.map((message, index) => renderLogMessage(message, index, actionType, logsTime, username))}
            </div>
          ) : (
            <div className="logsBoxForm__activity">
              <div className="logsBoxForm__activity--box">
                <div className="logsBoxForm__activity--info">
                  <span className="logsBoxForm__activity--name">Item</span>
                  <span className="logsBoxForm__activity--action">{actionType}</span>
                </div>
                <div className="logsBoxForm__activity--created">
                  <span className="logsBoxForm__activity--date">{logsTime || ''}</span>
                  <img src="/icons/dot.svg" alt="dot" />
                  <span className="logsBoxForm__activity--role">{username || ''}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="inventoryLogForm">
      <div className="inventoryLogForm__header">ACTIVITY LOGS</div>
      <div className="inventoryLogForm__body">
        {logsData.map((item, index) => renderLogsData(index, item))}
      </div>
    </div>
  )
}

export default InventoryLogForm
