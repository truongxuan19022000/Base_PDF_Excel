import { memo, useEffect, useMemo, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { CCollapse } from '@coreui/react'
import { useDispatch } from 'react-redux'

import ProductContainer from '../ProductContainer'
import MoveAndToggleIcon from '../MoveAndToggleIcon'

import { MESSAGE } from 'src/constants/config'
import { isSimilarObject } from 'src/helper/helper'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'

export const QuotationSectionDraggableItem = memo(
  function QuotationSectionDraggableItem({
    index,
    sectionInfo = {},
    showSectionIds = [],
    moveSection,
    setMessage,
    setShowSectionIds,
    showCreateProductModal,
    handleDragAndDropSection,
    setSelectedDeleteSectionId,
    showCreateProductItemModal,
  }) {
    const { actions } = useQuotationSectionSlice()

    const dispatch = useDispatch()

    const [productList, setProductList] = useState([])
    const [isShowMoveIcon, setIsShowMoveIcon] = useState(false)
    const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
    const [originalProductOrders, setOriginalProductOrders] = useState([])

    const onSuccess = () => {
      setMessage({ success: MESSAGE.SUCCESS.ACTION })
    }

    const onError = () => {
      setMessage({ failed: MESSAGE.ERROR.DEFAULT })
    }

    useEffect(() => {
      if (sectionInfo.products?.length > 0) {
        setProductList(sectionInfo.products)
        const originalList = [...sectionInfo.products].map((product, index) => ({
          product_id: product.productId,
          order_number: index + 1,
        }));
        setOriginalProductOrders(originalList)
      }
    }, [sectionInfo.products])

    const isShowSectionProduct = useMemo(() => {
      return !!showSectionIds?.includes(sectionInfo.id)
    }, [showSectionIds, sectionInfo])

    const [{ isDragging }, drag] = useDrag({
      type: isHoveringMoveIcon ? 'SECTION' : '',
      item: { id: sectionInfo.id, index },
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

    const toggleShowSectionProduct = (sectionId, e) => {
      e.stopPropagation()
      if (showSectionIds?.includes(sectionId)) {
        setShowSectionIds(showSectionIds.filter(id => id !== sectionId))
      } else {
        setShowSectionIds([...showSectionIds, sectionId])
      }
    }

    const handleClickDeleteSection = (sectionId) => {
      if (sectionId) {
        setSelectedDeleteSectionId(sectionId)
      }
    }

    const moveProduct = (fromIndex, toIndex) => {
      const updatedProductData = [...productList];
      const [movingProduct] = updatedProductData.splice(fromIndex, 1);
      updatedProductData.splice(toIndex, 0, movingProduct);
      setProductList(updatedProductData);
    };

    const handleDragAndDropProduct = () => {
      const updatedProductListOrder = [...productList].map((product, index) => ({
        product_id: product.productId,
        order_number: index + 1
      }));
      if (sectionInfo.id && !isSimilarObject(originalProductOrders, updatedProductListOrder)) {
        dispatch(actions.handleChangeProductOrder({
          quotation_section_id: +sectionInfo.id,
          products: updatedProductListOrder,
          onSuccess,
          onError
        }));
      }
    }

    const handleRemoveProduct = (e, id) => {
      e.stopPropagation()
      if (id) {
        setProductList(productList.filter(p => p.productId !== +id))
      } else {
        setMessage({
          failed: 'No found the product Id.'
        })
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
            onClick={(e) => toggleShowSectionProduct(sectionInfo.id, e)}
          >
            <MoveAndToggleIcon
              isOpen={isShowSectionProduct}
              isShowMoveIcon={isShowMoveIcon}
              handleMouseEnterIcon={handleMouseEnter}
              handleMouseLeaveIcon={handleMouseLeave}
            />
            <div className="quotationSectionDraggableItem__header--sectionName">{sectionInfo.section_name || ''}</div>
          </div>
          <div className="quotationSectionDraggableItem__header--right">
            <div className="quotationSectionDraggableItem__header--rightIcon">
              <img src="/icons/edit.svg" alt="edit" />
            </div>
            <div className="quotationSectionDraggableItem__header--rightIcon"
              onClick={() => handleClickDeleteSection(sectionInfo.id)}
            >
              <img src="/icons/delete.svg" alt="trash icon" />
            </div>
            <div
              className="quotationSectionDraggableItem__header--rightIcon"
              onClick={() => showCreateProductModal(sectionInfo.id)}
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
                sectionId={sectionInfo.id}
                moveProduct={moveProduct}
                setMessage={setMessage}
                handleRemoveProduct={handleRemoveProduct}
                handleDragAndDropProduct={handleDragAndDropProduct}
                showCreateProductItemModal={showCreateProductItemModal}
              />
            )}
          </div>
        </CCollapse>
      </div>
    )
  }
)
