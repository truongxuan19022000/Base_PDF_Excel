import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

import PriceInputForm from '../InputForm/PriceInputForm';

import { usePurchaseSlice } from 'src/slices/purchase';
import { validatePurchaseUpdateShipping } from 'src/helper/validation';
import { formatPriceWithTwoDecimals, isEmptyObject, parseLocaleStringToNumber } from 'src/helper/helper';
import { PURCHASE } from 'src/constants/config';

const ShippingFeeModal = ({
  id,
  feeValue = '',
  closeModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = usePurchaseSlice()

  const [messageError, setMessageError] = useState({});
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [shippingFee, setShippingFee] = useState(formatPriceWithTwoDecimals(feeValue));

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

  const handleAmountChange = (value) => {
    setShippingFee(value)
    setMessageError({})
  };

  const handleClickOutAmount = (e) => {
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;
    const formattedValue = formatPriceWithTwoDecimals(value)
    setShippingFee(formattedValue)
  };

  const handleClickApply = () => {
    if (isDisableSubmit) return;
    if (!id) {
      setMessageError({
        message: PURCHASE.MESSAGE.ERROR.NO_PURCHASE_ID
      })
      return;
    };

    const isInfoChanged = +feeValue !== parseLocaleStringToNumber(shippingFee)
    if (!isInfoChanged) {
      setMessageError({
        message: PURCHASE.MESSAGE.ERROR.NO_CHANGE
      })
      return;
    };

    const data = {
      purchase_order_id: +id,
      shipping_fee: parseLocaleStringToNumber(shippingFee),
    }
    const errors = validatePurchaseUpdateShipping(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.updateShippingFee({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  return (
    <div className="createPurchase">
      <div className="createPurchase__content">
        <div className="createPurchase__title">Shipping Fee</div>
        <div className="createPurchase__group">
          <div>
            <label>SHIPPING FEE</label>
            <div className={`createPurchase__inputBox createPurchase__inputBox--unit${messageError?.shipping_fee ? ' createPurchase__inputBox--error' : ''}`}>
              <span>$</span>
              <PriceInputForm
                inputValue={shippingFee}
                placeholderTitle="0.00"
                handleAmountChange={handleAmountChange}
                handleClickOutAmount={handleClickOutAmount}
              />
            </div>
            {messageError?.shipping_fee &&
              <div className="createPurchase__message">{messageError.shipping_fee}</div>
            }
            {messageError?.message &&
              <div className="createPurchase__message">{messageError.message}</div>
            }
          </div>
        </div>
        <div className="createPurchase__buttons">
          <button
            className="createPurchase__button"
            onClick={closeModal}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="createPurchase__button createPurchase__button--apply"
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

export default ShippingFeeModal
