import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useCustomerSlice } from 'src/slices/customer'
import { validateCreateCustomer, validatePermission } from 'src/helper/validation'
import { ACTIVITY, ALERT, MESSAGE, PERMISSION, PHONE_CODE } from 'src/constants/config'
import { formatPhoneNumber, isEmptyObject, isSimilarObject } from 'src/helper/helper'

import CustomerForm from '../CustomerForm'
import LazyLoadActivityLogs from '../ActivityLogsForm/LazyLoadLogs'

const CustomerDetailTab = ({
  id,
  detailInfo = {},
  isClickSave = false,
  setIsClickSave,
}) => {
  const dispatch = useDispatch()
  const { actions } = useCustomerSlice()

  const currentUser = useSelector(state => state.user.user)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CUSTOMER, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageError, setMessageError] = useState('');
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [phoneCode, setPhoneCode] = useState(PHONE_CODE.SINGAPORE);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [originalInfo, setOriginalInfo] = useState({});

  const onSuccess = () => {
    setIsDisableSubmit(false)
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!isEmptyObject(detailInfo)) {
      const { address } = detailInfo;
      const initialInfo = {
        name: detailInfo.name,
        email: detailInfo.email,
        postal_code: detailInfo.postal_code,
        company_name: detailInfo.company_name,
        phone_number: detailInfo.phone_number,
        address_1: address?.address_1,
        address_2: address?.address_2,
        created_at: detailInfo?.created_at,
        customer_id: +detailInfo.id,
      }
      setOriginalInfo(initialInfo)
      const phoneCode = detailInfo.phone_number?.toString()?.slice(0, 3) || '';
      const phoneNumber = formatPhoneNumber(detailInfo.phone_number?.toString()?.slice(3));
      setPhoneCode(phoneCode)
      setPhoneNumber(phoneNumber)
      setName(detailInfo.name)
      setEmail(detailInfo.email)
      setCompany(detailInfo.company_name)
      setPostalCode(detailInfo.postal_code)
      setAddress1(address?.address_1)
      setAddress2(address?.address_2)
    }
  }, [detailInfo, id])

  useEffect(() => {
    setIsDisableSubmit(false)
    setMessageError({})
  }, [isInputChanged])

  useEffect(() => {
    if (isClickSave) {
      handleSaveInfoChange()
      setIsClickSave(false)
    }
  }, [isClickSave])

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

  const handleSaveInfoChange = () => {
    if (isDisableSubmit || !id) return;
    const foundPhoneCode = !isEmptyObject(phoneCode) ? phoneCode.label : PHONE_CODE.SINGAPORE;
    const trimmedPhoneNumber = phoneNumber?.startsWith('0') ? phoneNumber?.substring(1) : phoneNumber;
    const phoneNumberFormatted = (foundPhoneCode + trimmedPhoneNumber)
    const data = {
      name: name,
      email: email,
      address_1: address1,
      address_2: address2,
      customer_id: +id,
      postal_code: postalCode,
      company_name: company,
      phone_number: phoneNumberFormatted?.replace(/\s/g, ''),
      created_at: detailInfo?.created_at || '',
    }
    const errors = validateCreateCustomer(data)
    if (isSimilarObject(originalInfo, data)) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        isHovered: false,
        description: MESSAGE.ERROR.INFO_NO_CHANGE,
      }))
    } else {
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(actions.updateCustomer({
          ...data,
          logsInfo: {
            type: ACTIVITY.LOGS.TYPE_VALUE.CUSTOMER,
            action_type: ACTIVITY.LOGS.ACTION_VALUE.UPDATE,
            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            username: currentUser?.username,
          },
          onSuccess, onError
        }))
        setIsDisableSubmit(true);
      }
    }
  }

  return (
    <div className="csDetailTab">
      <div className={`csDetailTab__left${isEditAllowed ? '' : ' csDetailTab__left--disabled'}`}>
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
          isDetailPage={true}
        />
      </div>
      <div className="csDetailTab__right">
        <LazyLoadActivityLogs
          logsNameList={ACTIVITY.LOGS.LABEL_CUSTOMER}
          actionNameList={ACTIVITY.LOGS.ACTION_CUSTOMER}
        />
      </div>
    </div>
  )
}

export default CustomerDetailTab
