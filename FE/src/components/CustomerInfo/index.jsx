import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { useCustomerSlice } from 'src/slices/customer'
import { formatPhoneNumber } from 'src/helper/helper'

import EditSvg from '../Icons/EditSvg'
import TrashSvg from '../Icons/TrashSvg'
import ActivityLogs from '../ActivityLogs'
import WhatsAppSvg from '../Icons/WhatsAppSvg'
import CustomerInfoModal from '../CustomerInfoModal'
import ConfirmDeleteModal from '../ConfirmDeleteModal'

const CustomerInfo = ({
  id = null,
  customerDetail = {},
  haveWhatsApp = false,
}) => {
  const { actions } = useCustomerSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowCustomerInfoModal, setIsShowCustomerInfoModal] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)

  const onSuccess = () => {
    setIsDisableSubmit(false)
    history.push('/customers')
  }

  const onError = () => {
    setIsDisableSubmit(false)
  }

  const postalCode = customerDetail?.customer?.postal_code || '';
  const address_1 = customerDetail?.customer?.address?.address_1 || '';
  const address_2 = customerDetail?.customer?.address?.address_2 || '';
  const phoneCode = customerDetail?.customer?.phone_number?.toString()?.slice(0, 3) || '';
  const phoneNumber = formatPhoneNumber(customerDetail?.customer?.phone_number?.toString()?.slice(3));

  const handleDelete = (deleteId) => {
    if (isDisableSubmit || !deleteId) return;

    if (deleteId) {
      dispatch(actions.multiDeleteCustomer({ customer_id: [deleteId], onSuccess, onError }));
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
    }
  }

  const goToChatPage = () => {
    if (id) {
      history.push(`/customers/chats/${id}`)
    }
  }

  return (
    <div className="customerInfo">
      <div className="customerInfo__left">
        <div className="customerInfo__headline">
          <div className="customerInfo__label">CUSTOMER INFORMATION</div>
          <div className="customerInfo__actions">
            {haveWhatsApp && (
              <div
                className={`customerInfo__button${haveWhatsApp ? ' customerInfo__button--highlight' : ''}`}
                onClick={goToChatPage}
              >
                <span className="customerInfo__button--icon customerInfo__button--whatsApp">
                  <WhatsAppSvg />
                </span>
                <span>WhatsApp Customer</span>
              </div>
            )}
            <div
              className={`customerInfo__button${haveWhatsApp ? '' : ' customerInfo__button--highlight'}`}
              onClick={() => setIsShowCustomerInfoModal(!isShowCustomerInfoModal)}
            >
              <span className={`customerInfo__button--icon${haveWhatsApp ? '' : ' customerInfo__button--edit'}`}>
                <EditSvg />
              </span>
              <span>Update Information</span>
            </div>
            <div
              className="customerInfo__button"
              onClick={() => setIsShowConfirmDeleteModal(!isShowConfirmDeleteModal)}
            >
              <span className="customerInfo__button--icon">
                <TrashSvg />
              </span>
              <span>Delete Customer</span>
            </div>
          </div>
        </div>
        <div className="customerInfo__content">
          <div className="customerInfo__box">
            <div className="customerInfo__title">Name</div>
            <div className="customerInfo__detail">{customerDetail.customer?.name || ''}</div>
          </div>
          <div className="customerInfo__box">
            <div className="customerInfo__title">Company</div>
            <div className="customerInfo__detail">{customerDetail.customer?.company_name || ''}</div>
          </div>
          <div className="customerInfo__box">
            <div className="customerInfo__title">Phone</div>
            <div className="customerInfo__detail">
              {phoneCode ? `(${phoneCode})` : ''} {' ' + phoneNumber || ''}
            </div>
          </div>
          <div className="customerInfo__box">
            <div className="customerInfo__title">Email</div>
            <div className="customerInfo__detail">{customerDetail.customer?.email || ''}</div>
          </div>
          <div className="customerInfo__box">
            <div className="customerInfo__title">Address</div>
            <div className="customerInfo__address">
              {address_1 || ''}<br /><br />
              {address_2 || ''}<br /><br />
              {postalCode || ''}
            </div>
          </div>
        </div>
      </div>
      <div className="customerInfo__right">
        <ActivityLogs
          logsData={customerDetail.activities || []}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="customer"
          isShow={isShowConfirmDeleteModal}
          onClickDelete={() => handleDelete(Number(id))}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      )}
      {isShowCustomerInfoModal && (
        <CustomerInfoModal
          customerId={+id}
          customerDetail={customerDetail.customer || null}
          closeModal={() => setIsShowCustomerInfoModal(false)}
        />
      )}
    </div>
  )
}

export default CustomerInfo
