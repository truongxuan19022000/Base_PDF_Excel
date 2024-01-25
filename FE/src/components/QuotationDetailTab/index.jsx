import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import ActivityLogsForm from '../ActivityLogsForm';
import CustomerInfoForm from '../CustomerInfoForm';
import StatusQuotationForm from '../StatusQuotationForm';

import { COUNTRY_CODE, QUOTATION } from 'src/constants/config';
import { formatPhoneNumber, isEmptyObject } from 'src/helper/helper';

const QuotationDetailTab = ({
  data = {},
  messageError = {},
  handleChange,
  setSearchText,
  setPayStatus,
  setIsInputChanged,
  setSelectedCustomer,
  setIsDisableSubmit,
  handleTypeSearchChange,
  setIsShowCreateNewCustomer,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState(COUNTRY_CODE[0].VALUE);

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
      <div className="quotationDetailTab__content">
        <div className="quotationDetailTab__section">
          <div className="quotationDetailTab__formData">
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
            <label>Payment Status</label>
            <StatusQuotationForm
              data={QUOTATION.STATUS}
              selectedStatus={data.payStatus}
              setSelectedStatus={setPayStatus}
              isInputChanged={data.isInputChanged}
              setIsInputChanged={setIsInputChanged}
            />
            {messageError?.payment_status &&
              <p className="quotationDetailTab__error">
                {messageError.payment_status || ''}
              </p>
            }
          </div>
        </div>
        <div className="quotationDetailTab__customerGroup">
          <CustomerInfoForm
            name={name}
            email={email}
            company={company}
            address1={address1}
            address2={address2}
            phoneCode={phoneCode}
            postalCode={postalCode}
            phoneNumber={phoneNumber}
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
            handleInputChange={handleInputChange}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setSelectedCustomer={setSelectedCustomer}
            handleTypeSearchChange={handleTypeSearchChange}
            setIsShowCreateNewCustomer={setIsShowCreateNewCustomer}
          />
        </div>
        <div className="quotationDetailTab__section">
          <div className="quotationDetailTab__formData">
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
          <div className="quotationDetailTab__formData">
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
        <div className="quotationDetailTab__section">
          <div className="quotationDetailTab__formData">
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
              className="quotationDetailTab__input"
              min="0"
              max="100"
              placeholder="0"
              onChange={(e) => handleChange('payment_balance', e.target.value)}
              name="payment_balance"
              disabled={true}
              value={data.paymentTermBalance || ''}
            />
          </div>
        </div>
        <div className="quotationDetailTab__section quotationDetailTab__section--textarea">
          <div className="quotationDetailTab__formData quotationDetailTab__formData--textArea">
            <label>Project Description</label>
            <textarea
              className="quotationDetailTab__input quotationDetailTab__input--textArea"
              placeholder="Project Description"
              onChange={(e) => handleChange('description', e.target.value)}
              name="description"
              value={data.description || ''}
            />
            {messageError?.description &&
              <p className="quotationDetailTab__error">
                {messageError.description || ''}
              </p>
            }
          </div>
        </div>
      </div>
      <div className="quotationDetailTab__activity">
        <ActivityLogsForm
          constantData={QUOTATION.LOGS}
          logsData={data.quotationDetail?.activities}
        />
      </div>
    </div>
  )
}

export default QuotationDetailTab
