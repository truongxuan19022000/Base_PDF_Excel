import React, { useEffect, useState } from 'react'

import { COUNTRY_CODE, PHONE_CODE } from 'src/constants/config'
import { isEmptyObject } from 'src/helper/helper'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const PhoneCodeForm = ({
  phoneList = [],
  selectedItem = COUNTRY_CODE[1],
  setSelectedItem,
  className = '',
  isDisable = false,
  setIsShow,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  useEffect(() => {
    setIsShow(isShowItemList)
  }, [isShowItemList])

  const toggleSelectList = () => {
    if (isDisable) return;
    setIsShowItemList(!isShowItemList)
  }

  const handleSelectItem = (item) => {
    setIsShowItemList(false)
    setSelectedItem(item)
  }
  return (
    <div className={`phoneCodeForm${isShowItemList ? ' phoneCodeForm--active' : ''}`}>
      <div className="phoneCodeForm__label" onClick={toggleSelectList}>
        {!isEmptyObject(selectedItem) ? (
          <div className="phoneCodeForm__action phoneCodeForm__action--selected">
            {selectedItem.label}
          </div>
        ) : (
          typeof selectedItem === 'string' ? (
            <div className="phoneCodeForm__action">{selectedItem}</div>
          ) : (
            <div className="phoneCodeForm__action">{PHONE_CODE.SINGAPORE}</div>
          )
        )}
        <img
          className={`phoneCodeForm__arrowDown${isShowItemList ? ' phoneCodeForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow down"
        />
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className={`phoneCodeForm__list${className && ` phoneCodeForm__list--${className}`}`}>
            {phoneList?.map((item, index) => (
              item.value !== 0 &&
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`phoneCodeForm__option${item.label === selectedItem?.label ? ' phoneCodeForm__option--selected' : ''}`}
              >
                {item.label || ''}
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default PhoneCodeForm
