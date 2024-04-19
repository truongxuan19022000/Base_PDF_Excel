import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ALERT } from 'src/constants/config';
import { useAlertSlice } from 'src/slices/alert';

const AlertForm = () => {
  const dispatch = useDispatch();
  const { actions } = useAlertSlice();

  const { isShowAlert, alertData, turnOffTime } = useSelector(state => state.alert);

  useEffect(() => {
    let closeAlertTimeOut;
    if (turnOffTime && isShowAlert && !alertData.isHovered) {
      closeAlertTimeOut = setTimeout(() => {
        dispatch(actions.closeAlert());
      }, turnOffTime);
      return () => clearTimeout(closeAlertTimeOut);
    }
  }, [isShowAlert, alertData.isHovered, turnOffTime]);

  const handleDismiss = () => {
    dispatch(actions.closeAlert());
  };

  const handleHoverOnAlert = () => {
    dispatch(actions.handleHoverOnAlert(ALERT.RESET_TIME_OUT_VALUE));
  }
  const handleMouseOutAlert = () => {
    dispatch(actions.handleMouseOutAlert(ALERT.RESET_TIME_OUT_VALUE));
  }

  const icon = alertData.type === ALERT.SUCCESS_VALUE ? ALERT.ICON.SUCCESS : ALERT.ICON.FAILED;
  const type = ALERT.TYPE[alertData.type]?.label;

  return (
    <div className="alertForm">
      <div className="alertForm__list">
        <div
          className={`alertNotify alertNotify--${type}`}
          onClick={handleDismiss}
          onMouseEnter={handleHoverOnAlert}
          onMouseLeave={handleMouseOutAlert}
        >
          <div className="alertNotify__content">
            <div className="alertNotify__icon">
              <img src={icon} alt="icon" />
            </div>
            <div className="alertNotify__body">
              <div className="alertNotify__title">{alertData.title}</div>
              <div className="alertNotify__description">{alertData.description}</div>
            </div>
          </div>
          <div
            className="alertNotify__closeMark"
            onClick={handleDismiss}
          >
            <img src="/icons/x-mark.svg" alt="x mark" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertForm;
