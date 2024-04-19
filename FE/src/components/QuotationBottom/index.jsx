import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { alertActions } from 'src/slices/alert'
import { quotationActions } from 'src/slices/quotation'
import { validatePermission } from 'src/helper/validation'
import { ALERT, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config'
import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals, isEmptyObject, parseLocaleStringToNumber, roundToTwoDecimals } from 'src/helper/helper'

import PriceInputForm from '../InputForm/PriceInputForm'

const QuotationBottom = ({ isEditable = false }) => {
  const { id } = useParams()
  const dispatch = useDispatch()

  const bottomBarData = useSelector(state => state.quotation.bottomBarData)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [discountPercent, setDiscountPercent] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')
  const [isOpenDiscountModal, setIsOpenDiscountModal] = useState(false)
  const [discountType, setDiscountType] = useState(QUOTATION.DISCOUNT_TYPE.PERCENT)

  const [discount, setDiscount] = useState(0.00);
  const [otherFees, setOtherFees] = useState(0.00);
  const [grandTotal, setGrandTotal] = useState(0.00)
  const [sumSections, setSumSections] = useState(0.00);
  const [totalBeforeGST, setTotalBeforeGST] = useState(0.00);
  const [estimateScrapCost, setEstimateScrapCost] = useState(0.00);
  const [messageError, setMessageError] = useState({});

  const onSuccess = () => {
  }

  const onError = () => {
  }

  useEffect(() => {
    if (!isEmptyObject(bottomBarData)) {
      const percent = bottomBarData.totalBeforeGST > 0 ? ((bottomBarData.discountAmount / bottomBarData.totalBeforeGST) * 100) : 0
      const typeDiscount = bottomBarData.discountType === QUOTATION.PERCENT_VALUE
        ? QUOTATION.DISCOUNT_TYPE.PERCENT : QUOTATION.DISCOUNT_TYPE.AMOUNT;
      setDiscountType(typeDiscount);
      setDiscount(bottomBarData.discountAmount)
      setOtherFees(bottomBarData.otherFees)
      setGrandTotal(parseLocaleStringToNumber(bottomBarData.grandTotal))
      setSumSections(bottomBarData.sumSections)
      setTotalBeforeGST(bottomBarData.totalBeforeGST)
      setEstimateScrapCost(bottomBarData.estimateScrapCost)
      setDiscountPercent(formatNumberWithTwoDecimalPlaces(percent))
      setDiscountAmount(formatPriceWithTwoDecimals(bottomBarData.discountAmount))
    }
  }, [bottomBarData])

  useEffect(() => {
    setDiscountPercent('')
    setDiscountAmount('')
    setMessageError({})
  }, [discountType])

  useEffect(() => {
    if (!isOpenDiscountModal) {
      setDiscountAmount('')
      setDiscountPercent('')
      setDiscountType(QUOTATION.DISCOUNT_TYPE.PERCENT)
    } else if (!isEmptyObject(bottomBarData) && bottomBarData.totalBeforeGST > 0) {
      const percent = bottomBarData.totalBeforeGST > 0 ? ((bottomBarData.discountAmount / bottomBarData.totalBeforeGST) * 100) : 0
      const typeDiscount = bottomBarData.discountType === QUOTATION.PERCENT_VALUE
        ? QUOTATION.DISCOUNT_TYPE.PERCENT : QUOTATION.DISCOUNT_TYPE.AMOUNT;
      setDiscountType(typeDiscount);
      setDiscountPercent(formatNumberWithTwoDecimalPlaces(percent))
      setDiscountAmount(formatPriceWithTwoDecimals(bottomBarData.discountAmount))
    }
  }, [isOpenDiscountModal, bottomBarData])

  useEffect(() => {
    if (discountType.id === bottomBarData.discountType) {
      setDiscountAmount(formatPriceWithTwoDecimals(bottomBarData.discountAmount))
      if (discountType.id === QUOTATION.PERCENT_VALUE && bottomBarData.totalBeforeGST > 0) {
        const percent = bottomBarData.totalBeforeGST > 0 ? ((bottomBarData.discountAmount / bottomBarData.totalBeforeGST) * 100) : 0
        setDiscountPercent(formatNumberWithTwoDecimalPlaces(percent))
      }
    }
  }, [discountType, bottomBarData])

  const handleSetDiscount = (value) => {
    if (!isNaN(value)) {
      setDiscountPercent(value)
      const amount = formatPriceWithTwoDecimals(value / 100 * totalBeforeGST)
      setDiscountAmount(amount)
      setMessageError(value > 100 ? {
        percent: 'Discount percentage must less than 100%.'
      } : {})
    }
  }

  const handleAmountChange = (value, keyValue, field) => {
    const fieldSetters = {
      'percent': setDiscountPercent,
      'amount': setDiscountAmount,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      if (field !== 'amount') {
        const amount = formatPriceWithTwoDecimals(value * totalBeforeGST / 100)
        setDiscountAmount(amount)
        setMessageError(value > 100 ? {
          percent: 'Discount percentage must less than 100%.'
        } : {})
      }
      setMessageError(value > totalBeforeGST ? {
        amount: 'Discount amount must less than the total.'
      } : {})
    }
  };

  const handleClickOutAmount = (e, keyValue, field) => {
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;
    const formatted = formatPriceWithTwoDecimals(value)
    const fieldSetters = {
      'percent': setDiscountPercent,
      'amount': setDiscountAmount,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(formatted);
    }
  };

  const handleOpenDiscountModal = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      setIsOpenDiscountModal(true)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const handleApplyData = () => {
    if (+discountAmount === +bottomBarData.discountAmount && +discountType.id === +bottomBarData.discountType) {
      return setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE
      })
    }
    if (id) {
      const formattedAmount = parseLocaleStringToNumber(discountAmount)
      dispatch(quotationActions.handleDiscountChange({
        quotation_id: +id,
        grand_total: roundToTwoDecimals(+bottomBarData.totalBeforeGST - formattedAmount),
        discount_amount: formattedAmount || 0,
        discount_type: +discountType.id || QUOTATION.PERCENT_VALUE,
        onSuccess,
        onError,
      }))
      setIsOpenDiscountModal(false)
    }
  }

  return (
    <div className="noteBottom">
      {isOpenDiscountModal &&
        <div className="noteBottom__coating">
          <div className="amountModal">
            <p className="amountModal__headerText">
              Add Discount
            </p>
            <div className="amountModal__inner">
              <div className="amountModal__formGroup">
                <label className="amountModal__label">TOTAL (BEFORE DISCOUNT & GST)</label>
                <div className="amountModal__input">
                  <input
                    value={`$ ${formatPriceWithTwoDecimals(totalBeforeGST)}`}
                    readOnly
                    type="text"
                  />
                </div>
              </div>
              <div className="amountModal__optionWrapper">
                {Object.values(QUOTATION.DISCOUNT_TYPE).map((item, index) => (
                  item.id !== 0 &&
                  <div
                    key={index}
                    className={
                      `amountModal__option ${discountType.id === item.id ? 'amountModal__option--active' : ''
                      }`}
                    onClick={() => setDiscountType(item)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
              {discountType.id === QUOTATION.DISCOUNT_TYPE.PERCENT.id ?
                <>
                  <div className="amountModal__formGroup">
                    <label className="amountModal__label">DISCOUNT PERCENTAGE</label>
                    <div className={`amountModal__input${messageError?.percent ? ' amountModal__input--error' : ''}`}>
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
                    {messageError?.percent &&
                      <div className="amountModal__input--message">{messageError.percent}</div>
                    }
                  </div>
                  <div className="amountModal__formGroup">
                    <label className="amountModal__label">DISCOUNT AMOUNT</label>
                    <div className="amountModal__input amountModal__input--inActive">
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
                  <div className={`amountModal__input${messageError?.amount ? ' amountModal__input--error' : ''}`}>
                    <div className="amountModal__currency amountModal__currency--icon">
                      $
                    </div>
                    <PriceInputForm
                      keyValue=""
                      inputValue={discountAmount}
                      field="amount"
                      placeholderTitle="0.00"
                      handleAmountChange={handleAmountChange}
                      handleClickOutAmount={handleClickOutAmount}
                    />
                  </div>
                  {messageError?.amount &&
                    <div className="amountModal__input--message">{messageError.amount}</div>
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
                onClick={() => setIsOpenDiscountModal(false)}
              >
                Cancel
              </button>
              <button
                className="amountModal__button amountModal__button--brown"
                onClick={handleApplyData}
                disabled={!isEmptyObject(messageError)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      }
      <div className="noteBottom__content">
        <div className="noteBottom__block">
          <div className="noteBottom__column">
            <p className="text text--small">QUOTATION</p>
            <b className="text">
              $ {formatPriceWithTwoDecimals(sumSections)}
            </b>
          </div>
          <b className="text text--icon">+</b>
          <div className="noteBottom__column">
            <p className="text text--small">OTHER FEES</p>
            <b className="text">
              $ {formatPriceWithTwoDecimals(otherFees)}
            </b>
          </div>
          <b className="text text--icon">=</b>
          <div className="noteBottom__column">
            <p className="text text--small">TOTAL (BEFORE GST)</p>
            <b className="text">
              $ {formatPriceWithTwoDecimals(totalBeforeGST)}
            </b>
          </div>
        </div>
        <div className="noteBottom__block noteBottom__block--left">
          <div className="noteBottom__column noteBottom__column--estimatedCost">
            <p className="text text--small">ESTIMATED SCRAP COST</p>
            <b className="text">
              $ {formatPriceWithTwoDecimals(estimateScrapCost)}
            </b>
          </div>
          <div className="noteBottom__column noteBottom__column--discount">
            <div className="noteBottom__discountLabel">
              <p className="text text--small">DISCOUNT</p>
              <img
                src="/icons/edit.svg"
                alt="edit"
                onClick={handleOpenDiscountModal}
              />
            </div>
            <p className="text text--input">$ {formatPriceWithTwoDecimals(discount)}</p>
          </div>
        </div>
      </div>
      <div className="noteBottom__content noteBottom__content--bottom">
        <p className="text text--small">GRAND TOTAL (EXCLUSIVE GST)</p>
        <b className="text text--big">$ {formatPriceWithTwoDecimals(grandTotal)}</b>
      </div>
    </div>
  )
}

export default QuotationBottom
