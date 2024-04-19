import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { alertActions } from 'src/slices/alert';
import { formatPriceWithTwoDecimals, isSimilarObject, parseLocaleStringToNumber, roundToTwoDecimals } from 'src/helper/helper';
import { ALERT, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config';
import { validateHandleNoteChange, validatePermission } from 'src/helper/validation';
import { useQuotationOtherFeesSlice } from 'src/slices/quotationOtherFees';

import NoteDragItem from '../NoteDragItem';
import QuotationBottom from '../QuotationBottom';

const QuotationOtherFees = ({
  id,
  viewTab = '',
  otherFeesList = [],
  resetAction,
  isEditable = false,
  selectedAction = '',
}) => {
  const dispatch = useDispatch();
  const { actions } = useQuotationOtherFeesSlice();

  const { bottomBarData } = useSelector(state => state.quotation)
  const { fetched } = useSelector(state => state.quotationOtherFees)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [feeList, setFeeList] = useState([])
  const [messageErrors, setMessageErrors] = useState([])
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(true)
  const [isChangingNoteList, setIsChangingNoteList] = useState(false);
  const [grandTotalAmount, setGrandTotalAmount] = useState('')

  //get totalAmount with 2 decimals
  const totalOtherFees = useMemo(() => {
    const total = feeList.reduce((total, item) => {
      if (item.type === QUOTATION.OTHER_FEES_ACTION.INCLUDE.value) {
        const amountValue = typeof item.amount === 'string' ? parseLocaleStringToNumber(item.amount) : item.amount;
        const amountNumber = +amountValue
        const amount = amountNumber || 0
        return total += +amount
      }
      return total += 0
    }, 0)
    return total
  }, [feeList])

  const onSuccess = () => {
    setIsDisableSubmit(false)
    setIsChangingNoteList(false)
    resetAction()
  }

  const onError = () => {
    setIsDisableSubmit(false)
    resetAction()
  }

  useEffect(() => {
    if (id && !fetched) {
      dispatch(actions.getQuotationOtherFees({ quotation_id: +id }))
    }
  }, [id, fetched])

  useEffect(() => {
    setFeeList(otherFeesList?.map(item => ({
      ...item,
      amount: formatPriceWithTwoDecimals(+item.amount).toString()
    })))
  }, [otherFeesList])

  useEffect(() => {
    if (otherFeesList.length > 0 && feeList.length > 0 && isSimilarObject(otherFeesList, feeList)) {
      setIsChangingNoteList(false)
    }
  }, [otherFeesList, feeList])

  useEffect(() => {
    if (selectedAction === QUOTATION.SAVE_AS_DRAFT && viewTab === QUOTATION.TAB_LABEL.OTHER_FEES) {
      handleFeeChange()
    }
  }, [selectedAction, viewTab])

  useEffect(() => {
    setIsDisableSubmit(false)
    setMessageErrors([])
  }, [isInputChanged])

  useEffect(() => {
    bottomBarData.grandTotal && setGrandTotalAmount(bottomBarData.grandTotal)
  }, [bottomBarData])

  useEffect(() => {
    if (totalOtherFees) {
      const newValue = bottomBarData.totalBeforeGST - bottomBarData.otherFees + totalOtherFees - bottomBarData.discountAmount;
      setGrandTotalAmount(roundToTwoDecimals(newValue))
    }
  }, [bottomBarData, totalOtherFees])

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleInputChange = (e, feeId) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      setFeeList(feeList.map(fee =>
        fee.id === feeId ? {
          ...fee,
          description: e.target.value,
        } : fee
      ))
      setIsInputChanged(!isInputChanged);
      setIsChangingNoteList(true)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  };

  const handleAmountChange = (value, feeId, field) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      setFeeList(feeList.map(fee =>
        fee.id === feeId ? { ...fee, amount: value } : fee
      ))
      setIsInputChanged(!isInputChanged);
      setIsChangingNoteList(true)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  };

  const handleClickOutAmount = (e, feeId, field) => {
    if (!isEditable) return;
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;
    const formatted = formatPriceWithTwoDecimals(value)

    setFeeList(feeList.map(fee =>
      fee.id === feeId ? { ...fee, amount: formatted } : fee
    ))
  };

  const handleOnKeydown = (e, feeId) => {
    if (!isEditable) return;
    const value = e.target.value
    if (value?.length === 0) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setFeeList(feeList.map(fee =>
        fee.id === feeId ? { ...fee, description: value } : fee
      ))
      setIsInputChanged(!isInputChanged)
      setIsChangingNoteList(true)
    }
  }

  const handleChangeType = (feeId, value) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      const tempNotes = feeList.map(fee =>
        fee.id === feeId ? { ...fee, type: value } : fee
      )
      setFeeList(tempNotes)
      setIsInputChanged(!isInputChanged)
      setIsChangingNoteList(true)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDeleteNote = useCallback((feeId) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (feeId) {
        setFeeList(feeList.filter(fee => fee.id !== feeId))
        setIsInputChanged(!isInputChanged);
        setIsChangingNoteList(true);
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }, [isInputChanged, feeList, isEditable, isEditAllowed]);

  const handleAddNewNote = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (id) {
        const nextNumber = feeList.length + 1;
        const tempId = `new-${nextNumber}`
        const newItem = {
          id: tempId,
          description: '',
          quotation_id: +id,
          amount: '',
          order_number: nextNumber,
          type: QUOTATION.DEFAULT_NOTE_TYPE,
        }
        setFeeList([...feeList, newItem])
        setIsInputChanged(!isInputChanged);
        setIsChangingNoteList(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDragAndDropOtherFees = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      const updatedOtherFeesListOrder = [...feeList].map((fee, index) => ({
        other_fee_id: fee.id,
        order_number: index + 1
      }));
      dispatch(actions.handleDragAndDropOtherFees({
        other_fees: updatedOtherFeesListOrder,
        onSuccess,
        onError,
      }));
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleFeeChange = () => {
    if (isEditAllowed) {
      if (isDisableSubmit || !id || !isEditable) return;
      if (isChangingNoteList) {
        const formatFeesList = feeList.map(item => {
          const newData = { ...item }
          delete newData.created_at
          newData.amount = parseLocaleStringToNumber(newData.amount)
          return newData
        })
        const newItems = formatFeesList
          .filter(fee => otherFeesList.every(oldItem => oldItem.id !== fee.id));
        const deletedIds = otherFeesList
          .filter(oldItem => !formatFeesList.find(fee => +fee.id === +oldItem.id))
          .map(item => item.id);
        const updatedItems = formatFeesList.filter(fee => {
          const initialNote = otherFeesList.find(initialNote => initialNote.id === fee.id);
          return (
            initialNote && !isSimilarObject(initialNote, fee)
          );
        });
        const totalFees = formatFeesList.filter(fee => fee.type === QUOTATION.FEE_INCLUDE).reduce((total, fee) => total + parseFloat(fee.amount), 0);
        const data = {
          quotation_id: +id,
          grand_total: +grandTotalAmount,
          create: newItems,
          delete: deletedIds,
          update: updatedItems,
          totalFees: totalFees,
        };
        const errors = validateHandleNoteChange(data);
        if (errors.length > 0) {
          setMessageErrors(errors);
          resetAction()
        } else {
          dispatch(actions.handleQuotationOtherFees({
            ...data,
            create: newItems.map(({ id, ...rest }) => rest),
            onSuccess,
            onError
          }));
          setMessageErrors([]);
          setIsDisableSubmit(true);
        }
      } else {
        resetAction()
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          description: MESSAGE.ERROR.INFO_NO_CHANGE,
        }))
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  };

  const moveNote = (fromIndex, toIndex) => {
    if (!isEditable) return;
    const updatedNoteList = [...feeList];
    const [removedNote] = updatedNoteList.splice(fromIndex, 1);
    updatedNoteList.splice(toIndex, 0, removedNote);
    setFeeList(updatedNoteList);
    setIsInputChanged(!isInputChanged);
  };

  const renderOtherFees = () => {
    return feeList.map((fee, index) => {
      const type = Object.values(QUOTATION.OTHER_FEES_ACTION).find(item => item.value === fee.type);
      const error = messageErrors.find(message => message.id === fee.id)?.message;
      return (
        <NoteDragItem
          note={fee}
          index={index}
          key={fee.id}
          moveNote={moveNote}
          handleInputChange={handleInputChange}
          handleAmountChange={handleAmountChange}
          handleClickOutAmount={handleClickOutAmount}
          handleDeleteNote={handleDeleteNote}
          handleChangeType={handleChangeType}
          handleOnKeydown={handleOnKeydown}
          error={error}
          noteType={type}
          hasAmount
          noteList={feeList}
          actionList={Object.values(QUOTATION.OTHER_FEES_ACTION)}
          isChangingNoteList={isChangingNoteList}
          handleDragAndDropNote={handleDragAndDropOtherFees}
          isEditable={isEditable}
        />
      )
    })
  };

  return (
    <div className="quotationNote quotationNote--otherFees">
      <div className="quotationNote__table quotationNote__table--otherFees">
        <div className='quotationNote__divider'></div>
        <table className="quotationNoteTable quotationNoteTable--otherFees">
          <thead>
            <tr>
              <th className="quotationNoteTable__th ">
                <div className="quotationNoteTable__th--description">
                  DESCRIPTION
                </div>
              </th>
              <th className="quotationNoteTable__th quotationNoteTable__th--type">
                <div className="quotationNoteTable__th--type">TYPE</div>
              </th>
              <th className="quotationNoteTable__th quotationNoteTable__th--type">
                <div className="quotationNoteTable__th--type">AMOUNT</div>
              </th>
              <th className="quotationNoteTable__th quotationNoteTable__th--actions">
                <div className="quotationNoteTable__th--actions">ACTIONS</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {renderOtherFees()}
            <tr>
              <td>TOTAL SUM</td>
              <td></td>
              <td>
                <b>$ {formatPriceWithTwoDecimals(+totalOtherFees)}</b>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div
          className="quotationNote__button"
          onClick={handleAddNewNote}
        >
          + Add Fees
        </div>
      </div>
      <QuotationBottom
        isEditable={isEditable}
      />
    </div>
  );
}

export default QuotationOtherFees
