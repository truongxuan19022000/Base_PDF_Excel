import React, { useState } from 'react'

import UnitForm from '../UnitForm'

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
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  return (
    <div className="inputSelectForm">
      {labelName &&
        <div className="inputSelectForm__title">{labelName}</div>
      }
      <div className={`inputSelectForm__body${isShowItemList ? ' inputSelectForm__body--showSelectList' : ''}${(messageError?.[keyValue]) || messageError?.[selectKey] ? ' inputSelectForm__body--error' : ''}`}>
        <div className="inputSelectForm__body--box">
          {(keyValue === 'price' || keyValue === 'coating_price') &&
            <div className="inputSelectForm__body--unit">S$</div>
          }
          {inputType === 'number' ? (
            <>
              <input
                value={value}
                type={inputType}
                placeholder={placeholderTitle}
                onChange={(e) => handleInputChange(keyValue, e.target.value)}
                className="inputSelectForm__body--input"
              />
            </>
          ) : (
            <>
              <input
                value={value}
                type={inputType}
                placeholder={placeholderTitle}
                onChange={(e) => handleInputChange(keyValue, e.target.value)}
                className="inputSelectForm__body--input"
              />
            </>
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
