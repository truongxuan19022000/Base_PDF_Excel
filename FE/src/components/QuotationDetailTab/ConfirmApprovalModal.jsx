import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { ACTIVITY, QUOTATION } from 'src/constants/config'
import { useQuotationSlice } from 'src/slices/quotation'

import Loading from '../Loading'

const ConfirmApprovalModal = ({
  id,
  closeModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSlice()

  const { submitting } = useSelector(state => state.quotation)
  const currentUser = useSelector(state => state.user.user)

  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const onSuccess = () => {
    closeModal()
    setIsDisableSubmit(false)
  }

  const onError = () => {
    setIsDisableSubmit(false)
  }

  const handleApproveQuotation = () => {
    if (isDisableSubmit) return;
    if (id) {
      setIsDisableSubmit(true)
      dispatch(actions.handleApproveQuotation({
        quotation_id: +id,
        status: QUOTATION.STATUS_VALUE.APPROVED,
        logsInfo: {
          type: ACTIVITY.LOGS.TYPE_VALUE.QUOTATION,
          action_type: ACTIVITY.LOGS.ACTION_VALUE.APPROVED,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          username: currentUser?.username,
        },
        onSuccess, onError
      }))
    }
  }
  return (
    <div className="confirmSend">
      <div className="confirmSend__content">
        <img src="/icons/send-brown.svg" alt="send" width="55" height="55" />
        <div className="confirmSend__title">Approval quotation</div>
        <p className="confirmSend__note">Are you sure to approve quotation?</p>
        <div className="confirmSend__buttons">
          <button
            className="confirmSend__button"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="confirmSend__button confirmSend__button--apply"
            onClick={handleApproveQuotation}
            disabled={isDisableSubmit}
          >
            {submitting ? <Loading /> : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmApprovalModal
