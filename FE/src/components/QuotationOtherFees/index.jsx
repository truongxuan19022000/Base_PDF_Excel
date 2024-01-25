import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { formatPriceWithTwoDecimals, isSimilarObject, parseLocaleStringToNumber } from 'src/helper/helper';
import { MESSAGE, QUOTATION } from 'src/constants/config';
import { validateHandleNoteChange } from 'src/helper/validation';

import NoteDragItem from '../NoteDragItem';
import QuotationBottom from '../QuotationBottom';
import { useQuotationOtherFeesSlice } from 'src/slices/quotationOtherFees';
import { quotationActions } from 'src/slices/quotation';

const QuotationOtherFees = ({
  id,
  otherFeesList = [],
  setMessage,
  resetAction,
  selectedAction = '',
}) => {
  const { actions } = useQuotationOtherFeesSlice();
  const dispatch = useDispatch();
  const [feeList, setFeeList] = useState([])
  const [messageErrors, setMessageErrors] = useState([])
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(true)
  const [isChangingNoteList, setIsChangingNoteList] = useState(false);
  const { bottomBarData } = useSelector(state => state.quotation)
  //get totalAmount with 2 decimals
  const totalOtherFees = useMemo(() => {
    const total = feeList.reduce((total, item) => {
      if (item.type === QUOTATION.OTHER_FEES_ACTION.INCLUDE.value) {
        const amount = isNaN(formatPriceWithTwoDecimals(item.amount)) ? parseLocaleStringToNumber(item.amount) : +item.amount
        return total += amount
      }
      return total += 0
    }, 0)
    return total
  }, [feeList])

  useEffect(() => {
    dispatch(quotationActions.setTotalOtherFees(totalOtherFees))
    if (bottomBarData.discountType.id === QUOTATION.DISCOUNT_TYPE.PERCENT.id) {
      const estimatedCost = bottomBarData.quotationCost + totalOtherFees
      dispatch(quotationActions.setDiscountAmount((estimatedCost * bottomBarData.discountPercent) / 100))
    }
    // eslint-disable-next-line
  }, [totalOtherFees, bottomBarData, bottomBarData])

  const onSuccess = () => {
    setMessage({ success: MESSAGE.SUCCESS.CHANGE })
    setIsDisableSubmit(true)
    setIsChangingNoteList(false)
  }

  const onError = () => {
    setIsDisableSubmit(true)
    setMessage({ failed: MESSAGE.ERROR.DEFAULT })
  }

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
    if (selectedAction === 'draft') {
      handleFeeChange()
      resetAction()
    }
    // eslint-disable-next-line
  }, [selectedAction])

  useEffect(() => {
    setIsDisableSubmit(false)
    setMessageErrors([])
  }, [isInputChanged])

  const handleInputChange = (e, feeId) => {
    setFeeList(feeList.map(fee =>
      fee.id === feeId ? {
        ...fee,
        description: e.target.value,
      } : fee
    ))
    setIsInputChanged(!isInputChanged);
    setIsChangingNoteList(true)
  };
  const handleAmountChange = (e, feeId) => {
    const amount = parseLocaleStringToNumber(e.target.value)
    if (!isNaN(amount)) {
      if (e.target.value.split('.').length === 2) {
        setFeeList(feeList.map(fee =>
          fee.id === feeId ? { ...fee, amount: e.target.value } : fee
        ))
      } else {
        setFeeList(feeList.map(fee =>
          fee.id === feeId ? { ...fee, amount: amount.toString() } : fee
        ))
      }
    }
    setIsInputChanged(!isInputChanged);
    setIsChangingNoteList(true)
  };
  const handleClickOutAmount = (feeId) => {
    setFeeList(feeList.map(fee =>
      fee.id === feeId ? {
        ...fee,
        amount: formatPriceWithTwoDecimals(parseLocaleStringToNumber(fee.amount))
      } : fee
    ))
  };

  const handleOnKeydown = (e, feeId) => {
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
    const tempNotes = feeList.map(fee =>
      fee.id === feeId ? { ...fee, type: value } : fee
    )
    setFeeList(tempNotes)
    setIsInputChanged(!isInputChanged)
    setIsChangingNoteList(true)
  }

  const handleDeleteNote = useCallback((feeId) => {
    if (feeId) {
      setFeeList(feeList.filter(fee => fee.id !== feeId))
      setIsInputChanged(!isInputChanged);
      setIsChangingNoteList(true);
    }
    // eslint-disable-next-line
  }, [isInputChanged, feeList, otherFeesList]);

  const handleAddNewNote = () => {
    if (id) {
      const nextNumber = feeList.length + 1;
      const tempId = `new-${nextNumber}`
      const newItem = {
        id: tempId,
        description: '',
        quotation_id: +id,
        amount: '0.00',
        order_number: nextNumber,
        type: QUOTATION.DEFAULT_NOTE_TYPE,
      }
      setFeeList([...feeList, newItem])
      setIsInputChanged(!isInputChanged);
      setIsChangingNoteList(true)
    }
  }

  const handleDragAndDropOtherFees = () => {
    const updatedOtherFeesListOrder = [...feeList].map((fee, index) => ({
      other_fee_id: fee.id,
      order_number: index + 1
    }));
    dispatch(actions.handleDragAndDropOtherFees({
      other_fees: updatedOtherFeesListOrder,
      onSuccess,
      onError,
    }));
  }

  const handleFeeChange = () => {
    setMessage({})
    if (isDisableSubmit && !id) return;
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

    const data = {
      quotation_id: +id,
      create: newItems,
      delete: deletedIds,
      update: updatedItems
    };

    const errors = validateHandleNoteChange(data);
    if (errors.length > 0) {
      setMessageErrors(errors);
    } else {
      dispatch(actions.handleQuotationOtherFees({
        ...data,
        create: newItems.map(({ id, ...rest }) => rest),
        onSuccess,
        onError
      },
      ));
      setMessageErrors([]);
      setIsDisableSubmit(true);
    }
  };

  const moveNote = (fromIndex, toIndex) => {
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
          setMessage={setMessage}
          isChangingNoteList={isChangingNoteList}
          handleDragAndDropNote={handleDragAndDropOtherFees}
        />
      )
    })
  };

  return (
    <div className="quotationNote quotationNote--otherFees">
      <div className="quotationNote__table quotationNote__table--otherFees">
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
                <b>$ {formatPriceWithTwoDecimals(totalOtherFees)}</b>
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
      />
    </div>
  );
}

export default QuotationOtherFees
