import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { ACTIVITY, QUOTATION } from 'src/constants/config'
import { isEmptyObject } from 'src/helper/helper'
import { useQuotationSlice } from 'src/slices/quotation'
import { validateRejectQuotation } from 'src/helper/validation'

import Loading from '../Loading'

const ConfirmRejectModal = ({
  id,
  closeModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSlice()

  const { submitting } = useSelector(state => state.quotation)
  const currentUser = useSelector(state => state.user.user)

  const [reason, setReason] = useState('')
  const [messageError, setMessageError] = useState({})
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const onSuccess = () => {
    setReason('')
    setMessageError({})
    setIsDisableSubmit(false)
    closeModal()
  }

  const onError = () => {
    setIsDisableSubmit(false)
  }

  const handleInputChange = (value) => {
    if (isDisableSubmit) return;
    setReason(value)
    setMessageError(
      value.length > 150
        ? { reject_reason: 'The reject reason must less than 150 digits.' }
        : {}
    )
  }

  const handleRejectQuotation = () => {
    if (isDisableSubmit) return;
    if (id) {
      const data = {
        quotation_id: +id,
        status: QUOTATION.STATUS_VALUE.REJECTED,
        reject_reason: reason,
        logsInfo: {
          type: ACTIVITY.LOGS.TYPE_VALUE.QUOTATION,
          action_type: ACTIVITY.LOGS.ACTION_VALUE.REJECTED,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          username: currentUser?.username,
        },
      }
      const errors = validateRejectQuotation(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(actions.handleApproveQuotation({
          ...data,
          onError, onSuccess
        }))
        setIsDisableSubmit(true)
      }
    }
  }

  return (
    <div className="confirmReject">
      <div className="confirmReject__content">
        <img src="/icons/reject-brown.svg" alt="reject" width="55" height="55" />
        <div className="confirmReject__title">Reject quotation</div>
        <p className="confirmReject__note">Are you sure to reject quotation?</p>
        <div className="confirmReject__inputBox">
          <label>REJECT REASON</label>
          <input
            type="text"
            value={reason || ''}
            placeholder="Type reject reason"
            className={`confirmReject__input${messageError?.reject_reason ? ' confirmReject__input--error' : ''}`}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          {messageError?.reject_reason &&
            <div className="confirmReject__message">{messageError.reject_reason}</div>
          }
        </div>
        <div className="confirmReject__buttons">
          <button
            className="confirmReject__button"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="confirmReject__button confirmReject__button--apply"
            onClick={handleRejectQuotation}
            disabled={isDisableSubmit || !isEmptyObject(messageError)}
          >
            {submitting ? <Loading /> : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmRejectModal
