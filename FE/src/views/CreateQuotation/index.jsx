import React, { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'react-datepicker/dist/react-datepicker.css';

import HeadlineBar from 'src/components/HeadlineBar';
import CustomerForm from 'src/components/CustomerForm';
import SelectCustomerForm from 'src/components/SelectCustomerForm';

import { PHONE_CODE, QUOTATION } from 'src/constants/config';
import { useCustomerSlice } from 'src/slices/customer';
import { useQuotationSlice } from 'src/slices/quotation';
import { validateCreateQuotation } from 'src/helper/validation';
import { formatPhoneNumber, isEmptyObject, normalizeString, validateDescription, validatePaymentTerm } from 'src/helper/helper';

const CreateQuotation = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams();

  const { actions } = useQuotationSlice();
  const { actions: customerActions } = useCustomerSlice();

  const fetchedAll = useSelector(state => state.customer.fetchedAll)
  const customerAll = useSelector(state => state.customer.customerAll)
  const customerDetail = useSelector(state => state.customer.detail?.customer)

  const [searchText, setSearchText] = useState('');
  const [messageError, setMessageError] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  const [referenceNumber, setReferenceNumber] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [paymentTermNumber, setPaymentTermNumber] = useState(null);
  const [paymentTermBalance, setPaymentTermBalance] = useState(null);
  const [isShowCreateNewCustomer, setIsShowCreateNewCustomer] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [validTillDate, setValidTillDate] = useState('');
  const [company, setCompany] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('+65');

  const isEditMode = useMemo(() => {
    return !!params.id
  }, [params.id])

  const onSuccess = () => {
    history.push('/quotation')
  }

  const onError = () => {
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (!fetchedAll) {
      dispatch(customerActions.getAllCustomerList())
    }
  }, [fetchedAll])

  useEffect(() => {
    if (customerAll?.length > 0 && searchText.length === 0) {
      setSearchResults(customerAll)
    }
  }, [customerAll, searchText])

  useEffect(() => {
    if (+paymentTermNumber > 0) {
      setPaymentTermBalance(100 - +paymentTermNumber)
    }
  }, [paymentTermNumber])

  useEffect(() => {
    if (!isEmptyObject(selectedCustomer)) {
      history.push(`/quotation/create-quotation?customer=${selectedCustomer.id}`)
      dispatch(customerActions.getCustomer({ customer_id: +selectedCustomer.id }))
    } else {
      history.push(`/quotation/create-quotation`)
      dispatch(customerActions.clearCustomerDetail())
    }
  }, [selectedCustomer])

  useEffect(() => {
    if (!isEmptyObject(customerDetail)) {
      const phoneCode = customerDetail.phone_number?.toString()?.slice(0, 3) || '';
      const phoneNumber = formatPhoneNumber(customerDetail.phone_number?.toString()?.slice(3));
      setPhoneCode(phoneCode)
      setPhoneNumber(phoneNumber)
      setName(customerDetail.name)
      setEmail(customerDetail.email)
      setCompany(customerDetail.company_name)
      setPostalCode(customerDetail.postal_code)
      setAddress1(customerDetail.address?.address_1)
      setAddress2(customerDetail.address?.address_2)
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
  }, [customerDetail])

  useEffect(() => {
    setIsDisableSubmit(false)
  }, [isInputChanged])

  const handleDateChangeRaw = (e) => {
    e.preventDefault();
  }

  const handleChange = (field, value) => {
    const fieldSetters = {
      name: setName,
      company_name: setCompany,
      email: setEmail,
      address_1: setAddress1,
      address_2: setAddress2,
      phone_code: setPhoneCode,
      phone_number: setPhoneNumber,
      postal_code: setPostalCode,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      issue_date: setIssueDate,
      description: setDescription,
      valid_till: setValidTillDate,
      reference_no: setReferenceNumber,
      terms_of_payment_confirmation: setPaymentTermNumber,
    };

    const setter = fieldSetters[field];
    if (!setter) return;

    let message = {}
    switch (field) {
      case QUOTATION.KEYS.PAYMENT_TERM:
        if (validatePaymentTerm(value)) {
          message.terms_of_payment_confirmation = QUOTATION.MESSAGE_ERROR.PAYMENT_TERM;
        }
        break;
      case QUOTATION.KEYS.DESCRIPTION:
        if (validateDescription(value)) {
          message.description = QUOTATION.MESSAGE_ERROR.DESCRIPTION;
        }
        break;
      default:
        break;
    }
    setter(value);
    setMessageError(message);
  };

  const handleCreateQuotation = () => {
    if (isDisableSubmit) return;
    const trimmedPhoneNumber = phoneNumber?.startsWith('0') ? phoneNumber?.substring(1) : phoneNumber;
    const phoneNumberFormatted = (phoneCode || PHONE_CODE.SINGAPORE + trimmedPhoneNumber)

    const data = {
      reference_no: referenceNumber,
      description: description,
      terms_of_payment_confirmation: +paymentTermNumber,
      terms_of_payment_balance: +paymentTermBalance,
      issue_date: issueDate && dayjs(issueDate, 'DD-MM-YYYY').format('YYYY/MM/DD'),
      valid_till: validTillDate && dayjs(validTillDate, 'DD-MM-YYYY').format('YYYY/MM/DD'),
      name: name,
      email: email,
      address_1: address1,
      address_2: address2,
      postal_code: postalCode,
      company_name: company || '',
      phone_number: phoneNumberFormatted?.replace(/\s/g, ''),
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      is_new_customer: true,
    }

    if (selectedCustomer?.id) {
      data.customer_id = selectedCustomer.id
      data.name = selectedCustomer?.name
      data.is_new_customer = false
    }

    const errors = validateCreateQuotation(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createQuotation({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  const handleSearch = (text) => {
    if (text && text.trim().length > 0 && customerAll?.length > 0) {
      const results = customerAll.filter(item =>
        normalizeString(item.name).trim().includes(text)
      );
      setSearchResults(results);
      setIsSearching(false)
    }
  };

  const handleTypeSearchChange = (e) => {
    if (isDisableSubmit) return;
    const text = e.target.value;
    setSearchText(normalizeString(text))
    setIsInputChanged(!isInputChanged)
    setIsSearching(true)
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const newTypingTimeout = setTimeout(() => {
      if (text.trim() === '') {
        setIsSearching(false)
      } else {
        handleSearch(normalizeString(text));
      }
    }, 500);
    setTypingTimeout(newTypingTimeout);
  }

  const handleClickCreateNewCustomer = () => {
    setIsShowCreateNewCustomer(true)
    setSelectedCustomer({})
  }

  return (
    <div className="createQuotation">
      {!isEditMode &&
        <HeadlineBar
          onClick={handleCreateQuotation}
          buttonName="Create"
          headlineTitle="New Quotation"
        />
      }
      <div className="createQuotation__content">
        <div className="createQuotation__contentInner">
          <div className="createQuotation__contentInner">
            <div className="createQuotation__section">
              <div className="createQuotation__formData">
                <label>Reference No.</label>
                <input
                  type="text"
                  className={`createQuotation__input${messageError?.reference_no ? ' createQuotation__input--error' : ''}`}
                  placeholder="Reference No."
                  onChange={(e) => handleInputChange('reference_no', e.target.value)}
                  name="reference_no"
                  autoFocus={true}
                />
                {messageError?.reference_no &&
                  <p className="createQuotation__error">
                    {messageError.reference_no || ''}
                  </p>
                }
              </div>
              <div className="createQuotation__formData">
                <label>Customer</label>
                <SelectCustomerForm
                  searchText={searchText}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  selectedCustomer={selectedCustomer}
                  messageError={messageError?.customer_id}
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
                {messageError?.customer_id &&
                  <p className="createQuotation__error">
                    {messageError.customer_id || ''}
                  </p>
                }
              </div>
            </div>
            {(!isEmptyObject(selectedCustomer) || isShowCreateNewCustomer) &&
              <div className="createQuotation__customerGroup">
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
                  isActiveInput={isShowCreateNewCustomer}
                  handleInputChange={handleChange}
                  isNotCustomer={true}
                />
              </div>
            }
            <div className="createQuotation__section">
              <div className="createQuotation__formData">
                <label>Issue Date</label>
                <DatePicker
                  selected={issueDate || ''}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  onChangeRaw={handleDateChangeRaw}
                  onChange={(date) => handleInputChange('issue_date', date)}
                  className={`createQuotation__input${messageError?.issue_date ? ' createQuotation__input--error' : ''}`}
                />
                <img
                  className="createQuotation__formData--icon"
                  src="/icons/calendar.svg"
                  alt="calendar"
                />
                {messageError?.issue_date &&
                  <p className="createQuotation__error">
                    {messageError.issue_date || ''}
                  </p>
                }
              </div>
              <div className="createQuotation__formData">
                <label>Valid Till</label>
                <DatePicker
                  selected={validTillDate || ''}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  onChangeRaw={handleDateChangeRaw}
                  onChange={(date) => handleInputChange('valid_till', date)}
                  className={`createQuotation__input${messageError?.valid_till ? ' createQuotation__input--error' : ''}`}
                />
                <img
                  className="createQuotation__formData--icon"
                  src="/icons/calendar.svg"
                  alt="calendar"
                />
                {messageError?.valid_till &&
                  <p className="createQuotation__error">
                    {messageError.valid_till || ''}
                  </p>
                }
              </div>
            </div>
            <div className="createQuotation__section">
              <div className="createQuotation__formData">
                <div className="inputPaymentTerm">
                  <div className="inputPaymentTerm__title">Terms of Payment (Upon Confirmation)</div>
                  <div className={`inputPaymentTerm__body${messageError?.terms_of_payment_confirmation ? ' inputPaymentTerm__body--error' : ''}`}>
                    <div className="inputPaymentTerm__body--box">
                      <input
                        value={paymentTermNumber || ''}
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        onChange={(e) => handleInputChange('terms_of_payment_confirmation', e.target.value)}
                        className="inputPaymentTerm__body--input"
                      />
                    </div>
                    <div className="inputPaymentTerm__body--select">
                      %
                    </div>
                  </div>
                  {messageError?.terms_of_payment_confirmation && (
                    <div className="inputPaymentTerm__message">{messageError?.terms_of_payment_confirmation}</div>
                  )}
                </div>
              </div>
              <div className="createQuotation__formData">
                <div className="inputPaymentTerm">
                  <div className="inputPaymentTerm__title">Terms of Payment (Balance)</div>
                  <div className="inputPaymentTerm__body inputPaymentTerm__body--disabled">
                    <div className="inputPaymentTerm__body--box">
                      <input
                        value={paymentTermBalance || ''}
                        type="number"
                        placeholder="0"
                        onChange={(e) => handleInputChange('payment_balance', e.target.value)}
                        className="inputPaymentTerm__body--input inputPaymentTerm__body--inputDisabled"
                        disabled={true}
                      />
                    </div>
                    <div className="inputPaymentTerm__body--select">
                      %
                    </div>
                  </div>
                  {messageError?.payment_balance && (
                    <div className="inputPaymentTerm__message">{messageError?.payment_balance}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="createQuotation__section">
              <div className="createQuotation__formData createQuotation__formData--textArea">
                <label>Project Description</label>
                <textarea
                  className={`createQuotation__input createQuotation__input--textArea${messageError?.description ? ' createQuotation__input--textAreaError' : ''}`}
                  placeholder="Project Description"
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  name="description"
                />
                {messageError?.description &&
                  <p className="createQuotation__error">
                    {messageError.description || ''}
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateQuotation
