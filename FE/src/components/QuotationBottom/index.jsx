import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { QUOTATION } from 'src/constants/config'
import { formatPriceWithTwoDecimals } from 'src/helper/helper'
import { quotationActions } from 'src/slices/quotation'

const QuotationBottom = () => {
  const [isOpenDiscountModal, setIsOpenDiscountModal] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountType, setDiscountType] = useState(QUOTATION.DISCOUNT_TYPE.PERCENT)
  const [discountAmount, setDiscountAmount] = useState(null)
  const dispatch = useDispatch()
  const { bottomBarData, totalOtherFees, discount } = useSelector(state => state.quotation)
  const costValues = useMemo(() => {
    // estimatedCost = QUOTATION + OTHER FEES
    const estimatedCost = bottomBarData.quotationCost + totalOtherFees
    // totalAfterDiscount = estimatedCost - DISCOUNT
    const totalAfterDiscount = estimatedCost - discount
    // GST = 9% of totalAfterDiscount
    const gstValue = ((totalAfterDiscount * 9) / 100)
    // GRAND TOTAL (INCLUSIVE GST) = totalAfterDiscount + gstValue
    const grandTotal = totalAfterDiscount + gstValue
    return {
      estimatedCost,
      totalAfterDiscount,
      gstValue,
      grandTotal
    }
  }, [bottomBarData.quotationCost, totalOtherFees, discount])

  useEffect(() => {
    setDiscountPercent(0)
    setDiscountAmount('')
  }, [discountType])

  useEffect(() => {
    if (discountPercent) {
      const originalAmount = costValues.estimatedCost * discountPercent / 100
      setDiscountAmount(originalAmount.toFixed(2))
    }
    // eslint-disable-next-line
  }, [discountPercent, costValues.estimatedCost])

  const handleSetDiscount = (value) => {
    if (!isNaN(value) && value <= 100) {
      setDiscountPercent(value)
    }
  }

  const handleApplyData = () => {
    dispatch(quotationActions.setBottomBarData({
      ...bottomBarData,
      discountType,
      discountAmount,
      discountPercent,
    }))
    dispatch(quotationActions.setDiscountAmount(discountAmount))
    setIsOpenDiscountModal(false)
  }
  const handleInputDiscountAmount = (value) => {
    if (!isNaN(value) && value <= +costValues.estimatedCost) {
      setDiscountAmount(value)
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
                    value={`$ ${formatPriceWithTwoDecimals(costValues.estimatedCost)}`}
                    readOnly
                    type="text"
                  />
                </div>
              </div>
              <div className="amountModal__optionWrapper">
                {Object.values(QUOTATION.DISCOUNT_TYPE).map((item, index) => (
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
                    <div className="amountModal__input">
                      <input
                        type="text"
                        value={discountPercent || ''}
                        placeholder="0"
                        onChange={({ target }) => handleSetDiscount(target.value)}
                      />
                      <div className="amountModal__currency">
                        %
                      </div>
                    </div>
                  </div>
                  <div className="amountModal__formGroup">
                    <label className="amountModal__label">DISCOUNT AMOUNT</label>
                    <div className="amountModal__input amountModal__input--inActive">
                      <input
                        value={`$ ${formatPriceWithTwoDecimals(+discountAmount)}`}
                        type="text"
                        readOnly
                      />
                    </div>
                  </div>
                </> :
                <div className="amountModal__formGroup">
                  <label className="amountModal__label">DISCOUNT AMOUNT</label>
                  <div className="amountModal__input">
                    <div className="amountModal__currency amountModal__currency--icon">
                      $
                    </div>
                    <input
                      type="text"
                      value={discountAmount}
                      placeholder="0.00"
                      onChange={({ target }) => handleInputDiscountAmount(target.value)}
                    />
                  </div>
                </div>
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
              {formatPriceWithTwoDecimals(bottomBarData.quotationCost)}
            </b>
          </div>
          <b className="text">+</b>
          <div className="noteBottom__column">
            <p className="text text--small">OTHER FEES</p>
            <b className="text">
              {formatPriceWithTwoDecimals(totalOtherFees)}
            </b>
          </div>
          <b className="text">=</b>
          <div className="noteBottom__column">
            <p className="text text--small">TOTAL (BEFORE GST)</p>
            <b className="text">
              {formatPriceWithTwoDecimals(costValues.estimatedCost)}
            </b>
          </div>
        </div>
        <div className="noteBottom__block">
          <div className="noteBottom__column noteBottom__column--estimatedCost">
            <p className="text text--small">ESTIMATED SCRAP COST</p>
            <b className="text">
              {formatPriceWithTwoDecimals(costValues.estimatedCost)}
            </b>
          </div>
          <div className="noteBottom__column">
            <div className="noteBottom__discountLabel">
              <p className="text text--small">DISCOUNT</p>
              <img
                src="/icons/edit.svg"
                alt="edit"
                onClick={() => setIsOpenDiscountModal(true)}
              />

            </div>
            <p className="text text--input">{formatPriceWithTwoDecimals(discount) || '0.00'}</p>
          </div>
          <div className="noteBottom__column">
            <p className="text text--small">GST (9%)</p>
            <b className="text">{formatPriceWithTwoDecimals(costValues.gstValue) || '0.00'}</b>
          </div>
        </div>
      </div>
      <div className="noteBottom__content noteBottom__content--bottom">
        <p className="text text--small">GRAND TOTAL (INCLUSIVE GST)</p>
        <b className="text">{formatPriceWithTwoDecimals(costValues.grandTotal)}</b>
      </div>
    </div>
  )
}

export default QuotationBottom
