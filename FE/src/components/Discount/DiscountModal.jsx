import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';

import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals, isEmptyObject, parseLocaleStringToNumber } from 'src/helper/helper';
import { validatePurchaseUpdateDiscount } from 'src/helper/validation';
import { usePurchaseSlice } from 'src/slices/purchase';
import { DISCOUNT, PURCHASE, QUOTATION } from 'src/constants/config';

import PriceInputForm from '../InputForm/PriceInputForm';

const DiscountModal = ({
  id,
  bottomBarData = {},
  closeModal,
}) => {
  const { actions } = usePurchaseSlice()
  const dispatch = useDispatch()

  const [messageError, setMessageError] = useState({});
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [discountType, setDiscountType] = useState({});

  const totalBeforeGST = useMemo(() => {
    return +bottomBarData.subTotal || 0;
  }, [bottomBarData.subTotal]);

  const onSuccess = () => {
    setMessageError({})
    closeModal()
    setIsDisableSubmit(false);
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  }

  useEffect(() => {
    if (!isEmptyObject(bottomBarData)) {
      const typeDiscount = bottomBarData.discountType === QUOTATION.PERCENT_VALUE
        ? QUOTATION.DISCOUNT_TYPE.PERCENT : QUOTATION.DISCOUNT_TYPE.AMOUNT;
      const percent = totalBeforeGST > 0 ? bottomBarData.discountAmount / totalBeforeGST * 100 : 0;
      setDiscountType(typeDiscount)
      setDiscountAmount(bottomBarData.discountAmount)
      setDiscountPercent(formatNumberWithTwoDecimalPlaces(percent))
    }
  }, [bottomBarData])

  const handleChangeType = (item) => {
    setDiscountType(item)
    setMessageError({})
    if (item.id === bottomBarData.discountType) {
      setDiscountAmount(bottomBarData.discountAmount)
      if (item.id === DISCOUNT.TYPE.PERCENT && totalBeforeGST > 0) {
        const percent = bottomBarData.discountAmount / totalBeforeGST * 100;
        setDiscountPercent(formatNumberWithTwoDecimalPlaces(percent))
      }
    }
  }

  const handleSetDiscount = (value) => {
    if (isDisableSubmit || !id) {
      setMessageError({
        message: PURCHASE.MESSAGE.ERROR.NO_PURCHASE_ID
      })
    };
    if (!isNaN(value)) {
      setDiscountPercent(value)
      const amount = formatPriceWithTwoDecimals(value / 100 * totalBeforeGST)
      setDiscountAmount(amount)
      setMessageError(value > 100 ? {
        discount_percent: 'Discount percentage must less than 100%.'
      } : {})
    }
  }
  const handleAmountChange = (value, keyValue, field) => {
    const fieldSetters = {
      'discount_percent': setDiscountPercent,
      'discount_amount': setDiscountAmount,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      if (field !== 'discount_amount') {
        const amount = formatPriceWithTwoDecimals(value * parseLocaleStringToNumber(totalBeforeGST) / 100)
        setDiscountAmount(amount)
        setMessageError(value > 100 ? {
          discount_percent: 'Discount percentage must less than 100%.'
        } : {})
      }
      setMessageError(value > parseLocaleStringToNumber(totalBeforeGST) ? {
        discount_amount: 'Discount amount must less than the total.'
      } : {})
    }
  };

  const handleClickOutAmount = (e, keyValue, field) => {
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;
    const formattedValue = formatPriceWithTwoDecimals(value)
    const fieldSetters = {
      'discount_percent': setDiscountPercent,
      'discount_amount': setDiscountAmount,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(formattedValue);
    }
  };

  const handleClickApply = () => {
    if (isDisableSubmit) return;
    if (!id) {
      setMessageError({
        message: PURCHASE.MESSAGE.ERROR.NO_PURCHASE_ID
      })
      return;
    };

    const isInfoChanged = (
      +discountType.id !== bottomBarData.discountType ||
      +discountAmount !== bottomBarData.discountAmount
    )

    if (!isInfoChanged) {
      setMessageError({
        message: PURCHASE.MESSAGE.ERROR.NO_CHANGE
      })
      return;
    };
    const data = {
      purchase_order_id: +id,
      discount_type: +discountType.id || DISCOUNT.TYPE.PERCENT,
      discount_amount: parseLocaleStringToNumber(discountAmount),
    }
    const errors = validatePurchaseUpdateDiscount(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.updateDiscount({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  return (
    <div className="discountModal">
      <div className="amountModal">
        <p className="amountModal__headerText">
          Add Discount
        </p>
        <div className="amountModal__inner">
          <div className="amountModal__optionWrapper">
            {Object.values(QUOTATION.DISCOUNT_TYPE).map((item, index) => (
              item.id !== 0 &&
              <div
                key={index}
                className={`amountModal__option${discountType?.id === item.id ? ' amountModal__option--active' : ''}`}
                onClick={() => handleChangeType(item)}
              >
                {item.label}
              </div>
            ))}
          </div>
          {discountType?.id === DISCOUNT.TYPE.PERCENT ?
            <>
              <div className="amountModal__formGroup">
                <label className="amountModal__label">DISCOUNT PERCENTAGE</label>
                <div className={`amountModal__input${messageError?.discount_percent ? ' amountModal__input--error' : ''}`}>
                  <input
                    type="number"
                    value={discountPercent || ''}
                    placeholder="0"
                    min="0"
                    max="100"
                    onChange={({ target }) => handleSetDiscount(target.value)}
                  />
                  <div className="amountModal__currency">
                    %
                  </div>
                </div>
                {messageError?.discount_percent &&
                  <div className="amountModal__input--message">{messageError.discount_percent}</div>
                }
              </div>
              <div className="amountModal__formGroup">
                <label className="amountModal__label">DISCOUNT AMOUNT</label>
                <div className="amountModal__input amountModal__input--inActive">
                  <div className="amountModal__currency amountModal__currency--icon">
                    $
                  </div>
                  <PriceInputForm
                    inputValue={discountAmount}
                    placeholderTitle="0.00"
                    isDisabled={true}
                  />
                </div>
              </div>
            </> :
            <div className="amountModal__formGroup">
              <label className="amountModal__label">DISCOUNT AMOUNT</label>
              <div className={`amountModal__input${messageError?.discount_amount ? ' amountModal__input--error' : ''}`}>
                <div className="amountModal__currency amountModal__currency--icon">
                  $
                </div>
                <PriceInputForm
                  inputValue={discountAmount}
                  field="discount_amount"
                  placeholderTitle="0.00"
                  handleAmountChange={handleAmountChange}
                  handleClickOutAmount={handleClickOutAmount}
                />
              </div>
              {messageError?.discount_amount &&
                <div className="amountModal__input--message">{messageError.discount_amount}</div>
              }
            </div>
          }
          {messageError?.message &&
            <div className="amountModal__input--message">{messageError.message}</div>
          }
        </div>
        <div className="amountModal__buttonWrapper">
          <button
            className="amountModal__button"
            onClick={closeModal}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="amountModal__button amountModal__button--brown"
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

export default DiscountModal
