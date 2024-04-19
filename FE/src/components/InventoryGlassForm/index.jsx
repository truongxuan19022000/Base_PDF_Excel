import React from 'react'

import InputBoxForm from '../InputBoxForm'
import InputSelectForm from '../InputSelectForm'
import PriceInputForm from '../InputForm/PriceInputForm'

import { INVENTORY } from 'src/constants/config'

const InventoryGlassForm = ({
  data = {},
  setSizeUnit,
  isInputChanged = false,
  isMaterialUsed = false,
  isEditAllowed = false,
  setIsInputChanged,
  handleInputChange,
  handleAmountChange,
  handleClickOutAmount
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
            value={data.minSize}
            unit={data.sizeUnit}
            setUnit={setSizeUnit}
            keyValue="min_size"
            labelName="Min Size"
            inputType="number"
            defaultUnit="m²"
            placeholderTitle="0.00"
            unitData={INVENTORY.SIZE_UNIT}
            messageError={data.messageError}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        </div>
      </div>
      <div className={`inventoryCell${isEditAllowed ? '' : ' inventoryCell--disabled'}`}>
        <div className={`inventoryCell__item${isMaterialUsed ? ' inventoryCell__item--disabled' : ''}`}>
          <div className="inventoryCell__item--label">
            Price
          </div>
          <div className={`inventoryCell__inputBox${data.messageError?.price ? ' inventoryCell__inputBox--error' : ''}`}>
            <div className="inventoryCell__input">
              <div className="inventoryCell__symbol">S$</div>
              <PriceInputForm
                inputValue={data.price}
                field="price"
                placeholderTitle="0.00"
                handleAmountChange={handleAmountChange}
                handleClickOutAmount={handleClickOutAmount}
              />
            </div>
            <div className="inventoryCell__unitPrice">/m²</div>
          </div>
          {data.messageError?.price &&
            <div className="inventoryCell__message">
              {data.messageError.price}
            </div>
          }
        </div>
      </div>
    </>
  )
}

export default InventoryGlassForm
