import React, { useState } from 'react'

import { COUNTRY_CODE, PHONE_CODE } from 'src/constants/config'

import PhoneCodeForm from '../PhoneCodeForm';

const CustomerForm = ({
  name = '',
  email = '',
  company = '',
  address1 = '',
  address2 = '',
  postalCode = '',
  phoneCode = PHONE_CODE.SINGAPORE,
  phoneNumber = '',
  messageError = {},
  isNotCustomer = false,
  isActiveInput = false,
  isDetailPage = false,
  handleInputChange,
  setPhoneCode,
}) => {
  const [isShowSelectList, setIsShowSelectList] = useState(false)

  const handleKeyDownInputPhoneNumber = (e) => {
    if (e.key === 'e') {
      e.preventDefault();
    }
  };

  return (
    <div className={`customerForm${isNotCustomer || isDetailPage ? ' customerForm--noPadding' : ''}`}>
      <div className="box">
        <div className={`box__left${isDetailPage ? ' box__left--detail' : ''}`}>
          <div className="box__title">Name</div>
          <input
            value={name || ''}
            type="text"
            className={`box__input${isDetailPage ? ' box__input--detail' : ''}${messageError?.name ? ' box__input--error' : ''}`}
            placeholder="Name"
            autoFocus
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.name && (
            <div className="box__message">{messageError.name}</div>
          )}
        </div>
        <div className="box__right box__right--company">
          <div className="box__title">Company (optional)</div>
          <input
            type="text"
            value={company || ''}
            className={`box__input${isDetailPage ? ' box__input--detail' : ''}`}
            placeholder="Company Name"
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
        </div>
      </div>
      <div className="box">
        <div className={`box__left${isDetailPage ? ' box__left--detail' : ''}`}>
          <div className="box__title">Phone</div>
          <div className={`box__phone${isDetailPage ? ' box__phone--detail' : ''}${isShowSelectList ? ' box__phone--showList' : ''}${messageError?.phone_number ? ' box__phone--error' : ''}${(!isActiveInput && isNotCustomer) ? ' box__phone--disabled' : ''}`}>
            <div className="box__phoneCode">
              <PhoneCodeForm
                phoneList={COUNTRY_CODE}
                selectedItem={phoneCode}
                setIsShow={setIsShowSelectList}
                setSelectedItem={setPhoneCode}
              />
            </div>
            <div className="box__divider"></div>
            <input
              type="text"
              placeholder="Phone"
              value={phoneNumber || ''}
              className="box__phoneNumber"
              onKeyDown={handleKeyDownInputPhoneNumber}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              disabled={!isActiveInput && isNotCustomer}
            />
          </div>
          {messageError?.phone_number && (
            <div className="box__message box__message--phone">{messageError.phone_number}</div>
          )}
        </div>
        <div className="box__right">
          <div className="box__title">Email</div>
          <input
            value={email || ''}
            type="text"
            className={`box__input${isDetailPage ? ' box__input--detail' : ''}${messageError?.email ? ' box__input--error' : ''}`}
            placeholder="Email"
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.email && (
            <div className="box__message">{messageError.email}</div>
          )}
        </div>
      </div>
      <div className="box">
        <div className={`box__left box__left--address${isNotCustomer ? ' box__left--fullWidth' : ''}`}>
          <div className="box__title">Address</div>
          <input
            className={`box__input box__input--address${isDetailPage ? ' box__input--detailAddress' : ''}${messageError?.address_1 ? ' box__input--error' : ''}`}
            placeholder="Address Line 1"
            value={address1 || ''}
            type="text"
            onChange={(e) => handleInputChange('address_1', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.address_1 && (
            <div className="box__message">{messageError.address_1}</div>
          )}
          <input
            className={`box__input box__input--address${isDetailPage ? ' box__input--detailAddress' : ''}${messageError?.address_2 ? ' box__input--error' : ''}`}
            placeholder="Address Line 2"
            value={address2 || ''}
            type="text"
            onChange={(e) => handleInputChange('address_2', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.address_2 && (
            <div className="box__message">{messageError.address_2}</div>
          )}
          <input
            className={`box__input box__input--address${isDetailPage ? ' box__input--detailAddress' : ''}${messageError?.postal_code ? ' box__input--error' : ''}`}
            placeholder="Postal Code"
            value={postalCode || ''}
            type="text"
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.postal_code && (
            <div className="box__message">{messageError.postal_code}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerForm
