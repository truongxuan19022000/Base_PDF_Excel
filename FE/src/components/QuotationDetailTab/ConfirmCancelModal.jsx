import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { useQuotationSlice } from 'src/slices/quotation'
import { ACTIVITY, QUOTATION } from 'src/constants/config'

import Loading from '../Loading'

const ConfirmCancelModal = ({
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

  const handleCancelQuotation = () => {
    if (isDisableSubmit) return;
    if (id) {
      setIsDisableSubmit(true)
      dispatch(actions.handleApproveQuotation({
        quotation_id: +id,
        status: QUOTATION.STATUS_VALUE.CANCELED,
        logsInfo: {
          type: ACTIVITY.LOGS.TYPE_VALUE.QUOTATION,
          action_type: ACTIVITY.LOGS.ACTION_VALUE.CANCELED,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          username: currentUser?.username,
        },
        onSuccess,
        onError
      }))
    }
  }
  return (
    <div className="confirmSend">
      <div className="confirmSend__content">
        <img src="/icons/send-brown.svg" alt="send" width="55" height="55" />
        <div className="confirmSend__title">Cancel quotation</div>
        <p className="confirmSend__note">Are you sure to cancel quotation?</p>
        <div className="confirmSend__buttons">
          <button
            className="confirmSend__button"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="confirmSend__button confirmSend__button--apply"
            onClick={handleCancelQuotation}
            disabled={isDisableSubmit}
          >
            {submitting ? <Loading /> : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmCancelModal
