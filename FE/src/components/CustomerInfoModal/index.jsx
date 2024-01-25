import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'

import { useCustomerSlice } from 'src/slices/customer'
import { validateCreateCustomer } from 'src/helper/validation'
import { COUNTRY_CODE, CUSTOMERS } from 'src/constants/config'
import { formatPhoneNumber, isEmptyObject, isSimilarObject } from 'src/helper/helper'

const CustomerInfoModal = ({ customerDetail, closeModal, customerId }) => {
  const { actions } = useCustomerSlice()

  const dispatch = useDispatch()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState(null)
  const [isErrorExist, setIsErrorExist] = useState(false)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const [isInfoChanged, setIsInfoChanged] = useState(false);
  const [originalCustomerData, setOriginalCustomerData] = useState({});
  const [changedCustomerData, setChangedCustomerData] = useState(originalCustomerData || {});

  const onSuccess = () => {
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!isEmptyObject(customerDetail)) {
      const initialData = {
        address_1: customerDetail?.address?.address_1,
        address_2: customerDetail?.address?.address_2,
        company_name: customerDetail?.company_name,
        email: customerDetail?.email,
        name: customerDetail?.name,
        phone_number: customerDetail?.phone_number,
        postal_code: customerDetail?.postal_code,
      }
      setName(customerDetail.name || '')
      setEmail(customerDetail.email || '')
      setCompany(customerDetail.company_name || '')
      setPostalCode(customerDetail.postal_code || '')
      setAddress1(customerDetail.address?.address_1 || '')
      setAddress2(customerDetail.address?.address_2 || '')
      setOriginalCustomerData(initialData)
      if (customerDetail?.phone_number) {
        const phone = customerDetail.phone_number?.toString()?.slice(3)
        const countryCode = customerDetail.phone_number?.toString()?.slice(0, 3)
        setPhoneNumber(formatPhoneNumber(phone))
        setPhoneCode(countryCode)
      } else {
        setPhoneNumber('')
        setPhoneCode('')
      }
    }
  }, [customerDetail])

  useEffect(() => {
    if (!isEmptyObject(customerDetail)) {
      const trimmedPhoneNumber = phoneNumber?.startsWith('0') ? phoneNumber?.substring(1) : phoneNumber;
      const phoneNumberFormatted = (phoneCode + trimmedPhoneNumber)
      const tempChangedData = {
        address_1: address1,
        address_2: address2,
        company_name: company,
        email: email,
        name: name,
        phone_number: phoneNumberFormatted,
        postal_code: postalCode,
      }
      setChangedCustomerData(tempChangedData)
    }
  }, [customerDetail, phoneNumber, phoneCode, address1, address2, company, email, name, postalCode])

  useEffect(() => {
    if (!isEmptyObject(originalCustomerData) && !isEmptyObject(changedCustomerData)) {
      setIsInfoChanged(!isSimilarObject(originalCustomerData, changedCustomerData))
    } else {
      setIsInfoChanged(false)
    }
  }, [originalCustomerData, changedCustomerData])

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    if (messageError?.length > 0) {
      setIsErrorExist(true)
    } else {
      setIsErrorExist(false)
    }
  }, [messageError])

  const handleInputChange = (field, value) => {
    if (submitting) return;
    const fieldSetters = {
      name: setName,
      email: setEmail,
      company: setCompany,
      address1: setAddress1,
      address2: setAddress2,
      phoneCode: setPhoneCode,
      postalCode: setPostalCode,
      phoneNumber: setPhoneNumber,
    };
    const setter = fieldSetters[field];
    if (setter) {
      if (field === 'phoneNumber') {
        setter(formatPhoneNumber(value))
      } else {
        setter(value);
      }
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleSaveChange = () => {
    if (isErrorExist || isDisableSubmit || !customerId || !isInfoChanged) return;
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const trimmedPhoneNumber = phoneNumber?.startsWith('0') ? phoneNumber?.substring(1) : phoneNumber;
    const phoneNumberFormatted = (phoneCode + trimmedPhoneNumber)
    const data = {
      name: name,
      email: email,
      address_1: address1,
      address_2: address2,
      customer_id: +customerId,
      postal_code: postalCode,
      status_updated_at: now,
      company_name: company,
      status: CUSTOMERS.STATUS.NEW.VALUE,
      phone_number: phoneNumberFormatted?.replace(/\s/g, ''),
      created_at: customerDetail?.created_at || '',
    }
    const errors = validateCreateCustomer(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.updateCustomer({ ...data, onSuccess, onError }))
      closeModal()
    }
  }

  return (
    <div className="customerInfoModal">
      <div className="customerInfoModal__content">
        <div className="customerInfoModal__header">Update Customer Information</div>
        <div className="customerInfoModal__body">
          <div className="box">
            <div className="box__title">Name</div>
            <input
              type="text"
              value={name || ''}
              className="box__input"
              placeholder="Customer Name"
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            {messageError?.name && (
              <div className="box__message">{messageError?.name}</div>
            )}
          </div>
          <div className="box">
            <div className="box__title">Company</div>
            <input
              type="text"
              value={company || ''}
              className="box__input"
              onChange={(e) => handleInputChange('company', e.target.value)}
            />
            {messageError?.company && (
              <div className="box__message">{messageError?.company}</div>
            )}
          </div>
          <div className="box">
            <div className="box__title">Phone</div>
            <div className={`box__phone${messageError?.phone_number ? ' box__phone--error' : ''}`}>
              <select
                value={phoneCode || ''}
                onChange={(e) => handleInputChange('phoneCode', e.target.value)}
              >
                {COUNTRY_CODE?.map((code, index) =>
                  code.value !== 0 &&
                  <option key={index} value={code.label}>{code.label}</option>
                )}
              </select>
              <div className="box__phone--divider"></div>
              <input
                className="box__phoneNumber"
                value={phoneNumber || ''}
                placeholder="Phone"
                type="text"
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </div>
            {messageError?.phone_number && (
              <div className="box__message box__message--phone">{messageError?.phone_number}</div>
            )}
          </div>
          <div className="box">
            <div className="box__title">Email</div>
            <input
              value={email || ''}
              type="text"
              className={`box__input${messageError?.email ? ' box__input--error' : ''}`}
              placeholder="Email"
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {messageError?.email && (
              <div className="box__message">{messageError?.email}</div>
            )}
          </div>
          <div className="box">
            <div className="box__title">Address</div>
            <input
              className={`box__input box__input--address${messageError?.address_1 ? ' box__input--error' : ''}`}
              placeholder="Address Line 1"
              value={address1 || ''}
              type="text"
              onChange={(e) => handleInputChange('address1', e.target.value)}
            />
            {messageError?.address_1 && (
              <div className="box__message">{messageError?.address_1}</div>
            )}
            <input
              className={`box__input box__input--address${messageError?.address_2 ? ' box__input--error' : ''}`}
              placeholder="Address Line 2"
              value={address2 || ''}
              type="text"
              onChange={(e) => handleInputChange('address2', e.target.value)}
            />
            {messageError?.address_2 && (
              <div className="box__message">{messageError?.address_2}</div>
            )}
            <input
              className={`box__input${messageError?.postal_code ? ' box__input--error' : ''}`}
              placeholder="Postal Code"
              value={postalCode || ''}
              type="text"
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
            />
            {messageError?.postal_code && (
              <div className="box__message">{messageError?.postal_code}</div>
            )}
          </div>
        </div>
        <div className="customerInfoModal__footer">
          <button
            onClick={closeModal}
            className="customerInfoModal__button customerInfoModal__button--cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChange}
            disabled={isDisableSubmit || submitting}
            className="customerInfoModal__button customerInfoModal__button--update"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerInfoModal
