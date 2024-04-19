import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import InvoiceBillDropDrag from '../InvoiceBillDropDrag'

import { formatPriceWithTwoDecimals, isSimilarObject, parseLocaleStringToNumber } from 'src/helper/helper'
import { MESSAGE, QUOTATION, INVOICE, ALERT, ACTIONS, PERMISSION } from 'src/constants/config'
import { validateHandleInvoiceBillChange, validatePermission } from 'src/helper/validation'
import { useInvoiceBillSlice } from 'src/slices/invoiceBill'
import { alertActions } from 'src/slices/alert'

const InvoiceSection = ({
  id,
  setSelectedAction,
  selectedAction = {},
  setIsShowGSTModal,
}) => {
  const dispatch = useDispatch()
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const { actions: invoiceBillActions } = useInvoiceBillSlice()

  const { invoiceBills, invoiceBillData } = useSelector(state => state.invoiceBill)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [isInfoChanged, setIsInfoChanged] = useState(false);
  const [messageErrors, setMessageErrors] = useState([])
  const [deletedIds, setDeletedIds] = useState([])
  const [bills, setBills] = useState([])

  const calculatePrices = useMemo(() => {
    const totalAmount = bills.reduce((total, item) => total += parseLocaleStringToNumber(item.amount), 0)
    const gstFee = (totalAmount * +invoiceBillData.tax / 100)
    const totalAmountAfterGST = totalAmount + gstFee
    return {
      totalAmount,
      totalAmountAfterGST,
      gstFee
    }
  }, [bills, invoiceBillData])

  useEffect(() => {
    dispatch(invoiceBillActions.getInvoiceBills({ id }))
  }, [id])

  useEffect(() => {
    setBills(prev => prev.filter(item => !deletedIds.includes(item.id)))
  }, [deletedIds])

  useEffect(() => {
    setBills(invoiceBills)
  }, [invoiceBills])

  useEffect(() => {
    setIsInfoChanged(!isSimilarObject(invoiceBills, bills))
  }, [invoiceBills, bills])

  useEffect(() => {
    if (params.get('tab') === INVOICE.ROUTE.DETAILS && Object.values(selectedAction).length > 0) {
      if (selectedAction.value === ACTIONS.VALUE.SAVE_AS_DRAFT) {
        handleQuotationBillChange();
      }
    }
  }, [selectedAction, params]);

  const handleAddInvoiceBill = () => {
    if (isEditAllowed) {
      const nextNumber = bills.length + 1;
      const newItem = {
        type_invoice_statement: '',
        type_percentage: 0,
        amount: '',
        order_number: nextNumber,
      }
      setBills([...bills, newItem])
      setMessageErrors([])
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const handleClickEditGST = () => {
    if (isEditAllowed) {
      setIsShowGSTModal(true)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const onSuccess = () => {
    setMessageErrors([])
    setIsDisableSubmit(false)
  }

  const onError = () => {
    setMessageErrors([])
    setIsDisableSubmit(false)
  }

  const moveBill = (fromIndex, toIndex) => {
    const updatedNoteList = [...bills];
    const [removedNote] = updatedNoteList.splice(fromIndex, 1);
    updatedNoteList.splice(toIndex, 0, removedNote);
    setBills(updatedNoteList);
  };

  const handleDragAndDrop = () => {
    if (isDisableSubmit) return;
    const updatedBillListOrder = [...bills].map((bill, index) => ({
      id: bill.id,
      order_number: index + 1
    }));
    dispatch(invoiceBillActions.handleDragAndDropBill({
      bill_schedules: updatedBillListOrder,
      bills: bills,
      onSuccess,
      onError,
    }));
    setIsDisableSubmit(true)
  }

  const handleQuotationBillChange = () => {
    setSelectedAction({})
    if (isInfoChanged) {
      const errors = validateHandleInvoiceBillChange(bills)
      if (errors.length > 0) {
        setMessageErrors(errors);
        return
      }
      const formatBillList = bills.map((item, index) => {
        const newData = { ...item }
        delete newData.created_at
        newData.amount = parseLocaleStringToNumber(newData.amount)
        newData.order_number = index + 1;
        return newData
      })

      const newItems = formatBillList
        .filter(bill => !bill.id);

      const updatedItems = formatBillList.filter(bill => {
        const initialNote = { ...invoiceBills.find(initialNote => initialNote.id === bill.id) };
        initialNote.amount = +initialNote.amount
        return (
          bill.id && !isSimilarObject(initialNote, bill)
        );
      });
      const totalFees = formatBillList.filter(bill => bill.type === QUOTATION.FEE_INCLUDE).reduce((total, bill) => total + parseFloat(bill.amount), 0);
      const data = {
        quotation_id: +id,
        create: newItems,
        delete: deletedIds,
        update: updatedItems,
        totalFees: totalFees,
      };

      dispatch(invoiceBillActions.handleBill({
        ...data,
        invoice_id: id,
        create: newItems.map(({ id, ...rest }) => rest),
        total_amount: parseLocaleStringToNumber(calculatePrices.totalAmount),
        onSuccess,
        onError
      }));
      setMessageErrors([]);
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.INFO_NO_CHANGE
      }));
    }
  };

  return (
    <div className="invoiceSection">
      <div className="invoiceSection__inner">
        <div className="invoiceSection__innerWrapper">
          <div className="invoiceSection__table">
            <div className="invoiceSection__divider"></div>
            <table >
              <thead>
                <tr>
                  <th className="invoiceSection__tableTh invoiceSection__tableTh--schedule">
                    SCHEDULE OF BILLS
                  </th>
                  <th className="invoiceSection__tableTh">
                    PERCENTAGE (%)
                  </th>
                  <th className="invoiceSection__tableTh">
                    AMOUNT
                  </th>
                  <th className="invoiceSection__tableTh">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {bills.map((item, index) => (
                  <InvoiceBillDropDrag
                    key={index}
                    bill={item}
                    index={index}
                    invoiceBills={bills}
                    deletedIds={deletedIds}
                    messageErrors={messageErrors}
                    totalAmount={+calculatePrices.totalAmount}
                    grandTotalFromQuotation={+invoiceBillData.grand_total_from_quotation}
                    moveBill={moveBill}
                    setInvoiceBills={setBills}
                    setDeletedIds={setDeletedIds}
                    setMessageErrors={setMessageErrors}
                    handleDragAndDrop={handleDragAndDrop}
                  />
                ))}
                <tr className="invoiceSection__lastTr">
                  <td colSpan={2} className="invoiceSection__tableTd">
                    TOTAL SUM
                  </td>
                  <td className="invoiceSection__tableTd">
                    $ {formatPriceWithTwoDecimals(calculatePrices.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="invoiceSection__buttonWrapper">
          <button
            className="invoiceSection__button"
            onClick={handleAddInvoiceBill}
          >
            + Add Statement
          </button>
        </div>
      </div>
      <div className="invoiceSection__footer">
        <div className="invoiceSection__footerDetail">
          <div className="invoiceSection__footerPriceGroup">
            <p className="invoiceSection__footerTitle">GRAND TOTAL FROM QUOTATION</p>
            <b className="invoiceSection__footerPrice">
              {formatPriceWithTwoDecimals(invoiceBillData.grand_total_from_quotation)}
            </b>
          </div>
          <div className="invoiceSection__footerGroup">
            <div className="invoiceSection__footerPriceGroup">
              <p className="invoiceSection__footerTitle">TOTAL (BEFORE GST)</p>
              <b className="invoiceSection__footerPrice">
                $ {formatPriceWithTwoDecimals(calculatePrices.totalAmount)}
              </b>
            </div>
            <div className="invoiceSection__footerPriceGroup">
              <p
                className="invoiceSection__footerTitle invoiceSection__footerTitle--pointer"
                onClick={handleClickEditGST}
              >
                GST ({invoiceBillData.tax}%)
                <span className="ml-1">
                  <img src="/icons/edit.svg" alt="edit" width="12" height="12" />
                </span>
              </p>
              <b className="invoiceSection__footerPrice">
                $ {formatPriceWithTwoDecimals(calculatePrices.gstFee)}
              </b>
            </div>
          </div>
        </div>
        <div className="invoiceSection__footerFinal">
          <p className="invoiceSection__footerTitle">TOTAL PAYABLE (INCLUSIVE GST)</p>
          <b className="invoiceSection__footerPrice invoiceSection__footerPrice--big">
            $ {formatPriceWithTwoDecimals(calculatePrices.totalAmountAfterGST)}
          </b>
        </div>
      </div>
    </div>
  )
}

export default InvoiceSection
