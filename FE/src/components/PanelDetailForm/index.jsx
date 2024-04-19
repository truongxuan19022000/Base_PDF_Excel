import React from 'react'

import { INVENTORY } from 'src/constants/config';
import { formatPriceWithTwoDecimals } from 'src/helper/helper';

const PanelDetailForm = ({ item = {} }) => {
  const costUnit = INVENTORY.UNIT[item?.cost_unit]?.label;
  return (
    <div className="itemDetailForm itemDetailForm--squareMetre">
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__group">
          <div className="itemDetailBox itemDetailBox--squareMetre">
            <div className="itemDetailBox__label">QUANTITY</div>
            <div className="itemDetailBox__value">{item.quantity || 0}</div>
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

export default PanelDetailForm
