import { memo, useEffect, useMemo, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { CCollapse } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'

import ProductContainer from '../ProductContainer'
import MoveAndToggleIcon from '../MoveAndToggleIcon'

import { isSimilarObject } from 'src/helper/helper'
import { ALERT, INVENTORY, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'
import { validatePermission } from 'src/helper/validation'
import { alertActions } from 'src/slices/alert'

export const QuotationSectionDraggableItem = memo(
  function QuotationSectionDraggableItem({
    index,
    sectionInfo = {},
    showSectionIds = [],
    moveSection,
    isEditable = false,
    setShowSectionIds,
    showCreateProductModal,
    handleDragAndDropSection,
    showCreateProductItemModal,
    setIsShowAddSectionModal,
    setIsShowAddProductModal,
    setIsShowEditProductModal,
    setIsShowCreateProductModal,
    setIsShowCreateProductItemModal,
  }) {
    const { actions } = useQuotationSectionSlice()
    const dispatch = useDispatch()

    const permissionData = useSelector(state => state.user.permissionData)

    const isEditAllowed = useMemo(() => {
      const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
      return isAllowed
    }, [permissionData])

    const [productList, setProductList] = useState([])
    const [isShowMoveIcon, setIsShowMoveIcon] = useState(false)
    const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
    const [originalProductOrders, setOriginalProductOrders] = useState([])

    const onSuccess = () => {
    }

    const onError = () => {
    }

    useEffect(() => {
      setProductList(sectionInfo.products)
      const originalList = [...sectionInfo.products].map((product, index) => ({
        product_id: +product.productId,
        order_number: index + 1,
      }));
      setOriginalProductOrders(originalList)
    }, [sectionInfo.products])

    const isShowSectionProduct = useMemo(() => {
      return !!showSectionIds?.includes(+sectionInfo.id)
    }, [showSectionIds, sectionInfo])

    const [{ isDragging }, drag] = useDrag({
      type: isHoveringMoveIcon ? 'SECTION' : '',
      item: { id: +sectionInfo.id, index },
    });

    const [, drop] = useDrop({
      accept: 'SECTION',
      hover: (draggedItem) => {
        if (draggedItem.index !== index) {
          moveSection(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
      drop: () => {
        handleDragAndDropSection();
      }
    });

    const handleMouseEnter = () => {
      setIsHoveringMoveIcon(true)
    }

    const handleMouseLeave = () => {
      setIsHoveringMoveIcon(false)
    }

    const dispatchAlertWithPermissionDenied = () => {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    };

    const toggleShowSectionProduct = (sectionId, e) => {
      e.stopPropagation()
      if (showSectionIds?.includes(sectionId)) {
        setShowSectionIds(showSectionIds.filter(id => +id !== sectionId))
      } else {
        setShowSectionIds([...showSectionIds, sectionId])
      }
    }

    const handleClickDeleteSection = (e, section) => {
      e.stopPropagation()
      if (isEditAllowed) {
        if (!isEditable) return;
        if (section) {
          const hasScrapUsed = section?.products?.some(product => product.product_items
            ?.some(item => item.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM && item.product_template
              ?.some(product => product.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM &&
                product.scrap?.status === INVENTORY.MATERIAL_USED)));
          if (hasScrapUsed) {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: QUOTATION.MESSAGE_ERROR.DELETE_SECTION_HAS_SCRAP_USED,
            }))
          } else {
            dispatch(actions.handleSelectDeleteInfo({
              quotation_section_id: section?.id,
              type: QUOTATION.LABEL.SECTION
            }))
          }
        }
      } else {
        dispatchAlertWithPermissionDenied()
      }
    }

    const moveProduct = (fromIndex, toIndex) => {
      if (!isEditable) return;
      const updatedProductData = [...productList];
      const [movingProduct] = updatedProductData.splice(fromIndex, 1);
      updatedProductData.splice(toIndex, 0, movingProduct);
      setProductList(updatedProductData);
    };

    const handleDragAndDropProduct = () => {
      if (isEditAllowed) {
        if (!isEditable) return;
        const updatedProductListOrder = [...productList].map((product, index) => ({
          product_id: product.productId,
          order_number: index + 1
        }));
        if (+sectionInfo.id && !isSimilarObject(originalProductOrders, updatedProductListOrder)) {
          dispatch(actions.handleChangeProductOrder({
            quotation_section_id: +sectionInfo.id,
            products: updatedProductListOrder,
            onSuccess,
            onError
          }));
        }
      } else {
        dispatchAlertWithPermissionDenied()
      }
    }

    const handleRemoveProduct = (e, product) => {
      e.stopPropagation()
      if (isEditAllowed) {
        if (!isEditable) return;
        if (product) {
          const hasScrapUsed = product?.product_items
            ?.some(item => item.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM && item.product_template
              ?.some(product =>
                product.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM &&
                product.scrap?.status === INVENTORY.MATERIAL_USED));
          if (hasScrapUsed) {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: QUOTATION.MESSAGE_ERROR.DELETE_SCRAP_USED,
            }))
          } else {
            dispatch(actions.handleSelectDeleteInfo({
              product_id: +product.productId,
              section_id: +sectionInfo?.id,
              type: QUOTATION.LABEL.PRODUCT
            }))
          }
        } else {
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Deletion Failed',
            description: QUOTATION.MESSAGE_ERROR.NO_FOUND_PRODUCT,
          }))
        }
      } else {
        dispatchAlertWithPermissionDenied()
      }
    }

    const handleClickEditSection = (e, section) => {
      e.stopPropagation()
      if (isEditAllowed) {
        if (!isEditable) return;
        if (section) {
          dispatch(actions.handleSetSelectedSection(section))
          setIsShowAddSectionModal(true)
        }
      } else {
        dispatchAlertWithPermissionDenied()
      }
    }

    return (
      <div
        className="quotationSectionDraggableItem"
        style={{ opacity: isDragging ? 0 : 1 }}
        ref={(node) => drag(drop(node))}
      >
        <div
          className="quotationSectionDraggableItem__header"
          onMouseLeave={() => setIsShowMoveIcon(false)}
          onMouseEnter={() => setIsShowMoveIcon(true)}
        >
          <div
            className="quotationSectionDraggableItem__header--left"
            onClick={(e) => toggleShowSectionProduct(+sectionInfo.id, e)}
          >
            <MoveAndToggleIcon
              isOpen={isShowSectionProduct}
              isShowMoveIcon={isShowMoveIcon && isEditAllowed && isEditable}
              handleMouseEnterIcon={handleMouseEnter}
              handleMouseLeaveIcon={handleMouseLeave}
            />
            <div className="quotationSectionDraggableItem__header--sectionName">{sectionInfo.section_name || ''}</div>
          </div>
          <div className="quotationSectionDraggableItem__header--right">
            <div
              className="quotationSectionDraggableItem__header--rightIcon"
              onClick={(e) => handleClickEditSection(e, sectionInfo)}
            >
              <img src="/icons/edit.svg" alt="edit" />
            </div>
            <div
              className="quotationSectionDraggableItem__header--rightIcon"
              onClick={(e) => handleClickDeleteSection(e, sectionInfo)}
            >
              <img src="/icons/delete.svg" alt="trash icon" />
            </div>
            <div
              className="quotationSectionDraggableItem__header--rightIcon"
              onClick={() => showCreateProductModal(+sectionInfo.id)}
            >
              <img src="/icons/plus.svg" alt="plus icon" />
            </div>
          </div>
        </div>
        <CCollapse show={isShowSectionProduct}>
          <div className="quotationSectionDraggableItem__section" >
            {productList.map((product, index) =>
              <ProductContainer
                key={index}
                index={index}
                product={product}
                sectionId={+sectionInfo.id}
                moveProduct={moveProduct}
                isEditable={isEditable}
                handleRemoveProduct={handleRemoveProduct}
                handleDragAndDropProduct={handleDragAndDropProduct}
                showCreateProductItemModal={showCreateProductItemModal}
                setIsShowAddProductModal={setIsShowAddProductModal}
                setIsShowEditProductModal={setIsShowEditProductModal}
                setIsShowCreateProductModal={setIsShowCreateProductModal}
                setIsShowCreateProductItemModal={setIsShowCreateProductItemModal}
              />
            )}
          </div>
        </CCollapse>
      </div>
    )
  }
)
