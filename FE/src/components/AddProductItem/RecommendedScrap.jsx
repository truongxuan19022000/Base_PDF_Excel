import React from 'react'
import { useDispatch } from 'react-redux'

import { formatNumberWithTwoDecimalPlaces } from 'src/helper/helper'
import { INVENTORY } from 'src/constants/config'
import { useScrapSlice } from 'src/slices/scrap'

const RecommendedScrap = ({
  scrapList = [],
  handleCancel,
  setIsShowAddItemsForm,
  setIsOpenAddAluminiumModal,
  setIsCreateWithScrapItem,
}) => {
  const { actions } = useScrapSlice()
  const dispatch = useDispatch()

  const onCancel = () => {
    handleCancel()
  }

  const handleSelectScrapItem = (item) => {
    if (item) {
      dispatch(actions.setSelectedScrapItem(item))
      setIsShowAddItemsForm(true)
      setIsCreateWithScrapItem(true)
      setIsOpenAddAluminiumModal(true)
    }
  }

  const handleClickBack = () => {
    setIsShowAddItemsForm(false)
    setIsCreateWithScrapItem(false)
    setIsOpenAddAluminiumModal(false)
    dispatch(actions.resetSelectedScrapItem())
  }

  const handleClickNext = () => {
    setIsShowAddItemsForm(true)
    setIsCreateWithScrapItem(false)
    setIsOpenAddAluminiumModal(true)
    dispatch(actions.resetSelectedScrapItem())
  }

  const renderScrapList = (item, index) => {
    const isShow = (item.status === INVENTORY.MATERIAL_UN_USED && +item.scrap_length > INVENTORY.MIN_MATERIAL_LENGTH)
    return (
      isShow &&
      <tr key={index}>
        <td className="scrapTable__td">
          <div className="scrapTable__text">
            {item.title}
          </div>
        </td>
        <td className="scrapTable__td">
          <div className="scrapTable__text">
            {item.product_code}
          </div>
        </td>
        <td className="scrapTable__td">
          <div className="scrapTable__text">
            {item.item}
          </div>
        </td>
        <td className="scrapTable__td">
          <div className="scrapTable__text">
            {formatNumberWithTwoDecimalPlaces(item.scrap_length)} m
          </div>
        </td>
        <td className="scrapTable__td">
          <div className="scrapTable__thAction" onClick={() => handleSelectScrapItem(item)}>
            USE
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="createItemForm createItemForm--scrap">
      <div className="createItemForm__inner">
        <p className="createItemForm__headerText">
          Add Items
        </p>
        <b className="createItemForm__label">
          RECOMMENDED SCRAP TO USE
        </b>
        <div className="createItemForm__table">
          <table className="scrapTable">
            <thead>
              <tr>
                <th className="scrapTable__th scrapTable__th--title">SCRAP FROM</th>
                <th className="scrapTable__th scrapTable__th--code">PRODUCT CODE</th>
                <th className="scrapTable__th scrapTable__th--item">ITEM</th>
                <th className="scrapTable__th scrapTable__th--length">SCRAP LENGTH</th>
                <th className="scrapTable__th scrapTable__th--actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {scrapList.map((item, index) => renderScrapList(item, index))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="createItemForm__buttonWrapper createItemForm__buttonWrapper--scrap">
        <button
          className="createItemForm__button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="createItemForm__button"
          onClick={handleClickBack}
        >
          Back
        </button>
        <button
          className="createItemForm__button createItemForm__button--brown"
          onClick={handleClickNext}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default RecommendedScrap
