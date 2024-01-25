import React, { useState } from 'react'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const SelectNoteForm = ({
  noteId = null,
  actionList = [],
  selectedItem = {},
  handleChangeType,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleSelectItem = (value) => {
    if (noteId) {
      handleChangeType(noteId, value)
      setIsShowItemList(false)
    }
  }

  return (
    <div className={`selectNoteForm${isShowItemList ? ' selectNoteForm--active' : ''}`}>
      <div className="selectNoteForm__label" onClick={() => setIsShowItemList(!isShowItemList)}>
        {Object.keys(selectedItem).length > 0 ? (
          <div className="selectNoteForm__action selectNoteForm__action--selected">{selectedItem?.label}</div>
        ) : (
          <div className="selectNoteForm__action">Select</div>
        )}
        <img
          className={`selectNoteForm__arrowDown${isShowItemList ? ' selectNoteForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow_down.svg"
        />
      </div>
      {isShowItemList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="selectNoteForm__list">
            {actionList?.map((item, index) => (
              item.value !== 0 &&
              <div
                key={index}
                onClick={() => handleSelectItem(item.value)}
                className={`selectNoteForm__option${item?.value === selectedItem?.value ? ' selectNoteForm__option--selected' : ''}`}
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

export default SelectNoteForm
