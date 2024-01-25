import React from 'react'

const PieceDetailForm = () => {
  return (
    <div className="itemDetailForm itemDetailForm--squareMetre">
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__group">
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">QUANTITY</div>
            <div className="itemDetailBox__value">8</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">COST OF ITEM</div>
            <div className="itemDetailBox__value">$ 1.60 / pcs</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">COST OF ITEM</div>
            <div className="itemDetailBox__value">$ 12.80</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PieceDetailForm
