import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { useProductSlice } from 'src/slices/product'
import { useCustomerSlice } from 'src/slices/customer'
import { quotationActions, useQuotationSlice } from 'src/slices/quotation'
import { useMaterialSlice } from 'src/slices/material';
import { validateEditQuotation } from 'src/helper/validation'
import { useQuotationNoteSlice } from 'src/slices/quotationNote';
import { useQuotationSectionSlice } from 'src/slices/quotationSection';
import { useQuotationOtherFeesSlice } from 'src/slices/quotationOtherFees';
import { ACTIVITY, MESSAGE, QUOTATION } from 'src/constants/config'
import { formatNumberWithTwoDecimalPlaces, formatStringToDate, isEmptyObject, isSimilarObject, normalizeString, validateDescription, validatePaymentTerm } from 'src/helper/helper'

import TabQuotation from 'src/components/TabQuotation'
import QuotationNote from 'src/components/QuotationNote'
import ActionMessageForm from 'src/components/ActionMessageForm';
import QuotationDetailTab from 'src/components/QuotationDetailTab'
import ActionQuotationForm from 'src/components/ActionQuotationForm'
import ConfirmDeleteItemModal from 'src/components/ConfirmDeleteItemModal'
import QuotationOtherFees from 'src/components/QuotationOtherFees';

const QuotationDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')

  const { actions } = useQuotationSlice();
  const { actions: productActions } = useProductSlice();
  const { actions: materialActions } = useMaterialSlice();
  const { actions: customerActions } = useCustomerSlice();
  const { actions: quotationNoteActions } = useQuotationNoteSlice();
  const { actions: quotationSectionActions } = useQuotationSectionSlice();
  const { actions: quotationOtherFeesActions } = useQuotationOtherFeesSlice();

  const user = useSelector(state => state.user.user)
  const fetchedAll = useSelector(state => state.customer.fetchedAll)
  const customerAll = useSelector(state => state.customer.customerAll)
  const quotationDetail = useSelector(state => state.quotation.detail)
  const customerDetail = useSelector(state => state.customer.detail?.customer)

  const { notes } = useSelector(state => state.quotationNote)
  const { otherFeesList } = useSelector(state => state.quotationOtherFees)

  const otherFees = useSelector(state => state.quotationSection.otherFees)
  const sectionList = useSelector(state => state.quotationSection.sections) || []
  const sectionFetched = useSelector(state => state.quotationSection.fetched)
  const quotationDiscount = useSelector(state => state.quotationSection.discount)
  const quotationAmount = useSelector(state => state.quotationSection.quotationAmount)

  const productData = useSelector(state => state.product.allProduct) || [];
  const productFetched = useSelector(state => state.product.allFetched);

  const materialData = useSelector(state => state.material.allMaterial) || [];
  const materialFetched = useSelector(state => state.material.allFetched);

  const [searchText, setSearchText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selectedAction, setSelectedAction] = useState({});
  const [selectedView, setSelectedView] = useState(QUOTATION.VIEW.DETAILS)

  const [company, setCompany] = useState('');
  const [issueDate, setIssueDate] = useState('')
  const [reference, setReference] = useState('')
  const [payStatus, setPayStatus] = useState({})
  const [description, setDescription] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [validTillDate, setValidTillDate] = useState('')
  const [messageError, setMessageError] = useState(null)
  const [isInputChanged, setIsInputChanged] = useState(null)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [paymentTermNumber, setPaymentTermNumber] = useState(null);
  const [paymentTermBalance, setPaymentTermBalance] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [isShowCreateNewCustomer, setIsShowCreateNewCustomer] = useState(false);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);

  const [message, setMessage] = useState({});
  const [otherFeesCost, setOtherFeesCost] = useState(0);
  const [originalQuotationData, setOriginalQuotationData] = useState({});
  const [changedQuotationData, setChangedQuotationData] = useState(originalQuotationData || {});

  const onSuccess = () => {
    setMessageError({})
    setSelectedAction({})
    setIsDisableSubmit(true)
    setMessage({ success: MESSAGE.SUCCESS.CHANGE })
  }

  const onDeleteSuccess = () => {
    history.push('/quotation')
  }

  const onError = () => {
    setMessage({ failed: MESSAGE.ERROR.DEFAULT })
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (!fetchedAll) {
      dispatch(customerActions.getAllCustomerList())
    }
  }, [fetchedAll])

  useEffect(() => {
    if (!productFetched) {
      dispatch(productActions.getAllProductList())
    }
  }, [productFetched])

  useEffect(() => {
    if (!materialFetched) {
      dispatch(materialActions.getAllMaterialList())
    }
  }, [materialFetched])

  useEffect(() => {
    if (customerAll?.length > 0 && searchText.length === 0) {
      setSearchResults(customerAll)
    }
  }, [customerAll, searchText])

  useEffect(() => {
    const detailInfo = QUOTATION.TAB.find(item => item.tab === viewTab);
    if (detailInfo) {
      setSelectedView(detailInfo.value);
    } else {
      setSelectedView(QUOTATION.VIEW.INFORMATION_NOTE)
    }
  }, [viewTab])

  useEffect(() => {
    if (id) {
      dispatch(actions.getQuotationDetail(+id))
      dispatch(quotationNoteActions.getQuotationNotes({ quotation_id: +id }))
      dispatch(quotationSectionActions.getQuotationSectionList({ quotation_id: +id }))
      dispatch(quotationOtherFeesActions.getQuotationOtherFees({ quotation_id: +id }))
    }
  }, [id])

  useEffect(() => {
    if (!sectionFetched && id) {
      dispatch(quotationSectionActions.getQuotationSectionList({ quotation_id: +id }))
    }
  }, [sectionFetched, id])

  useEffect(() => {
    if (quotationAmount) {
      dispatch(quotationActions.setBottomBarData(quotationAmount))
    }
  }, [quotationAmount])

  useEffect(() => {
    if (otherFees) {
      const cost = otherFees.filter(fee => fee.type === 2).reduce((total, fee) => total + parseFloat(fee.amount), 0);
      const formatted = formatNumberWithTwoDecimalPlaces(cost)
      setOtherFeesCost(formatted)
    }
  }, [otherFees])

  useEffect(() => {
    if (otherFeesCost > 0) {
      dispatch(quotationActions.setTotalOtherFees(+otherFeesCost))
    }
  }, [otherFeesCost])

  useEffect(() => {
    if (quotationDiscount > 0) {
      dispatch(quotationActions.setDiscountAmount(+quotationDiscount))
    }
  }, [quotationDiscount])

  useEffect(() => {
    if (!isEmptyObject(selectedCustomer)) {
      dispatch(customerActions.getCustomer({ customer_id: +selectedCustomer.id }))
    } else {
      dispatch(customerActions.clearCustomerDetail())
    }
  }, [selectedCustomer])

  useEffect(() => {
    if (!isEmptyObject(quotationDetail?.quotation)) {
      const quotation = quotationDetail?.quotation
      const foundStatus = QUOTATION.STATUS[quotation?.payment_status]
      const originalData = {
        reference_no: quotation?.reference_no,
        payment_status: quotation?.payment_status,
        customer_id: +quotation?.customer?.id,
        issue_date: quotation?.issue_date,
        valid_till: quotation?.valid_till,
        description: quotation?.description,
        terms_of_payment_balance: quotation?.terms_of_payment_balance,
        terms_of_payment_confirmation: quotation?.terms_of_payment_confirmation,
      }
      setPayStatus(foundStatus)
      setCustomerName(quotation?.customer?.name)
      setReference(quotation?.reference_no)
      setDescription(quotation?.description)
      setIssueDate(formatStringToDate(quotation?.issue_date))
      setPaymentTermBalance(quotation?.terms_of_payment_balance)
      setValidTillDate(formatStringToDate(quotation?.valid_till))
      setPaymentTermNumber(quotation?.terms_of_payment_confirmation)
      setOriginalQuotationData(originalData)
    }
  }, [quotationDetail?.quotation])

  useEffect(() => {
    if (!isEmptyObject(quotationDetail?.quotation)) {
      const tempQuotation = {
        reference_no: reference,
        payment_status: payStatus?.value,
        customer_id: +selectedCustomer?.id || +quotationDetail?.quotation?.customer?.id,
        valid_till: dayjs(validTillDate).format('DD/MM/YYYY'),
        issue_date: dayjs(issueDate).format('DD/MM/YYYY'),
        terms_of_payment_confirmation: paymentTermNumber,
        terms_of_payment_balance: paymentTermBalance,
        description: description,
      }
      setChangedQuotationData(tempQuotation)
    }
  }, [quotationDetail?.quotation, selectedCustomer, paymentTermNumber, paymentTermBalance, reference, payStatus, issueDate, validTillDate, description])

  useEffect(() => {
    if (searchText?.length === 0) {
      dispatch(customerActions.clearSearchedData());
    } else {
      setCustomerName('')
    }
  }, [searchText])

  useEffect(() => {
    if (!isEmptyObject(selectedAction) && selectedAction.action === QUOTATION.SAVE_AS_DRAFT) {
      handleSaveQuotationChange()
    }
  }, [selectedAction])

  useEffect(() => {
    setIsDisableSubmit(false)
    setSelectedAction({})
  }, [isInputChanged])

  useEffect(() => {
    if (!isEmptyObject(message)) {
      const timer = setTimeout(() => setMessage({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [message])

  useEffect(() => {
    if (!isEmptyObject(messageError)) {
      const timer = setTimeout(() => setMessageError({}), 3000)
      return () => clearTimeout(timer);
    }
  }, [messageError])

  useEffect(() => {
    if (+paymentTermNumber > 0) {
      setPaymentTermBalance(100 - +paymentTermNumber)
    }
  }, [paymentTermNumber])

  const handleSelectView = (tab) => {
    history.push(`/quotation/${id}?tab=${tab}`)
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

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      reference: setReference,
      payStatus: setPayStatus,
      description: setDescription,
      issue_date: setIssueDate,
      valid_till: setValidTillDate,
      company_name: setCompany,
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
    if (!isEmptyObject(message)) {
    }
    setter(value);
    setMessageError(message);
    setIsInputChanged(!isInputChanged)
  }

  const handleInputDateFilter = (date, field) => {
    if (field === 'issueDate') {
      setIssueDate(date);
    } else {
      setValidTillDate(date);
    }
    setIsInputChanged(!isInputChanged);
  }

  const handleSaveQuotationChange = () => {
    if (isDisableSubmit) return;
    const data = {
      id: +id,
      description,
      quotation_id: Number(id),
      reference_no: reference || '',
      payment_status: payStatus?.value,
      valid_till: dayjs(validTillDate).format('YYYY/MM/DD') || '',
      issue_date: dayjs(issueDate).format('YYYY/MM/DD') || '',
      created_at: quotationDetail?.quotation?.created_at || '',
      terms_of_payment_confirmation: +paymentTermNumber,
      terms_of_payment_balance: paymentTermBalance,
      customer_id: selectedCustomer?.id || quotationDetail?.quotation?.customer_id,
      name: selectedCustomer?.name || quotationDetail?.quotation?.customer?.name,
      customer: !isEmptyObject(customerDetail) ?
        customerDetail :
        quotationDetail.quotation?.customer,
      type: ACTIVITY.LOGS.TYPE_VALUE.QUOTATION,
      action_type: ACTIVITY.LOGS.ACTION_VALUE.UPDATE,
      username: user.username,
      now: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    const errors = validateEditQuotation(data);
    if (!isSimilarObject(originalQuotationData, changedQuotationData)) {
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(actions.updateQuotation({ ...data, onSuccess, onError }))
        setIsDisableSubmit(true);
      }
    } else {
      setMessage({
        failed: MESSAGE.ERROR.INFO_NO_CHANGE,
      })
    }
  }

  const handleDelete = () => {
    if (isDisableSubmit || !id) return;
    dispatch(actions.multiDeleteQuotation({ quotation_id: [+id], onDeleteSuccess, onError }));
    setIsDisableSubmit(true)
  }

  const detailData = {
    id,
    company,
    payStatus,
    issueDate,
    reference,
    searchText,
    description,
    isSearching,
    customerName,
    validTillDate,
    searchResults,
    isInputChanged,
    selectedCustomer,
    quotationDetail,
    paymentTermNumber,
    paymentTermBalance,
    customerDetail: !isEmptyObject(customerDetail) ? customerDetail : quotationDetail.quotation?.customer,
    isShowCreateNewCustomer,
  }

  const renderView = () => {
    switch (selectedView) {
      case QUOTATION.VIEW.DETAILS:
        return (
          <QuotationDetailTab
            data={detailData}
            messageError={messageError}
            setPayStatus={setPayStatus}
            setSearchText={setSearchText}
            setCustomerName={setCustomerName}
            handleChange={handleInputChange}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setSelectedCustomer={setSelectedCustomer}
            handleInputDateFilter={handleInputDateFilter}
            handleTypeSearchChange={handleTypeSearchChange}
            setIsShowCreateNewCustomer={setIsShowCreateNewCustomer}
          />
        );
      case QUOTATION.VIEW.INFORMATION_NOTE:
        return (
          <QuotationNote
            id={id}
            notes={notes}
            message={message}
            setMessage={setMessage}
            selectedAction={selectedAction?.action}
            resetAction={() => setSelectedAction({})}
          />
        );
      case QUOTATION.VIEW.QUOTATION:
        return <TabQuotation
          id={id}
          setMessage={setMessage}
          sections={sectionList}
          productData={productData}
          materialData={materialData}
        />;
      case QUOTATION.VIEW.OTHER_FEES:
        return <QuotationOtherFees
          id={id}
          otherFeesList={otherFeesList}
          message={message}
          setMessage={setMessage}
          selectedAction={selectedAction?.action}
          resetAction={() => setSelectedAction({})}
        />
      default:
        return null;
    }
  }
  return (
    <div className="quotationDetail">
      {!isEmptyObject(message) &&
        <div className="quotationDetail__message">
          <ActionMessageForm
            successMessage={message.success}
            failedMessage={message.failed}
          />
        </div>
      }
      <div className="quotationDetail__header">
        <div className="quotationDetail__header--title">
          {quotationDetail.quotation?.reference_no || ''}
        </div>
        <div className="quotationDetail__header--buttons">
          <div className="quotationDetail__header--button" onClick={() => setIsShowConfirmDeleteModal(true)}>
            <img src="/icons/brown-trash.svg" alt="delete-icon" />
            <span>Delete</span>
          </div>
          <div className="quotationDetail__header--select">
            <ActionQuotationForm
              data={QUOTATION.ACTIONS}
              selectedAction={selectedAction}
              setSelectedAction={setSelectedAction}
            />
          </div>
        </div>
      </div>
      <div className="detailRoute">
        {QUOTATION.TAB.map(url => (
          <div
            key={url.value}
            className={`detailRoute__url${viewTab === url.tab ? ' detailRoute__url--active' : ''}`}
            onClick={() => handleSelectView(url.tab)}
          >
            {url.label}
          </div>
        ))}
      </div>
      <div className="quotationDetail__body">
        {renderView()}
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteItemModal
          deleteTitle="quotation"
          isShow={isShowConfirmDeleteModal}
          onClickDelete={handleDelete}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      )}
    </div>
  )
}

export default QuotationDetail
