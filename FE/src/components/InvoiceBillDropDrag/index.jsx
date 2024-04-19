import React, { useMemo, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useDispatch, useSelector } from 'react-redux';

import { alertActions } from 'src/slices/alert';
import { validatePermission } from 'src/helper/validation';
import { ALERT, A_HUNDRED_PERCENT, MESSAGE, PERMISSION } from 'src/constants/config';
import { formatPriceWithTwoDecimals, parseLocaleStringToNumber } from 'src/helper/helper';

import PriceInputForm from '../InputForm/PriceInputForm';

const InvoiceBillDropDrag = ({
  bill = {},
  deletedIds = [],
  invoiceBills = [],
  messageErrors = [],
  isChangingBillList = false,
  index,
  moveBill,
  setDeletedIds,
  setInvoiceBills,
  setMessageErrors,
  handleDragAndDrop,
  grandTotalFromQuotation = 0,
}) => {
  const dispatch = useDispatch();
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [isHoveredOnMoveIcon, setIsHoveredOnMoveIcon] = useState(false);
  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false);

  const error = messageErrors.find(message => message.index === index) || {};

  const [{ isDragging }, drag] = useDrag({
    type: isHoveredOnMoveIcon ? 'NOTE' : '',
    item: { id: bill.id, index },
  });
  const [, drop] = useDrop({
    accept: 'NOTE',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        if (isChangingBillList) {
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Action Failed',
            description: MESSAGE.ERROR.UN_SAVE_CHANGED
          }));
        } else {
          moveBill(draggedItem.index, index);
          draggedItem.index = index;
        }
      }
    },
    drop: () => {
      if (!isChangingBillList) {
        handleDragAndDrop(index);
      }
    }
  });

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleSetInvoiceBillValue = (key, value) => {
    if (isEditAllowed) {
      setInvoiceBills(invoiceBills.map((item, billIndex) => index === billIndex ? {
        ...item,
        [key]: value
      } : item
      ))
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }
  const handleSetInvoiceBillPercentValue = (value) => {
    const totalAmountWithoutThisValue = invoiceBills.reduce((total, bill, billIndex) => {
      if (billIndex !== index) {
        const amountValue = typeof bill.amount === 'string' ? parseLocaleStringToNumber(bill.amount) : bill.amount;
        const amountNumber = +amountValue;
        const amount = amountNumber || 0;
        return total + amount;
      }
      return total;
    }, 0);

    const newTotalAmount = totalAmountWithoutThisValue + (grandTotalFromQuotation * (value / 100))
    if (newTotalAmount.toFixed(2) > grandTotalFromQuotation) {
      setMessageErrors([...messageErrors, {
        index,
        percent: 'Total percentage must be less than 100%.'
      }])
      return;
    }
    if (!isNaN(value) && value <= A_HUNDRED_PERCENT) {
      setInvoiceBills(invoiceBills.map((item, billIndex) => index === billIndex ? {
        ...item,
        type_percentage: value,
        amount: grandTotalFromQuotation * (value / 100)
      } : item))
    }
  }

  const handleAmountChange = (value, billIndex, field) => {
    setInvoiceBills(invoiceBills.map((item, index) =>
      index === billIndex && !item.type_percentage
        ? { ...item, amount: value }
        : item
    ))
  };

  const handleClickOutAmount = (e, billIndex, field) => {
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;

    setInvoiceBills(invoiceBills.map((item, index) =>
      index === billIndex ? {
        ...item,
        amount: formatPriceWithTwoDecimals(value)
      } : item
    ))
  };

  const handleDeleteBill = (id, index) => {
    if (isEditAllowed) {
      if (!id) {
        setInvoiceBills(invoiceBills.filter((_, billIndex) => billIndex !== index))
        return
      }
      setDeletedIds([...deletedIds, id])
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  return (
    <tr
      key={index}
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.6 : 1 }}
      onMouseEnter={() => setIsShowMoveIcon(true)}
      onMouseLeave={() => setIsShowMoveIcon(false)}
    >
      <td className="invoiceSection__tableTd">
        {(isShowMoveIcon && isEditAllowed) &&
          <div className="invoiceSection__move"
            onMouseEnter={() => setIsHoveredOnMoveIcon(true)}
            onMouseLeave={() => setIsHoveredOnMoveIcon(false)}
          >
            <img src="/icons/move-icon.svg" alt="move icon" />
          </div>
        }
        <textarea
          type="text"
          value={bill.type_invoice_statement}
          placeholder="Type invoice statement"
          onChange={({ target }) => handleSetInvoiceBillValue('type_invoice_statement', target.value)}
          readOnly={!isEditAllowed}
        />
        {error?.message &&
          <p className="invoiceSection__error">{error?.message}</p>
        }
        {error?.percent &&
          <p className="invoiceSection__error">{error.percent}</p>
        }
      </td>
      <td className="invoiceSection__tableTd">
        <input
          type="text"
          value={bill.type_percentage || ''}
          placeholder="Type percentage"
          onChange={({ target }) => handleSetInvoiceBillPercentValue(target.value)}
          readOnly={!isEditAllowed}
        />
      </td>
      <td className="invoiceSection__tableTd">
        <div className="invoiceSection__amountWrapper">
          <p>$</p>
          <PriceInputForm
            keyValue={index}
            inputValue={bill.amount}
            placeholderTitle="Type amount"
            handleAmountChange={handleAmountChange}
            handleClickOutAmount={handleClickOutAmount}
            isDisabled={!isEditAllowed}
          />
        </div>
      </td>
      <td className="invoiceSection__tableTd">
        <img
          src="/icons/x-mark.svg"
          alt="close mark"
          onClick={() => handleDeleteBill(bill.id, index)}
        />
      </td>
    </tr>
  )
}
export default InvoiceBillDropDrag
