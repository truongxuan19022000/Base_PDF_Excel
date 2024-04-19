import React, { useEffect, useMemo, useState } from 'react'
import { CCollapse } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'

import { alertActions } from 'src/slices/alert'
import { validatePermission } from 'src/helper/validation'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'
import { ALERT, INVENTORY, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config'
import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals } from 'src/helper/helper'

import ItemContainer from '../ItemContainer'
import MoveAndToggleIcon from '../MoveAndToggleIcon'

const MaterialContainer = ({
  material = {},
  handleRemoveMaterial,
  product = {},
  isEditable = false,
  setIsShowAddProductModal,
  setIsShowEditProductModal,
  sectionId = null,
  setIsShowCreateProductItemModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSectionSlice();
  const { actions: quotationSectionActions } = useQuotationSectionSlice();

  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [itemList, setItemList] = useState([]);
  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false)
  const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
  const [showDetailMaterialIds, setShowDetailMaterialIds] = useState([])

  const [quantity, setQuantity] = useState(0);
  const [quantityUnit, setQuantityUnit] = useState(INVENTORY.UNIT_LABEL.SQUARE_METER);
  const [materialWidth, setMaterialWidth] = useState(+product.width);
  const [materialHeight, setMaterialHeight] = useState(+product.height);

  const isShowMaterialList = useMemo(() => {
    return showDetailMaterialIds.includes(material.id)
  }, [showDetailMaterialIds, material.id])

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  useEffect(() => {
    if (product.width) {
      setMaterialWidth(+product.width);
    }
    if (product.height) {
      setMaterialHeight(+product.height);
    }
  }, [product.height, product.width]);

  useEffect(() => {
    if (material.type === QUOTATION.MATERIAL_VALUE.GLASS && material.no_of_panels) {
      const calculatedMaterialWidth = +product.width / +material.no_of_panels;
      const roundedMaterialWidth = Math.round(calculatedMaterialWidth);
      setMaterialWidth(roundedMaterialWidth);
    }
  }, [material, product.width]);

  useEffect(() => {
    if (materialHeight && materialWidth) {
      if (material.type === QUOTATION.MATERIAL_VALUE.EXTRA_ORDER) {
        const unit = INVENTORY.UNIT[material.quantity_unit]?.label;
        setQuantity(material.quantity);
        setQuantityUnit(unit)
      } else {
        const calculatedQuantity = (+materialWidth / 1000) * (+materialHeight / 1000);
        const roundedQuantity = formatNumberWithTwoDecimalPlaces(calculatedQuantity);
        setQuantity(roundedQuantity);
      }
    }
  }, [material, materialWidth, materialHeight]);

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

  const handleMouseEnter = (e) => {
    e.stopPropagation()
    setIsHoveringMoveIcon(true)
  }

  const handleMouseLeave = (e) => {
    e.stopPropagation()
    setIsHoveringMoveIcon(false)
  }

  const handleOpenAddItemModal = (materialId) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (sectionId && materialId) {
        dispatch(quotationSectionActions.handleSetSelectedProduct({
          productId: product.productId,
          productItemId: materialId,
          productWidth: product.width,
          productHeight: product.height,
          productTemplateId: material.product_template_id,
        }))
        setIsShowAddProductModal(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleClickEditProductItem = (e, material) => {
    e.stopPropagation()
    if (isEditAllowed) {
      if (!isEditable) return;
      if (material) {
        const productItem = {
          ...material,
          width: product.width,
          height: product.height,
        }
        dispatch(actions.handleSetSelectedProductItem(productItem))
        setIsShowCreateProductItemModal(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const title = QUOTATION.MATERIAL_TITLE[material.type]?.label || 'TITLE';
  const isGlassItem = material.type === QUOTATION.MATERIAL_VALUE.GLASS;
  const isExtraItem = material.type === QUOTATION.MATERIAL_VALUE.EXTRA_ORDER;
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
            isShowToggleIcon={+material.type === QUOTATION.MATERIAL_VALUE.PRODUCT}
            isShowMoveIcon={isShowMoveIcon && isEditAllowed && isEditable}
            isOpen={isShowMaterialList}
            handleMouseEnterIcon={handleMouseEnter}
            handleMouseLeaveIcon={handleMouseLeave}
          />
        </div>
        <div className="materialContainer__table">
          <table className="materialProductTable">
            <thead>
              <tr>
                <th className={`materialProductTable__th materialProductTable__th--title${isGlassItem ? ' materialProductTable__th--titlePanel' : ''}${isExtraItem ? ' materialProductTable__th--extraItem' : ''}`}>
                  {title}
                </th>
                {material.type === QUOTATION.MATERIAL_VALUE.GLASS &&
                  <th className="materialProductTable__th materialProductTable__th--panel">
                    NO. OF PANELS
                  </th>
                }
                {material.type !== QUOTATION.MATERIAL_VALUE.EXTRA_ORDER &&
                  <th className="materialProductTable__th materialProductTable__th--size">
                    SIZE (mm)
                  </th>
                }
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
                {material.type !== QUOTATION.MATERIAL_VALUE.EXTRA_ORDER &&
                  <td className="materialProductTable__td">
                    <div className="materialProductTable__td--text materialProductTable__td--size">
                      {materialWidth || 0} x {materialHeight || 0}
                    </div>
                  </td>
                }
                <td className="materialProductTable__td">
                  <div className="materialProductTable__td--text materialProductTable__td--quantity">
                    {quantity || 0} {quantity > 0 && quantityUnit}
                  </div>
                </td>
                <td className="materialProductTable__td">
                  <div className="materialProductTable__td--text materialProductTable__td--unitPrice">
                    $ {formatPriceWithTwoDecimals(+material.unit_price)}
                  </div>
                </td>
                <td className="materialProductTable__td">
                  <div className="materialProductTable__td--text materialProductTable__td--subTotal">
                    $ {formatPriceWithTwoDecimals(+material.sub_total)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="materialContainer__actions">
          <div
            className="materialContainer__actions--button"
            onClick={(e) => handleClickEditProductItem(e, material)}
          >
            <img
              src="/icons/edit.svg"
              alt="edit"
            />
          </div>
          <div
            className="materialContainer__actions--button"
            onClick={(e) => handleRemoveMaterial(e, +material.id)}
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
                  itemWidth={+product.width}
                  itemHeight={+product.height}
                  sectionId={sectionId}
                  isEditable={isEditable}
                  productId={product?.productId}
                  productItemId={material?.id}
                  setIsShowEditProductModal={setIsShowEditProductModal}
                />
              </div>
            ))}
          </div>
          {isShowAddItemButton &&
            <div className="materialContainer__footer">
              <div
                className="materialContainer__footer--button"
                onClick={() => handleOpenAddItemModal(material.id)}
              >
                +  Add Item
              </div>
            </div>
          }
        </div>
      </CCollapse>
    </div>
  )
}

export default MaterialContainer
