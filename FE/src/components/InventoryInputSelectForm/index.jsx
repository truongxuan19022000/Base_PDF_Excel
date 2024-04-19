import React, { useState } from 'react'

import { isEmptyObject } from 'src/helper/helper'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const InventoryInputSelectForm = ({
  data,
  isDetail = false,
  selectedItem = {},
  setSelectedItem,
  keyValue = '',
  className = '',
  messageError = {},
  setMessageError,
  displayProperties = 'label',
  placeholder = 'Actions',
  isInputChanged = false,
  setIsInputChanged,
  setInputText,
  inputText = '',
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleSelectItem = (item) => {
    setSelectedItem(item)
    setIsShowItemList(false)
    setMessageError(null)
    setInputText('')
    setIsInputChanged(!isInputChanged)
  }

  const handleClickChangeItem = (inputText) => {
    if (inputText.length > 0) {
      setInputText(inputText)
    }
    setSelectedItem({})
    setMessageError({})
    setIsShowItemList(!isShowItemList)
  }

  const handleChangeInput = (text) => {
    setInputText(text)
    setMessageError({})
  }

  return (
    <div className={`inventorySelectForm${isShowItemList ? ' inventorySelectForm--active' : ''}${isDetail ? ' inventorySelectForm--detail' : ''}${messageError?.[keyValue] ? ' inventorySelectForm--error' : ''}`}>
      <div className="inventorySelectForm__label" onClick={() => setIsShowItemList(!isShowItemList)}>
        {!isEmptyObject(selectedItem) ? (
          <div
            className="inventorySelectForm__action inventorySelectForm__action--selected"
            onClick={() => handleClickChangeItem(selectedItem.label)}
          >
            {selectedItem.label}
          </div>
        ) : (
          <input
            type="text"
            className="inventorySelectForm__action"
            placeholder={placeholder}
            value={inputText || ''}
            autoFocus
            onChange={(e) => handleChangeInput(e.target.value)}
          />
        )}
        <img
          className={`inventorySelectForm__arrowDown${isShowItemList ? ' inventorySelectForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow down"
        />
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className={`inventorySelectForm__list${className ? ` inventorySelectForm__list--${className}` : ''}`}>
            {data.map((item, index) => (
              item.value !== 0 &&
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`inventorySelectForm__option${item.value === selectedItem.value ? ' inventorySelectForm__option--selected' : ''}`}
              >
                {item?.[displayProperties] || ''}
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default InventoryInputSelectForm
