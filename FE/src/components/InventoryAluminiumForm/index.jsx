import React from 'react'

import InputBoxForm from '../InputBoxForm'
import InputSelectForm from '../InputSelectForm'
import InventorySelectForm from '../InventorySelectForm'

import { INVENTORY } from 'src/constants/config'

const InventoryAluminiumForm = ({
  data = {},
  setProfile,
  setPriceUnit,
  setWindowType,
  setWeightUnit,
  setLengthUnit,
  setRawGirthUnit,
  setMessageError,
  handleSideChange,
  handleInputChange,
  setCoatingPriceUnit,
  handleBoxApplyCoating,
  isEditMode = false,
  isInputChanged = false,
  setIsInputChanged,
}) => {
  const renderSideOptions = () => {
    return INVENTORY.SIDE.map((item, index) => {
      const isChecked = !!data.side?.find(s => s.value === item?.value);
      return (
        item.value !== 0 &&
        <div
          key={index}
          className="inventoryCell__item--option"
          onClick={() => handleSideChange(item)}
        >
          <div className="inventoryCell__item--checkbox">
            <img
              src={`/icons/${isChecked ? 'checked' : 'uncheck'}.svg`}
              alt={isChecked ? 'checked' : 'uncheck'}
            />
          </div>
          <span>{item.label}</span>
        </div>
      );
    });
  };

  const renderCoatingPriceStatus = () => {
    return INVENTORY.COATING_PRICE_STATUS.map((item, index) => {
      const isChecked = !!data.coatingPriceStatus
      return (
        <div
          key={index}
          className="inventoryCell__item--option"
          onClick={() => handleBoxApplyCoating(isChecked)}
        >
          <div className="inventoryCell__item--checkbox">
            <img
              src={`/icons/${isChecked ? 'checked' : 'uncheck'}.svg`}
              alt={isChecked ? 'checked' : 'uncheck'}
            />
          </div>
          <span>{item.label}</span>
        </div>
      );
    });
  };

  return (
    <>
      <div className="inventoryCell">
        <div className="inventoryCell__item">
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
        <div className="inventoryCell__item">
          <InputBoxForm
            value={data.code}
            keyValue="code"
            labelName="Code"
            inputType="text"
            placeholderTitle="Code"
            messageError={data.messageError}
            handleInputChange={handleInputChange}
          />
          {data.messageError?.code &&
            <div className="inventoryCell__item--message">{data.messageError.code}</div>
          }
        </div>
      </div>
      <div className={`inventoryCell${data.messageError?.profile ? ' inventoryCell--error' : ''}`}>
        <div className="inventoryCell__item">
          <InputBoxForm
            value={data.category}
            keyValue="category"
            labelName="Category"
            inputType="text"
            placeholderTitle="Category"
            messageError={data.messageError}
            handleInputChange={handleInputChange}
          />
          {data.messageError?.category &&
            <div className="inventoryCell__item--message">{data.messageError.category}</div>
          }
        </div>
        <div className="inventoryCell__item">
          <div className="inventoryCell__item--select">
            <div className="inventoryCell__item--label">
              Profile
            </div>
            <InventorySelectForm
              placeholder="Profile"
              isDetail={isEditMode}
              selectedItem={data.profile}
              keyValue="profile"
              data={INVENTORY.PROFILES}
              setSelectedItem={setProfile}
              messageError={data.messageError}
              setMessageError={setMessageError}
              isInputChanged={isInputChanged}
              setIsInputChanged={setIsInputChanged}
            />
          </div>
          {data.messageError?.profile &&
            <div className="inventoryCell__item--messageSelect">{data.messageError.profile}</div>
          }
        </div>
      </div>
      <div className={`inventoryCell${data.messageError?.door_window_type ? ' inventoryCell--error' : ''}`}>
        <div className="inventoryCell__item">
          <div className="inventoryCell__item--label">
            Door / Window Type
          </div>
          <div className="inventoryCell__item--select">
            <InventorySelectForm
              data={INVENTORY.WINDOW_TYPE}
              isDetail={isEditMode}
              keyValue="door_window_type"
              selectedItem={data.windowType}
              setSelectedItem={setWindowType}
              messageError={data.messageError}
              setMessageError={setMessageError}
              placeholder="Select Door / Window Type"
              isInputChanged={isInputChanged}
              setIsInputChanged={setIsInputChanged}
            />
          </div>
          {data.messageError?.door_window_type &&
            <div className="inventoryCell__item--message">{data.messageError.door_window_type}</div>
          }
        </div>
        <div className="inventoryCell__item">
          <div className="inventoryCell__item--label">
            Inner / Outer Side
          </div>
          <div className="inventoryCell__item--selectBox">
            {renderSideOptions()}
          </div>
        </div>
      </div>
      <div className="inventoryCell">
        <div className="inventoryCell__item">
          <InputSelectForm
            value={data.weight}
            unit={data.weightUnit}
            setUnit={setWeightUnit}
            keyValue="weight"
            labelName="Weight"
            inputType="number"
            defaultUnit="kg/m"
            placeholderTitle="0.00"
            unitData={INVENTORY.WEIGHT_UNIT}
            messageError={data.messageError}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        </div>
        <div className="inventoryCell__item">
          <InputSelectForm
            value={data.length}
            unit={data.lengthUnit}
            setUnit={setLengthUnit}
            keyValue="raw_length"
            labelName="Raw Length"
            inputType="number"
            defaultUnit="m"
            placeholderTitle="0.00"
            unitData={INVENTORY.LENGTH_UNIT}
            messageError={data.messageError}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        </div>
      </div>
      <div className="inventoryCell">
        <div className="inventoryCell__item">
          <InputSelectForm
            value={data.rawGirth}
            unit={data.rawGirthUnit}
            setUnit={setRawGirthUnit}
            keyValue="raw_girth"
            labelName="Raw Girth"
            inputType="number"
            defaultUnit="m"
            placeholderTitle="0.00"
            messageError={data.messageError}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        </div>
        <div className="inventoryCell__item">
          <InputSelectForm
            value={data.price}
            unit={data.priceUnit}
            setUnit={setPriceUnit}
            defaultUnit="/pcs"
            keyValue="price"
            labelName="Price"
            inputType="number"
            selectKey="price_unit"
            placeholderTitle="0.00"
            unitData={INVENTORY.PRICE_UNIT}
            messageError={data.messageError}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        </div>
      </div>
      <div className="inventoryCell">
        <div className="inventoryCell__item">
          <div className="inventoryCell__item--label">
            Coating Price
          </div>
          <div className="inventoryCell__item--selectBox">
            {renderCoatingPriceStatus()}
            {(data.coatingPriceStatus) &&
              <InputSelectForm
                value={data.coatingPrice}
                unit={data.coatingPriceUnit}
                setUnit={setCoatingPriceUnit}
                selectKey='coating_price_unit'
                keyValue="coating_price"
                inputType="number"
                defaultUnit="/m²"
                placeholderTitle="0.00"
                unitData={INVENTORY.COATING_PRICE_UNIT}
                messageError={data.messageError}
                handleInputChange={handleInputChange}
                isInputChanged={isInputChanged}
                setIsInputChanged={setIsInputChanged}
              />
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default InventoryAluminiumForm
