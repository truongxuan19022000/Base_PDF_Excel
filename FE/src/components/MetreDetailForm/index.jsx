import React from 'react'

const MetreDetailForm = () => {
  return (
    <div className="itemDetailForm itemDetailForm--squareMetre">
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__group">
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">WIDTH</div>
            <div className="itemDetailBox__value">1.50 m</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">QUANTITY</div>
            <div className="itemDetailBox__value">2</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">HEIGHT</div>
            <div className="itemDetailBox__value">3.00 m</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">QUANTITY</div>
            <div className="itemDetailBox__value">2</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL RAW PERIMETER</div>
            <div className="itemDetailBox__value">11.60 m</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">COST OF ITEM</div>
            <div className="itemDetailBox__value">$ 1.50 / m</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">TOTAL COST OF ITEM</div>
            <div className="itemDetailBox__value">$ 13.50</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetreDetailForm
