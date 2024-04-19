import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom';

import HeadlineBar from 'src/components/HeadlineBar';
import ActivityLogsForm from 'src/components/ActivityLogsForm';
import InventorySelectForm from 'src/components/InventorySelectForm';

import { ACTIVITY, ALERT, MESSAGE, PERMISSION, SCRAP, STATUS } from 'src/constants/config';
import { isEmptyObject } from 'src/helper/helper';
import { useScrapSlice } from 'src/slices/scrap'
import { alertActions } from 'src/slices/alert';
import { validatePermission } from 'src/helper/validation';

const EditScrap = () => {
  const dispatch = useDispatch()

  const { id } = useParams()
  const { actions } = useScrapSlice()
  const { detail } = useSelector(state => state.scrap)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.SCRAP, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [scrapStatus, setScrapStatus] = useState({});
  const [messageError, setMessageError] = useState({});
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  useEffect(() => {
    id && dispatch(actions.getScrapDetail({ id }))
  }, [id])

  useEffect(() => {
    if (!isEmptyObject(detail)) {
      const foundStatus = STATUS.SCRAP[detail?.scraps?.status];
      setScrapStatus(foundStatus)
    }
  }, [detail])

  const handleChangeStatus = (status) => {
    setScrapStatus(status)
    setMessageError({})
  }

  const handleSaveChanged = () => {
    if (isEditAllowed) {
      if (detail.scraps?.status !== STATUS.SCRAP_UN_USED) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          description: SCRAP.MESSAGE_ERROR.SCRAP_USED,
        }));
        return;
      }

      if (isDisableSubmit || !id) return;
      if (scrapStatus?.value === detail.scraps?.status) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          description: MESSAGE.ERROR.INFO_NO_CHANGE,
        }))
      } else {
        const { scraps } = detail;
        const data = {
          scrap_id: +scraps?.scrap_id,
          status: +scrapStatus?.value,
        }
        dispatch(actions.updateScrap({
          ...data,
          onSuccess,
          onError,
        }))
        setIsDisableSubmit(true)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const onSuccess = () => {
    setIsDisableSubmit(false)
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  }

  return (
    <div className="editScrap">
      <HeadlineBar
        buttonName="Save"
        headlineTitle="Edit Scrap"
        onClick={handleSaveChanged}
        isDisableSubmit={isDisableSubmit}
      />
      <div className="editScrap__content">
        <div className="editScrap__sections">
          <div className="editScrap__section">
            <div className="editScrap__formData">
              <label>Item</label>
              <div className="editScrap__box editScrap__box--disabled">{detail.scraps?.item || ''}</div>
            </div>
            <div className="editScrap__formData">
              <label>Item Code</label>
              <div className="editScrap__box editScrap__box--disabled">{detail.scraps?.code || ''}</div>
            </div>
          </div>
          <div className="editScrap__section">
            <div className="editScrap__formData">
              <label>From Quotation Reference No.</label>
              <div className="editScrap__box editScrap__box--disabled">{detail.scraps?.reference_no || ''}</div>
            </div>
            <div className="editScrap__formData">
              <label>Product Code</label>
              <div className="editScrap__box editScrap__box--disabled">{detail.scraps?.product_code || ''}</div>
            </div>
          </div>
          <div className={`editScrap__section${isEditAllowed ? '' : ' editScrap__section--disabled'}`}>
            <div className="editScrap__formData">
              <label>Length</label>
              <div className="editScrap__box editScrap__box--disabled">{detail.scraps?.scrap_length || ''}</div>
            </div>
            <div className="editScrap__formData">
              <label>Status</label>
              {detail.scraps?.status === STATUS.SCRAP_UN_USED ?
                <InventorySelectForm
                  data={STATUS.SCRAP_STATUS}
                  placeholder="Status"
                  keyValue="status"
                  borderLight={true}
                  selectedItem={scrapStatus}
                  messageError={messageError}
                  setSelectedItem={handleChangeStatus}
                  setMessageError={setMessageError}
                  setIsInputChanged={() => { }}
                />
                :
                <div className="editScrap__box editScrap__box--disabled">
                  {scrapStatus.label || ''}
                </div>
              }
            </div>
          </div>
        </div>
        <div className="editScrap__activity">
          <ActivityLogsForm
            logsNameList={ACTIVITY.LOGS.LABEL}
            actionNameList={ACTIVITY.LOGS.ACTION}
            logsData={detail.activities}
          />
        </div>
      </div>
    </div>
  )
}

export default EditScrap
