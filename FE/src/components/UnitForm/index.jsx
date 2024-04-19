import React from 'react'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const UnitForm = ({
  className = '',
  defaultUnit = '',
  unitData = [],
  selectedUnit = {},
  isDetail = false,
  setSelectedUnit,
  setIsShowItemList,
  isShowItemList = false,
  isInputChanged = false,
  setIsInputChanged,
}) => {
  const handleSelectItem = (item) => {
    setSelectedUnit(item)
    setIsShowItemList(false)
    setIsInputChanged(!isInputChanged)
  }

  const handleClickShowSelectList = () => {
    if (unitData.length < 2) return;
    setIsShowItemList(!isShowItemList)
  }
  return (
    <div className={`unitForm${isShowItemList ? ' unitForm--active' : ''} ${className}${isDetail ? ' unitForm--detail' : ''}`}>
      <div className={`unitForm__label${unitData.length < 2 ? ' unitForm__label--unselect' : ''}`} onClick={handleClickShowSelectList}>
        {selectedUnit && Object.keys(selectedUnit).length > 0 ? (
          <div className="unitForm__action unitForm__action--selected">{selectedUnit?.label}</div>
        ) : (
          <div className="unitForm__action">
            {defaultUnit}
          </div>
        )}
        {unitData.length > 1 &&
          <img
            className={`unitForm__arrowDown${isShowItemList ? ' unitForm__arrowDown--rotate' : ''}`}
            src="/icons/arrow_down.svg"
            alt="arrow_down.svg"
          />
        }
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="unitForm__list">
            {unitData?.map((item, index) => (
              item.value !== 0 &&
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`unitForm__option${item?.value === selectedUnit?.value ? ' unitForm__option--selected' : ''}`}
              >
                {item?.label || ''}
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default UnitForm

