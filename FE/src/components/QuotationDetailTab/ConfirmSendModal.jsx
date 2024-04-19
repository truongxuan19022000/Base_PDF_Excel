import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { useQuotationSlice } from 'src/slices/quotation'

import Loading from '../Loading'
import { ACTIVITY } from 'src/constants/config'

const ConfirmSendModal = ({
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

  const handleSendToApproval = () => {
    if (isDisableSubmit) return;
    if (id) {
      setIsDisableSubmit(true)
      dispatch(actions.handleSendToApproval({
        quotation_id: +id,
        logsInfo: {
          type: ACTIVITY.LOGS.TYPE_VALUE.QUOTATION,
          action_type: ACTIVITY.LOGS.ACTION_VALUE.SEND_APPROVAL,
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
        <div className="confirmSend__title">Send for approval</div>
        <p className="confirmSend__note">Are you sure to send for approval? <br />
          The quotation will be send to admin for approval.</p>
        <div className="confirmSend__buttons">
          <button
            className="confirmSend__button"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="confirmSend__button confirmSend__button--apply"
            onClick={handleSendToApproval}
            disabled={isDisableSubmit}
          >
            {submitting ? <Loading /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmSendModal
