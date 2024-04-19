import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import HeadlineBar from 'src/components/HeadlineBar'
import CustomerForm from 'src/components/CustomerForm'

import { COUNTRY_CODE, PHONE_CODE } from 'src/constants/config'
import { useCustomerSlice } from 'src/slices/customer'
import { validateCreateCustomer } from 'src/helper/validation'
import { formatPhoneNumber, isEmptyObject } from 'src/helper/helper'

const CreateCustomer = () => {
  const { actions } = useCustomerSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [messageError, setMessageError] = useState('')
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [phoneCode, setPhoneCode] = useState(COUNTRY_CODE[1].label)

  const onSuccess = () => {
    history.push('/customers')
  }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      name: setName,
      email: setEmail,
      address_1: setAddress1,
      address_2: setAddress2,
      phone_code: setPhoneCode,
      company_name: setCompany,
      postal_code: setPostalCode,
      phone_number: setPhoneNumber,
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
  const handleCreate = () => {
    const isErrorExist = !!(messageError?.length > 0)
    if (isErrorExist || isDisableSubmit) return;
    const phone = !isEmptyObject(phoneCode) ? phoneCode.label : PHONE_CODE.SINGAPORE;
    const trimmedPhoneNumber = phoneNumber?.startsWith('0') ? phoneNumber?.substring(1) : phoneNumber;
    const phoneNumberFormatted = (phone + trimmedPhoneNumber)
    const data = {
      name: name,
      email: email,
      address_1: address1,
      address_2: address2,
      postal_code: postalCode,
      company_name: company || '',
      phone_number: phoneNumberFormatted?.replace(/\s/g, ''),
    }

    const errors = validateCreateCustomer(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createCustomer({ ...data, onSuccess, onError }))
      setMessageError('')
      setIsDisableSubmit(true)
    }
  }

  return (
    <div className="createCustomer">
      <HeadlineBar
        buttonName="Create"
        onClick={handleCreate}
        headlineTitle="New Customer"
        isDisableSubmit={isDisableSubmit}
      />
      <CustomerForm
        name={name}
        email={email}
        company={company}
        address1={address1}
        address2={address2}
        phoneCode={phoneCode}
        postalCode={postalCode}
        phoneNumber={phoneNumber}
        messageError={messageError}
        setPhoneCode={setPhoneCode}
        isInputChanged={isInputChanged}
        setIsInputChanged={setIsInputChanged}
        handleInputChange={handleInputChange}
      />
    </div>
  )
}

export default CreateCustomer
