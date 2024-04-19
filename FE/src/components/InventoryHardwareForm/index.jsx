import React from 'react'

import InputBoxForm from '../InputBoxForm'
import InputSelectForm from '../InputSelectForm'

import { INVENTORY } from 'src/constants/config'

const InventoryHardwareForm = ({
  data = {},
  setPriceUnit,
  handleInputChange,
  isInputChanged = false,
  isMaterialUsed = false,
  isEditAllowed = false,
  setIsInputChanged,
  setPrice,
}) => {
  return (
    <>
      <div className={`inventoryCell${isEditAllowed ? '' : ' inventoryCell--disabled'}`}>
        <div className={`inventoryCell__item${isMaterialUsed ? ' inventoryCell__item--disabled' : ''}`}>
          <InputBoxForm
            value={data.item}
            keyValue="item"
            labelName="Item"
            inputType="text"
            placeholderTitle="Item"
            messageError={data.messageError}
            handleInputChange={handleInputChange}
          />
          {data.messageError?.item &&
            <div className="inventoryCell__item--message">{data.messageError.item}</div>
          }
        </div>
        <div className={`inventoryCell__item${isMaterialUsed ? ' inventoryCell__item--disabled' : ''}`}>
          <InputBoxForm
            value={data.code}
            keyValue="code"
            labelName="Code"
            inputType="text"
            placeholderTitle="Code"
            messageError={data.messageError}
            handleInputChange={handleInputChange}
          />
        </div>
      </div>
      <div className={`inventoryCell${isEditAllowed ? '' : ' inventoryCell--disabled'}`}>
        <div className={`inventoryCell__item${isMaterialUsed ? ' inventoryCell__item--disabled' : ''}`}>
          <InputBoxForm
            value={data.category}
            keyValue="category"
            labelName="Category"
            inputType="text"
            placeholderTitle="Category"
            messageError={data.messageError}
            handleInputChange={handleInputChange}
          />
        </div>
        <div className={`inventoryCell__item${isMaterialUsed ? ' inventoryCell__item--disabled' : ''}`}>
          <InputSelectForm
            value={data.price}
            unit={data.priceUnit}
            setUnit={setPriceUnit}
            selectKey="price_unit"
            defaultUnit="/pcs"
            keyValue="price"
            labelName="Price"
            inputType="number"
            placeholderTitle="0.00"
            unitData={INVENTORY.PRICE_UNIT}
            messageError={data.messageError}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
            setPrice={setPrice}
          />
        </div>
      </div>
    </>
  )
}

export default InventoryHardwareForm
