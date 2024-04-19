import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import ActivityLogsForm from '../ActivityLogsForm';
import CustomerInfoForm from '../CustomerInfoForm';

import { ACTIVITY, COUNTRY_CODE, DEFAULT_VALUE, PERMISSION, QUOTATION } from 'src/constants/config';
import { formatPhoneNumber, isEmptyObject } from 'src/helper/helper';
import { useCustomerSlice } from 'src/slices/customer';
import { validatePermission } from 'src/helper/validation';

const QuotationDetailTab = ({
  data = {},
  status = {},
  isEditable = false,
  messageError = {},
  handleChange,
  setSearchText,
  setIsInputChanged,
  setSelectedCustomer,
  setIsDisableSubmit,
  handleTypeSearchChange,
  setIsShowCreateNewCustomer,
}) => {
  const dispatch = useDispatch();
  const { actions: customerActions } = useCustomerSlice();

  const fetchedAll = useSelector(state => state.customer.fetchedAll)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState(COUNTRY_CODE[DEFAULT_VALUE].label);
  const [isShowInfoTooltip, setIsShowInfoTooltip] = useState(false);

  useEffect(() => {
    if (!fetchedAll) {
      dispatch(customerActions.getAllCustomerList())
    }
  }, [fetchedAll])

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      name: setName,
      email: setEmail,
      address_1: setAddress1,
      address_2: setAddress2,
      company_name: setCompany,
      phone_code: setPhoneCode,
      postal_code: setPostalCode,
      phone_number: setPhoneNumber,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!data.isInputChanged)
    }
  }

  useEffect(() => {
    if (!isEmptyObject(data.customerDetail)) {
      const detail = data.customerDetail
      const phoneCode = detail.phone_number?.toString()?.slice(0, 3) || '';
      const phoneNumber = formatPhoneNumber(detail.phone_number?.toString()?.slice(3));
      setPhoneCode(phoneCode)
      setPhoneNumber(phoneNumber)
      setName(detail.name)
      setEmail(detail.email)
      setCompany(detail.company_name)
      setPostalCode(detail.postal_code)
      setAddress1(detail.address?.address_1)
      setAddress2(detail.address?.address_2)
    } else {
      setName('')
      setEmail('')
      setCompany('')
      setAddress1('')
      setAddress2('')
      setPhoneCode('')
      setPostalCode('')
      setPhoneNumber('')
    }
  }, [data.customerDetail])

  const handleDateChangeRaw = (e) => {
    e.preventDefault();
  }

  return (
    <div className="quotationDetailTab">
      <div className={`quotationDetailTab__content${isEditAllowed ? '' : ' quotationDetailTab__content--disabled'}`}>
        <div className={`quotationDetailTab__section${isEditAllowed ? '' : ' quotationDetailTab__section--disabled'}`}>
          <div className={`quotationDetailTab__formData${isEditable ? '' : ' quotationDetailTab__formData--disabled'}`}>
            <label>Reference No.</label>
            <input
              type="text"
              className="quotationDetailTab__input"
              placeholder="Reference No."
              onChange={(e) => handleChange('reference', e.target.value)}
              name="reference_no"
              value={data.reference || ''}
            />
            {messageError?.reference_no &&
              <p className="quotationDetailTab__error">
                {messageError.reference_no || ''}
              </p>
            }
          </div>
          <div className="quotationDetailTab__formData">
            <label>Quotation Status</label>
            <input
              type="text"
              className="quotationDetailTab__input quotationDetailTab__input--disabled"
              placeholder="Quotation Status"
              name="quotation_status"
              value={status.label || ''}
              readOnly
            />
            {(status.value === QUOTATION.STATUS_VALUE.REJECTED && data.rejectedReason) &&
              <img
                onMouseEnter={() => setIsShowInfoTooltip(true)}
                onMouseLeave={() => setIsShowInfoTooltip(false)}
                src="/icons/info-icon.svg"
                alt="info"
                width="18"
                height="18"
              />
            }
            {(isShowInfoTooltip && data.rejectedReason) &&
              <div className="quotationDetailTab__infoBox">
                <div className="quotationDetailTab__innerBox">
                  <p>
                    {data.rejectedReason}
                  </p>
                </div>
                <div className="quotationDetailTab__shape"></div>
              </div>
            }
            {messageError?.status &&
              <p className="quotationDetailTab__error">
                {messageError.status || ''}
              </p>
            }
          </div>
        </div>
        <div className={`quotationDetailTab__customerGroup${isEditAllowed ? '' : ' quotationDetailTab__customerGroup--disabled'}`}>
          <CustomerInfoForm
            name={name}
            email={email}
            company={company}
            address1={address1}
            address2={address2}
            phoneCode={phoneCode}
            postalCode={postalCode}
            phoneNumber={phoneNumber}
            isEditable={isEditable}
            isDetail={data.id}
            searchText={data.searchText}
            isSearching={data.isSearching}
            searchResults={data.searchResults}
            selectedCustomer={data.selectedCustomer}
            isActiveInput={data.isShowCreateNewCustomer}
            isShowCreateNewCustomer={data.isShowCreateNewCustomer}
            messageError={messageError}
            setSearchText={setSearchText}
            setName={setName}
            setPhoneCode={setPhoneCode}
            handleInputChange={handleInputChange}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setSelectedCustomer={setSelectedCustomer}
            handleTypeSearchChange={handleTypeSearchChange}
            setIsShowCreateNewCustomer={setIsShowCreateNewCustomer}
          />
        </div>
        <div className={`quotationDetailTab__section${isEditAllowed ? '' : ' quotationDetailTab__section--disabled'}`}>
          <div className={`quotationDetailTab__formData${isEditable ? '' : ' quotationDetailTab__formData--disabled'}`}>
            <label>Issue Date</label>
            <DatePicker
              selected={data.issueDate || ''}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              onChangeRaw={handleDateChangeRaw}
              onSelect={(date) => handleChange('issue_date', date)}
              className="quotationDetailTab__input"
            />
            {messageError?.issue_date &&
              <p className="quotationDetailTab__error">
                {messageError.issue_date || ''}
              </p>
            }
          </div>
          <div className={`quotationDetailTab__formData${isEditable ? '' : ' quotationDetailTab__formData--disabled'}`}>
            <label>Valid Till</label>
            <DatePicker
              selected={data.validTillDate || ''}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              onChangeRaw={handleDateChangeRaw}
              onSelect={(date) => handleChange('valid_till', date)}
              className="quotationDetailTab__input"
            />
            {messageError?.valid_till &&
              <p className="quotationDetailTab__error">
                {messageError.valid_till || ''}
              </p>
            }
          </div>
        </div>
        <div className={`quotationDetailTab__section${isEditAllowed ? '' : ' quotationDetailTab__section--disabled'}`}>
          <div className={`quotationDetailTab__formData${isEditable ? '' : ' quotationDetailTab__formData--disabled'}`}>
            <label>Terms of Payment (Upon Confirmation)</label>
            <input
              type="number"
              className="quotationDetailTab__input"
              min="0"
              max="100"
              placeholder="0"
              onChange={(e) => handleChange('terms_of_payment_confirmation', e.target.value)}
              name="terms_of_payment_confirmation"
              value={data.paymentTermNumber || ''}
            />
            <div className="quotationDetailTab__input--unit">%</div>
            {messageError?.terms_of_payment_confirmation &&
              <div className="quotationDetailTab__error">
                {messageError?.terms_of_payment_confirmation || ''}
              </div>
            }
          </div>
          <div className="quotationDetailTab__formData">
            <label>Terms of Payment (Balance)</label>
            <input
              type="number"
              className="quotationDetailTab__input quotationDetailTab__input--disabled"
              min="0"
              max="100"
              placeholder="0"
              onChange={(e) => handleChange('payment_balance', e.target.value)}
              name="payment_balance"
              readOnly
              value={data.paymentTermBalance || ''}
            />
            <div className="quotationDetailTab__input--unit">%</div>
          </div>
        </div>
        <div className="quotationDetailTab__section quotationDetailTab__section--textarea">
          <div className={`quotationDetailTab__formData quotationDetailTab__formData--textArea${isEditable ? '' : ' quotationDetailTab__formData--disabled'}`}>
            <label>Project Description</label>
            <textarea
              className="quotationDetailTab__input quotationDetailTab__input--textArea"
              placeholder="Project Description"
              onChange={(e) => handleChange('description', e.target.value)}
              name="description"
              value={data.description || ''}
              readOnly={!isEditAllowed}
            />
            {messageError?.description &&
              <p className="quotationDetailTab__error">
                {messageError.description || ''}
              </p>
            }
          </div>
        </div>
        <div className="quotationDetailTab__section quotationDetailTab__section--textarea">
          <div className={`quotationDetailTab__formData quotationDetailTab__formData--textArea${isEditable ? '' : ' quotationDetailTab__formData--disabled'}`}>
            <label>Quotation Description</label>
            <textarea
              className="quotationDetailTab__input quotationDetailTab__input--textArea"
              placeholder="Project Description"
              onChange={(e) => handleChange('quotation_description', e.target.value)}
              name="Quotation Description"
              value={data.quotationDescription || ''}
              readOnly={!isEditAllowed}
            />
            {messageError?.quotation_description &&
              <p className="quotationDetailTab__error">
                {messageError.quotation_description}
              </p>
            }
          </div>
        </div>
      </div>
      <div className="quotationDetailTab__activity">
        <ActivityLogsForm
          logsNameList={ACTIVITY.LOGS.LABEL}
          actionNameList={ACTIVITY.LOGS.QUOTATION_ACTION}
          logsData={data.quotationDetail?.activities}
        />
      </div>
    </div>
  )
}

export default QuotationDetailTab
