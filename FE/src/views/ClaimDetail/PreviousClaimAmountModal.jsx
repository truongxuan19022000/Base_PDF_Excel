import React from 'react'

import { formatPriceWithTwoDecimals } from 'src/helper/helper'

const PreviousClaimAmountModal = ({
  data = [],
  closeModal,
}) => {

  return (
    <div className="claimAmountModal">
      <div className="claimAmountModal__content">
        <div className="claimAmountModal__title">Previous Claim Amount Received</div>
        <div className="claimAmountModal__list">
          {data.map((item, index) =>
            <div key={index} className="claimAmountModal__item">
              <label>CLAIM {index + 1}</label>
              <div className="claimAmountModal__inputBox">
                <span className="claimAmountModal__unit">$</span>
                <input
                  type="text"
                  placeholder="0.00"
                  value={formatPriceWithTwoDecimals(item)}
                  className="claimAmountModal__input"
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
        <button
          className="claimAmountModal__button"
          onClick={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default PreviousClaimAmountModal
