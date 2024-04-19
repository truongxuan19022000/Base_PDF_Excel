import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import Loading from 'src/components/Loading';
import HeadlineBar from 'src/components/HeadlineBar'
import PhoneCodeForm from 'src/components/PhoneCodeForm';
import SelectSearchForm from 'src/components/SelectSearchForm';
import ActivityLogsForm from 'src/components/ActivityLogsForm';

import { ACTIONS, ACTIVITY, ALERT, COUNTRY_CODE, INVOICE, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config';
import { alertActions } from 'src/slices/alert';
import { useInvoiceSlice } from 'src/slices/invoice';
import { useQuotationSlice } from 'src/slices/quotation';
import { validateCreateInvoice, validatePermission, validateUpdateInvoice } from 'src/helper/validation';
import { isEmptyObject, normalizeString, formatPhoneNumber, formatStringToDate, formatDate } from 'src/helper/helper';

const CreateInvoice = ({
  invoiceDetail = {},
  logsInfo = {},
  selectedAction,
  setSelectedAction,
}) => {
  const { actions } = useInvoiceSlice()
  const { actions: quotationActions } = useQuotationSlice()

  const params = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')

  const isLoading = useSelector(state => state.quotation.isSearching)
  const {
    quotationAll,
    selectedQuotationData,
    detail: quotationDetail,
  } = useSelector(state => state.quotation)

  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [invoiceNo, setInvoiceNo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState({});
  const [selectedQuotationDetail, setSelectedQuotationDetail] = useState({});
  const [selectedQuotationTitle, setSelectedQuotationTitle] = useState('');
  const [messageError, setMessageError] = useState({});
  const [issueDate, setIssueDate] = useState('');
  const [receivedDate, setReceivedDate] = useState('');

  const isEditMode = useMemo(() => {
    return !!params.id
  }, [params])

  const onSuccess = (newId) => {
    setIsDisableSubmit(false)
    !isEditMode && setTimeout(() => {
      history.push(`/invoice/${newId}?tab=invoice`)
    }, 1000);
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  }

  useEffect(() => {
    dispatch(quotationActions.getAllQuotationList({
      status: [QUOTATION.STATUS_VALUE.APPROVED]
    }))
  }, [])

  useEffect(() => {
    if (quotationAll?.length > 0 && searchText?.length === 0) {
      setSearchResults(quotationAll)
    }
  }, [quotationAll, searchText])

  useEffect(() => {
    if (searchText?.length === 0) {
      setIsSearching(false)
    }
  }, [searchText])

  useEffect(() => {
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    return () => {
      dispatch(quotationActions.clearQuotationDetail())
      dispatch(quotationActions.clearSelectedQuotationData())
    }
  }, [])

  useEffect(() => {
    const invoice = invoiceDetail?.invoice;
    if (!isEmptyObject(invoice)) {
      const { quotation } = invoice;
      setInvoiceNo(invoice?.invoice_no)
      setSelectedQuotation(quotation)
      setSearchText(quotation?.reference_no)
      setIssueDate(formatStringToDate(invoice?.issue_date))
      setReceivedDate(formatStringToDate(invoice?.payment_received_date))
      if (!isEmptyObject(quotation)) {
        const addressObject = typeof quotation?.address === 'string'
          ? JSON.parse(quotation?.address) : quotation?.address;
        const convertedPhoneCode = quotation?.phone_number?.toString()?.slice(0, 3) || '';
        const convertedPhoneNumber = formatPhoneNumber(quotation?.phone_number?.toString()?.slice(3));
        setSelectedQuotationTitle(quotation?.reference_no)
        setSelectedQuotationDetail({
          ...quotation,
          address: addressObject,
          phoneCode: convertedPhoneCode,
          phoneNumber: convertedPhoneNumber,
        })
      }
    }
  }, [invoiceDetail?.invoice])

  useEffect(() => {
    if (!isEmptyObject(quotationDetail?.quotation)) {
      const { customer } = quotationDetail.quotation;
      const convertedPhoneCode = customer?.phone_number?.toString()?.slice(0, 3) || '';
      const convertedPhoneNumber = formatPhoneNumber(customer?.phone_number?.toString()?.slice(3));
      const data = {
        ...customer,
        phoneCode: convertedPhoneCode,
        phoneNumber: convertedPhoneNumber,
        description: quotationDetail.quotation?.description,
        reference_no: quotationDetail.quotation?.reference_no,
      }
      setSelectedQuotationDetail(data)
      setSelectedQuotationTitle(quotationDetail.quotation?.reference_no)
    }
  }, [quotationDetail?.quotation])

  useEffect(() => {
    if (viewTab === INVOICE.ROUTE.DETAILS && Object.values(selectedAction).length > 0) {
      if (selectedAction.value === ACTIONS.VALUE.SAVE_AS_DRAFT) {
        handleUpdateInvoice()
      }
    }
  }, [selectedAction, viewTab]);

  useEffect(() => {
    !isEmptyObject(selectedQuotationData) && setSelectedQuotationTitle(selectedQuotationData.reference_no)
  }, [selectedQuotationData])

  const handleCreateInvoice = () => {
    if (isDisableSubmit) return;
    const data = {
      invoice_no: invoiceNo,
      quotation_id: +selectedQuotation?.id || +selectedQuotationData?.id,
      customer_id: +selectedQuotation?.customer_id,
      reference_no: selectedQuotation?.reference_no,
      customer_name: selectedQuotation?.name || 'Unknown',
      issue_date: issueDate ? dayjs(issueDate).format('YYYY-MM-DD') : '',
      origin_date: issueDate || ''
    }
    const errors = validateCreateInvoice(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createInvoice({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  const prepareInvoiceData = () => {
    const data = {
      id: +params.id,
      invoice_id: +params.id,
      invoice_no: invoiceNo,
      quotation_id: +selectedQuotationDetail?.id,
      customer_id: +selectedQuotationDetail?.customer_id,
      reference_no: selectedQuotationDetail?.reference_no,
      customer_name: selectedQuotationDetail?.name || 'Unknown',
      description: selectedQuotationDetail?.description,
      price: selectedQuotationDetail?.price,
      created_at: invoiceDetail?.invoice?.created_at,
      issue_date: issueDate ? dayjs(issueDate).format('YYYY-MM-DD') : '',
      origin_date: issueDate || '',
      quotation: selectedQuotationDetail,
      logsInfo: {
        ...logsInfo,
        action_type: ACTIVITY.LOGS.ACTION_VALUE.UPDATE,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
    };

    if (receivedDate) {
      data.payment_received_date = dayjs(receivedDate).format('YYYY-MM-DD');
    }

    return data;
  };

  const isInfoChanged = () => {
    const initialIssueDate = formatDate(invoiceDetail?.invoice?.issue_date);
    const initialReceivedDate = formatDate(invoiceDetail?.invoice?.payment_received_date);

    return (
      invoiceNo !== invoiceDetail?.invoice?.invoice_no ||
      +selectedQuotationDetail?.id !== invoiceDetail?.invoice?.quotation_id ||
      dayjs(issueDate).format('YYYY-MM-DD') !== dayjs(initialIssueDate).format('YYYY-MM-DD') ||
      dayjs(receivedDate).format('YYYY-MM-DD') !== dayjs(initialReceivedDate).format('YYYY-MM-DD')
    );
  };

  const handleUpdateInvoice = () => {
    setSelectedAction({});
    if (isEditAllowed) {
      if (isDisableSubmit) return;

      const isChanged = isInfoChanged();

      if (isChanged) {
        const data = prepareInvoiceData();
        const errors = validateUpdateInvoice(data);
        if (Object.keys(errors).length > 0) {
          setMessageError(errors);
        } else {
          dispatch(actions.updateInvoice({ ...data, onSuccess, onError }));
          setMessageError({});
          setIsDisableSubmit(true);
        }
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          description: MESSAGE.ERROR.INFO_NO_CHANGE,
        }));
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  };

  const handleSearch = (text) => {
    if (text && text.trim().length > 0 && searchResults?.length > 0) {
      const results = searchResults.filter(item =>
        normalizeString(item.reference_no).trim().includes(text)
      );
      setSearchResults(results);
      setIsSearching(false)
    }
  };

  const handleTypeSearchChange = (e) => {
    if (isDisableSubmit) return;
    const text = e.target.value;
    setSearchText(text)
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

  const handleInputInvoiceNo = (e) => {
    setInvoiceNo(e.target.value)
    setIsInputChanged(!isInputChanged)
  }

  const handleDateChangeRaw = (e) => {
    e.preventDefault();
  }

  const handleSelectDate = (field, date) => {
    if (isDisableSubmit) return;
    const fieldSetters = {
      issue_date: setIssueDate,
      payment_received_date: setReceivedDate,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(date);
      setMessageError({})
    }
  }

  const handleSelectQuotation = (item) => {
    if (isDisableSubmit) return;
    if (isEmptyObject(item)) {
      setSelectedQuotation({})
      setSelectedQuotationTitle('')
      setSelectedQuotationDetail({})
      dispatch(quotationActions.clearQuotationDetail())
    } else {
      setSelectedQuotation(item)
      setSelectedQuotationTitle(item.reference_no)
      dispatch(quotationActions.getQuotationDetail(+item?.id))
    }
  }

  return (
    <div className={`createInvoice${isEditMode ? ' createInvoice--editForm' : ''}`}>
      {!isEditMode &&
        <HeadlineBar
          buttonName="Create"
          headlineTitle="New Invoice"
          onClick={handleCreateInvoice}
        />
      }
      <div className="createInvoice__container">
        <div className={`createInvoice__createForm${isEditMode ? ' createInvoice__createForm--edit' : ''}`}>
          <div className={`createInvoice__col${isEditAllowed ? '' : ' createInvoice__col--disabled'}`}>
            <div className="createInvoice__formGroup">
              <b className="createInvoice__label">
                Invoice No.
              </b>
              <input
                name="invoice_no"
                type="text"
                className={`createInvoice__input${messageError?.invoice_no ? ' createInvoice__input--error' : ''}`}
                value={invoiceNo || ''}
                placeholder="Invoice No."
                onChange={handleInputInvoiceNo}
              />
              {messageError?.invoice_no &&
                <p className="createInvoice__error">
                  {messageError.invoice_no || ''}
                </p>
              }
            </div>
            <div className="createInvoice__formGroup">
              <b className="createInvoice__label">
                Reference No.
              </b>
              <SelectSearchForm
                validSelectProperty="id"
                borderStyle="lightBorder"
                displayProperty="reference_no"
                placeHolderLabel="Reference No."
                searchText={searchText}
                isSearching={isSearching}
                searchResults={searchResults}
                selectedItem={selectedQuotation}
                isInputChanged={isInputChanged}
                selectedItemTitle={selectedQuotationTitle}
                messageError={messageError?.quotation_id}
                setSearchText={setSearchText}
                setSelectedItem={handleSelectQuotation}
                setIsInputChanged={setIsInputChanged}
                setIsDisableSubmit={setIsDisableSubmit}
                setSelectedItemTitle={setSelectedQuotationTitle}
                handleTypeSearchChange={handleTypeSearchChange}
              />
              {messageError?.quotation_id &&
                <p className="createInvoice__error">
                  {messageError.quotation_id || ''}
                </p>
              }
            </div>
          </div>
          {isLoading ?
            <Loading />
            :
            (selectedQuotationDetail && Object.values(selectedQuotationDetail).length > 0) &&
            <>
              <div className="createInvoice__col">
                <div className="createInvoice__formGroup">
                  <b className="createInvoice__label">
                    Name
                  </b>
                  <input
                    name="customer"
                    type="text"
                    className="createInvoice__input"
                    placeholder="Customer"
                    value={selectedQuotationDetail?.name || ''}
                    disabled={true}
                  />
                  {messageError?.customer_id &&
                    <p className="createInvoice__error">
                      {messageError.customer_id || ''}
                    </p>
                  }
                </div>
                <div className="createInvoice__formGroup">
                  <b className="createInvoice__label">
                    Company Name (optional)
                  </b>
                  <div className="createInvoice__price createInvoice__price--selected">
                    {selectedQuotationDetail?.company_name || ''}
                  </div>
                </div>
              </div>
              <div className="createInvoice__col">
                <div className="createInvoice__formGroup">
                  <b className="createInvoice__label">
                    Phone
                  </b>
                  <div className="createInvoice__phoneNumberWrapper">
                    <div className="createInvoice__phoneCode">
                      <PhoneCodeForm
                        phoneList={COUNTRY_CODE}
                        selectedItem={selectedQuotationDetail?.phoneCode || COUNTRY_CODE[1]}
                        isDisable={true}
                        setIsShow={() => { }}
                      />
                    </div>
                    <div className="createInvoice__divider"></div>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={selectedQuotationDetail?.phoneNumber || ''}
                      className="createInvoice__phoneNumber"
                      disabled
                    />
                  </div>
                </div>
                <div className="createInvoice__formGroup">
                  <b className="createInvoice__label">
                    Email
                  </b>
                  <input
                    type="text"
                    className="createInvoice__input"
                    placeholder="Email"
                    value={selectedQuotationDetail?.email || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="createInvoice__col">
                <div className="createInvoice__formGroup createInvoice__formGroup--address">
                  <b className="createInvoice__label">
                    Project Description
                  </b>
                  <input
                    className="createInvoice__input createInvoice__input--fullWidth"
                    placeholder="Address Line 1"
                    value={selectedQuotationDetail?.address?.address_1 || ''}
                    type="text"
                    disabled
                  />
                  <input
                    className="createInvoice__input createInvoice__input--fullWidth"
                    placeholder="Address Line 2"
                    value={selectedQuotationDetail?.address?.address_2 || ''}
                    type="text"
                    disabled
                  />
                  <input
                    className="createInvoice__input createInvoice__input--fullWidth"
                    placeholder="Postal Code"
                    value={selectedQuotationDetail?.postal_code || ''}
                    type="text"
                    disabled
                  />
                </div>
              </div>
              <div className="createInvoice__col">
                <div className="createInvoice__formGroup">
                  <b className="createInvoice__label">
                    Project Description
                  </b>
                  <div className="createInvoice__formGroup">
                    <textarea
                      name="description"
                      className="createInvoice__input createInvoice__input--textArea"
                      placeholder="Project Description"
                      value={selectedQuotationDetail?.description || ''}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
            </>
          }
          <div className={`createInvoice__col${isEditAllowed ? '' : ' createInvoice__col--disabled'}`}>
            <div className="createInvoice__formGroup createInvoice__formGroup--calender">
              <b className="createInvoice__label">
                Issue Date
              </b>
              <DatePicker
                selected={issueDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                onChangeRaw={handleDateChangeRaw}
                onChange={(date) => handleSelectDate('issue_date', date)}
                className={`createClaim__input${messageError?.issue_date ? ' createClaim__input--error' : ''}`}
              />
              <img
                className="createInvoice__calenderIcon"
                src="/icons/calendar.svg"
                alt="calendar"
              />
              {messageError?.issue_date &&
                <p className="createClaim__error">
                  {messageError.issue_date || ''}
                </p>
              }
            </div>
            {isEditMode &&
              <div className="createInvoice__formGroup createInvoice__formGroup--calender">
                <b className="createInvoice__label">
                  Payment Received Date
                </b>
                <DatePicker
                  selected={receivedDate}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  onChangeRaw={handleDateChangeRaw}
                  onChange={(date) => handleSelectDate('payment_received_date', date)}
                  className={`createClaim__input${messageError?.payment_received_date ? ' createClaim__input--error' : ''}`}
                />
                <img
                  className="createInvoice__calenderIcon"
                  src="/icons/calendar.svg"
                  alt="calendar"
                />
                {messageError?.payment_received_date &&
                  <p className="createClaim__error">
                    {messageError.payment_received_date || ''}
                  </p>
                }
              </div>
            }
          </div>
        </div>
        {isEditMode &&
          <div className="createInvoice__activity">
            <ActivityLogsForm
              isInvoiceDetail={true}
              logsNameList={ACTIVITY.LOGS.LABEL}
              actionNameList={ACTIVITY.LOGS.ACTION}
              logsData={invoiceDetail?.activities}
            />
          </div>
        }
      </div>
    </div>
  )
}

export default CreateInvoice
