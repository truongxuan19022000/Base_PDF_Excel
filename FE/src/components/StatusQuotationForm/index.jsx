import React, { useState } from 'react'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const StatusQuotationForm = ({
  data = [],
  isInputChanged = false,
  selectedStatus = {},
  setSelectedStatus,
  setIsInputChanged,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleSelectItem = (item) => {
    setSelectedStatus(item)
    setIsShowItemList(false)
    setIsInputChanged(!isInputChanged)
  }

  return (
    <div className={`statusQuotationForm${isShowItemList ? ' statusQuotationForm--active' : ''}`}>
      <div className="statusQuotationForm__label" onClick={() => setIsShowItemList(!isShowItemList)}>
        {selectedStatus &&
          <div className="statusQuotationForm__action">
            {selectedStatus.label || ''}
          </div>
        }
        <img
          className={`statusQuotationForm__arrowDown${isShowItemList ? ' statusQuotationForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow down"
        />
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="statusQuotationForm__list">
            {data.map((item, index) => (
              item.value !== 0 &&
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`statusQuotationForm__option${item.value === selectedStatus.value ? ' statusQuotationForm__option--selected' : ''}`}
              >
                <span>{item.label || ''}</span>
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default StatusQuotationForm
