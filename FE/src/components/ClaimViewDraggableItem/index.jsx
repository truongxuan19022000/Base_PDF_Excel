import { memo, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDrag, useDrop } from 'react-dnd'
import { CCollapse } from '@coreui/react'

import MoveAndToggleIcon from '../MoveAndToggleIcon'
import ClaimProduct from '../QuotationSectionDraggableItem/ClaimProduct'

import { validatePermission } from 'src/helper/validation'
import { PERMISSION } from 'src/constants/config'

const ClaimViewDraggableItem = ({
  index,
  data = [],
  isCopied = false,
  handleDragAndDropSection,
  moveSection,
  setIsShowEditClaimModal,
}) => {
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false)
  const [isShowSectionProduct, setIsShowSectionProduct] = useState(true)
  const [isShowSectionIds, setIsShowSectionIds] = useState([])
  const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
  const [productList, setProductList] = useState([])

  const [{ isDragging }, drag] = useDrag({
    type: isHoveringMoveIcon ? 'PENDING' : '', //pending dnd
    item: { id: +data.id, index },
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
          onClick={() => setIsShowSectionProduct(!isShowSectionProduct)}
        >
          <MoveAndToggleIcon
            isOpen={isShowSectionProduct}
            isShowMoveIcon={isShowMoveIcon && isEditAllowed}
            handleMouseEnterIcon={() => setIsHoveringMoveIcon(true)}
            handleMouseLeaveIcon={() => setIsHoveringMoveIcon(false)}
          />
          <div className="quotationSectionDraggableItem__header--sectionName">{data.section_name || ''}</div>
        </div>
      </div>
      <CCollapse show={isShowSectionProduct}>
        <div className="quotationSectionDraggableItem__section" >
          {data.products?.map((product, index) =>
            <div key={index}>
              <ClaimProduct
                index={index}
                product={product}
                isCopied={isCopied}
                moveProduct={moveProduct}
                handleDragAndDropProduct={handleDragAndDropProduct}
                setIsShowEditClaimModal={setIsShowEditClaimModal}
              />
            </div>
          )}
        </div>
      </CCollapse>
    </div>
  )
}

export default memo(ClaimViewDraggableItem)
