import React from 'react'
import { useSelector } from 'react-redux'

import { formatPriceWithTwoDecimals } from 'src/helper/helper'

const OrderBottom = ({
  showTaxModal,
  showDiscountModal,
  showShippingFeeModal,
}) => {
  const { bottomBarData } = useSelector(state => state.purchase);

  return (
    <div className="orderBottom">
      <div className="orderBottom__content">
        <div className="orderBottom__block">
          <div className="orderBottom__column">
            <p className="text text--small">SUBTOTAL (BEFORE GST)</p>
            <b className="text">
              $ {formatPriceWithTwoDecimals(bottomBarData.subTotal)}
            </b>
          </div>
        </div>
        <div className="orderBottom__block orderBottom__block--left">
          <div className="orderBottom__column">
            <div className="orderBottom__label" onClick={showShippingFeeModal}>
              <p className="text text--small">SHIPPING FEE</p>
              <img
                src="/icons/edit.svg"
                alt="edit"
              />
            </div>
            <b className="text">
              $ {formatPriceWithTwoDecimals(bottomBarData.shippingFee)}
            </b>
          </div>
          <div className="orderBottom__column">
            <div className="orderBottom__label" onClick={showDiscountModal}>
              <p className="text text--small">DISCOUNT</p>
              <img
                src="/icons/edit.svg"
                alt="edit"
              />
            </div>
            <b className="text">
              $ {formatPriceWithTwoDecimals(bottomBarData.discountAmount)}
            </b>
          </div>
          <div className="orderBottom__column">
            <div className="orderBottom__label" onClick={showTaxModal}>
              <p className="text text--small">GST ({bottomBarData.tax}%)</p>
              <img
                src="/icons/edit.svg"
                alt="edit"
              />
            </div>
            <b className="text">
              $ {formatPriceWithTwoDecimals(bottomBarData.gstAmount)}
            </b>
          </div>
        </div>
      </div>
      <div className="orderBottom__content orderBottom__content--bottom">
        <p className="text text--small">GRAND TOTAL (EXCLUSIVE GST)</p>
        <b className="text text--big">$ {formatPriceWithTwoDecimals(bottomBarData.grandTotal)}</b>
      </div>
    </div>
  )
}

export default OrderBottom
