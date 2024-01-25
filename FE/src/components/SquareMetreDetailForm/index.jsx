import React from 'react'
import { INVENTORY } from 'src/constants/config'
import { formatNumberWithTwoDecimalPlaces } from 'src/helper/helper'

const SquareMetreDetailForm = ({
  item = {},
  itemWidth = 0,
  itemHeight = 0,
}) => {
  const costUnit = INVENTORY.UNIT[item?.cost_unit]?.label;
  const totalCost = +item.quantity * +item?.cost_of_item;
  const width = Math.round(+itemWidth / 1000);
  const height = Math.round(+itemHeight / 1000);
  return (
    <div className="itemDetailForm itemDetailForm--squareMetre">
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__group">
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">WIDTH</div>
            <div className="itemDetailBox__value">{width || 0} m</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">HEIGHT</div>
            <div className="itemDetailBox__value">{height || 0} m</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">TOTAL AREA</div>
            <div className="itemDetailBox__value">{item.quantity || 0} {costUnit}</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">COST OF ITEM</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(+item.cost_of_item)} / {costUnit}</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">TOTAL COST OF ITEM</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(+totalCost)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SquareMetreDetailForm
