import React, { useState } from 'react'
import { isEmptyObject } from 'src/helper/helper'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const SelectInventoryAction = ({
  data = [],
  selectedInventoryAction = {},
  placeholder = 'New Item',
  displayProperties = 'label',
  setSelectedInventoryAction,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleSelectItem = (item) => {
    setSelectedInventoryAction(item)
    setIsShowItemList(false)
  }

  return (
    <div className={`selectInventoryAction${isShowItemList ? ' selectInventoryAction--active' : ''}`}>
      <div className="selectInventoryAction__label" onClick={() => setIsShowItemList(!isShowItemList)}>
        {!isEmptyObject(selectedInventoryAction) ? (
          <div className="selectInventoryAction__action">
            {selectedInventoryAction.value === 5 ? (
              <img src="/icons/white-upload.svg" alt="upload" />
            ) : (
              <div className="selectInventoryAction__action--icon">+</div>
            )}
            {selectedInventoryAction?.label}</div>
        ) : (
          <div className="selectInventoryAction__action">
            <div className="selectInventoryAction__action--icon">+</div>
            {placeholder}
          </div>
        )}
        <img
          className={`selectInventoryAction__arrowDown${isShowItemList ? ' selectInventoryAction__arrowDown--rotate' : ''}`}
          src="/icons/arrow-down.svg"
          alt="arrow down"
        />
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="selectInventoryAction__list">
            {data?.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`selectInventoryAction__option${item?.value === selectedInventoryAction?.value ? ' selectInventoryAction__option--selected' : ''}`}
              >
                {item.value === 5 ? (
                  <div className="selectInventoryAction__option--icon">
                    <img src="/icons/upload.svg" alt="upload" />
                  </div>
                ) : (
                  <div className="selectInventoryAction__option--icon">+</div>
                )}
                <div className="selectInventoryAction__option--label">
                  {item?.[displayProperties]}
                </div>
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default SelectInventoryAction
