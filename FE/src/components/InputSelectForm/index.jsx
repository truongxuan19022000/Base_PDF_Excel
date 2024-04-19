import React, { useState } from 'react'

import UnitForm from '../UnitForm'
import PriceInputForm from '../InputForm/PriceInputForm'

import { formatPriceWithTwoDecimals, parseLocaleStringToNumber, roundToTwoDecimals } from 'src/helper/helper'

const InputSelectForm = ({
  unit = '',
  value = '',
  setUnit = '',
  keyValue = '',
  selectKey = '',
  labelName = '',
  defaultUnit = '',
  inputType = 'text',
  placeholderTitle = '',
  unitData = [],
  messageError = {},
  handleInputChange,
  isInputChanged = false,
  setIsInputChanged,
  setPrice,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleAmountChange = (value) => {
    setPrice(value)
  };

  const handleClickOutAmount = (e) => {
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;
    const formatted = formatPriceWithTwoDecimals(value)
    setPrice(formatted)
  };

  const handleClickOutNumber = (keyValue, value) => {
    const formattedValue = roundToTwoDecimals(value)
    handleInputChange(keyValue, formattedValue)
  };

  return (
    <div className="inputSelectForm">
      {labelName &&
        <div className="inputSelectForm__title">{labelName}</div>
      }
      <div className={`inputSelectForm__body${isShowItemList ? ' inputSelectForm__body--showSelectList' : ''}${(messageError?.[keyValue]) || messageError?.[selectKey] ? ' inputSelectForm__body--error' : ''}`}>
        <div className="inputSelectForm__body--box">
          {(keyValue === 'price' || keyValue === 'coating_price') ?
            <>
              <div className="inputSelectForm__body--unit">S$</div>
              <PriceInputForm
                inputValue={value}
                placeholderTitle="0.00"
                handleAmountChange={handleAmountChange}
                handleClickOutAmount={handleClickOutAmount}
              />
            </> :
            inputType === 'number' ? (
              <input
                value={value}
                type={inputType}
                placeholder={placeholderTitle}
                onChange={(e) => handleInputChange(keyValue, e.target.value)}
                onBlur={(e) => handleClickOutNumber(keyValue, e.target.value)}
                className="inputSelectForm__body--input"
              />
            ) : (
              <input
                value={value}
                type={inputType}
                placeholder={placeholderTitle}
                onChange={(e) => handleInputChange(keyValue, e.target.value)}
                className="inputSelectForm__body--input"
              />
            )}
        </div>
        <div className="inputSelectForm__body--select">
          <UnitForm
            unitData={unitData}
            selectedUnit={unit}
            setSelectedUnit={setUnit}
            defaultUnit={defaultUnit}
            isShowItemList={isShowItemList}
            setIsShowItemList={setIsShowItemList}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        </div>
      </div>
      {messageError?.[keyValue] && (
        <div className="inputSelectForm__message">{messageError?.[keyValue]}</div>
      )}
      {messageError?.[selectKey] && (
        <div className="inputSelectForm__message">{messageError?.[selectKey]}</div>
      )}
    </div>
  )
}

export default InputSelectForm
