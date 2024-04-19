import React from 'react'

import SelectForm from '../SelectForm'

const CustomerTableAction = ({
  searchText = '',
  buttonTitle = '',
  actionList = [],
  isDetail = false,
  isShowFilter = true,
  isFiltering = false,
  selectedAction = null,
  isUploadDocument = false,
  isShowFilterModal = false,
  onClickApply,
  handleSearch,
  setSearchText,
  onClickCreateNew,
  setSelectedAction,
  setIsShowFilterModal,
  handleFileUpload,
}) => {
  const handleApplyAction = (actionType) => {
    onClickApply(actionType)
    setSelectedAction(null)
  }

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="customerTableAction">
      <div className="customerTableAction__actions">
        <div className={`customerTableAction__searchBox${isShowFilter ? '' : ' mr-22'}`}>
          <img
            src="/icons/magnifying.svg"
            alt="magnifying"
            onClick={handleSearch}
          />
          <input
            type="text"
            placeholder="Search"
            className="customerTableAction__search"
            value={searchText || ''}
            onKeyDown={handleEnter}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {isShowFilter && (
          <div
            className={`customerTableAction__filter${isFiltering ? ' customerTableAction__filter--active' : ''}`}
            onClick={() => setIsShowFilterModal(!isShowFilterModal)}
          >
            <img src="/icons/filter.svg" alt="filter" />
            <span>Filters</span>
          </div>
        )}
        <div className="customerTableAction__select">
          <SelectForm
            data={actionList}
            isDetail={isDetail}
            selectedItem={selectedAction}
            setSelectedItem={setSelectedAction}
          />
        </div>
        <div className="customerTableAction__apply" onClick={() => handleApplyAction(selectedAction?.action)}>
          Apply
        </div>
      </div>
      <div className="customerTableAction__status">
        <div className="tableAction__button">
          {isUploadDocument ? (
            <label
              className="customerTableAction__button--new"
              onClick={handleFileUpload}
            >
              + Upload
            </label>
          ) : (
            <div
              className="customerTableAction__button--new"
              onClick={onClickCreateNew}
            >
              + {buttonTitle}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerTableAction
