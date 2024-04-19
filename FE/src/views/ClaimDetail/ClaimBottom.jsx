import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ALERT, DEFAULT_GST_VALUE, MESSAGE, PERMISSION } from 'src/constants/config';
import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals, isEmptyObject, roundToTwoDecimals } from 'src/helper/helper';
import { validatePermission } from 'src/helper/validation';
import { alertActions } from 'src/slices/alert';

const ClaimBottom = ({
  isCopied = false,
  setIsShowGSTModal,
  setIsShowPreviousAmountModal,
}) => {
  const dispatch = useDispatch()

  const { claimTabInfo } = useSelector(state => state.claims);
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const { quotation } = claimTabInfo;

  const previousClaim = claimTabInfo?.claim_copied || {};
  const sections = quotation?.quotation_sections || [];
  const fees = quotation?.other_fees || [];

  const previousActualReceived = previousClaim?.actual_paid_amount || 0; // previous actual received amount
  const previousSubTotal = previousClaim?.subtotal_from_claim || 0; // previous subtotal amount

  const discountProgress = quotation?.discount?.claim_progress?.[0] || []; // first item

  const sectionClaimProgressList = sections.flatMap(section => {
    return section.products.map(product => product.claim_progress[0]); // first item
  })

  const feeClaimProgressList = fees.flatMap(fee => {
    return fee.claim_progress[0] // first item
  }, []).flat()

  const sectionPreviousAmount = sectionClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.previous_amount || 0), 0)

  const sectionCurrentAmount = sectionClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.current_amount || 0), 0)

  const feePreviousAmount = feeClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.previous_amount || 0), 0)

  const feeCurrentAmount = feeClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.current_amount || 0), 0)

  const sectionAccumulativeAmount = sectionClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.accumulative_amount || 0), 0)

  const feeAccumulativeAmount = feeClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.accumulative_amount || 0), 0)

  const discountCurrentAmount = +discountProgress?.current_amount || 0;
  const discountPreviousAmount = +discountProgress?.previous_amount || 0;
  const discountAccumulativeAmount = +discountProgress?.accumulative_amount || 0;

  const totalPreviousAmount = +sectionPreviousAmount + +feePreviousAmount - +discountPreviousAmount;
  const totalCurrentAmount = +sectionCurrentAmount + +feeCurrentAmount - +discountCurrentAmount;
  const totalAccumulative = +sectionAccumulativeAmount + +feeAccumulativeAmount - +discountAccumulativeAmount;

  const totalQuotationAmount = +quotation?.total_quotation_amount;
  const overallProgress = totalQuotationAmount > 0 ? ((+totalAccumulative / +totalQuotationAmount) * 100) : 0

  const depositPercent = +quotation?.terms_of_payment_confirmation;
  const depositAmount = +depositPercent * +totalQuotationAmount / 100;

  const offsetAccumulative = depositAmount * overallProgress / 100;
  const offsetPreviousAmount = previousClaim?.accumulative_from_claim || 0;
  const offsetCurrentAmount = offsetAccumulative - offsetPreviousAmount;
  const balanceBeforeGSTAmount = +totalCurrentAmount - +offsetCurrentAmount - +previousActualReceived + +previousSubTotal;

  const tax = +claimTabInfo?.tax || DEFAULT_GST_VALUE;
  const gstAmount = tax * balanceBeforeGSTAmount / 100;

  const balanceAfterGSTAmount = roundToTwoDecimals(balanceBeforeGSTAmount) + roundToTwoDecimals(gstAmount);

  const isShowInfoToggle = useMemo(() => {
    return !isEmptyObject(claimTabInfo.claim_copied)
  }, [claimTabInfo])

  const [isShowInfoTooltip, setIsShowInfoTooltip] = useState(false);

  const handleClickEditGst = () => {
    if (isEditAllowed) {
      if (isCopied) return;
      setIsShowGSTModal(true)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  return (
    <div className="claimBottom">
      <div className="claimBottom__section">
        <div className="claimBottom__box">
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              TOTAL QUOTATION AMOUNT
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(totalQuotationAmount))}
            </div>
          </div>
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              OVERALL PROGRESS DONE
            </div>
            <div className="claimBottomBox__value">
              {formatNumberWithTwoDecimalPlaces(overallProgress)}%
            </div>
          </div>
        </div>
        <div className="claimBottom__box">
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              DEPOSIT
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(depositAmount))}
            </div>
          </div>
        </div>
        <div className="claimBottom__box">
          <div className="claimBottomBox">
            <div className="claimBottomBox__title"
              onMouseEnter={() => setIsShowInfoTooltip(true)}
              onMouseLeave={() => setIsShowInfoTooltip(false)}
            >
              SUBTOTAL FROM THIS CLAIM / BALANCE DUE (BEFORE GST)
              {isShowInfoToggle &&
                <div className="claimBottomBox__icon" onMouseEnter={() => setIsShowInfoTooltip(true)}>
                  <img
                    src="/icons/info-icon.svg"
                    alt="info"
                    width="18"
                    height="18"
                  />
                </div>
              }
              {(isShowInfoTooltip && isShowInfoToggle) &&
                <div
                  className="claimTooltip"
                  onMouseEnter={() => setIsShowInfoTooltip(true)}
                >
                  <div className="claimTooltip__innerBox">
                    <p>
                      Subtract previous claim amount received
                    </p>
                    <p
                      className="claimTooltip__link"
                      onClick={() => setIsShowPreviousAmountModal(true)}
                    >View Amount</p>
                  </div>
                  <div className="claimTooltip__shape"></div>
                </div>
              }
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(balanceBeforeGSTAmount))}
            </div>
          </div>
          <div className="claimBottomBox">
            <div
              className="claimBottomBox__title claimBottomBox__title--pointer"
              onClick={handleClickEditGst}
            >
              GST ({tax}%)
              <span className="ml-1" style={{ opacity: isCopied ? 0.3 : 1 }}>
                <img src="/icons/edit.svg" alt="edit" width="12" height="12" />
              </span>
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(gstAmount))}
            </div>
          </div>
        </div>
      </div>
      <div className="claimBottom__section">
        <div className="claimBottom__box claimBottom__box--grid">
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              TOTAL CURRENT
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(totalCurrentAmount))}
            </div>
          </div>
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              TOTAL PREVIOUS
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(totalPreviousAmount))}
            </div>
          </div>
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              ACCUMULATIVE
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(totalAccumulative))}
            </div>
          </div>
        </div>
        <div className="claimBottom__box claimBottom__box--grid">
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              OFFSET CURRENT
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(offsetCurrentAmount))}
            </div>
          </div>
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              OFFSET PREVIOUS
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(offsetPreviousAmount))}
            </div>
          </div>
          <div className="claimBottomBox">
            <div className="claimBottomBox__title">
              ACCUMULATIVE
            </div>
            <div className="claimBottomBox__value">
              $ {formatPriceWithTwoDecimals(roundToTwoDecimals(offsetAccumulative))}
            </div>
          </div>
        </div>
        <div className="claimBottomBox claimBottomBox--total">
          <div className="claimBottomBox__title claimBottomBox__title--total">
            TOTAL FROM THIS CLAIM / BALANCE DUE (INCLUSIVE GST)
          </div>
          <div className="claimBottomBox__value claimBottomBox__value--total">
            $ {formatPriceWithTwoDecimals(roundToTwoDecimals(balanceAfterGSTAmount))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaimBottom
