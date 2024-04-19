import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { DEFAULT_GST_VALUE } from 'src/constants/config'
import { isEmptyObject } from 'src/helper/helper'

import { validatePurchaseUpdateTax } from 'src/helper/validation'
import { usePurchaseSlice } from 'src/slices/purchase'

const TaxModal = ({
  id,
  taxValue,
  closeModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = usePurchaseSlice()

  const [messageError, setMessageError] = useState({});
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [tax, setTax] = useState(taxValue || DEFAULT_GST_VALUE);

  const onSuccess = () => {
    setMessageError({})
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
    const formattedValue = value.replace(/\D/g, '');//format integer number
    setTax(formattedValue)
    setMessageError(formattedValue > 100 ? {
      tax: 'Gst rate must less than 100%.'
    } : {})
  }

  const handleClickApply = () => {
    if (isDisableSubmit || !id) return;
    const data = {
      purchase_order_id: +id,
      tax: +tax,
    }
    const errors = validatePurchaseUpdateTax(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.updateTax({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  return (
    <div className="gstModal">
      <div className="gstModal__content">
        <div className="gstModal__title">GST Rates</div>
        <div>
          <label>RATES</label>
          <div className={`gstModal__inputBox${messageError?.tax ? ' gstModal__inputBox--error' : ''}`}>
            <input
              type="number"
              placeholder="0"
              value={tax || ''}
              className="gstModal__input"
              max="100"
              min="0"
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <div className="gstModal__unit">%</div>
          </div>
          {messageError?.tax &&
            <div className="gstModal__message">{messageError.tax}</div>
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

export default TaxModal
