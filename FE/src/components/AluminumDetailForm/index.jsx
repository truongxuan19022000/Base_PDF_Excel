import React from 'react'
import { formatNumberWithTwoDecimalPlaces } from 'src/helper/helper'

const AluminumDetailForm = ({
  item = {},
}) => {
  return (
    <div className="itemDetailForm">
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__sectionTitle">ACTUAL MATERIAL NEEDED</div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">WIDTH</div>
            <div className="itemDetailBox__value">{item.actual_material_needed.width || 0} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">WIDTH QUANTITY</div>
            <div className="itemDetailBox__value">{item.actual_material_needed.width_quantity || 0} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">HEIGHT</div>
            <div className="itemDetailBox__value">{item.actual_material_needed.height || 0} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">HEIGHT QUANTITY</div>
            <div className="itemDetailBox__value">{item.actual_material_needed.height_quantity || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL PERIMETER</div>
            <div className="itemDetailBox__value">{Number(item.actual_material_needed.total_perimeter).toFixed(2) || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL WEIGHT</div>
            <div className="itemDetailBox__value">{Number(item.actual_material_needed.total_weight).toFixed(2) || 0} kg</div>
          </div>
        </div>
      </div>
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__sectionTitle">RAW MATERIAL NEEDED</div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">RAW LENGTH</div>
            <div className="itemDetailBox__value">{item.raw_material_needed.raw_length || 0} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">RAW QUANTITY</div>
            <div className="itemDetailBox__value">{item.raw_material_needed.raw_quantity || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">RAW GIRTH</div>
            <div className="itemDetailBox__value">{item.raw_material_needed.raw_girth || 0} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL RAW PERIMETER</div>
            <div className="itemDetailBox__value">{item.raw_material_needed.total_raw_perimeter || 0} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL RAW WEIGHT</div>
            <div className="itemDetailBox__value">{Number(item.raw_material_needed.total_raw_weight).toFixed(2) || 0} kg</div>
          </div>
        </div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">COST OF RAW ALUMINIUM</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(item.raw_material_needed.cost_of_raw_aluminium) || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL COST OF RAW ALUMINIUM</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(item.raw_material_needed.total_cost_of_raw_aluminium) || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">COST OF POWDER COATING</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(item.raw_material_needed.cost_of_powder_coating) || 0} / m²</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL COST OF POWDER COATING</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(item.raw_material_needed.total_cost_of_powder_coating) || 0}</div>
          </div>
        </div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL COST OF RAW MATERIAL</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(item.raw_material_needed.total_cost_of_raw_material) || 0}</div>
          </div>
        </div>
      </div>
      <div className="itemDetailForm__section">
        <div className="itemDetailForm__sectionTitle">SCRAP</div>
        <div className="itemDetailForm__group">
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">SCRAP LENGTH</div>
            <div className="itemDetailBox__value">{item.scrap.scrap_length || 0} m</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">SCRAP WEIGHT</div>
            <div className="itemDetailBox__value">{Number(item.scrap.scrap_weight).toFixed(2) || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">COST OF SCRAP</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(item.scrap.cost_of_scrap) || 0}</div>
          </div>
          <div className="itemDetailBox">
            <div className="itemDetailBox__label">TOTAL COST OF SCRAP</div>
            <div className="itemDetailBox__value">$ {formatNumberWithTwoDecimalPlaces(item.scrap.total_cost_of_scrap) || 0}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AluminumDetailForm
