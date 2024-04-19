import React from 'react'

import InputBoxForm from '../InputBoxForm'
import InputSelectForm from '../InputSelectForm'
import InventorySelectForm from '../InventorySelectForm'

import { INVENTORY } from 'src/constants/config'

const InventoryServiceForm = ({
  data = {},
  setService,
  setSizeUnit,
  setPriceUnit,
  handleInputChange,
  setMessageError,
  isEditMode,
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
      <div className={`inventoryCell${data.messageError?.service_type ? ' inventoryCell--error' : ''}${isEditAllowed ? '' : ' inventoryCell--disabled'}`}>
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
          <div className="inventoryCell__item--select">
            <div className="inventoryCell__item--label">
              Service Type
            </div>
            <InventorySelectForm
              placeholder="Select Service Type"
              isDetail={isEditMode}
              selectedItem={data.service}
              keyValue="service_type"
              data={INVENTORY.SERVICE}
              setSelectedItem={setService}
              messageError={data.messageError}
              setMessageError={setMessageError}
              isInputChanged={isInputChanged}
              setIsInputChanged={setIsInputChanged}
            />
          </div>
          {data.messageError?.service_type &&
            <div className="inventoryCell__item--messageSelect">{data.messageError.service_type}</div>
          }
        </div>
      </div>
      <div className={`inventoryCell${isEditAllowed ? '' : ' inventoryCell--disabled'}`}>
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

export default InventoryServiceForm
