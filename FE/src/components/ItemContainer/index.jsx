import React, { useEffect, useMemo, useState } from 'react'
import { CCollapse } from '@coreui/react'

import MetreDetailForm from '../MetreDetailForm'
import PieceDetailForm from '../PieceDetailForm'
import MoveAndToggleIcon from '../MoveAndToggleIcon'
import AluminumDetailForm from '../AluminumDetailForm'
import SquareMetreDetailForm from '../SquareMetreDetailForm'

import { formatCurrency } from 'src/helper/helper'
import { DEFAULT_VALUE, QUOTATION } from 'src/constants/config'

const ItemContainer = ({
  item = {},
  itemWidth = 0,
  itemHeight = 0,
  handleRemoveItem,
}) => {
  const [itemUnitPrice, setItemUnitPrice] = useState(0)
  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false)
  const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
  const [showDetailItemIds, setShowDetailItemIds] = useState([])

  const isShowDetailItem = useMemo(() => {
    return showDetailItemIds.includes(item.id)
  }, [showDetailItemIds, item.id])

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

  const side = useMemo(() => {
    const isInner = item.inner_side === DEFAULT_VALUE;
    const isOuter = item.outer_side === DEFAULT_VALUE;
    if (isInner && isOuter) return 'Inner / Outer';
    if (isInner) return 'Inner';
    if (isOuter) return 'Outer';
    return '';
  }, [item.inner_side, item.outer_side]);

  useEffect(() => {
    if (item.type === 1) {
      setItemUnitPrice(Number(item.raw_material_needed.total_cost_of_raw_material).toFixed(2))
    } else {
      setItemUnitPrice(Number((+item.quantity * +item?.cost_of_item).toFixed(2)))
    }
  }, [item])

  const renderItemDetail = () => {
    switch (item?.cost_unit) {
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
      case QUOTATION.ITEM_TYPE.PIECE:
        return (
          <PieceDetailForm
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
        onClick={(e) => toggleShowDetailItem(item.id, e)}
      >
        <div className="itemContainer__toggle">
          <MoveAndToggleIcon
            isShowToggleIcon={true}
            isShowMoveIcon={isShowMoveIcon}
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
                    {side || ''}
                  </div>
                </td>
                <td className="itemProductTable__td">
                  <div className="itemProductTable__td--unitPrice">
                    $ {formatCurrency(+itemUnitPrice)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="itemContainer__actions">
          <div className="itemContainer__actions--button">
            <img
              src="/icons/edit.svg"
              alt="edit"
            />
          </div>
          <div
            className="itemContainer__actions--button"
            onClick={(e) => handleRemoveItem(e, item.material_id)}
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
