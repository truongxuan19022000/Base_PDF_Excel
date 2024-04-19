import React, { useState } from 'react'
import { CCollapse } from '@coreui/react'

import ArrowDownSvg from '../Icons/ArrowDownSvg'
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const ActionInvoiceForm = ({
  data = [],
  selectedAction = null,
  setSelectedAction,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)
  const [selectedDropdown, setSelectedDropdown] = useState(null)

  const handleSelectItem = (item) => {
    setSelectedAction(item)
    setIsShowItemList(false)
  }
  const handleSetSelectedDropdown = (value) => {
    setSelectedDropdown(selectedDropdown === value ? null : value)
  }

  return (
    <div className={`actionQuotationForm ${isShowItemList ? ' actionQuotationForm--active' : ''}`}>
      <div className="actionQuotationForm__label" onClick={() => setIsShowItemList(!isShowItemList)}>
        <div className="actionQuotationForm__action">Save & Continue</div>
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
                onClick={
                  Object.values(item.children || {}).length > 0 ?
                    () => handleSetSelectedDropdown(item.value)
                    :
                    () => handleSelectItem(item)
                }
              >
                <div
                  className={`actionQuotationForm__option ${item?.value === selectedAction?.value ?
                    ' actionQuotationForm__option--selected' : ''}`}
                >
                  <img src={item?.icon} alt={item?.label} />
                  <span>{item?.label || ''}</span>
                  {Object.values(item.children || {}).length > 0 &&
                    <span className="actionQuotationForm__childrenDropDown">
                      <ArrowDownSvg />
                    </span>
                  }
                </div>
                {Object.values(item.children || {}).length > 0 &&
                  <CCollapse show={selectedDropdown === item.value}>
                    {Object.values(item.children).map((children, childrenIndex) => (
                      <div key={childrenIndex}
                        className="actionQuotationForm__option actionQuotationForm__option--children"
                        onClick={() => handleSelectItem(children)}
                      >
                        <span>{children.value || ''}</span>
                      </div>
                    ))}
                  </CCollapse>
                }
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default ActionInvoiceForm
