import React, { useState } from 'react'
import { isEmptyObject } from 'src/helper/helper'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const InventorySelectForm = ({
  data,
  isDetail = false,
  selectedItem = {},
  setSelectedItem,
  keyValue = '',
  messageError = {},
  setMessageError,
  displayProperties = 'label',
  placeholder = 'Actions',
  isInputChanged = false,
  setIsInputChanged,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleSelectItem = (item) => {
    setSelectedItem(item)
    setIsShowItemList(false)
    setMessageError(null)
    setIsInputChanged(!isInputChanged)
  }

  return (
    <div className={`inventorySelectForm${isShowItemList ? ' inventorySelectForm--active' : ''}${isDetail ? ' inventorySelectForm--detail' : ''}${messageError?.[keyValue] ? ' inventorySelectForm--error' : ''}`}>
      <div className="inventorySelectForm__label" onClick={() => setIsShowItemList(!isShowItemList)}>
        {!isEmptyObject(selectedItem) ? (
          <div className="inventorySelectForm__action inventorySelectForm__action--selected">{selectedItem.label}</div>
        ) : (
          <div className="inventorySelectForm__action">{placeholder}</div>
        )}
        <img
          className={`inventorySelectForm__arrowDown${isShowItemList ? ' inventorySelectForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow down"
        />
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="inventorySelectForm__list">
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

export default InventorySelectForm
