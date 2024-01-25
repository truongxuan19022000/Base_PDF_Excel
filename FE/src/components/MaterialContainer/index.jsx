import React, { useEffect, useMemo, useState } from 'react'
import { CCollapse } from '@coreui/react'
import { Link, useHistory } from 'react-router-dom'

import { INVENTORY, QUOTATION } from 'src/constants/config'
import { formatPriceWithTwoDecimals } from 'src/helper/helper'

import ItemContainer from '../ItemContainer'
import MoveAndToggleIcon from '../MoveAndToggleIcon'

const MaterialContainer = ({
  material = {},
  setMessage,
  handleRemoveMaterial,
  productHeight = 0,
  productWidth = 0,
}) => {
  const [itemList, setItemList] = useState([]);
  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false)
  const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
  const [showDetailMaterialIds, setShowDetailMaterialIds] = useState([])

  const [quantity, setQuantity] = useState(0);
  const [quantityUnit, setQuantityUnit] = useState(INVENTORY.UNIT_LABEL.SQUARE_METER);
  const [materialWidth, setMaterialWidth] = useState(productWidth);
  const [materialHeight, setMaterialHeight] = useState(productHeight);

  const { location } = useHistory()
  const isShowMaterialList = useMemo(() => {
    return showDetailMaterialIds.includes(material.id)
  }, [showDetailMaterialIds, material.id])

  useEffect(() => {
    if (material.type === QUOTATION.MATERIAL_VALUE.GLASS && material.no_of_panels) {
      const calculatedMaterialWidth = +productWidth / +material.no_of_panels;
      const roundedMaterialWidth = Math.round(calculatedMaterialWidth);
      setMaterialWidth(roundedMaterialWidth);
    }
  }, [material, productWidth]);

  useEffect(() => {
    if (productHeight) {
      setMaterialHeight(productHeight);
    }
  }, [productHeight]);

  useEffect(() => {
    if (productWidth) {
      setMaterialWidth(productWidth);
    }
  }, [productWidth]);

  useEffect(() => {
    if (materialHeight && materialWidth) {
      const calculatedQuantity = (+materialWidth / 1000) * (+materialHeight / 1000);
      const roundedQuantity = Number(calculatedQuantity.toFixed(2));
      setQuantity(roundedQuantity);
    }
  }, [materialWidth, materialHeight]);

  useEffect(() => {
    if (material?.product_template) {
      setItemList(material.product_template);
    }
  }, [material]);

  const toggleShowDetailMaterial = (productId, e, type) => {
    e.stopPropagation()
    if (type === QUOTATION.MATERIAL_VALUE.PRODUCT) {
      if (showDetailMaterialIds.includes(productId)) {
        setShowDetailMaterialIds(showDetailMaterialIds.filter(id => id !== productId))
      } else {
        setShowDetailMaterialIds([...showDetailMaterialIds, productId])
      }
    }
  }

  const handleRemoveItem = (e, itemId) => {
    e.stopPropagation()
    if (itemId) {
      setItemList(itemList.filter(item => item.material_id !== itemId))
    } else {
      setMessage({
        failed: 'No found the item Id.'
      })
    }
  }

  const handleMouseEnter = (e) => {
    e.stopPropagation()
    setIsHoveringMoveIcon(true)
  }

  const handleMouseLeave = (e) => {
    e.stopPropagation()
    setIsHoveringMoveIcon(false)
  }

  const title = QUOTATION.MATERIAL_TITLE[material.type]?.label || 'TITLE';
  const isGlassItem = material.type === QUOTATION.MATERIAL_VALUE.GLASS;
  const isShowAddItemButton = material.type === QUOTATION.MATERIAL_VALUE.PRODUCT;

  return (
    <div className="materialContainer">
      <div
        className={`materialContainer__header${material.type === QUOTATION.MATERIAL_VALUE.PRODUCT ? ' materialContainer__header--cursor' : ''}`}
        onMouseEnter={() => setIsShowMoveIcon(true)}
        onMouseLeave={() => setIsShowMoveIcon(false)}
        onClick={(e) => toggleShowDetailMaterial(material.id, e, material.type)}
      >
        <div className="materialContainer__toggle">
          <MoveAndToggleIcon
            isShowToggleIcon={material.type === QUOTATION.MATERIAL_VALUE.PRODUCT}
            isShowMoveIcon={isShowMoveIcon}
            isOpen={isShowMaterialList}
            handleMouseEnterIcon={handleMouseEnter}
            handleMouseLeaveIcon={handleMouseLeave}
          />
        </div>
        <div className="materialContainer__table">
          <table className="materialProductTable">
            <thead>
              <tr>
                <th className={`materialProductTable__th materialProductTable__th--title${isGlassItem ? ' materialProductTable__th--titlePanel' : ''}`}>
                  {title}
                </th>
                {material.type === QUOTATION.MATERIAL_VALUE.GLASS &&
                  <th className="materialProductTable__th materialProductTable__th--panel">
                    NO. OF PANELS
                  </th>
                }
                <th className="materialProductTable__th materialProductTable__th--size">
                  SIZE (mm)
                </th>
                <th className="materialProductTable__th materialProductTable__th--quantity">
                  QUANTITY
                </th>
                <th className="materialProductTable__th materialProductTable__th--unitPrice">
                  UNIT PRICE
                </th>
                <th className="materialProductTable__th materialProductTable__th--subTotal">
                  SUBTOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="materialProductTable__td">
                  <div className="materialProductTable__td--text materialProductTable__td--title">
                    {material.title || ''}
                  </div>
                </td>
                {material.type === QUOTATION.MATERIAL_VALUE.GLASS &&
                  <td className="materialProductTable__td">
                    <div className="materialProductTable__td--text materialProductTable__td--panel">
                      {material.no_of_panels || 0}
                    </div>
                  </td>
                }
                <td className="materialProductTable__td">
                  <div className="materialProductTable__td--text materialProductTable__td--size">
                    {materialWidth || 0} x {materialHeight || 0}
                  </div>
                </td>
                <td className="materialProductTable__td">
                  <div className="materialProductTable__td--text materialProductTable__td--quantity">
                    {quantity || 0} {quantity > 0 && quantityUnit}
                  </div>
                </td>
                <td className="materialProductTable__td">
                  <div className="materialProductTable__td--text materialProductTable__td--unitPrice">
                    $ {formatPriceWithTwoDecimals(material.unit_price) || 0}
                  </div>
                </td>
                <td className="materialProductTable__td">
                  <div className="materialProductTable__td--text materialProductTable__td--subTotal">
                    $ {formatPriceWithTwoDecimals(material.sub_total) || 0}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="materialContainer__actions">
          <div className="materialContainer__actions--button">
            <img
              src="/icons/edit.svg"
              alt="edit"
            />
          </div>
          <div
            className="materialContainer__actions--button"
            onClick={(e) => handleRemoveMaterial(e, material.id)}
          >
            <img
              src="/icons/x-mark.svg"
              alt="x-mark"
            />
          </div>
        </div>
      </div>
      <CCollapse show={isShowMaterialList}>
        <div className="materialContainer__detailBox">
          <div className="materialContainer__list">
            {itemList.map((item, index) => (
              <div className="materialContainer__list--material" key={index}>
                <ItemContainer
                  item={item}
                  itemWidth={productWidth}
                  itemHeight={productHeight}
                  handleRemoveItem={handleRemoveItem}
                />
              </div>
            ))}
          </div>
          {isShowAddItemButton &&
            <div className="materialContainer__footer">
              <Link to={`${location.pathname}/create-item`}>
                <div className="materialContainer__footer--button">
                  +  Add Item
                </div>
              </Link>
            </div>
          }
        </div>
      </CCollapse>
    </div>
  )
}

export default MaterialContainer
