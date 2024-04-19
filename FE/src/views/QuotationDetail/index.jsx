import React, { useEffect, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert';
import { useScrapSlice } from 'src/slices/scrap';
import { useProductSlice } from 'src/slices/product'
import { useCustomerSlice } from 'src/slices/customer'
import { quotationActions, useQuotationSlice } from 'src/slices/quotation'
import { useMaterialSlice } from 'src/slices/material';
import { validateEditQuotation, validatePermission } from 'src/helper/validation'
import { useQuotationNoteSlice } from 'src/slices/quotationNote';
import { useTermsConditionsSlice } from 'src/slices/termsConditions';
import { useQuotationSectionSlice } from 'src/slices/quotationSection';
import { useQuotationOtherFeesSlice } from 'src/slices/quotationOtherFees';
import { ACTIONS, ACTIVITY, ALERT, MESSAGE, PDF_TYPE, PERMISSION, QUOTATION, ROLES } from 'src/constants/config'
import { formatStringToDate, isEmptyObject, isSimilarObject, normalizeString, sendEmail, validateDescription, validatePaymentTerm } from 'src/helper/helper'

import TabQuotation from 'src/components/TabQuotation'
import QuotationNote from 'src/components/QuotationNote'
import QuotationDetailTab from 'src/components/QuotationDetailTab'
import ConfirmDeleteItemModal from 'src/components/ConfirmDeleteItemModal'
import QuotationOtherFees from 'src/components/QuotationOtherFees';
import TermsAndConditions from 'src/components/TermsAndConditions';
import ConfirmSendModal from 'src/components/QuotationDetailTab/ConfirmSendModal';
import ConfirmApprovalModal from 'src/components/QuotationDetailTab/ConfirmApprovalModal';
import ConfirmRejectModal from 'src/components/QuotationDetailTab/ConfirmRejectModal';
import ConfirmCancelModal from 'src/components/QuotationDetailTab/ConfirmCancelModal';
import ActionInvoiceForm from 'src/components/ActionInvoiceForm';

const QuotationDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')

  const { actions } = useQuotationSlice();
  const { actions: scrapActions } = useScrapSlice();
  const { actions: productActions } = useProductSlice();
  const { actions: materialActions } = useMaterialSlice();
  const { actions: customerActions } = useCustomerSlice();
  const { actions: quotationNoteActions } = useQuotationNoteSlice();
  const { actions: termsConditionsActions } = useTermsConditionsSlice();
  const { actions: quotationSectionActions } = useQuotationSectionSlice();
  const { actions: quotationOtherFeesActions } = useQuotationOtherFeesSlice();

  const user = useSelector(state => state.user.user)
  const permissionData = useSelector(state => state.user.permissionData)

  const customerAll = useSelector(state => state.customer.customerAll)
  const quotationDetail = useSelector(state => state.quotation.detail)
  const currentUser = useSelector(state => state.user.user)
  const customerDetail = useSelector(state => state.customer.detail)
  const { notes } = useSelector(state => state.quotationNote)
  const { otherFeesList } = useSelector(state => state.quotationOtherFees)
  const { termsConditions } = useSelector(state => state.termsConditions)

  const sectionList = useSelector(state => state.quotationSection.sections) || []
  const sectionFetched = useSelector(state => state.quotationSection.fetched)
  const productData = useSelector(state => state.product.allProduct) || [];

  const materialData = useSelector(state => state.material.allMaterial) || [];
  const materialFetched = useSelector(state => state.material.allFetched);

  const { quotation } = quotationDetail;

  const currentQuotation = useMemo(() => {
    return {
      customer_id: +quotation?.customer_id,
      id: +quotation?.id,
      reference_no: quotation?.reference_no,
      name: quotation?.customer?.name,
    };
  }, [quotation]);

  const [searchText, setSearchText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selectedAction, setSelectedAction] = useState({});
  const [selectedView, setSelectedView] = useState(QUOTATION.VIEW.DETAILS)

  const [company, setCompany] = useState('');
  const [issueDate, setIssueDate] = useState('')
  const [reference, setReference] = useState('')
  const [description, setDescription] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [validTillDate, setValidTillDate] = useState('')
  const [messageError, setMessageError] = useState(null)
  const [isInputChanged, setIsInputChanged] = useState(null)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [paymentTermNumber, setPaymentTermNumber] = useState(null);
  const [paymentTermBalance, setPaymentTermBalance] = useState(null);
  const [rejectedReason, setRejectedReason] = useState('');
  const [quotationDescription, setQuotationDescription] = useState('');

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [isShowCreateNewCustomer, setIsShowCreateNewCustomer] = useState(false);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);
  const [isShowConfirmSendModal, setIsShowConfirmSendModal] = useState(false);
  const [isShowConfirmRejectModal, setIsShowConfirmRejectModal] = useState(false);
  const [isShowConfirmApproveModal, setIsShowConfirmApproveModal] = useState(false);
  const [isShowConfirmCancelModal, setIsShowConfirmCancelModal] = useState(false);

  const [originalQuotationData, setOriginalQuotationData] = useState({});
  const [changedQuotationData, setChangedQuotationData] = useState(originalQuotationData || {});

  const onSuccess = () => {
    setMessageError({})
    setSelectedAction({})
    setIsDisableSubmit(false)
  }

  const onSendSuccess = (url) => {
    setSelectedAction({})
    const data = `To view or download attachment, click on the link below.
    ${url}`;
    sendEmail(data)
  }

  const onDownloadSuccess = () => {
    setSelectedAction({})
  }

  const onDeleteSuccess = () => {
    history.push('/quotation')
  }

  const onError = () => {
    setIsDisableSubmit(false)
    setSelectedAction({})
  }

  useEffect(() => {
    if (!materialFetched) {
      dispatch(materialActions.getAllMaterialList())
    }
  }, [materialFetched])

  useEffect(() => {
    !isShowConfirmSendModal && selectedAction.action === QUOTATION.SEND_APPROVAL && setSelectedAction({})
  }, [isShowConfirmSendModal, selectedAction])

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
    }
    return () => {
      dispatch(quotationActions.resetBottomBarData())
      dispatch(quotationActions.clearQuotationDetail())
      dispatch(quotationSectionActions.resetQuotationSectionData())
      dispatch(quotationNoteActions.resetFetchedList())
      dispatch(termsConditionsActions.resetFetchedList())
      dispatch(quotationOtherFeesActions.resetFetchedList())
    }
  }, [id])

  useEffect(() => {
    if (!sectionFetched && id && sectionList.length > 0) {
      dispatch(quotationSectionActions.getQuotationSectionList({ quotation_id: +id }))
    }
  }, [sectionFetched, id, sectionList])

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
      const originalData = {
        reference_no: quotation?.reference_no,
        status: quotation?.status,
        customer_id: +quotation?.customer?.id,
        issue_date: quotation?.issue_date,
        valid_till: quotation?.valid_till,
        description: quotation?.description,
        terms_of_payment_balance: quotation?.terms_of_payment_balance,
        terms_of_payment_confirmation: quotation?.terms_of_payment_confirmation,
      }
      setRejectedReason(quotation?.reject_reason)
      setCustomerName(quotation?.customer?.name)
      setReference(quotation?.reference_no)
      setDescription(quotation?.description)
      setQuotationDescription(quotation?.quotation_description)
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
        status: +quotationDetail.quotation?.status,
        customer_id: +selectedCustomer?.id || +quotationDetail?.quotation?.customer?.id,
        valid_till: dayjs(validTillDate).format('DD/MM/YYYY'),
        issue_date: dayjs(issueDate).format('DD/MM/YYYY'),
        terms_of_payment_confirmation: paymentTermNumber,
        terms_of_payment_balance: paymentTermBalance,
        description: description,
      }
      setChangedQuotationData(tempQuotation)
    }
  }, [quotationDetail?.quotation, selectedCustomer, paymentTermNumber, paymentTermBalance, reference, issueDate, validTillDate, description])

  useEffect(() => {
    if (searchText?.length === 0) {
      dispatch(customerActions.clearSearchedData());
    } else {
      setCustomerName('')
    }
  }, [searchText])

  useEffect(() => {
    setIsDisableSubmit(false)
    setSelectedAction({})
  }, [isInputChanged])

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowConfirmDeleteModal(false);
        setIsShowConfirmApproveModal(false)
        setIsShowConfirmRejectModal(false)
        setIsShowConfirmSendModal(false)
        setIsShowConfirmCancelModal(false)
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      reference: setReference,
      description: setDescription,
      quotation_description: setQuotationDescription,
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
      case QUOTATION.KEYS.QUOTATION_DESCRIPTION:
        if (validateDescription(value)) {
          message.quotation_description = QUOTATION.MESSAGE_ERROR.DESCRIPTION;
        }
        break;
      default:
        break;
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
      status: +quotationDetail.quotation?.status,
      quotation_description: quotationDescription,
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
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        isHovered: false,
        description: MESSAGE.ERROR.INFO_NO_CHANGE,
      }))
      setSelectedAction({})
    }
  }

  const handleClickDelete = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.DELETE)
    isAllowed ? setIsShowConfirmDeleteModal(true) : dispatchAlertWithPermissionDenied();
  }

  const handleDelete = () => {
    if (isDisableSubmit || !id) return;
    dispatch(actions.multiDeleteQuotation({ quotation_id: [+id], onDeleteSuccess, onError }));
    setIsDisableSubmit(true)
  }

  const handleApproveQuotation = (value) => {
    switch (value.action) {
      case QUOTATION.REJECTED:
        setIsShowConfirmRejectModal(true)
        break;
      case QUOTATION.APPROVED:
        setIsShowConfirmApproveModal(true)
        break;
      case QUOTATION.CANCELED:
        setIsShowConfirmCancelModal(true)
        break;
      default: return null;
    }
  }

  const handleDownloadPDF = () => {
    if (id) {
      dispatch(quotationActions.downloadPDF({
        quotation_ids: [+id],
        onDownloadSuccess,
        onError,
      }));
    }
  };

  const handleDownloadCSV = () => {
    if (id) {
      dispatch(actions.getExportQuotationCSV({
        quotation_ids: [+id],
        onDownloadSuccess,
        onError,
      }));
    }
  };

  const handleSaveAsDraft = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE);
    if (isAllowed) {
      viewTab === QUOTATION.TAB_LABEL.DETAIL && handleSaveQuotationChange();
    } else {
      dispatchAlertWithPermissionDenied();
    }
  };

  const handleSendApproval = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE);
    isAllowed ? setIsShowConfirmSendModal(true) : dispatchAlertWithPermissionDenied();
  };

  const handleSendEmail = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.SEND);
    if (isAllowed) {
      id && dispatch(quotationActions.handleSendEmail({
        quotation_ids: [+id],
        send_mail: PERMISSION.ALLOW_VALUE,
        onSendSuccess,
        onError,
      }));
    } else {
      dispatchAlertWithPermissionDenied();
    }
  };

  const handleCreateInvoice = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.CREATE);
    if (isAllowed) {
      dispatch(quotationActions.getQuotationDetail(+id))
        && dispatch(quotationActions.handleSetSelectedQuotation(currentQuotation))
        && history.push('/invoice/create-invoice');
    } else {
      dispatchAlertWithPermissionDenied();
    }
  };

  const handleCreateClaim = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.CREATE);
    if (isAllowed) {
      if (quotation.claim_use === QUOTATION.CLAIM_UN_USED) {
        dispatch(quotationActions.getQuotationDetail(+id))
          && dispatch(quotationActions.handleSetSelectedQuotation(currentQuotation))
          && history.push('/claims/create');
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          isHovered: false,
          description: QUOTATION.MESSAGE_ERROR.CLAIM_USED,
        }));
      }
    } else {
      dispatchAlertWithPermissionDenied();
    }
  };

  const handleSelectAction = (item) => {
    setSelectedAction(item);

    if (viewTab === 'quotation') {
      setSelectedAction({});
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.INFO_NO_CHANGE,
      }));
      return;
    }

    if (item?.actionValue === ACTIONS.VALUE.DOWNLOAD) {
      item?.label === PDF_TYPE ? handleDownloadPDF() : handleDownloadCSV();
      return;
    }

    switch (item?.action) {
      case QUOTATION.SAVE_AS_DRAFT:
        handleSaveAsDraft();
        break;
      case QUOTATION.SEND_APPROVAL:
        handleSendApproval();
        break;
      case QUOTATION.DOWNLOAD_PDF:
        handleDownloadPDF()
        break;
      case QUOTATION.SEND_EMAIL:
        handleSendEmail();
        break;
      case QUOTATION.CREATE_INVOICE:
        handleCreateInvoice();
        break;
      case QUOTATION.CREATE_CLAIM:
        handleCreateClaim();
        break;
      default:
        return null;
    }
  };

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const actionsData = useMemo(() => {
    const status = quotationDetail.quotation?.status;
    switch (status) {
      case QUOTATION.STATUS_VALUE.DRAFT:
      case QUOTATION.STATUS_VALUE.REJECTED:
        return QUOTATION.DRAFT_ACTIONS;
      case QUOTATION.STATUS_VALUE.PENDING:
      case QUOTATION.STATUS_VALUE.CANCELED:
        return QUOTATION.PENDING_ACTIONS;
      case QUOTATION.STATUS_VALUE.APPROVED:
        return QUOTATION.APPROVED_ACTIONS;
      default:
        return null;
    }
  }, [quotationDetail.quotation?.status]);

  const quotationStatus = quotationDetail.quotation?.status;
  const { DRAFT, REJECTED } = QUOTATION.STATUS_VALUE;

  const [isEditable, status] = useMemo(() => {
    const editable = (+quotationStatus === DRAFT || +quotationStatus === REJECTED);
    const statusLabel = QUOTATION.STATUS[quotationStatus];
    return [editable, statusLabel];
  }, [quotationStatus]);

  const detailData = {
    id,
    company,
    rejectedReason,
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
    quotationDescription,
  }

  const renderView = () => {
    switch (selectedView) {
      case QUOTATION.VIEW.DETAILS:
        return (
          <QuotationDetailTab
            data={detailData}
            status={status}
            isEditable={isEditable}
            messageError={messageError}
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
            viewTab={viewTab}
            isEditable={isEditable}
            originalNoteList={notes}
            selectedAction={selectedAction?.action}
            resetAction={() => setSelectedAction({})}
          />
        );
      case QUOTATION.VIEW.QUOTATION:
        return <TabQuotation
          id={id}
          sections={sectionList}
          isEditable={isEditable}
          productData={productData}
          materialData={materialData}
        />;
      case QUOTATION.VIEW.OTHER_FEES:
        return <QuotationOtherFees
          id={id}
          viewTab={viewTab}
          isEditable={isEditable}
          otherFeesList={otherFeesList}
          selectedAction={selectedAction?.action}
          resetAction={() => setSelectedAction({})}
        />
      case QUOTATION.VIEW.TERMS_CONDITIONS:
        return <TermsAndConditions
          id={id}
          viewTab={viewTab}
          isEditable={isEditable}
          termsConditions={termsConditions}
          selectedAction={selectedAction?.action}
          resetAction={() => setSelectedAction({})}
        />
      default:
        return null;
    }
  }

  const renderButtons = (button, index) => {
    const isShowButton = quotationDetail.quotation?.status === button.status;
    return (
      isShowButton &&
      <button
        key={index}
        className={`quotationDetail__btn quotationDetail__btn--${button.action}`}
        onClick={() => handleApproveQuotation(button)}
      >
        <img src={button.icon} alt="button" />
        <span>{button.label}</span>
      </button>
    )
  }

  const isShowActionButton = useMemo(() => {
    return (
      quotationDetail.quotation?.status === QUOTATION.STATUS_VALUE.DRAFT ||
      quotationDetail.quotation?.status === QUOTATION.STATUS_VALUE.REJECTED
    );
  }, [quotationDetail.quotation?.status]);

  return (
    <div className="quotationDetail">
      <div className="quotationDetail__header">
        <div className="quotationDetail__header--title">
          {quotationDetail.quotation?.reference_no || ''}
        </div>
        <div className="quotationDetail__header--buttons">
          {currentUser.role_id === ROLES.ADMIN_ID &&
            <div className="quotationDetail__adminBtn">
              {QUOTATION.BUTTONS.map((button, index) => renderButtons(button, index))}
            </div>
          }
          {isShowActionButton &&
            <div
              className="quotationDetail__header--button"
              onClick={handleClickDelete}
            >
              <img src="/icons/brown-trash.svg" alt="delete-icon" />
              <span>Delete</span>
            </div>
          }
          <div className="quotationDetail__header--select">
            <ActionInvoiceForm
              data={actionsData}
              selectedAction={selectedAction}
              setSelectedAction={handleSelectAction}
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
      {isShowConfirmSendModal &&
        <ConfirmSendModal
          id={id}
          closeModal={() => setIsShowConfirmSendModal(false)}
        />
      }
      {isShowConfirmApproveModal &&
        <ConfirmApprovalModal
          id={id}
          closeModal={() => setIsShowConfirmApproveModal(false)}
        />
      }
      {isShowConfirmRejectModal &&
        <ConfirmRejectModal
          id={id}
          closeModal={() => setIsShowConfirmRejectModal(false)}
        />
      }
      {isShowConfirmCancelModal &&
        <ConfirmCancelModal
          id={id}
          closeModal={() => setIsShowConfirmCancelModal(false)}
        />
      }
    </div>
  )
}

export default QuotationDetail
