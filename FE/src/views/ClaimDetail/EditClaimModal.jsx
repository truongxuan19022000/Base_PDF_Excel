import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { useClaimsSlice } from 'src/slices/claims';
import { ACTIVITY, ALERT, CLAIM, MESSAGE, PROGRESS_NUMBERS } from 'src/constants/config';
import { validateUpdateClaim } from 'src/helper/validation';
import { formatPriceWithTwoDecimals, isEmptyObject, parseLocaleStringToNumber, roundToTwoDecimals } from 'src/helper/helper';
import { alertActions } from 'src/slices/alert';

const EditClaimModal = ({
  id,
  quotationId,
  logsInfo = {},
  onClickCancel,
}) => {
  const dispatch = useDispatch();
  const { actions } = useClaimsSlice();

  const { selectedClaimProduct } = useSelector(state => state.claims)

  const { claimTabInfo } = useSelector(state => state.claims);
  const { quotation } = claimTabInfo;

  const previousClaim = claimTabInfo?.claim_copied || {};
  const sections = quotation?.quotation_sections || [];
  const fees = quotation?.other_fees || [];
  const taxValue = claimTabInfo?.tax || 0

  const previousTaxValue = previousClaim?.tax / 100 || 0; // previous tax value
  // previous actual received amount before GST
  const previousActualReceivedBeforeGST = (previousClaim?.actual_paid_amount / (1 + +previousTaxValue)) || 0;
  const previousSubTotal = previousClaim?.subtotal_from_claim || 0; // previous subtotal amount

  const discountProgress = quotation?.discount?.claim_progress?.[0] || []; // first item

  const sectionClaimProgressList = sections.flatMap(section => {
    return section.products.map(product => product.claim_progress[0]); // first item
  })

  const feeClaimProgressList = fees.flatMap(fee => {
    return fee.claim_progress[0] // first item
  }, []).flat()

  const sectionCurrentAmount = sectionClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.current_amount || 0), 0)

  const feeCurrentAmount = feeClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.current_amount || 0), 0)

  const sectionAccumulativeAmount = sectionClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.accumulative_amount || 0), 0)

  const feeAccumulativeAmount = feeClaimProgressList.reduce((total, item) =>
    total + parseFloat(item?.accumulative_amount || 0), 0)

  const discountCurrentAmount = +discountProgress.current_amount || 0;
  const discountAccumulativeAmount = +discountProgress.accumulative_amount || 0;

  const totalCurrentAmount = +sectionCurrentAmount + +feeCurrentAmount - +discountCurrentAmount;
  const totalAccumulative = +sectionAccumulativeAmount + +feeAccumulativeAmount - +discountAccumulativeAmount;

  const totalQuotationAmount = +quotation?.total_quotation_amount || 0;
  const overallProgress = totalQuotationAmount > 0 ? ((+totalAccumulative / +totalQuotationAmount) * 100) : 0
  const depositPercent = +quotation?.terms_of_payment_confirmation || 0;
  const depositAmount = +depositPercent * +totalQuotationAmount / 100;

  const offsetAccumulative = parseLocaleStringToNumber(depositAmount) * parseLocaleStringToNumber(overallProgress) / 100;
  const offsetPreviousAmount = previousClaim?.accumulative_from_claim || 0;
  const offsetCurrentAmount = offsetAccumulative - offsetPreviousAmount;
  const balanceBeforeGSTAmount = totalCurrentAmount - offsetCurrentAmount;
  const [productCode, setProductCode] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState(0.00);
  const [progressList, setProgressList] = useState([]);
  const [messageError, setMessageError] = useState({});
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [subTotalAmount, setSubTotalAmount] = useState(balanceBeforeGSTAmount);
  const [totalCurrentValue, setTotalCurrentValue] = useState(totalCurrentAmount);
  const [totalAccumulativeValue, setTotalAccumulativeValue] = useState(totalAccumulative);
  const [offsetAccumulativeValue, setOffsetAccumulativeValue] = useState(offsetAccumulative);

  const onSuccess = () => {
    setMessageError({})
    setIsDisableSubmit(false);
    onClickCancel()
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  }

  useEffect(() => {
    return () => {
      dispatch(actions.clearSelectedClaimProduct())
    }
  }, [])

  useEffect(() => {
    if (isEmptyObject(selectedClaimProduct)) {
      onClickCancel()
    } else {
      if (selectedClaimProduct?.item_type === CLAIM.TYPES.PRODUCT) {
        const totalAmount = +selectedClaimProduct?.subtotal * +selectedClaimProduct?.quantity;
        setTotalAmount(+totalAmount)
      } else if (selectedClaimProduct?.item_type === CLAIM.TYPES.OTHER_FEE) {
        setTotalAmount(+selectedClaimProduct?.amount)
        setDescription(selectedClaimProduct?.description)
      } else if (selectedClaimProduct?.item_type === CLAIM.TYPES.DISCOUNT) {
        setTotalAmount(selectedClaimProduct?.discount_amount)
      }
      setProductCode(selectedClaimProduct?.product_code)
      setProgressList(selectedClaimProduct?.claim_progress)
    }
  }, [selectedClaimProduct])

  const handleInputClaimNumber = (value, id) => {
    if (isDisableSubmit || (progressList || []).length === 0) return;
    const updatedProgressList = progressList.map(item =>
      item.id === id ? { ...item, claim_number: value } : item);
    setProgressList(updatedProgressList);
    setMessageError({});
  };

  const handleChangeProduct = (number) => {
    const previousProgressPercent = progressList?.length >= 2 ? progressList[1]?.claim_percent : 0;
    const initialProgress = progressList[0] || {};
    const initialCurrentAmount = initialProgress?.current_amount || 0;
    const initialPreviousAmount = initialProgress?.previous_amount || 0;
    const initialAccumulativeAmount = initialProgress?.accumulative_amount || 0;

    if (number >= previousProgressPercent) {
      setMessageError({});

      // re-calculate current progress
      const accumulativeAmount = (+totalAmount * number) / 100;
      const currentValue = +accumulativeAmount - +initialPreviousAmount;

      const updatedProgress = progressList.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            claim_percent: number,
            current_amount: roundToTwoDecimals(currentValue),
            accumulative_amount: roundToTwoDecimals(accumulativeAmount)
          };
        }
        return item;
      });
      setProgressList(updatedProgress);

      // re-calculate total accumulative, total current
      const newTotalAccumulativeAmount = +totalAccumulativeValue - +initialAccumulativeAmount + +accumulativeAmount;
      const newTotalCurrent = +totalCurrentValue - +initialCurrentAmount + +currentValue;

      setTotalCurrentValue(roundToTwoDecimals(newTotalCurrent));
      setTotalAccumulativeValue(roundToTwoDecimals(newTotalAccumulativeAmount));

      // re-calculate offset accumulative, subtotal
      const overallProgress = totalQuotationAmount > 0 ? ((+newTotalAccumulativeAmount / +totalQuotationAmount) * 100) : 0;
      const depositAmount = (+depositPercent * +totalQuotationAmount) / 100;

      const offsetAccumulative = (+depositAmount * +overallProgress) / 100;
      const newOffsetCurrent = +offsetAccumulative - +offsetPreviousAmount;
      const newSubtotal = +newTotalCurrent - +newOffsetCurrent - +previousActualReceivedBeforeGST + +previousSubTotal;

      setOffsetAccumulativeValue(roundToTwoDecimals(offsetAccumulative));
      setSubTotalAmount(roundToTwoDecimals(newSubtotal));
    } else {
      setMessageError({
        message: `Next progress must be greater than ${previousProgressPercent}`,
      });
    }
  };

  const handleChangeDiscount = (number) => {
    const previousProgressPercent = progressList?.length >= 2 ? progressList[1]?.claim_percent : 0;
    const initialProgress = progressList[0] || {};

    const initialCurrentAmount = initialProgress?.current_amount || 0;
    const initialPreviousAmount = initialProgress?.previous_amount || 0;
    const initialAccumulativeAmount = initialProgress?.accumulative_amount || 0;

    if (number >= previousProgressPercent) {
      setMessageError({});

      // re-calculate current progress
      const accumulativeAmount = (+totalAmount * number) / 100;
      const currentValue = +accumulativeAmount - +initialPreviousAmount;

      const updatedProgress = progressList.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            claim_percent: number,
            current_amount: roundToTwoDecimals(currentValue),
            accumulative_amount: roundToTwoDecimals(accumulativeAmount)
          };
        }
        return item;
      });
      setProgressList(updatedProgress);

      // re-calculate total accumulative, total current
      const newTotalAccumulativeAmount = +totalAccumulative + +initialAccumulativeAmount - +accumulativeAmount;
      const newTotalCurrent = +totalCurrentValue + +initialCurrentAmount - +currentValue;

      setTotalCurrentValue(roundToTwoDecimals(newTotalCurrent));
      setTotalAccumulativeValue(roundToTwoDecimals(newTotalAccumulativeAmount));

      const overallProgress = totalQuotationAmount > 0 ? ((+newTotalAccumulativeAmount / +totalQuotationAmount) * 100) : 0;
      const depositAmount = (+depositPercent * +totalQuotationAmount) / 100;

      const offsetAccumulative = (+depositAmount * +overallProgress) / 100;
      const newOffsetCurrent = +offsetAccumulative - +offsetPreviousAmount;
      const newSubtotal = +newTotalCurrent - +newOffsetCurrent - +previousActualReceivedBeforeGST + +previousSubTotal;

      setOffsetAccumulativeValue(roundToTwoDecimals(offsetAccumulative));
      setSubTotalAmount(roundToTwoDecimals(newSubtotal));

    } else {
      setMessageError({
        message: `Next progress must be greater than ${previousProgressPercent}`,
      });
    }
  };

  const handleChangeProgressNumber = (number) => {
    selectedClaimProduct.item_type === CLAIM.TYPES.DISCOUNT ?
      handleChangeDiscount(number) : handleChangeProduct(number)
  }

  const handleUpdateClaimProgress = () => {
    if (isDisableSubmit) return;

    if (id) {
      const updatedItem = progressList?.[0];
      const updatedPercent = updatedItem?.claim_percent || 0;
      const updatedClaimNumber = updatedItem?.claim_number || '';
      const initialPercent = selectedClaimProduct?.claim_progress?.[0]?.claim_percent || 0;
      const initialClaimNumber = selectedClaimProduct?.claim_progress?.[0]?.claim_number || '';

      if (+updatedPercent === +initialPercent && updatedClaimNumber === initialClaimNumber) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          isHovered: false,
          description: MESSAGE.ERROR.INFO_NO_CHANGE,
        }))
      } else {
        const totalAfterGst = +subTotalAmount + roundToTwoDecimals(+taxValue * +subTotalAmount / 100)

        const data = {
          claim_id: +id,
          total_after_gst: +totalAfterGst,
          accumulative_from_claim: +offsetAccumulativeValue,
          subtotal_from_claim: +subTotalAmount,
          claim_progress_id: +updatedItem?.id,
          claim_number: updatedItem?.claim_number || '',
          claim_percent: +updatedItem?.claim_percent || 0,
          current_amount: +updatedItem?.current_amount || 0,
          previous_amount: +updatedItem?.previous_amount || 0,
          accumulative_amount: +updatedItem?.accumulative_amount || 0,
          item_type: selectedClaimProduct?.item_type,
          progress: progressList,
          last_current_amount: +selectedClaimProduct?.claim_progress?.[0]?.current_amount || 0,
          logsInfo: {
            ...logsInfo,
            action_type: ACTIVITY.LOGS.ACTION_VALUE.UPDATE,
            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          }
        }
        if (selectedClaimProduct.item_type === CLAIM.TYPES.PRODUCT) {
          data.product_id = updatedItem?.product_id;
          data.quotation_section_id = selectedClaimProduct?.quotation_section_id;
        } else if (selectedClaimProduct.item_type === CLAIM.TYPES.OTHER_FEE) {
          data.other_fee_id = updatedItem?.other_fee_id;
        } else if (selectedClaimProduct.item_type === CLAIM.TYPES.DISCOUNT && quotationId) {
          data.quotation_id = quotationId;
        }

        const errors = validateUpdateClaim(data)
        if (Object.keys(errors).length > 0) {
          setMessageError(errors)
        } else {
          dispatch(actions.updateClaimProgress({ ...data, onSuccess, onError }))
          setMessageError({})
          setIsDisableSubmit(true)
        }
      }

    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        isHovered: false,
        description: MESSAGE.ERROR.UNKNOWN_ID,
      }))
    }
  }

  const renderProgressBar = (number, index) => {
    const isPrevious = +number === (progressList?.length >= 2 ? +progressList?.[1]?.claim_percent : 0);
    const isSelectedNumber = +progressList?.[0]?.claim_percent > (progressList?.length >= 2 ? +progressList?.[1]?.claim_percent : 0) &&
      +progressList?.[0]?.claim_percent === +number;
    return (
      <div
        key={index}
        onClick={() => handleChangeProgressNumber(number)}
        className={`claimProgress__box${isSelectedNumber ? ' claimProgress__box--selected' : ''}${isPrevious ? ' claimProgress__box--previous' : ''}`}
      >
        {number}
      </div>
    )
  }

  const renderClaimList = (progress, index) => {
    return (
      <div className="claimAt" key={index}>
        <div className="claimAt__title">
          CLAIM AT {progress?.claim_percent}%
        </div>
        <div className="claimAt__box">
          <div className="claimAtBox">
            <div className="claimAtBox__label">
              CLAIM NUMBER
            </div>
            <input
              type="text"
              value={progress?.claim_number || ''}
              placeholder="Claim number"
              className={`claimAtBox__info${index !== 0 ? ' claimAtBox__info--disabled' : ''}${(messageError?.claim_number && index === 0) ? ' claimAtBox__info--error' : ''}`}
              onChange={(e) => handleInputClaimNumber(e.target.value, +progress?.id)}
              disabled={index !== 0}
            />
            {(messageError?.claim_number && index === 0) &&
              <div className="claimAtBox__message">{messageError.claim_number}</div>
            }
          </div>
          <div className="claimAtBox">
            <div className="claimAtBox__label">
              CURRENT AMOUNT
            </div>
            <div className="claimAtBox__info claimAtBox__info--disabled">
              $ {formatPriceWithTwoDecimals(+progress.current_amount)}
            </div>
          </div>
          <div className="claimAtBox">
            <div className="claimAtBox__label">
              PREVIOUS AMOUNT
            </div>
            <div className="claimAtBox__info claimAtBox__info--disabled">
              $ {formatPriceWithTwoDecimals(+progress.previous_amount)}
            </div>
          </div>
          <div className="claimAtBox">
            <div className="claimAtBox__label">
              ACCUMULATIVE AMOUNT
            </div>
            <div className="claimAtBox__info claimAtBox__info--disabled">
              $ {formatPriceWithTwoDecimals(+progress.accumulative_amount)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderInfo = () => {
    switch (selectedClaimProduct.item_type) {
      case CLAIM.TYPES.PRODUCT: {
        return (
          <div className="editClaimModal__section">
            <div className="editClaimModal__detail">
              <div className="claimInfo">
                <div className="claimInfo__label">PRODUCT</div>
                <div className="claimInfo__info">{productCode}</div>
              </div>
              <div className="claimInfo">
                <div className="claimInfo__label">TOTAL AMOUNT</div>
                <div className="claimInfo__info">$ {formatPriceWithTwoDecimals(totalAmount)}</div>
              </div>
            </div>
          </div>
        )
      }
      case CLAIM.TYPES.DISCOUNT: {
        return (
          <div className="editClaimModal__section">
            <div className="editClaimModal__detail">
              <div className="claimInfo">
                <div className="claimInfo__label">Description</div>
                <div className="claimInfo__info">Discount</div>
              </div>
              <div className="claimInfo">
                <div className="claimInfo__label">TOTAL AMOUNT</div>
                <div className="claimInfo__info">$ {formatPriceWithTwoDecimals(totalAmount)}</div>
              </div>
            </div>
          </div>
        )
      }
      case CLAIM.TYPES.OTHER_FEE: {
        return (
          <div className="editClaimModal__section">
            <div className="editClaimModal__detail editClaimModal__detail--fee">
              <div className="claimInfo">
                <div className="claimInfo__label">Description</div>
                <div className="claimInfo__info claimInfo__info--description">{description}</div>
              </div>
              <div className="claimInfo">
                <div className="claimInfo__label">TOTAL AMOUNT</div>
                <div className="claimInfo__info">$ {formatPriceWithTwoDecimals(totalAmount)}</div>
              </div>
            </div>
          </div>
        )
      }
      default:
        return <></>;
    }
  }

  const modalTitle = selectedClaimProduct.item_type === CLAIM.TYPES.DISCOUNT ? 'Edit Discount' : 'Edit Claim'

  return (
    <div className="editClaimModal">
      <div className="editClaimModal__content">
        <p className="editClaimModal__headerText">{modalTitle}</p>
        {renderInfo()}
        <div className="editClaimModal__section editClaimModal__section--noBorder">
          <div className="claimProgress">
            <div className="claimProgress__title">PROGRESS BAR (IN %)</div>
            <div className="claimProgress__bar">
              {PROGRESS_NUMBERS.map((number, index) => renderProgressBar(number, index))}
            </div>
            {messageError?.message &&
              <div className="claimProgress__message">{messageError.message}</div>
            }
          </div>
          <div className={`editClaimModal__list${selectedClaimProduct?.item_type === CLAIM.TYPES.OTHER_FEE ? ' editClaimModal__list--fee' : ''}`}>
            {progressList?.map((progress, index) => renderClaimList(progress, index))}
          </div>
        </div>
        <div className="editClaimModal__buttons">
          <button
            className="editClaimModal__button"
            onClick={onClickCancel}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="editClaimModal__button editClaimModal__button--brown"
            onClick={handleUpdateClaimProgress}
            disabled={isDisableSubmit}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditClaimModal
