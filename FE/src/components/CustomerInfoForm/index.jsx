import React, { useState } from 'react'
import { useDispatch } from 'react-redux';

import { COUNTRY_CODE } from 'src/constants/config';
import { useCustomerSlice } from 'src/slices/customer';
import { useQuotationSlice } from 'src/slices/quotation';

import SelectCustomerForm from '../SelectCustomerForm';
import PhoneCodeForm from '../PhoneCodeForm';

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
  isEditable = false,
  isSearching = false,
  isActiveInput = false,
  isShowCreateNewCustomer = false,
  messageError = {},
  searchResults = [],
  selectedCustomer = {},
  setName,
  setPhoneCode,
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

  const [isShowSelectList, setIsShowSelectList] = useState(false)

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
      <div className="infoBox">
        <div className={`infoBox__left${isEditable ? '' : ' infoBox__left--disabled'}`}>
          <div className="infoBox__title">Name</div>
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
            <div className="infoBox__message">{messageError?.name}</div>
          )}
        </div>
        <div className="infoBox__right infoBox__right--company">
          <div className="infoBox__title">Company (optional)</div>
          <input
            type="text"
            value={company || ''}
            className="infoBox__input"
            placeholder="Company Name"
            disabled={!isActiveInput}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
          />
        </div>
      </div>
      <div className="infoBox">
        <div className="infoBox__left">
          <div className="infoBox__title">Phone</div>
          <div className={`infoBox__phone${isShowSelectList ? ' infoBox__phone--showList' : ''}${messageError?.phone_number ? ' infoBox__phone--error' : ''}${(!isActiveInput) ? ' infoBox__phone--disabled' : ''}`}>
            <div className="infoBox__phoneCode">
              <PhoneCodeForm
                phoneList={COUNTRY_CODE}
                selectedItem={phoneCode}
                isDisable={!isActiveInput}
                setSelectedItem={setPhoneCode}
                setIsShow={setIsShowSelectList}
              />
            </div>
            <div className="infoBox__divider"></div>
            <input
              type="text"
              placeholder="Phone"
              value={phoneNumber || ''}
              disabled={!isActiveInput}
              className="infoBox__phoneNumber"
              onKeyDown={handleKeyDownInputPhoneNumber}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
            />
          </div>
          {messageError?.phone_number && (
            <div className="infoBox__message infoBox__message--phone">{messageError?.phone_number}</div>
          )}
        </div>
        <div className="infoBox__right">
          <div className="infoBox__title">Email</div>
          <input
            value={email || ''}
            type="text"
            disabled={!isActiveInput}
            className={`infoBox__input${messageError?.email ? ' infoBox__input--error' : ''}`}
            placeholder="Email"
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          {messageError?.email && (
            <div className="infoBox__message">{messageError?.email}</div>
          )}
        </div>
      </div>
      <div className="infoBox">
        <div className={`infoBox__left infoBox__left--address`}>
          <div className="infoBox__title">Address</div>
          <input
            className={`infoBox__input infoBox__input--address${messageError?.address_1 ? ' infoBox__input--error' : ''}`}
            placeholder="Address Line 1"
            value={address1 || ''}
            type="text"
            disabled={!isActiveInput}
            onChange={(e) => handleInputChange('address_1', e.target.value)}
          />
          {messageError?.address_1 && (
            <div className="infoBox__message">{messageError?.address_1}</div>
          )}
          <input
            className={`infoBox__input infoBox__input--address${messageError?.address_2 ? ' box__input--error' : ''}`}
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
            className={`infoBox__input infoBox__input--address${messageError?.postal_code ? ' box__input--error' : ''}`}
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
