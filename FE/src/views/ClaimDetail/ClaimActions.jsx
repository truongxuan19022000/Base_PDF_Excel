import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import PreviousClaimAmountModal from './PreviousClaimAmountModal';
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal';
import ActionInvoiceForm from 'src/components/ActionInvoiceForm';
import HeadlineBar from 'src/components/HeadlineBar';
import GSTModal from 'src/components/GSTModal';
import EditClaimModal from './EditClaimModal';
import DetailForm from './DetailForm';
import ClaimView from './ClaimView';

import { formatDate, formatStringToDate, isEmptyObject, normalizeString, parseLocaleStringToNumber, sendEmail } from 'src/helper/helper';
import { ACTIONS, ACTIVITY, ALERT, CLAIM, CLAIM_TABS, MESSAGE, PDF_TYPE, PERMISSION, QUOTATION } from 'src/constants/config';
import { validateCreateClaim, validateCreateClaimCopy, validatePermission, validateUpdateClaimDetail, } from 'src/helper/validation';
import { useQuotationSlice } from 'src/slices/quotation';
import { useClaimsSlice } from 'src/slices/claims';
import { alertActions } from 'src/slices/alert';

const ClaimActions = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { id } = useParams()

  const permissionData = useSelector(state => state.user.permissionData)

  const [claimNo, setClaimNo] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [previousClaimNo, setPreviousClaimNo] = useState('');
  const [selectedAction, setSelectedAction] = useState({});
  const [selectedQuotation, setSelectedQuotation] = useState({});
  const [originalReferences, setOriginalReferences] = useState([]);
  const [lessPaymentReceived, setLessPaymentReceived] = useState('');

  const [isCopied, setIsCopied] = useState(false);
  const [messageError, setMessageError] = useState({});
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  const [logsInfo, setLogsInfo] = useState({});
  const [quotationInfo, setQuotationInfo] = useState({});
  const [isShowEditClaimModal, setIsShowEditClaimModal] = useState(false);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);
  const [isShowPreviousAmountModal, setIsShowPreviousAmountModal] = useState(false);

  const [gstValue, setGstValue] = useState('');
  const [isShowGSTModal, setIsShowGSTModal] = useState(false);

  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')

  const { actions: quotationActions } = useQuotationSlice()
  const { actions: claimActions } = useClaimsSlice()

  const currentUser = useSelector(state => state.user.user)
  const {
    isSearching,
    approvedList,
    detail: quotationDetail,
    selectedQuotationData,
    fetchedApprovalList,
  } = useSelector(state => state.quotation)

  const {
    copiedClaim,
    claimDetail,
    selectedCopyClaim,
    claimTabInfo,
    isLoading
  } = useSelector(state => state.claims)

  const searchReferenceResult = useMemo(() => {
    if (searchText) {
      return originalReferences.filter(item =>
        normalizeString(item.reference_no).includes(normalizeString(searchText))
      )
    }
    return originalReferences
  }, [searchText, originalReferences])

  const isEditMode = useMemo(() => {
    return !!id
  }, [id])

  const onSuccess = () => {
    setIsDisableSubmit(false)
    setMessageError({})
    setSelectedAction({})
  }

  const onCreateClaimSuccess = (newId) => {
    setIsDisableSubmit(false)
    !isEditMode && setTimeout(() => {
      history.push(`/claims/${newId}?tab=claim`)
    }, 1000);
  }

  const onDeleteSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setSelectedAction({})
    setTimeout(() => {
      history.push('/claims')
    }, 1000);
  }

  const onDownloadSuccess = () => {
    setSelectedAction({})
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
    setSelectedAction({})
  }

  useEffect(() => {
    if (!fetchedApprovalList && !isEditMode && isEmptyObject(selectedCopyClaim)) {
      dispatch(quotationActions.getApprovedList())
    }
  }, [fetchedApprovalList, isEditMode, selectedCopyClaim])

  useEffect(() => {
    if (approvedList.length > 0) {
      const unusedQuotationList = approvedList.filter(item =>
        item.claim_use === QUOTATION.CLAIM_UN_USED
      )
      setOriginalReferences(unusedQuotationList)
    }
  }, [approvedList])

  useEffect(() => {
    return () => {
      dispatch(claimActions.clearDetailTabInfo())
      dispatch(quotationActions.clearQuotationDetail())
      dispatch(quotationActions.clearSelectedQuotationData())
    }
  }, [])

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(claimActions.getClaimDetail({ id, getClaimDetailError }))
      dispatch(claimActions.getClaimTabInfo({ id, getClaimDetailError }))
    }
  }, [isEditMode, id])

  useEffect(() => {
    if (!isEmptyObject(selectedCopyClaim) && !isEditMode) {
      setPreviousClaimNo(selectedCopyClaim?.claim_no)
      setReferenceNo(selectedCopyClaim?.reference_no)
    }
  }, [selectedCopyClaim, isEditMode])

  useEffect(() => {
    if (!isEmptyObject(quotationDetail)) {
      const { quotation } = quotationDetail;
      const selectedData = {
        ...quotation?.customer,
        description: quotation?.description,
      }
      setQuotationInfo(selectedData)
    }
  }, [quotationDetail])

  useEffect(() => {
    !isEmptyObject(selectedQuotationData) && setReferenceNo(selectedQuotationData.reference_no)
  }, [selectedQuotationData])

  useEffect(() => {
    if (!isEmptyObject(copiedClaim)) {
      const { claim } = copiedClaim;
      setQuotationInfo(claim)
    }
  }, [copiedClaim])

  useEffect(() => {
    claimTabInfo.tax && setGstValue(claimTabInfo.tax)
  }, [claimTabInfo.tax])

  useEffect(() => {
    if (isEditMode && Object.values(claimDetail).length > 0) {
      const { type } = claimDetail.activities?.[0] || {};
      const receivedDate = claimDetail.claim?.payment_received_date;
      const issueDate = claimDetail.claim?.issue_date;

      setLogsInfo({ type, username: currentUser?.username })
      setQuotationInfo(claimDetail?.claim)
      setClaimNo(claimDetail.claim?.claim_no)
      setReferenceNo(claimDetail?.claim?.reference_no)
      setPreviousClaimNo(claimDetail?.claim?.previous_claim_no)
      setIsCopied(claimDetail.claim?.is_copied !== CLAIM.IS_NOT_COPIED)
      setLessPaymentReceived(claimDetail.claim?.actual_paid_amount)

      if (issueDate) {
        setIssueDate(formatStringToDate(issueDate))
      }

      if (receivedDate) {
        setReceivedDate(formatStringToDate(receivedDate));
      }
    }
  }, [isEditMode, claimDetail, currentUser])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowGSTModal(false);
        setIsShowEditClaimModal(false);
        setIsShowConfirmDeleteModal(false);
        setIsShowPreviousAmountModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getClaimDetailError = () => {
    history.goBack()
  }

  const handleDateChangeRaw = (e) => {
    e.preventDefault();
  }

  const handleSelectDate = (field, date) => {
    if (isDisableSubmit) return;
    const fieldSetters = {
      issue_date: setIssueDate,
      received_date: setReceivedDate,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(date);
      setMessageError({})
    }
  }

  const handleSelectedReference = useCallback((item) => {
    if (item) {
      setSelectedQuotation(item)
      dispatch(quotationActions.getQuotationDetail(+item.id))
    }
  }, [])

  const handleCreateClaim = () => {
    if (isDisableSubmit) return;
    const data = {
      claim_no: claimNo,
      quotation_id: selectedQuotation.id || selectedQuotationData?.id,
      issue_date: issueDate && dayjs(issueDate).format('YYYY/MM/DD'),
    }
    const errors = validateCreateClaim(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(claimActions.createClaim({
        ...data,
        onCreateClaimSuccess,
        onError,
      }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  const handleCreateClaimCopy = () => {
    if (isDisableSubmit) return;
    const data = {
      claim_no: claimNo,
      claim_id: selectedCopyClaim.claim_id,
      quotation_id: selectedCopyClaim.quotation_id,
      previous_claim_no: selectedCopyClaim.claim_no,
      issue_date: issueDate && dayjs(issueDate).format('YYYY/MM/DD'),
    }
    const errors = validateCreateClaimCopy(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(claimActions.createClaimCopy({
        ...data,
        onCreateClaimSuccess,
        onError,
      }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }

  const handleClickCreate = () => {
    !isEmptyObject(selectedCopyClaim) ? handleCreateClaimCopy() : handleCreateClaim();
  }

  const handleSelectView = (tab) => {
    history.push(`/claims/${id}?tab=${tab}`)
  }

  const handleClickDelete = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (isCopied) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: CLAIM.MESSAGE.IS_COPIED,
        }))
      } else {
        setIsShowConfirmDeleteModal(true)
      };
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDelete = () => {
    if (!id) return;
    dispatch(claimActions.deleteClaim({
      data: { claim_id: +id },
      onDeleteSuccess,
      onError,
    }))
    setIsShowConfirmDeleteModal(false)
  };

  const isInfoChange = () => {
    const { claim } = claimDetail;
    const formattedInitialIssueDate = formatDate(claim.issue_date);
    const formattedInitialReceivedDate = formatDate(claim.payment_received_date);

    return (
      claimNo !== claim.claim_no ||
      parseLocaleStringToNumber(lessPaymentReceived) !== parseLocaleStringToNumber(claim.less_payment_received) ||
      (issueDate !== '' && (dayjs(issueDate).format('YYYY-MM-DD') !== dayjs(formattedInitialIssueDate).format('YYYY-MM-DD'))) ||
      (receivedDate !== '' && (dayjs(receivedDate).format('YYYY-MM-DD') !== dayjs(formattedInitialReceivedDate).format('YYYY-MM-DD')))
    );
  };

  const preparedData = () => {
    const { claim } = claimDetail;
    const data = {
      claim_no: claimNo,
      claim_id: claim?.claim_id,
      quotation_id: claim?.quotation_id,
      issue_date: issueDate && dayjs(issueDate).format('YYYY/MM/DD'),
      logsInfo: {
        ...logsInfo,
        action_type: ACTIVITY.LOGS.ACTION_VALUE.UPDATE,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }
    };

    if (receivedDate) {
      data.payment_received_date = receivedDate && dayjs(receivedDate).format('YYYY/MM/DD');
    }

    if (lessPaymentReceived) {
      data.actual_paid_amount = parseLocaleStringToNumber(lessPaymentReceived);
    }

    return data;
  };

  const handleSaveChange = () => {
    if (isDisableSubmit) return;

    if (isInfoChange()) {
      const data = preparedData();
      const errors = validateUpdateClaimDetail(data);

      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(claimActions.updateClaimDetail({
          ...data,
          onSuccess,
          onError,
        }));
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
  };


  const onSendSuccess = (url) => {
    const data = `To view or download attachment, click on the link below.
    ${url}`;
    sendEmail(data)
  }

  const downloadPDF = () => {
    dispatch(claimActions.downloadClaimPDF({
      claim_id: +id,
      logsInfo: getLogsInfo(),
      onDownloadSuccess,
      onError,
    }));
  };

  const downloadCSV = () => {
    dispatch(claimActions.getExportClaimsCSV({
      claim_ids: [+id],
      logsInfo: getLogsInfo(),
      onDownloadSuccess,
      onError,
    }));
  };

  const handleSaveAsDraft = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.UPDATE);
    if (isAllowed) {
      if (viewTab === CLAIM_TABS.DETAIL.key) {
        handleSaveChange();
      } else if (viewTab === CLAIM_TABS.CLAIM.key) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          description: MESSAGE.ERROR.INFO_NO_CHANGE,
        }));
        setSelectedAction({});
      }
    } else {
      dispatchAlertWithPermissionDenied();
    }
  };

  const handleSend = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.SEND);

    if (isAllowed) {
      dispatch(claimActions.sendClaimPDF({
        claim_id: +id,
        send_mail: PERMISSION.ALLOW_VALUE,
        logsInfo: getLogsInfo(),
        onSendSuccess,
        onError,
      }));
    } else {
      dispatchAlertWithPermissionDenied();
    }
  };

  const getLogsInfo = () => ({
    ...logsInfo,
    action_type: ACTIVITY.LOGS.ACTION_VALUE.DOWNLOAD,
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  });

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Denied',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleSelectDetailAction = (item) => {
    setSelectedAction(item);
    if (item?.actionValue === ACTIONS.VALUE.DOWNLOAD && id) {
      item?.label === PDF_TYPE ? downloadPDF() : downloadCSV();
    } else if (item?.value === ACTIONS.VALUE.SAVE_AS_DRAFT) {
      handleSaveAsDraft();
    } else if (item?.value === ACTIONS.VALUE.SEND) {
      handleSend();
    }
  };

  const detailData = {
    isEditMode,
    claimNo,
    isCopied,
    issueDate,
    searchText,
    referenceNo,
    isSearching,
    receivedDate,
    messageError,
    quotationInfo,
    previousClaimNo,
    selectedQuotation,
    lessPaymentReceived,
    searchReferenceResult,
    claimLogs: claimDetail.activities,
  }

  const createData = {
    claimNo,
    issueDate,
    searchText,
    referenceNo,
    messageError,
    quotationInfo,
    previousClaimNo,
    selectedQuotation,
    searchReferenceResult,
    isSearching: isSearching || isLoading,
  }

  const previousClaimReceivedData = useMemo(() => {
    const prevList = claimTabInfo.claim_previous?.map(item => item.actual_paid_amount).reverse()
    return prevList
  }, [claimTabInfo.claim_previous]);

  const selectedTab = () => {
    switch (viewTab) {
      case CLAIM_TABS.DETAIL.key: {
        return <DetailForm
          data={detailData}
          setClaimNo={setClaimNo}
          setSearchText={setSearchText}
          setMessageError={setMessageError}
          handleSelectDate={handleSelectDate}
          handleDateChangeRaw={handleDateChangeRaw}
          handleSelectedReference={handleSelectedReference}
          setLessPaymentReceived={setLessPaymentReceived}
        />
      }
      case CLAIM_TABS.CLAIM.key: {
        return <ClaimView
          isCopied={isCopied}
          claimTabInfo={claimTabInfo}
          setIsShowGSTModal={setIsShowGSTModal}
          setIsShowEditClaimModal={setIsShowEditClaimModal}
          setIsShowPreviousAmountModal={setIsShowPreviousAmountModal}
        />
      }
      default:
        return <DetailForm
          data={createData}
          setClaimNo={setClaimNo}
          setSearchText={setSearchText}
          setMessageError={setMessageError}
          handleSelectDate={handleSelectDate}
          handleDateChangeRaw={handleDateChangeRaw}
          handleSelectedReference={handleSelectedReference}
          setLessPaymentReceived={() => { }}
        />
    }
  }
  return (
    <div className={`createClaim${isEditMode ? ' createClaim--detail' : ''}`}>
      {isEditMode ?
        <>
          <div className="claimDetail__header">
            <div className="claimDetail__header--title">
              {claimDetail.claim?.claim_no || ''}
            </div>
            <div className="claimDetail__header--buttons">
              <div
                className="claimDetail__header--button"
                onClick={handleClickDelete}
              >
                <img src="/icons/brown-trash.svg" alt="delete-icon" />
                <span>Delete</span>
              </div>
              <div className="claimDetail__header--select">
                <ActionInvoiceForm
                  data={QUOTATION.ACTIONS}
                  selectedAction={selectedAction}
                  setSelectedAction={handleSelectDetailAction}
                />
              </div>
            </div>
          </div>
          <div className="detailRoute">
            {Object.values(CLAIM_TABS).map(url => (
              <div
                key={url.id}
                className={`detailRoute__url${viewTab === url.key ? ' detailRoute__url--active' : ''}`}
                onClick={() => handleSelectView(url.key)}
              >
                {url.name}
              </div>
            ))}
          </div>
        </>
        :
        <HeadlineBar
          buttonName="Create"
          headlineTitle="New Claims"
          onClick={handleClickCreate}
          isDisableSubmit={isDisableSubmit}
        />
      }
      {selectedTab()}
      {isShowEditClaimModal &&
        <EditClaimModal
          id={id}
          logsInfo={logsInfo}
          onClickCancel={() => setIsShowEditClaimModal(false)}
          quotationId={+claimTabInfo?.quotation_id}
        />
      }
      {isShowConfirmDeleteModal &&
        <ConfirmDeleteModal
          deleteTitle="claim"
          onClickDelete={handleDelete}
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      }
      {isShowGSTModal &&
        <GSTModal
          id={id}
          gstValue={gstValue}
          setGstValue={setGstValue}
          closeModal={() => setIsShowGSTModal(false)}
        />
      }
      {isShowPreviousAmountModal &&
        <PreviousClaimAmountModal
          data={previousClaimReceivedData}
          closeModal={() => setIsShowPreviousAmountModal(false)}
        />
      }
    </div>
  )
}

export default ClaimActions
