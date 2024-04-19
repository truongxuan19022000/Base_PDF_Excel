import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDrag, useDrop } from 'react-dnd'
import { CCollapse, CProgress } from '@coreui/react'

import { alertActions } from 'src/slices/alert'
import { useClaimsSlice } from 'src/slices/claims'
import { validatePermission } from 'src/helper/validation'
import { formatPriceWithTwoDecimals } from 'src/helper/helper'
import { ALERT, CHANGE_PROGRESS, CLAIM, INVENTORY, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config'

import MoveAndToggleIcon from '../MoveAndToggleIcon'

const innitProgress = {
  claim_percent: 0,
  current_amount: 0,
  previous_amount: 0,
  accumulative_amount: 0
}

const ClaimProduct = ({
  index,
  product = {},
  moveProduct,
  isCopied = false,
  handleDragAndDropProduct,
  setIsShowEditClaimModal,
}) => {
  const dispatch = useDispatch();
  const { actions } = useClaimsSlice();

  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [isShowProductMoveIcon, setIsShowProductMoveIcon] = useState(false)
  const [isHoveringMoveIcon, setIsHoveringMoveIcon] = useState(false)
  const [isShowDetail, setIsShowDetail] = useState(false)

  const [{ isDragging }, drag] = useDrag({
    type: isHoveringMoveIcon ? 'PENDING' : '', //pending dnd
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

  const handleMouseEnter = (e) => {
    e.stopPropagation()
    setIsHoveringMoveIcon(true)
  }
  const handleMouseLeave = (e) => {
    e.stopPropagation()
    setIsHoveringMoveIcon(false)
  }
  const handleClickEditClaim = (e, product) => {
    e.stopPropagation()
    if (isEditAllowed) {
      if (isCopied || !product) return;
      dispatch(actions.handleSetSelectClaimProduct({ ...product, item_type: CLAIM.TYPES.PRODUCT }))
      setIsShowEditClaimModal(true)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const claimProgress = product?.claim_progress?.[0] || innitProgress;

  const renderProductDetail = () => {
    const backgroundColor = claimProgress?.claim_percent >= CHANGE_PROGRESS.LIMIT ?
      CHANGE_PROGRESS.BACKGROUND.HIGHT : CHANGE_PROGRESS.BACKGROUND.LOW
    const textColor = claimProgress?.claim_percent >= CHANGE_PROGRESS.LIMIT ?
      CHANGE_PROGRESS.COLOR.HIGHT : CHANGE_PROGRESS.COLOR.LOW

    return (
      <tr>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            {product.product_code || ''}
          </div>
        </td>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            {product.quantity || ''}
          </div>
        </td>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            $ {formatPriceWithTwoDecimals(+product.subtotal || 0)}
          </div>
        </td>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            $ {formatPriceWithTwoDecimals((+product.subtotal * +product.quantity) || 0)}
          </div>
        </td>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            <CProgress
              height={16}
              value={claimProgress?.claim_percent}
            >
              <div
                className="productContainerTable__progress"
                style={{
                  width: `${claimProgress?.claim_percent}%`,
                  background: backgroundColor
                }}
              >
                {claimProgress?.claim_percent > 10 &&
                  <p style={{ color: textColor }}>{claimProgress.claim_percent} %</p>
                }
              </div>
            </CProgress>
          </div>
          {claimProgress?.claim_percent <= 10 &&
            <div className="productContainerTable__progress--number" style={{
              color: textColor,
              paddingRight: '5px',
            }}>
              {claimProgress.claim_percent} %
            </div>
          }
        </td>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            $ {formatPriceWithTwoDecimals(+claimProgress?.current_amount)}
          </div>
        </td>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            $ {formatPriceWithTwoDecimals(+claimProgress?.previous_amount)}
          </div>
        </td>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            $ {formatPriceWithTwoDecimals(+claimProgress?.accumulative_amount)}
          </div>
        </td>
      </tr>
    )
  }

  const renderProductInfo = () => {
    const profile = INVENTORY.PROFILES[product.profile]?.label;
    const storey = product?.storey ? QUOTATION.STOREY[product.storey]?.label : product?.storey_text;
    const area = product?.area ? QUOTATION.AREA[product.area]?.label : product?.area_text;
    return (
      <div className="productDetail__inner">
        <div className="productDetail__block">
          <p className="productDetail__header">
            PROFILE
          </p>
          <p className="productDetail__value">
            {profile || ''}
          </p>
        </div>
        <div className="productDetail__block">
          <p className="productDetail__header">
            GLASS TYPE
          </p>
          <p className="productDetail__value">
            {product.glass_type || ''}
          </p>
        </div>
        <div className="productDetail__block">
          <p className="productDetail__header">
            STOREY
          </p>
          <p className="productDetail__value">
            {storey || ''}
          </p>
        </div>
        <div className="productDetail__block">
          <p className="productDetail__header">
            AREA
          </p>
          <p className="productDetail__value">
            {area || ''}
          </p>
        </div>
        <div className="productDetail__block">
          <p className="productDetail__header">
            SIZE (mm)
          </p>
          <p className="productDetail__value">
            {product.width + ' x ' + product.height}
          </p>
        </div>
      </div>
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
        onClick={() => setIsShowDetail(!isShowDetail)}
      >
        <div className="productContainer__toggle">
          <MoveAndToggleIcon
            isShowToggleIcon={true}
            isOpen={isShowDetail}
            isShowMoveIcon={isShowProductMoveIcon && isEditAllowed}
            handleMouseEnterIcon={handleMouseEnter}
            handleMouseLeaveIcon={handleMouseLeave}
          />
        </div>
        <div className="productContainer__table">
          <table className="productContainerTable">
            <thead>
              <tr>
                <th className="productContainerTable__th productContainerTable__th--code">
                  PRODUCT CODE
                </th>
                <th className="productContainerTable__th productContainerTable__th--common">
                  QUANTITY
                </th>
                <th className="productContainerTable__th productContainerTable__th--common">
                  SUBTOTAL
                </th>
                <th className="productContainerTable__th productContainerTable__th--common">
                  TOTAL
                </th>
                <th className="productContainerTable__th productContainerTable__th--progress">
                  PROGRESS DONE
                </th>
                <th className="productContainerTable__th productContainerTable__th--common">
                  CURRENT
                </th>
                <th className="productContainerTable__th productContainerTable__th--common">
                  PREVIOUS
                </th>
                <th className="productContainerTable__th productContainerTable__th--accumulative">
                  ACCUMULATIVE
                </th>
              </tr>
            </thead>
            <tbody>
              {renderProductDetail()}
            </tbody>
          </table>
        </div>
        <div className="productContainer__actions productContainer__actions--space">
          <div
            className={`productContainer__actions--button${isCopied ? ' productContainer__actions--disabled' : ''}`}
            onClick={(e) => handleClickEditClaim(e, product)}
          >
            <img
              src="/icons/edit.svg"
              alt="edit"
            />
          </div>
        </div>
      </div>
      <CCollapse show={isShowDetail}>
        <div className="productDetail">
          <p className="productDetail__header productDetail__header--bold">
            PRODUCT INFORMATION
          </p>
          {renderProductInfo()}
        </div>
      </CCollapse>
    </div>
  )
}

export default ClaimProduct
