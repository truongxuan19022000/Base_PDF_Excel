import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import ConfirmDeleteItemModal from 'src/components/ConfirmDeleteItemModal';
import FilterScrapModal from 'src/components/ScrapForms/FilterScrapModal';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';
import RevenueClaim from 'src/components/RevenueClaim';
import TableButtons from 'src/components/TableButtons';
import TableAction from 'src/components/TableAction'
import Pagination from 'src/components/Pagination';
import Checkbox from 'src/components/Checkbox';

import { ACTIONS, ALERT, CLAIM, CSV_TYPE, DOWNLOAD_TYPES, FILTER, LINKS, MESSAGE, PAGINATION, PDF_TYPE, PERMISSION, STATUS } from 'src/constants/config';
import { formatDate, formatPriceWithTwoDecimals, isEmptyObject, normalizeString } from 'src/helper/helper';
import { validateFilterRequest, validatePermission } from 'src/helper/validation';
import { useClaimsSlice } from 'src/slices/claims';
import { alertActions } from 'src/slices/alert';

const Claims = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { actions: claimsActions } = useClaimsSlice()

  const { list, fetched } = useSelector(state => state.claims)
  const permissionData = useSelector(state => state.user.permissionData)

  const [searchText, setSearchText] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [messageError, setMessageError] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)

  const [topPosition, setTopPosition] = useState(0);
  const [isShowFilterModal, setIsShowFilterModal] = useState(false);
  const [selectedDownloadId, setSelectedDownloadId] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState([]);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);
  const [isShowSelectDownloadModal, setIsShowSelectDownloadModal] = useState(false)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);

  useEffect(() => {
    if (!fetched) {
      dispatch(claimsActions.getClaimsList())
    }
  }, [fetched])

  useEffect(() => {
    return () => {
      dispatch(claimsActions.resetFetchedList())
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowFilterModal(false);
        setIsShowConfirmDeleteModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    !isShowFilterModal && setMessageError({})
  }, [isShowFilterModal])

  const onSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setIsShowFilterModal(false)
  }

  const onDownloadSuccess = () => { }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  const onDeleteSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    const isLastPage = list.claims?.current_page === list.claims?.last_page
    const hasNoItem = list.claims?.data.every(item => selectedDeleteIds.includes(item.id))
    let tempoPageNumber = currentPageNumber;

    // set to prev page if current page is last page and there has no item
    if (isLastPage && hasNoItem) {
      tempoPageNumber = currentPageNumber - 1;
    }
    const params = {
      page: +tempoPageNumber <= 0 ? 1 : +tempoPageNumber,
      status: selectedStatusFilter,
      search: normalizeString(searchText),
      start_date: startDateFilter && dayjs(startDateFilter).format('YYYY/MM/DD'),
      end_date: endDateFilter && dayjs(endDateFilter).format('YYYY/MM/DD'),
      onError,
    }
    dispatch(claimsActions.getClaimsList(params))
    setSelectedDeleteIds([])
  }

  const handleCheckIsNoCopiedClaim = (id, data) => {
    const claim = data.find(claim => claim.id === id);
    return claim && +claim.is_copied === CLAIM.IS_NOT_COPIED;
  };

  const handleCheckIsNoReceivedClaim = (id, data) => {
    const claim = data.find(claim => claim.id === id);
    return claim && +claim.status === CLAIM.STATUS_VALUE.PENDING;
  };

  const getDescription = (hasCopiedItem, hasPaidItem, length) => {
    if (hasPaidItem) {
      return length > 1 ? CLAIM.MESSAGE.HAS_PAYMENT_ITEM : CLAIM.MESSAGE.PAYMENT_RECEIVED;
    } else if (!hasCopiedItem) {
      return length > 1 ? CLAIM.MESSAGE.HAS_COPIED_ITEM : CLAIM.MESSAGE.IS_COPIED;
    }
  };

  const handleClickApply = (actionType) => {
    if (!actionType) return;
    if (selectedIds.length > 0) {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.DELETE)

        if (isAllowed) {
          const isNoCopiedItem = selectedIds.every(id => handleCheckIsNoCopiedClaim(id, list.claims?.data));
          const isNoReceivedItem = selectedIds.every(id => handleCheckIsNoReceivedClaim(id, list.claims?.data));

          if (isNoCopiedItem && isNoReceivedItem) {
            setSelectedDeleteIds(selectedIds)
            setIsShowConfirmDeleteModal(true)
          } else {
            const description = getDescription(!isNoCopiedItem, !isNoReceivedItem, selectedIds.length);

            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: description,
            }));
          }
        } else {
          dispatchAlertWithPermissionDenied()
        }

      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(claimsActions.getExportClaimsCSV({ claim_ids: selectedIds, onSuccess, onError }))
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    }
  }

  const handleSearch = () => {
    if (isDisableSubmit) return;
    const data = {
      search: normalizeString(searchText),
      page: PAGINATION.START_PAGE,
    };

    if (startDateFilter) data.start_date = dayjs(startDateFilter).format('YYYY-MM-DD');
    if (endDateFilter) data.end_date = dayjs(endDateFilter).format('YYYY-MM-DD');
    if (selectedStatusFilter?.length > 0) data.status = selectedStatusFilter;

    const errors = validateFilterRequest(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      if (isShowFilterModal) {
        setIsFiltering(true);
      }
      dispatch(claimsActions.getClaimsList({ ...data, onError, onSuccess }));
      setSelectedIds([]);
      setMessageError('');
      setIsDisableSubmit(true)
      setIsShowFilterModal(false)
    }
  }

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(list.claims?.data?.map(item => item.claim_id) || []);
      setIsSelectedAll(true)
    } else {
      setSelectedIds([]);
      setIsSelectedAll(false)
    }
  }
  const handleSelectItem = (itemId) => {
    if (selectedIds.includes(itemId)) {
      setSelectedIds(selectedIds?.filter(id => id !== itemId) || [])
    } else {
      setSelectedIds([...selectedIds, itemId])
    }
  }
  const goToDetailPage = (claim) => {
    if (!isEmptyObject(claim) && claim?.claim_id) {
      history.push(`/claims/${claim?.claim_id}?tab=details`)
    }
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickDelete = (claim) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      const isCopied = claim.is_copied !== CLAIM.IS_NOT_COPIED;
      const isPaid = claim.status === CLAIM.STATUS_VALUE.PAID;

      if (isCopied) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: CLAIM.MESSAGE.IS_COPIED,
        }))
      } else if (isPaid) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: CLAIM.MESSAGE.PAYMENT_RECEIVED,
        }))
      } else {
        setSelectedDeleteIds([claim.claim_id])
        setIsShowConfirmDeleteModal(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleAcceptedDelete = () => {
    if (isDisableSubmit) return;
    if (selectedDeleteIds.length === 0) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Deletion Failed',
        isHovered: false,
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    } else {
      dispatch(claimsActions.deleteMultiClaim({
        quotation_id: selectedDeleteIds,
        onDeleteSuccess,
        onError
      }));
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }
  const handleClickDownload = (claimId, index) => {
    setSelectedDownloadId(claimId)
    setIsShowSelectDownloadModal(true)
    setTopPosition(CLAIM.START_POINT_DOWNLOAD_MODAL + CLAIM.ROW_HEIGHT * index)
  }

  const handleClickCopy = (data) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.CREATE)
    if (isAllowed) {
      if (data?.is_copied === CLAIM.IS_NOT_COPIED) {
        dispatch(claimsActions.handleSetSelectCopyClaim(data))
        dispatch(claimsActions.getCopyClaimDetail({ id: data.claim_id }))
        history.push('/claims/create')
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          description: CLAIM.MESSAGE.IS_COPIED
        }))
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  };

  const handleInputValue = (field, value) => {
    if (isDisableSubmit) return;
    const fieldSetters = {
      start_date: setStartDateFilter,
      end_date: setEndDateFilter,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setMessageError({})
    }
  }

  const handleCheckBoxChange = (value) => {
    if (selectedStatusFilter.includes(value)) {
      setSelectedStatusFilter(selectedStatusFilter.filter(id => id !== value))
    } else {
      setSelectedStatusFilter([...selectedStatusFilter, value])
    }
    setMessageError({})
  }

  const handleFilterSearchApply = () => {
    if (isDisableSubmit) return;
    const isEmptyRequest = !(
      selectedStatusFilter.length > 0 ||
      startDateFilter ||
      endDateFilter
    );
    if (isEmptyRequest) {
      setMessageError({
        message: 'Please select your request.'
      })
    } else {
      const data = {
        search: normalizeString(searchText),
        status: selectedStatusFilter || [],
        page: PAGINATION.START_PAGE,
        start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
      };
      const errors = validateFilterRequest(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        if (isShowFilterModal) {
          setIsFiltering(true);
        }
        dispatch(claimsActions.getClaimsList({ ...data, onError }));
        setSelectedIds([]);
        setMessageError('');
        setIsShowFilterModal(false)
      }
    }
  }

  const handleClickResetFilter = () => {
    const data = {
      search: normalizeString(searchText),
      page: PAGINATION.START_PAGE,
    };
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setIsShowFilterModal(false)
    setMessageError({})
    setIsDisableSubmit(false)
    setSelectedStatusFilter([])
    dispatch(claimsActions.getClaimsList({ ...data }))
  }
  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([])

    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    };

    if (searchText?.length > 0) params.search = normalizeString(searchText);
    if (startDateFilter) params.start_date = dayjs(startDateFilter).format('YYYY-MM-DD');
    if (endDateFilter) params.end_date = dayjs(endDateFilter).format('YYYY-MM-DD');
    if (selectedStatusFilter?.length > 0) params.status = selectedStatusFilter;

    dispatch(claimsActions.getClaimsList(params))
  }

  const handleDownloadClaim = (type) => {
    if (type === PDF_TYPE && selectedDownloadId) {
      dispatch(claimsActions.downloadClaimPDF({
        claim_id: +selectedDownloadId,
        onDownloadSuccess, onError,
      }))
    } else if (type === CSV_TYPE && selectedDownloadId) {
      dispatch(claimsActions.getExportClaimsCSV({
        claim_ids: [+selectedDownloadId],
        onDownloadSuccess, onError,
      }))
    }
    setIsShowSelectDownloadModal(false)
  }

  const renderTableList = (data, index) => {
    const isChecked = !!selectedIds?.includes(data.claim_id);
    const status = STATUS.CLAIM.find(item => item.value === data.status);
    const formattedDate = data?.issue_date && formatDate(data.issue_date);
    const isShowCopy = data.is_copied === CLAIM.IS_NOT_COPIED && status.value === STATUS.CLAIM_VALUE.PAID;
    return (
      data &&
      <tr key={index} className={isChecked ? 'claimsTable__selected' : ''}>
        <td className="claimsTable__td claimsTable__td--checkbox">
          <Checkbox
            isChecked={isChecked}
            onChange={(e) => handleSelectItem(data.claim_id)}
          />
        </td>
        <td className="claimsTable__td">
          <div className="claimsTable__td--textBox">
            {data.claim_no}
          </div>
        </td>
        <td className="claimsTable__td">
          <div className="claimsTable__td--textBox">
            {data.reference_no}
          </div>
        </td>
        <td className="claimsTable__td">
          <div className="claimsTable__td--textBox">
            {data.name}
          </div>
        </td>
        <td className="claimsTable__td">
          <div className="claimsTable__td--textBox">
            $ {formatPriceWithTwoDecimals(data.amount)}
          </div>
        </td>
        <td className="claimsTable__td">
          <div className="claimsTable__td--textBox">
            $ {formatPriceWithTwoDecimals(data.actual_paid_amount)}
          </div>
        </td>
        <td className="claimsTable__td">
          <div className={`claimsTable__status claimsTable__td--textBox${status ? ` claimsTable__status--${status.class}` : ''}`}>
            {status?.label}
          </div>
        </td>
        <td className="claimsTable__td">
          <div className="claimsTable__td--textBox">
            {formattedDate}
          </div>
        </td>
        <td className="claimsTable__td">
          <div className="claimsTable__td--buttons">
            <TableButtons
              data={data}
              isShowEdit={true}
              isShowCopy={isShowCopy}
              isShowDelete={true}
              isShowDownLoad={true}
              clickCopy={() => handleClickCopy(data)}
              clickEdit={() => goToDetailPage(data)}
              clickDelete={() => handleClickDelete(data)}
              clickDownLoad={() => handleClickDownload(data.claim_id, index)}
              idField="claim_id"
            />
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="claims">
      <div className="claims__revenue">
        <RevenueClaim />
      </div>
      <TableAction
        searchText={searchText}
        isFiltering={isFiltering}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        actionList={ACTIONS.MAIN}
        totalQuantity={list.claims?.total}
        selectedQuantity={selectedIds?.length || null}
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        onClickApply={handleClickApply}
        setIsShowFilterModal={setIsShowFilterModal}
        createURL={LINKS.CREATE.CLAIM}
        buttonTitle="New Claims"
        tableUnit="claim"
        permissionKey={PERMISSION.KEY.CLAIM}
      />
      <div className="claims__table">
        <div className="claims__divider"></div>
        <table className="claimsTable">
          <thead>
            <tr>
              <th className="claimsTable__th claimsTable__th--checkbox">
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="claimsTable__th claimsTable__th--claim">CLAIMS NO.</th>
              <th className="claimsTable__th claimsTable__th--reference">REFERENCE NO.</th>
              <th className="claimsTable__th claimsTable__th--customer">CUSTOMER</th>
              <th className="claimsTable__th claimsTable__th--estimate">EST.AMOUNT</th>
              <th className="claimsTable__th claimsTable__th--paid">PAID AMOUNT</th>
              <th className="claimsTable__th claimsTable__th--status">STATUS</th>
              <th className="claimsTable__th claimsTable__th--date">ISSUED ON</th>
              <th className="claimsTable__th claimsTable__th--actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {list.claims?.data?.map((data, index) => renderTableList(data, index))}
            {isShowSelectDownloadModal &&
              <ClickOutSideWrapper onClickOutside={() => setIsShowSelectDownloadModal(false)}>
                <div className="download" style={{ top: `${topPosition}px` }}>
                  {Object.values(DOWNLOAD_TYPES).map((item, index) => (
                    <div
                      key={index}
                      className="download__option"
                      onClick={() => handleDownloadClaim(item.name)}
                    >
                      <p>
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </ClickOutSideWrapper>
            }
          </tbody>
        </table>
      </div>
      <div className="claims__paginate">
        <Pagination
          totalNumber={list?.claims?.total || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowFilterModal && (
        <FilterScrapModal
          checkList={FILTER.CLAIM_STATUS}
          isShowStatus={false}
          isShowLength={false}
          messageError={messageError}
          endDateFilter={endDateFilter}
          startDateFilter={startDateFilter}
          isDisableSubmit={isDisableSubmit}
          selectedStatus={selectedStatusFilter}
          handleInputValue={handleInputValue}
          onClickApply={handleFilterSearchApply}
          handleCheckBoxChange={handleCheckBoxChange}
          handleClickResetFilter={handleClickResetFilter}
          onClickCancel={() => setIsShowFilterModal(false)}
        />
      )}
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteItemModal
          deleteTitle="claim"
          isShow={isShowConfirmDeleteModal}
          onClickDelete={handleAcceptedDelete}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      )}
    </div>
  )
}

export default Claims
