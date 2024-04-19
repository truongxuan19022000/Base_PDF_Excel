import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDrag, useDrop } from 'react-dnd'
import { CProgress } from '@coreui/react'

import { formatPriceWithTwoDecimals } from 'src/helper/helper'
import { ALERT, CHANGE_PROGRESS, CLAIM, MESSAGE, PERMISSION } from 'src/constants/config'
import { validatePermission } from 'src/helper/validation'
import { useClaimsSlice } from 'src/slices/claims'
import { alertActions } from 'src/slices/alert'

import MoveAndToggleIcon from '../MoveAndToggleIcon'

const innitProgress = {
  claim_percent: 0,
  current_amount: 0,
  previous_amount: 0,
  accumulative_amount: 0
}

const ClaimDiscount = ({
  index,
  claimDiscount = {},
  moveClaimDiscount,
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
    type: isHoveringMoveIcon ? 'PENDING' : '', // pending dnd feature
    item: { id: +claimDiscount.productId, index },
  });

  const [, drop] = useDrop(() => ({
    accept: 'DISCOUNT',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveClaimDiscount(draggedItem.index, index);
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
  const handleClickEditDiscount = (e, product) => {
    e.stopPropagation()
    if (isEditAllowed) {
      if (isCopied || !product) return;
      dispatch(actions.handleSetSelectClaimProduct({ ...product, item_type: CLAIM.TYPES.DISCOUNT }))
      setIsShowEditClaimModal(true)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Denied',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const claimProgress = claimDiscount.claim_progress?.[0] || innitProgress;

  const renderProductDetail = () => {
    const backgroundColor = claimProgress?.claim_percent >= CHANGE_PROGRESS.LIMIT ?
      CHANGE_PROGRESS.BACKGROUND.HIGHT : CHANGE_PROGRESS.BACKGROUND.LOW
    const textColor = claimProgress?.claim_percent >= CHANGE_PROGRESS.LIMIT ?
      CHANGE_PROGRESS.COLOR.HIGHT : CHANGE_PROGRESS.COLOR.LOW

    return (
      <tr>
        <td className="productContainerTable__td">
          <div className="productContainerTable__td--text">
            Discount
          </div>
        </td>
        <td className="productContainerTable__td productContainerTable__td--space">
          <div className="productContainerTable__td--text">
            $ {formatPriceWithTwoDecimals(+claimDiscount?.discount_amount)}
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
            isOpen={false}
            isShowMoveIcon={false}
            handleMouseEnterIcon={handleMouseEnter}
            handleMouseLeaveIcon={handleMouseLeave}
          />
        </div>
        <div className="productContainer__table">
          <table className="productContainerTable">
            <thead>
              <tr>
                <th className="productContainerTable__th productContainerTable__th--description">
                  DESCRIPTION
                </th>
                <th className="productContainerTable__th productContainerTable__th--amount">
                  AMOUNT
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
            onClick={(e) => handleClickEditDiscount(e, claimDiscount)}
          >
            <img
              src="/icons/edit.svg"
              alt="edit"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaimDiscount
