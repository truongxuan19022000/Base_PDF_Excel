import React, { useEffect, useMemo, useState } from 'react'
import { CCollapse } from '@coreui/react'
import { useDrag, useDrop } from 'react-dnd'
import { useDispatch, useSelector } from 'react-redux'

import { useQuotationSectionSlice } from 'src/slices/quotationSection'
import { formatPriceWithTwoDecimals } from 'src/helper/helper'
import { ALERT, INVENTORY, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config'
import { validatePermission } from 'src/helper/validation'
import { alertActions } from 'src/slices/alert'

import MoveAndToggleIcon from '../MoveAndToggleIcon'
import MaterialContainer from '../MaterialContainer'

const ProductContainer = ({
  index,
  sectionId,
  product = {},
  moveProduct,
  isEditable = false,
  handleRemoveProduct,
  handleDragAndDropProduct,
  showCreateProductItemModal,
  setIsShowAddProductModal,
  setIsShowEditProductModal,
  setIsShowCreateProductModal,
  setIsShowCreateProductItemModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSectionSlice();

  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [materialList, setMaterialList] = useState([])
  const [isShowProductMoveIcon, setIsShowProductMoveIcon] = useState(false)
  const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
  const [showDetailProductIds, setShowDetailProductIds] = useState([])

  const isShowProductList = useMemo(() => {
    return showDetailProductIds.includes(+product.productId)
  }, [product, showDetailProductIds])

  const [{ isDragging }, drag] = useDrag({
    type: isHoveringMoveIcon ? 'PRODUCT' : '',
    item: { id: +product.productId, index },
  });

  const [, drop] = useDrop(() => ({
    accept: 'PRODUCT',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveProduct(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    drop: () => {
      handleDragAndDropProduct();
    }
  }))

  useEffect(() => {
    if (product?.product_items) {
      setMaterialList(product.product_items)
    }
    setShowDetailProductIds([...showDetailProductIds, +product.productId])
  }, [product])

  const toggleShowDetailProduct = (productId, e) => {
    e.stopPropagation()
    if (showDetailProductIds.includes(productId)) {
      setShowDetailProductIds(showDetailProductIds.filter(id => +id !== +productId))
    } else {
      setShowDetailProductIds([...showDetailProductIds, productId])
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

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleRemoveMaterial = (e, productItemId) => {
    e.stopPropagation()
    if (isEditAllowed) {
      if (!isEditable) return;
      if (productItemId) {
        dispatch(actions.handleSelectDeleteInfo({
          product_item_id: productItemId,
          product_id: +product.productId,
          section_id: +sectionId,
          type: QUOTATION.LABEL.PRODUCT_ITEM,
        }))
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: 'No found the product item Id.'
        }))
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleClickEditSectionProduct = (e, product) => {
    e.stopPropagation()
    if (isEditAllowed) {
      if (!isEditable) return;
      if (product) {
        dispatch(actions.handleSetSelectedProduct(product))
        setIsShowCreateProductModal(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const renderProductDetail = () => {
    const profile = INVENTORY.PROFILES[product.profile]?.label;
    const storey = product?.storey ? QUOTATION.STOREY[product.storey]?.label : product?.storey_text;
    const area = product?.area ? QUOTATION.AREA[product.area]?.label : product?.area_text;
    return (
      <tr>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--profile">
            {profile || ''}
          </div>
        </td>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--code">
            {product.product_code || ''}
          </div>
        </td>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--glassType">
            {product.glass_type || ''}
          </div>
        </td>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--storey">
            {storey || ''}
          </div>
        </td>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--area">
            {area || ''}
          </div>
        </td>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--size">
            {product.width || 0} x {product.height || 0}
          </div>
        </td>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--quantity">
            {product.quantity || 0}
          </div>
        </td>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--price">
            $ {formatPriceWithTwoDecimals(+product.sub_total)}
          </div>
        </td>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text productContainerTable__td--total">
            $ {formatPriceWithTwoDecimals(+product.quantity * +product.sub_total)}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div
      className="productContainer"
      style={{ opacity: isDragging ? 0 : 1 }}
      ref={(node) => drag(drop(node))}
    >
      <div
        className="productContainer__header"
        onMouseEnter={() => setIsShowProductMoveIcon(true)}
        onMouseLeave={() => setIsShowProductMoveIcon(false)}
        onClick={(e) => toggleShowDetailProduct(+product.productId, e)}
      >
        <div className="productContainer__toggle">
          <MoveAndToggleIcon
            isShowToggleIcon={true}
            isOpen={isShowProductList}
            isShowMoveIcon={isShowProductMoveIcon && isEditAllowed && isEditable}
            handleMouseEnterIcon={handleMouseEnter}
            handleMouseLeaveIcon={handleMouseLeave}
          />
        </div>
        <div className="productContainer__table">
          <table className="productContainerTable">
            <thead>
              <tr>
                <th className="productContainerTable__th productContainerTable__th--profile">
                  PROFILE
                </th>
                <th className="productContainerTable__th productContainerTable__th--code">
                  PRODUCT CODE
                </th>
                <th className="productContainerTable__th productContainerTable__th--glassType">
                  GLASS TYPE
                </th>
                <th className="productContainerTable__th productContainerTable__th--storey">
                  STOREY
                </th>
                <th className="productContainerTable__th productContainerTable__th--area">
                  AREA
                </th>
                <th className="productContainerTable__th productContainerTable__th--size">
                  SIZE (mm)
                </th>
                <th className="productContainerTable__th productContainerTable__th--quantity">
                  QUANTITY
                </th>
                <th className="productContainerTable__th productContainerTable__th--subTotal">
                  SUBTOTAL
                </th>
                <th className="productContainerTable__th productContainerTable__th--total">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {renderProductDetail()}
            </tbody>
          </table>
        </div>
        <div className="productContainer__actions">
          <div
            className="productContainer__actions--button"
            onClick={(e) => handleClickEditSectionProduct(e, product)}
          >
            <img
              src="/icons/edit.svg"
              alt="edit"
            />
          </div>
          <div
            className="productContainer__actions--button"
            onClick={(e) => handleRemoveProduct(e, product)}
          >
            <img
              src="/icons/x-mark.svg"
              alt="x-mark"
            />
          </div>
        </div>
      </div>
      <CCollapse show={isShowProductList}>
        <div className="productContainer__detailBox">
          <div className="productContainer__list">
            {materialList.map((material, index) => (
              <div className="productContainer__list--material" key={index}>
                <MaterialContainer
                  product={product}
                  material={material}
                  sectionId={sectionId}
                  isEditable={isEditable}
                  handleRemoveMaterial={handleRemoveMaterial}
                  setIsShowAddProductModal={setIsShowAddProductModal}
                  setIsShowEditProductModal={setIsShowEditProductModal}
                  setIsShowCreateProductItemModal={setIsShowCreateProductItemModal}
                />
              </div>
            ))}
          </div>
          <div className="productContainer__footer">
            <div className="productContainer__footer--title">
              ADD MATERIALS ...
            </div>
            <div className="productContainer__footer--buttons">
              <div
                className="productContainer__footer--button"
                onClick={() => showCreateProductItemModal(+product.productId, QUOTATION.MATERIAL_VALUE.PRODUCT, +sectionId, product?.height, product?.width)}
              >
                + Product
              </div>
              <div
                className="productContainer__footer--button"
                onClick={() => showCreateProductItemModal(+product.productId, QUOTATION.MATERIAL_VALUE.GLASS, +sectionId, product?.height, product?.width)}
              >
                + Glass
              </div>
              <div
                className="productContainer__footer--button"
                onClick={() => showCreateProductItemModal(+product.productId, QUOTATION.MATERIAL_VALUE.EXTRA_ORDER, +sectionId, product?.height, product?.width)}
              >
                + Extra Order
              </div>
            </div>
          </div>
        </div>
      </CCollapse>
    </div>
  )
}

export default ProductContainer
