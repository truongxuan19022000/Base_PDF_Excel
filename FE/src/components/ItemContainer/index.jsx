import React, { useEffect, useMemo, useState } from 'react'
import { CCollapse } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'

import MetreDetailForm from '../MetreDetailForm'
import PieceDetailForm from '../PieceDetailForm'
import PanelDetailForm from '../PanelDetailForm'
import MoveAndToggleIcon from '../MoveAndToggleIcon'
import AluminumDetailForm from '../AluminumDetailForm'
import SquareMetreDetailForm from '../SquareMetreDetailForm'

import { formatPriceWithTwoDecimals, isEmptyObject } from 'src/helper/helper'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'
import { ALERT, INVENTORY, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config'
import { validatePermission } from 'src/helper/validation'
import { alertActions } from 'src/slices/alert'

const ItemContainer = ({
  item = {},
  itemWidth = 0,
  itemHeight = 0,
  sectionId,
  productId,
  productItemId,
  isEditable = false,
  setIsShowEditProductModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSectionSlice();

  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [itemUnitPrice, setItemUnitPrice] = useState(0)
  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false)
  const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
  const [showDetailItemIds, setShowDetailItemIds] = useState([])

  const isShowDetailItem = useMemo(() => {
    return showDetailItemIds.includes(item.material_id)
  }, [showDetailItemIds, item])

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const toggleShowDetailItem = (itemId, e) => {
    e.stopPropagation()
    if (showDetailItemIds.includes(itemId)) {
      setShowDetailItemIds(showDetailItemIds.filter(id => id !== itemId))
    } else {
      setShowDetailItemIds([...showDetailItemIds, itemId])
    }
  }
  const handleMouseEnter = () => {
    setIsHoveringMoveIcon(true)
  }

  const handleMouseLeave = () => {
    setIsHoveringMoveIcon(false)
  }

  const handleRemoveItem = (e, item) => {
    e.stopPropagation()
    if (isEditAllowed) {
      if (!isEditable) return;

      if (item?.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM && item?.scrap?.status === INVENTORY.MATERIAL_USED) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: INVENTORY.MESSAGE_ERROR.DELETE_ITEM_USED,
        }))
        return;
      }

      if (item && productItemId && productId && sectionId) {
        dispatch(actions.handleSelectDeleteInfo({
          product_template_material_id: item?.product_template_material_id,
          product_item_template_id: item?.product_item_template_id || 0,
          product_template_id: item?.product_template_id,
          used_scrap_id: item?.used_scrap_id || 0,
          scrap_id: item?.scrap?.scrap_id || 0,
          product_item_id: productItemId,
          product_id: +productId,
          section_id: +sectionId,
          type: QUOTATION.LABEL.ITEM,
        }))
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: QUOTATION.MESSAGE_ERROR.NO_FOUND_ITEM
        }))
      }

    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleOpenEditItemModal = (item, e) => {
    e.stopPropagation()
    if (isEditAllowed) {
      if (!isEditable) return;
      if (!isEmptyObject(item)) {
        if (item?.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM && item?.scrap?.status === INVENTORY.MATERIAL_USED) {
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Action Failed',
            description: INVENTORY.MESSAGE_ERROR.ITEM_USED,
          }))
        } else {
          const data = {
            ...item,
            productWidth: itemWidth,
            productHeight: itemHeight,
            productItemId: productItemId,
          }
          dispatch(actions.handleSetSelectedItem(data))
          setIsShowEditProductModal(true)
        }
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  useEffect(() => {
    if (+item.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM) {
      setItemUnitPrice(formatPriceWithTwoDecimals(+item.raw_material_needed.total_cost_of_raw_material))
    } else {
      setItemUnitPrice(formatPriceWithTwoDecimals(+item?.total_cost_of_item))
    }
  }, [item])

  const renderItemDetail = () => {
    switch (item?.cost_unit) {
      case QUOTATION.ITEM_TYPE.PIECE:
        return (
          <PieceDetailForm
            item={item}
          />
        )
      case QUOTATION.ITEM_TYPE.SQUARE_METER:
        return (
          <SquareMetreDetailForm
            item={item}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
          />
        )
      case QUOTATION.ITEM_TYPE.METER:
        return (
          <MetreDetailForm
            item={item}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
          />
        )
      case QUOTATION.ITEM_TYPE.PANEL:
        return (
          <PanelDetailForm
            item={item}
          />
        )
      default:
        return null;
    }
  }

  return (
    <div
      className={`itemContainer${isShowDetailItem ? ' itemContainer--show' : ''}`}
      onMouseEnter={() => setIsShowMoveIcon(true)}
      onMouseLeave={() => setIsShowMoveIcon(false)}
    >
      <div
        className="itemContainer__header"
        onClick={(e) => toggleShowDetailItem(item.material_id, e)}
      >
        <div className="itemContainer__toggle">
          <MoveAndToggleIcon
            isShowToggleIcon={true}
            isShowMoveIcon={isShowMoveIcon && isEditAllowed && isEditable}
            isOpen={isShowDetailItem}
            handleMouseEnterIcon={handleMouseEnter}
            handleMouseLeaveIcon={handleMouseLeave}
          />
        </div>
        <div className="itemContainer__table">
          <table className="itemProductTable">
            <thead>
              <tr>
                <th className="itemProductTable__th itemProductTable__th--item">
                  ITEM
                </th>
                <th className="itemProductTable__th itemProductTable__th--code">
                  ITEM CODE
                </th>
                <th className="itemProductTable__th itemProductTable__th--side">
                  SIDE
                </th>
                <th className="itemProductTable__th itemProductTable__th--unitPrice">
                  UNIT PRICE
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="itemProductTable__td">
                  <div className="itemProductTable__td--title">
                    {item.item || ''}
                  </div>
                </td>
                <td className="itemProductTable__td">
                  <div className="itemProductTable__td--code">
                    {item.code || ''}
                  </div>
                </td>
                <td className="itemProductTable__td">
                  <div className="itemProductTable__td--side">
                    {item.side || ''}
                  </div>
                </td>
                <td className="itemProductTable__td">
                  <div className="itemProductTable__td--unitPrice">
                    $ {itemUnitPrice}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="itemContainer__actions">
          <div
            className="itemContainer__actions--button"
            onClick={(e) => handleOpenEditItemModal(item, e)}
          >
            <img
              src="/icons/edit.svg"
              alt="edit"
            />
          </div>
          <div
            className="itemContainer__actions--button"
            onClick={(e) => handleRemoveItem(e, item)}
          >
            <img
              src="/icons/x-mark.svg"
              alt="x-mark"
            />
          </div>
        </div>
      </div>
      <CCollapse show={isShowDetailItem}>
        {item.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM ? (
          <AluminumDetailForm
            item={item}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
          />
        ) : (
          renderItemDetail()
        )}
      </CCollapse>
    </div>
  )
}

export default ItemContainer
