import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { ACTIONS, ACTIVITY, ALERT, COUNTRY_CODE, MESSAGE, PERMISSION, PHONE_CODE } from 'src/constants/config';
import { formatPhoneNumber, formatStringToDate, isEmptyObject, isSimilarObject } from 'src/helper/helper';
import { validateCreateVendor, validatePermission, validateUpdatePurchaseOrder, validateUpdateVendor } from 'src/helper/validation';
import { usePurchaseSlice } from 'src/slices/purchase';
import { useVendorSlice } from 'src/slices/vendor';
import { alertActions } from 'src/slices/alert';

import ActivityLogsForm from '../ActivityLogsForm';
import PhoneCodeForm from '../PhoneCodeForm';
import DateForm from '../InputForm/DateForm';

const CreateVendor = ({
  id,
  purchaseId,
  logsInfo = {},
  purchaseLogs = [],
  vendorInfo = {},
  isEditMode = false,
  isClickSave = false,
  isClickCreate = false,
  isPurchasedOrder = false,
  setIsClickSave,
  setIsClickCreate,
  setIsSubmitting,
  selectedAction = {},
  resetAction,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { actions } = useVendorSlice();
  const { actions: purchaseActions } = usePurchaseSlice();

  const currentUser = useSelector(state => state.user.user)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.VENDOR, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState(COUNTRY_CODE[1]);
  const [vendorName, setVendorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [originalInfo, setOriginalInfo] = useState({});
  const [messageError, setMessageError] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [isShowSelectList, setIsShowSelectList] = useState(false);

  const [issueDate, setIssueDate] = useState('');
  const [purchaseOrderNo, setPurchaseOrderNo] = useState('');

  const onSuccess = (payload) => {
    setMessageError({})
    setIsDisableSubmit(false);
    setIsSubmitting(false)
    setOriginalInfo(payload)
  }

  const onCreateSuccess = (newId) => {
    setMessageError({})
    setIsSubmitting(false)
    setIsDisableSubmit(false);
    setTimeout(() => {
      history.push(`/inventory/vendors/${newId}?tab=details`)
    }, 2000);
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsSubmitting(false)
    setIsDisableSubmit(false);
  }

  useEffect(() => {
    if (!isEmptyObject(vendorInfo)) {
      const { vendor } = vendorInfo;
      const { address, id, email, created_at: createdAt, ...restOfVendor } = vendor || {};
      const addressObject = typeof address === 'string'
        ? JSON.parse(address) : address;

      const initialInfo = {
        ...restOfVendor,
        email,
        vendor_id: +vendor?.id,
        address_1: addressObject?.address_1,
        address_2: addressObject?.address_2,
      }
      const phoneCode = vendor?.phone?.toString().slice(0, 3);
      const phoneNumber = formatPhoneNumber(vendor?.phone?.toString().slice(3));
      setEmail(email)
      setPhoneCode(phoneCode)
      setPhoneNumber(phoneNumber)
      setVendorName(vendor?.vendor_name)
      setPostalCode(vendor?.postal_code)
      setCompanyName(vendor?.company_name)
      setAddress1(addressObject?.address_1)
      setAddress2(addressObject?.address_2)
      setOriginalInfo(initialInfo)
      setIssueDate(formatStringToDate(vendorInfo?.issue_date))
      setPurchaseOrderNo(vendorInfo?.purchase_order_no)
    }
  }, [vendorInfo, id])

  useEffect(() => {
    if (isClickCreate) {
      setIsClickCreate(false)
      handleCreateVendor()
    }
  }, [isClickCreate])

  useEffect(() => {
    if (isClickSave) {
      setIsClickSave(false)
      handleClickSave()
    }
  }, [isClickSave])

  useEffect(() => {
    if (isPurchasedOrder && selectedAction?.value === ACTIONS.VALUE.SAVE_AS_DRAFT) {
      handleClickSave()
      resetAction()
      setIsClickSave(false)
    }
  }, [selectedAction, isPurchasedOrder])

  const handleKeyDownInputPhoneNumber = (e) => {
    if (e.key === 'e') {
      e.preventDefault();
    }
  };

  const handleInputChange = (field, value) => {
    if (isDisableSubmit) return
    const fieldSetters = {
      email: setEmail,
      address_1: setAddress1,
      address_2: setAddress2,
      vendor_name: setVendorName,
      postal_code: setPostalCode,
      phone_number: setPhoneNumber,
      company_name: setCompanyName,
      purchase_order_no: setPurchaseOrderNo,
    };
    const setter = fieldSetters[field];
    if (field === 'phone_number') {
      setter(formatPhoneNumber(value))
    } else {
      setter(value);
    }
    setMessageError({})
  }

  const handleSelectPhoneCode = (value) => {
    setPhoneCode(value)
    setMessageError({})
  }

  const handleCreateVendor = () => {
    if (isDisableSubmit) return;
    const foundPhoneCode = isEmptyObject(phoneCode) ? PHONE_CODE.SINGAPORE : phoneCode.label;
    const trimmedPhoneNumber = phoneNumber?.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
    const formattedPhoneNumber = foundPhoneCode + trimmedPhoneNumber;
    const data = {
      email: email,
      address_1: address1,
      address_2: address2,
      vendor_name: vendorName,
      postal_code: postalCode,
      company_name: companyName,
      phone: formattedPhoneNumber?.replace(/\s/g, ''),
    }
    const errors = validateCreateVendor(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createVendor({ ...data, onCreateSuccess, onError, onSuccess }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  const handleSaveChange = () => {
    if (isDisableSubmit || !id) return;
    const foundPhoneCode = isEmptyObject(phoneCode) ? PHONE_CODE.SINGAPORE : phoneCode.label;
    const trimmedPhoneNumber = phoneNumber?.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
    const formattedPhoneNumber = foundPhoneCode + trimmedPhoneNumber;
    const data = {
      email: email,
      address_1: address1,
      address_2: address2,
      vendor_name: vendorName,
      postal_code: postalCode,
      company_name: companyName,
      phone: formattedPhoneNumber?.replace(/\s/g, ''),
      vendor_id: +vendorInfo.vendor?.id,
      address: { address_1: address1, address_2: address2 },
      id: +id,
      logsInfo: {
        ...logsInfo,
        action_type: ACTIVITY.LOGS.ACTION_VALUE.UPDATE,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        username: currentUser?.username,
      },
    }
    if (isSimilarObject(data, originalInfo)) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.INFO_NO_CHANGE,
      }))
      setIsSubmitting(false)
    } else {
      const errors = validateUpdateVendor(data)
      if (Object.keys(errors).length > 0) {
        setMessageError(errors)
      } else {
        dispatch(actions.updateVendor({ ...data, onSuccess, onError }))
        setMessageError({})
        setIsDisableSubmit(true)
      }
    }
  }

  const handleSavePurchase = () => {
    if (isDisableSubmit || !purchaseId) return;
    const isInfoChanged = (purchaseOrderNo !== vendorInfo?.purchase_order_no ||
      dayjs(issueDate).format('YYYY-MM-DD') !== dayjs(formatStringToDate(vendorInfo?.issue_date)).format('YYYY-MM-DD'))
    if (isInfoChanged) {
      const data = {
        purchase_order_id: +purchaseId,
        purchase_order_no: purchaseOrderNo,
        issue_date: issueDate && dayjs(issueDate).format('YYYY/MM/DD'),
        logsInfo: {
          ...purchaseLogs[0],
          action_type: ACTIVITY.LOGS.ACTION_VALUE.UPDATE,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          username: currentUser?.username,
        },
      }
      const errors = validateUpdatePurchaseOrder(data)
      if (Object.keys(errors).length > 0) {
        setMessageError(errors)
      } else {
        dispatch(purchaseActions.updatePurchase({ ...data, onSuccess, onError }))
        setMessageError({})
        setIsDisableSubmit(true)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.INFO_NO_CHANGE,
      }))
    }
  }

  const handleClickSave = () => {
    isPurchasedOrder ? handleSavePurchase() : handleSaveChange()
  }

  return (
    <div className="createVendor">
      <div className={`createVendor__content${isEditMode ? '' : ' createVendor__content--create'}`}>
        {isPurchasedOrder &&
          <div className="createVendor__section">
            <div className="createVendor__formData">
              <label>Purchase Order No.</label>
              <input
                type="text"
                className={`createVendor__input${messageError?.purchase_order_no ? ' createVendor__input--error' : ''}`}
                onChange={(e) => handleInputChange('purchase_order_no', e.target.value)}
                name="purchase_order_no"
                placeholder="Purchase Order No."
                value={purchaseOrderNo || ''}
                autoFocus={!isEditMode}
              />
              {messageError?.purchase_order_no &&
                <p className="createVendor__error">
                  {messageError.purchase_order_no}
                </p>
              }
            </div>
            <div className="createVendor__formData">
              <label>Issue Date</label>
              <div className={`createVendor__input createVendor__input--date${messageError?.issue_date ? ' createVendor__input--error' : ''}`}>
                <DateForm
                  dateValue={issueDate}
                  setDateValue={setIssueDate}
                  isDisableSubmit={isDisableSubmit}
                  resetError={() => setMessageError({})}
                />
              </div>
              {messageError?.issue_date &&
                <p className="createVendor__error">
                  {messageError.issue_date}
                </p>
              }
            </div>
          </div>
        }
        <div className={`createVendor__section${isEditAllowed ? '' : ' createVendor__section--disabled'}`}>
          <div className="createVendor__formData">
            <label>Vendor Name</label>
            <input
              type="text"
              className={`createVendor__input${messageError?.vendor_name ? ' createVendor__input--error' : ''}`}
              onChange={(e) => handleInputChange('vendor_name', e.target.value)}
              name="vendor_name"
              placeholder="Vendor Name"
              value={vendorName || ''}
              autoFocus={!isEditMode}
              disabled={isPurchasedOrder}
            />
            {messageError?.vendor_name &&
              <p className="createVendor__error">
                {messageError.vendor_name}
              </p>
            }
          </div>
          <div className="createVendor__formData">
            <label>Company Name (optional)</label>
            <input
              type="text"
              className={`createVendor__input ${messageError?.company_name ? ' createVendor__input--error' : ''}`}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              name="company_name"
              placeholder="Company Name"
              value={companyName || ''}
              disabled={isPurchasedOrder}
            />
            {messageError?.company_name &&
              <p className="createVendor__error">
                {messageError.company_name}
              </p>
            }
          </div>
        </div>
        <div className={`createVendor__section${isEditAllowed ? '' : ' createVendor__section--disabled'}`}>
          <div className="createVendor__formData">
            <label>Phone</label>
            <div className={`createVendor__inputBox${isShowSelectList ? ' createVendor__inputBox--show' : ''}${messageError?.phone_number ? ' createVendor__inputBox--error' : ''}`}>
              <div className={`createVendor__phoneCode${isPurchasedOrder ? ' createVendor__phoneCode--disabled' : ''}`}>
                <PhoneCodeForm
                  className={!isEmptyObject(vendorInfo) ? 'detail' : 'create'}
                  phoneList={COUNTRY_CODE}
                  selectedItem={phoneCode}
                  setIsShow={setIsShowSelectList}
                  setSelectedItem={handleSelectPhoneCode}
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber || ''}
                className="createVendor__phoneNumber"
                onKeyDown={handleKeyDownInputPhoneNumber}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                disabled={isPurchasedOrder}
              />
            </div>
            {messageError?.phone && (
              <div className="createVendor__error">{messageError.phone}</div>
            )}
          </div>
          <div className="createVendor__formData">
            <label>Email</label>
            <input
              type="text"
              className={`createVendor__input ${messageError?.email ? ' createVendor__input--error' : ''}`}
              onChange={(e) => handleInputChange('email', e.target.value)}
              name="email"
              placeholder="Email"
              value={email || ''}
              disabled={isPurchasedOrder}
            />
            {messageError?.email &&
              <p className="createVendor__error">
                {messageError.email}
              </p>
            }
          </div>
        </div>
        <div className={`createVendor__section${isEditAllowed ? '' : ' createVendor__section--disabled'}`}>
          <div className={`createVendor__formData${isEditMode ? ' createVendor__formData--fullWidth' : ' createVendor__formData--create'}`}>
            <label>Address</label>
            <input
              type="text"
              className={`createVendor__input${messageError?.address_1 ? ' createVendor__input--error' : ''}`}
              onChange={(e) => handleInputChange('address_1', e.target.value)}
              name="address_1"
              placeholder="Address 1"
              value={address1 || ''}
              disabled={isPurchasedOrder}
            />
            {messageError?.address_1 &&
              <p className="createVendor__error">
                {messageError.address_1}
              </p>
            }
            <input
              type="text"
              className={`createVendor__input${messageError?.address_2 ? ' createVendor__input--error' : ''}`}
              onChange={(e) => handleInputChange('address_2', e.target.value)}
              name="address_2"
              placeholder="Address 2"
              value={address2 || ''}
              disabled={isPurchasedOrder}
            />
            {messageError?.address_2 &&
              <p className="createVendor__error">
                {messageError.address_2}
              </p>
            }
            <input
              type="text"
              className={`createVendor__input${messageError?.postal_code ? ' createVendor__input--error' : ''}`}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              name="postal_code"
              placeholder="Postal Code"
              value={postalCode || ''}
              disabled={isPurchasedOrder}
            />
            {messageError?.postal_code &&
              <p className="createVendor__error">
                {messageError.postal_code}
              </p>
            }
          </div>
        </div>
      </div>
      {isEditMode &&
        <div className="createVendor__activity">
          <ActivityLogsForm
            logsNameList={ACTIVITY.LOGS.LABEL}
            actionNameList={ACTIVITY.LOGS.ACTION}
            logsData={isPurchasedOrder ? purchaseLogs : vendorInfo.activities}
          />
        </div>
      }
    </div>
  )
}

export default CreateVendor
