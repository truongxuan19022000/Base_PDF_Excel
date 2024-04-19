import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

import { BASE_URL_LIST, MESSAGE } from 'src/constants/config'
import { isEmptyObject } from 'src/helper/helper'
import { validateUpdateTax } from 'src/helper/validation'
import { useClaimsSlice } from 'src/slices/claims'
import { useInvoiceBillSlice } from 'src/slices/invoiceBill'

const GSTModal = ({
  id,
  gstValue = '',
  closeModal,
  setGstValue,
}) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { actions } = useInvoiceBillSlice()
  const { actions: claimsActions } = useClaimsSlice()

  const currentPath = history.location.pathname
  const baseURL = currentPath?.split('/')[1]

  const [messageError, setMessageError] = useState({});
  const [originalValue, setOriginalValue] = useState(gstValue);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  const onSuccess = (rate) => {
    setMessageError({})
    setOriginalValue(rate)
    closeModal()
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  }

  const handleInputChange = (value) => {
    if (isDisableSubmit) return;
    const formattedValue = value.replace(/\D/g, ''); // format integer number
    setGstValue(formattedValue)
    setMessageError(formattedValue > 100 ? {
      gst_rates: 'Gst rate must less than 100%.'
    } : {})
  }

  const handleClickApply = () => {
    if (isDisableSubmit || !id) return;
    if (+gstValue === +originalValue) {
      setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE
      })
      setIsDisableSubmit(false)
    } else {
      handleUpdateTax()
    }
  }

  const handleUpdateInvoiceTax = () => {
    const data = {
      invoice_id: +id,
      gst_rates: +gstValue,
    }
    const errors = validateUpdateTax(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.updateTax({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  const handleUpdateClaimTax = () => {
    const data = {
      claim_id: +id,
      gst_rates: +gstValue,
    }
    const errors = validateUpdateTax(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(claimsActions.updateTax({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  const handleUpdateTax = () => {
    switch (baseURL) {
      case BASE_URL_LIST.INVOICE:
        handleUpdateInvoiceTax();
        break;
      case BASE_URL_LIST.CLAIMS:
        handleUpdateClaimTax();
        break;
      default:
        return;
    }
  }


  return (
    <div className="gstModal">
      <div className="gstModal__content">
        <div className="gstModal__title">GST Rates</div>
        <div>
          <label>RATES</label>
          <div className={`gstModal__inputBox${messageError?.gst_rates ? ' gstModal__inputBox--error' : ''}`}>
            <input
              type="number"
              placeholder="Rates"
              value={gstValue || ''}
              className="gstModal__input"
              max="100"
              min="0"
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <div className="gstModal__unit">%</div>
          </div>
          {messageError?.gst_rates &&
            <div className="gstModal__message">{messageError.gst_rates}</div>
          }
          {messageError?.message &&
            <div className="gstModal__message">{messageError.message}</div>
          }
        </div>
        <div className="gstModal__buttons">
          <button
            className="gstModal__button"
            onClick={closeModal}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="gstModal__button gstModal__button--apply"
            onClick={handleClickApply}
            disabled={isDisableSubmit || !isEmptyObject(messageError)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default GSTModal
