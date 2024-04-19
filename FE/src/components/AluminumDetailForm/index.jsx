import React, { useMemo } from 'react'
import { INVENTORY } from 'src/constants/config';

import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals, isEmptyObject } from 'src/helper/helper'

const AluminumDetailForm = ({
  item = {},
}) => {
  const totalCostOfScrap = useMemo(() => {
    const scrapWeight = item?.scrap?.scrap_weight ?? 0;
    const costOfScrap = item?.scrap?.cost_of_scrap ?? 0;
    return scrapWeight * costOfScrap;
  }, [item]);

  const isShowScrapUsed = useMemo(() => {
    return !isEmptyObject(item?.scrap_used)
  }, [item])

  const scrapUsedRemaining = useMemo(() => {
    let length = 0
    if (+item.actual_material_needed?.total_perimeter < +item?.scrap_used?.scrap_length) {
      length = 0
    } else {
      length = +item.actual_material_needed?.total_perimeter - +item?.scrap_used?.scrap_length
    }
    return length
  }, [item])

  return (
    <div className="itemDetailForm">
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__sectionTitle">ACTUAL MATERIAL NEEDED</div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">WIDTH</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.actual_material_needed.width)} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">WIDTH QUANTITY</div>
            <div className="itemDetailBox__value">{item.actual_material_needed.width_quantity || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">HEIGHT</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.actual_material_needed.height)} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">HEIGHT QUANTITY</div>
            <div className="itemDetailBox__value">{item.actual_material_needed.height_quantity || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL PERIMETER</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.actual_material_needed.total_perimeter)} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL WEIGHT</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.actual_material_needed.total_weight)} kg</div>
          </div>
        </div>
      </div>
      {isShowScrapUsed &&
        <div className="itemDetailForm__section">
          <div className="itemDetailForm__sectionTitle">SCRAP USED</div>
          <div className="itemDetailForm__group">
            <div className="itemDetailBox">
              <div className="itemDetailBox__label">SCRAP LENGTH</div>
              <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item?.scrap?.scrap_length)} m</div>
            </div>
            <div className="itemDetailBox">
              <div className="itemDetailBox__label">SCRAP FROM</div>
              <div className="itemDetailBox__value">{item?.scrap?.title}</div>
            </div>
            <div className="itemDetailBox">
              <div className="itemDetailBox__label">REMAINING PERIMETER</div>
              <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(+scrapUsedRemaining)} m</div>
            </div>
          </div>
        </div>
      }
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__sectionTitle">RAW MATERIAL NEEDED</div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">RAW LENGTH</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.raw_material_needed.raw_length)} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">RAW QUANTITY</div>
            <div className="itemDetailBox__value">{item.raw_material_needed.raw_quantity || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">RAW GIRTH</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.raw_material_needed.raw_girth)} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL RAW PERIMETER</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.raw_material_needed.total_raw_perimeter)} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL RAW WEIGHT</div>
            <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.raw_material_needed.total_raw_weight)} kg</div>
          </div>
        </div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">COST OF RAW ALUMINIUM</div>
            <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+item.raw_material_needed.cost_of_raw_aluminium)}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL COST OF RAW ALUMINIUM</div>
            <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+item.raw_material_needed.total_cost_of_raw_aluminium)}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">COST OF POWDER COATING</div>
            <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+item.raw_material_needed.cost_of_powder_coating)} / m²</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL COST OF POWDER COATING</div>
            <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+item.raw_material_needed.total_cost_of_powder_coating)}</div>
          </div>
        </div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL COST OF RAW MATERIAL</div>
            <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+item.raw_material_needed.total_cost_of_raw_material)}</div>
          </div>
        </div>
      </div>
      {(+item.scrap?.scrap_length > 0 && +item.scrap?.status === INVENTORY.MATERIAL_UN_USED) &&
        <div className="itemDetailForm__section">
          <div className="itemDetailForm__sectionTitle">SCRAP</div>
          <div className="itemDetailForm__group">
            <div className="itemDetailBox">
              <div className="itemDetailBox__label">SCRAP LENGTH</div>
              <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.scrap.scrap_length)} m</div>
            </div>
            <div className="itemDetailBox">
              <div className="itemDetailBox__label">SCRAP WEIGHT</div>
              <div className="itemDetailBox__value">{formatNumberWithTwoDecimalPlaces(item.scrap.scrap_weight)} kg</div>
            </div>
            <div className="itemDetailBox">
              <div className="itemDetailBox__label">COST OF SCRAP</div>
              <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+item.scrap.cost_of_scrap)}</div>
            </div>
            <div className="itemDetailBox">
              <div className="itemDetailBox__label">TOTAL COST OF SCRAP</div>
              <div className="itemDetailBox__value">$ {formatPriceWithTwoDecimals(+totalCostOfScrap)}</div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default AluminumDetailForm
