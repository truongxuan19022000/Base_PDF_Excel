import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { INVENTORY } from 'src/constants/config'

import SelectForm from '../SelectForm'
import SelectInventoryAction from '../SelectInventoryAction'

const TableAction = ({
  actionList = [],
  searchText = '',
  isFiltering = false,
  onClickApply,
  handleSearch,
  selectedItem = {},
  setSearchText,
  totalQuantity = 0,
  setSelectedItem,
  selectedQuantity = 0,
  isShowFilterModal = false,
  isInventorySite = false,
  isShowFilter = true,
  setIsShowFilterModal,
  selectedInventoryAction = {},
  setSelectedInventoryAction,
  tableUnit = '',
  createURL = '',
  buttonTitle = '',
}) => {
  const history = useHistory()

  const [countUnit, setCountUnit] = useState(tableUnit)

  const handleApplyAction = (actionType) => {
    onClickApply(actionType)
    setSelectedItem({})
  }

  useEffect(() => {
    if (selectedQuantity > 0) {
      setCountUnit(selectedQuantity > 1 ? `${tableUnit}s` : `${tableUnit}`)
    }
  }, [selectedQuantity])

  const redirectToCreatePage = (redirectURL) => {
    if (redirectURL === 'handleUpload') {
      return
    } else {
      history.push(redirectURL)
    }
  }

  const handleClickEnter = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="tableAction">
      <div className="tableAction__actions">
        <div className={`tableAction__searchBox${isShowFilter ? '' : ' mr-22'}`}>
          <img
            src="/icons/magnifying.svg"
            alt="magnifying"
            onClick={handleSearch}
          />
          <input
            type="text"
            placeholder="Search"
            className="tableAction__search"
            value={searchText || ''}
            onKeyDown={handleClickEnter}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {isShowFilter && (
          <div
            className={`tableAction__filter${isFiltering ? ' tableAction__filter--active' : ''}`}
            onClick={() => setIsShowFilterModal(!isShowFilterModal)}
          >
            <img src="/icons/filter.svg" alt="filter" />
            <span>Filters</span>
          </div>
        )}
        <div className="tableAction__select">
          <SelectForm
            data={actionList}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        </div>
        <div className="tableAction__apply" onClick={() => handleApplyAction(selectedItem?.action)}>
          Apply
        </div>
      </div>
      <div className="tableAction__status">
        <div className="tableAction__text">
          {selectedQuantity ? `${selectedQuantity} Selected ${countUnit}` : `${totalQuantity} Total ${totalQuantity > 1 ? `${tableUnit}s` : `${tableUnit}`}`}
        </div>
        <div className="tableAction__button">
          {isInventorySite ? (
            <div className="tableAction__button--select">
              <SelectInventoryAction
                data={INVENTORY.ACTIONS}
                selectedInventoryAction={selectedInventoryAction}
                setSelectedInventoryAction={setSelectedInventoryAction}
                displayProperties='label'
                placeholder='New Item'
              />
            </div>
          ) : (
            <div
              className="tableAction__button--new"
              onClick={() => redirectToCreatePage(createURL)}
            >
              + {buttonTitle}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TableAction
