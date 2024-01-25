import React from 'react'

const TableActionTemplate = ({
  searchText = '',
  isFiltering = false,
  handleSearch,
  setSearchText,
  isShowFilterModal = false,
  isShowFilter = true,
  setIsShowFilterModal,
  handleAddToSelectedList,
}) => {
  const handleClickEnter = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="tableActionTemplate">
      <div className="tableActionTemplate__title">Item List to select from</div>
      <div className="tableActionTemplate__actions">
        <div className={`tableActionTemplate__searchBox${isShowFilter ? '' : ' mr-22'}`}>
          <img
            src="/icons/magnifying.svg"
            alt="magnifying"
            onClick={handleSearch}
          />
          <input
            type="text"
            placeholder="Search"
            className="tableActionTemplate__search"
            value={searchText || ''}
            onKeyDown={handleClickEnter}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {isShowFilter && (
          <div
            className={`tableActionTemplate__filter${isFiltering ? ' tableActionTemplate__filter--active' : ''}`}
            onClick={() => setIsShowFilterModal(!isShowFilterModal)}
          >
            <img src="/icons/filter.svg" alt="filter" />
            <span>Filters</span>
          </div>
        )}
        <div className="tableActionTemplate__button" onClick={handleAddToSelectedList}>
          + Add Selected
        </div>
      </div>
    </div>
  )
}

export default TableActionTemplate
