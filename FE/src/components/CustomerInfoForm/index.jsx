import React from 'react'
import { useDispatch } from 'react-redux';

import { COUNTRY_CODE } from 'src/constants/config';
import { useCustomerSlice } from 'src/slices/customer';
import { useQuotationSlice } from 'src/slices/quotation';

import SelectCustomerForm from '../SelectCustomerForm';

const CustomerInfoForm = ({
  name = '',
  email = '',
  company = '',
  address1 = '',
  address2 = '',
  phoneCode = '',
  postalCode = '',
  searchText = '',
  phoneNumber = '',
  isDetail = false,
  isSearching = false,
  isActiveInput = false,
  isShowCreateNewCustomer = false,
  messageError = {},
  searchResults = [],
  selectedCustomer = {},
  setName,
  setSearchText,
  setIsInputChanged,
  setIsDisableSubmit,
  setSelectedCustomer,
  setIsShowCreateNewCustomer,
  handleInputChange,
  handleTypeSearchChange,
}) => {
  const { actions } = useQuotationSlice();
  const { actions: customerActions } = useCustomerSlice();

  const dispatch = useDispatch();

  const handleKeyDownInputPhoneNumber = (e) => {
    if (e.key === 'e') {
      e.preventDefault();
    }
  };

  const handleClickCreateNewCustomer = () => {
    setIsShowCreateNewCustomer(true)
    setSelectedCustomer({})
    dispatch(customerActions.clearCustomerDetail())
    dispatch(actions.clearCustomerQuotationDetail())
  }

  return (
    <>
      <div className="box">
        <div className="box__left">
          <div className="box__title">Name</div>
          <SelectCustomerForm
            isDetail={isDetail}
            customerName={name}
            searchText={searchText}
            isSearching={isSearching}
            searchResults={searchResults}
            selectedCustomer={selectedCustomer}
            isShowCreateNewCustomer={isShowCreateNewCustomer}
            setCustomerName={setName}
            setSearchText={setSearchText}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setSelectedCustomer={setSelectedCustomer}
            handleTypeSearchChange={handleTypeSearchChange}
            onClickCreateNew={handleClickCreateNewCustomer}
            setIsShowCreateNewCustomer={setIsShowCreateNewCustomer}
          />
          {messageError?.name && (
            <div className="box__message">{messageError?.name}</div>
          )}
        </div>
        <div className="box__right box__right--company">
          <div className="box__title">Company (optional)</div>
          <input
            type="text"
            value={company || ''}
            className="box__input"
            placeholder="Company Name"
            disabled={!isActiveInput}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
          />
        </div>
      </div>
      <div className="box">
        <div className="box__left">
          <div className="box__title">Phone</div>
          <div className={`box__phone${messageError?.phone_number ? ' box__phone--error' : ''}${(!isActiveInput) ? ' box__phone--disabled' : ''}`}>
            <select
              value={phoneCode || ''}
              disabled={!isActiveInput}
              onChange={(e) => handleInputChange('phone_code', e.target.value)}
            >
              {COUNTRY_CODE.map((code, index) =>
                <option key={index} value={code.value}>{code.label}</option>
              )}
            </select>
            <div className="box__divider"></div>
            <input
              type="text"
              placeholder="Phone"
              value={phoneNumber || ''}
              disabled={!isActiveInput}
              className="box__phoneNumber"
              onKeyDown={handleKeyDownInputPhoneNumber}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
            />
          </div>
          {messageError?.phone_number && (
            <div className="box__message box__message--phone">{messageError?.phone_number}</div>
          )}
        </div>
        <div className="box__right">
          <div className="box__title">Email</div>
          <input
            value={email || ''}
            type="text"
            disabled={!isActiveInput}
            className={`box__input${messageError?.email ? ' box__input--error' : ''}`}
            placeholder="Email"
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          {messageError?.email && (
            <div className="box__message">{messageError?.email}</div>
          )}
        </div>
      </div>
      <div className="box">
        <div className={`box__left box__left--address`}>
          <div className="box__title">Address</div>
          <input
            className={`box__input box__input--address${messageError?.address_1 ? ' box__input--error' : ''}`}
            placeholder="Address Line 1"
            value={address1 || ''}
            type="text"
            disabled={!isActiveInput}
            onChange={(e) => handleInputChange('address_1', e.target.value)}
          />
          {messageError?.address_1 && (
            <div className="box__message">{messageError?.address_1}</div>
          )}
          <input
            className={`box__input box__input--address${messageError?.address_2 ? ' box__input--error' : ''}`}
            placeholder="Address Line 2"
            value={address2 || ''}
            type="text"
            disabled={!isActiveInput}
            onChange={(e) => handleInputChange('address_2', e.target.value)}
          />
          {messageError?.address_2 && (
            <div className="box__message">{messageError?.address_2}</div>
          )}
          <input
            className={`box__input box__input--address${messageError?.postal_code ? ' box__input--error' : ''}`}
            placeholder="Postal Code"
            value={postalCode || ''}
            type="text"
            disabled={!isActiveInput}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
          />
          {messageError?.postal_code && (
            <div className="box__message">{messageError?.postal_code}</div>
          )}
        </div>
      </div>
    </>
  )
}

export default CustomerInfoForm
