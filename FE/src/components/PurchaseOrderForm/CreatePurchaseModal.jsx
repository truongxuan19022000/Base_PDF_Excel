import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

import DateForm from '../InputForm/DateForm';

import { validateCreatePurchaseOrder } from 'src/helper/validation';
import { usePurchaseSlice } from 'src/slices/purchase';

const CreatePurchaseOrder = ({
  id,
  closeModal,
}) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { actions } = usePurchaseSlice()

  const [issueDate, setIssueDate] = useState('');
  const [messageError, setMessageError] = useState({});
  const [purchaseOrderNo, setPurchaseOrderNo] = useState('');
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  const onSuccess = (purchaseId) => {
    setMessageError({})
    closeModal()
    setTimeout(() => {
      history.push(`/inventory/vendors/${id}/purchase-order/${purchaseId}?tab=purchase-order`)
    }, 1000);
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  }

  const handleInputChange = (field, value) => {
    if (isDisableSubmit) return;
    const fieldSetters = {
      issue_date: setIssueDate,
      purchase_order_no: setPurchaseOrderNo,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setMessageError({})
    }
  }

  const handleClickCreate = () => {
    if (isDisableSubmit || !id) return;
    const data = {
      vendor_id: +id,
      purchase_order_no: purchaseOrderNo,
      issue_date: issueDate && dayjs(issueDate).format('YYYY/MM/DD'),
    }
    const errors = validateCreatePurchaseOrder(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createPurchase({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  return (
    <div className="createPurchase">
      <div className="createPurchase__content">
        <div className="createPurchase__title">New Purchase Order</div>
        <div className="createPurchase__group">
          <div>
            <label>PURCHASE ORDER NO.</label>
            <div className={`createPurchase__inputBox${messageError?.purchase_order_no ? ' createPurchase__inputBox--error' : ''}`}>
              <input
                type="text"
                placeholder="PURCHASE ORDER NO."
                value={purchaseOrderNo || ''}
                className="createPurchase__input"
                onChange={(e) => handleInputChange('purchase_order_no', e.target.value)}
              />
            </div>
            {messageError?.purchase_order_no &&
              <div className="createPurchase__message">{messageError.purchase_order_no}</div>
            }
          </div>
          <div>
            <label>ISSUE DATE</label>
            <div className={`createPurchase__inputBox${messageError?.issue_date ? ' createPurchase__inputBox--error' : ''} `}>
              <DateForm
                dateValue={issueDate}
                setDateValue={setIssueDate}
                isDisableSubmit={isDisableSubmit}
                resetError={() => setMessageError({})}
              />
            </div>
            {messageError?.issue_date && (
              <div className="createPurchase__message">{messageError.issue_date || ''}</div>
            )}
          </div>
        </div>
        <div className="createPurchase__buttons">
          <button
            className="createPurchase__button"
            onClick={closeModal}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="createPurchase__button createPurchase__button--apply"
            onClick={handleClickCreate}
            disabled={isDisableSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePurchaseOrder
