import React, { useState } from 'react'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const SectionItemSelectForm = ({
  className = '',
  propertyValid = '',
  propertyDisplay = '',
  placeHolder = 'Select',
  dataList = [],
  selectedItem = {},
  setSelectedItem,
  setIsShowSelectMaterialItem,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleSelectItem = (item) => {
    setSelectedItem(item)
    setIsShowItemList(false)
    setIsShowSelectMaterialItem(false)
  }

  const handleShowSelectModal = () => {
    setIsShowSelectMaterialItem(true)
    setIsShowItemList(true)
  }

  const handleCloseSelectModal = () => {
    setIsShowSelectMaterialItem(false)
    setIsShowItemList(false)
  }

  return (
    <div className={`sectionItemSelectForm${isShowItemList ? ' sectionItemSelectForm--active' : ''}${className === 'tableSelect' ? ' sectionItemSelectForm--tableSelect' : ''}`}>
      <div className="sectionItemSelectForm__label" onClick={handleShowSelectModal}>
        {Object.keys(selectedItem).length > 0 ? (
          <div className="sectionItemSelectForm__action sectionItemSelectForm__action--selected">
            {selectedItem?.[propertyDisplay]}
          </div>
        ) : (
          <div className="sectionItemSelectForm__action">{placeHolder}</div>
        )}
        <img
          className={`sectionItemSelectForm__arrowDown${isShowItemList ? ' sectionItemSelectForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow_down.svg"
        />
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={handleCloseSelectModal}>
          <div className={`sectionItemSelectForm__list${' sectionItemSelectForm__list--' + className} `}>
            {dataList?.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`sectionItemSelectForm__option${item?.[propertyValid] === selectedItem?.[propertyValid] ? ' sectionItemSelectForm__option--selected' : ''} `}
              >
                {item?.[propertyDisplay] || ''}
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default SectionItemSelectForm
