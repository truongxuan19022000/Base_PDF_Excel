import { memo, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { CCollapse } from '@coreui/react'

import MoveAndToggleIcon from '../MoveAndToggleIcon'
import ClaimDiscount from '../QuotationSectionDraggableItem/ClaimDiscount'

import { validatePermission } from 'src/helper/validation'
import { PERMISSION } from 'src/constants/config'

const ClaimDiscountDraggableItem = ({
  data = {},
  isCopied = false,
  setIsShowEditClaimModal,
}) => {
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false)
  const [isShowSectionProduct, setIsShowSectionProduct] = useState(true)
  const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
  const [productList, setProductList] = useState([])

  const moveClaimDiscount = (fromIndex, toIndex) => {
    const updatedProductData = [...productList];
    const [movingProduct] = updatedProductData.splice(fromIndex, 1);
    updatedProductData.splice(toIndex, 0, movingProduct);
    setProductList(updatedProductData);
  };

  return (
    <div className="quotationSectionDraggableItem">
      <div className="quotationSectionDraggableItem__header">
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
          <div className="quotationSectionDraggableItem__header--sectionName">Discount</div>
        </div>
      </div>
      <CCollapse show={isShowSectionProduct}>
        <div className="quotationSectionDraggableItem__section" >
          <ClaimDiscount
            index={0}
            isCopied={isCopied}
            claimDiscount={data}
            moveClaimDiscount={moveClaimDiscount}
            setIsShowEditClaimModal={setIsShowEditClaimModal}
          />
        </div>
      </CCollapse>
    </div>
  )
}

export default memo(ClaimDiscountDraggableItem)
