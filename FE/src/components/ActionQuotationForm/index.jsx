import React, { useState } from 'react'

import ArrowDownSvg from '../Icons/ArrowDownSvg'
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const ActionQuotationForm = ({
  data = [],
  selectedAction = null,
  setSelectedAction,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleSelectItem = (item) => {
    setSelectedAction(item)
    setIsShowItemList(false)
  }

  return (
    <div className={`actionQuotationForm${isShowItemList ? ' actionQuotationForm--active' : ''}`}>
      <div className="actionQuotationForm__label" onClick={() => setIsShowItemList(!isShowItemList)}>
        {Object.keys(selectedAction).length > 0 ? (
          <div className="actionQuotationForm__action actionQuotationForm__action--selected">
            {selectedAction?.label}
          </div>
        ) : (
          <div className="actionQuotationForm__action">Save & Continue</div>
        )}
        <span className="actionQuotationForm__action--icon">
          <ArrowDownSvg />
        </span>
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="actionQuotationForm__list">
            {data?.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`actionQuotationForm__option${item?.value === selectedAction?.value ? ' actionQuotationForm__option--selected' : ''}`}
              >
                <img src={item?.icon} alt={item?.label} />
                <span>{item?.label || ''}</span>
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default ActionQuotationForm
