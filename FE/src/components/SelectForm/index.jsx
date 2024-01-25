import React, { useState } from 'react'
import { isEmptyObject } from 'src/helper/helper'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const SelectForm = ({
  data,
  isDetail = false,
  selectedItem = {},
  setSelectedItem,
  className,
  displayProperties = 'label',
  placeholder = 'Actions'
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleSelectItem = (item) => {
    setSelectedItem(item)
    setIsShowItemList(false)
  }

  return (
    <div className={`selectForm${isShowItemList ? ' selectForm--active' : ''} ${className}${isDetail ? ' selectForm--detail' : ''}`}>
      <div className="selectForm__label" onClick={() => setIsShowItemList(!isShowItemList)}>
        {!isEmptyObject(selectedItem) ? (
          <div className="selectForm__action selectForm__action--selected">{selectedItem?.label}</div>
        ) : (
          <div className="selectForm__action">{placeholder}</div>
        )}
        <img
          className={`selectForm__arrowDown${isShowItemList ? ' selectForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow_down.svg"
        />
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="selectForm__list">
            {data?.map((item, index) => (
              item.value !==0 &&
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`selectForm__option${item?.value === selectedItem?.value ? ' selectForm__option--selected' : ''}`}
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

export default SelectForm
