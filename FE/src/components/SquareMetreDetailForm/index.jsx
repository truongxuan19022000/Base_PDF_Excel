import React from 'react'

import { INVENTORY } from 'src/constants/config'
import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals } from 'src/helper/helper'

const SquareMetreDetailForm = ({
  item = {},
  itemWidth = 0,
  itemHeight = 0,
}) => {
  const costUnit = INVENTORY.UNIT[item?.cost_unit]?.label;
  return (
    <div className="itemDetailForm itemDetailForm--squareMetre">
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__group">
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">WIDTH</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(+itemWidth / 1000)} m</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">HEIGHT</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(+itemHeight / 1000)} m</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">TOTAL AREA</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(+item.total_area)} {costUnit}</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">COST OF ITEM</div>
            <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+item.cost_of_item)} / {costUnit}</div>
          </div>
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">TOTAL COST OF ITEM</div>
            <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+item.total_cost_of_item)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SquareMetreDetailForm
