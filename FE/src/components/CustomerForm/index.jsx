import React from 'react'

import { COUNTRY_CODE } from 'src/constants/config'

const CustomerForm = ({
  name = '',
  email = '',
  company = '',
  address1 = '',
  address2 = '',
  postalCode = '',
  phoneCode = '+65',
  phoneNumber = '',
  messageError = {},
  isNotCustomer = false,
  isActiveInput = false,
  handleInputChange,
}) => {
  const handleKeyDownInputPhoneNumber = (e) => {
    if (e.key === 'e') {
      e.preventDefault();
    }
  };

  return (
    <div className={`customerForm${isNotCustomer ? ' customerForm--noPadding' : ''}`}>
      <div className="box">
        <div className="box__left">
          <div className="box__title">Name</div>
          <input
            value={name || ''}
            type="text"
            className={`box__input${messageError?.name ? ' box__input--error' : ''}`}
            placeholder="Name"
            autoFocus
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
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
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
        </div>
      </div>
      <div className="box">
        <div className="box__left">
          <div className="box__title">Phone</div>
          <div className={`box__phone${messageError?.phone_number ? ' box__phone--error' : ''}${(!isActiveInput && isNotCustomer) ? ' box__phone--disabled' : ''}`}>
            <select
              value={phoneCode || ''}
              onChange={(e) => handleInputChange('phone_code', e.target.value)}
              disabled={!isActiveInput && isNotCustomer}
            >
              {COUNTRY_CODE.map((code, index) =>
                code.value !== 0 &&
                <option key={index} value={code.label}>{code.label}</option>
              )}
            </select>
            <div className="box__divider"></div>
            <input
              type="number"
              placeholder="Phone"
              value={phoneNumber || ''}
              className="box__phoneNumber"
              onKeyDown={handleKeyDownInputPhoneNumber}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              disabled={!isActiveInput && isNotCustomer}
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
            className={`box__input${messageError?.email ? ' box__input--error' : ''}`}
            placeholder="Email"
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.email && (
            <div className="box__message">{messageError?.email}</div>
          )}
        </div>
      </div>
      <div className="box">
        <div className={`box__left box__left--address${isNotCustomer ? ' box__left--fullWidth' : ''}`}>
          <div className="box__title">Address</div>
          <input
            className={`box__input box__input--address${messageError?.address_1 ? ' box__input--error' : ''}`}
            placeholder="Address Line 1"
            value={address1 || ''}
            type="text"
            onChange={(e) => handleInputChange('address_1', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.address_1 && (
            <div className="box__message">{messageError?.address_1}</div>
          )}
          <input
            className={`box__input box__input--address${messageError?.address_2 ? ' box__input--error' : ''}`}
            placeholder="Address Line 2"
            value={address2 || ''}
            type="text"
            onChange={(e) => handleInputChange('address_2', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.address_2 && (
            <div className="box__message">{messageError?.address_2}</div>
          )}
          <input
            className={`box__input box__input--address${messageError?.postal_code ? ' box__input--error' : ''}`}
            placeholder="Postal Code"
            value={postalCode || ''}
            type="text"
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            disabled={!isActiveInput && isNotCustomer}
          />
          {messageError?.postal_code && (
            <div className="box__message">{messageError?.postal_code}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerForm
