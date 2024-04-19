import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useClaimsSlice } from 'src/slices/claims'
import { useCustomerSlice } from 'src/slices/customer'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'
import { formatDate, formatPriceWithTwoDecimals, normalizeString } from 'src/helper/helper'
import { ACTIONS, ALERT, CLAIM, FILTER, MESSAGE, PAGINATION, PERMISSION, STATUS } from 'src/constants/config'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import CustomerTableAction from '../CustomerTableAction'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const CustomerClaim = ({
  id,
}) => {
  const { actions } = useCustomerSlice()
  const { actions: claimsActions } = useClaimsSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const { fetchedClaim } = useSelector(state => state.customer)
  const permissionData = useSelector(state => state.user.permissionData)
  const customerClaimData = useSelector(state => state.customer.customerClaim)

  const [searchText, setSearchText] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([])

  const onSuccess = () => {
    setMessageError('')
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowFilterModal(false)
    setIsShowConfirmDeleteModal(false)
  }

  const onDeleteSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    const isLastPage = customerClaimData.current_page === customerClaimData.last_page
    const hasNoItem = customerClaimData.data.every(item => selectedDeleteIds.includes(item.id))
    let tempoPageNumber = currentPageNumber;

    // set to prev page if current page is last page and there has no item
    if (isLastPage && hasNoItem) {
      tempoPageNumber = currentPageNumber - 1;
    }

    if (id) {
      const params = {
        customer_id: +id,
        page: +tempoPageNumber <= 0 ? 1 : +tempoPageNumber,
        search: normalizeString(searchText),
        start_date: startDateFilter && dayjs(startDateFilter).format('YYYY/MM/DD'),
        end_date: endDateFilter && dayjs(endDateFilter).format('YYYY/MM/DD'),
        onError,
      }
      dispatch(claimsActions.getClaimsList(params))
    }
    setSelectedDeleteIds([])
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (id && !fetchedClaim) {
      dispatch(actions.getCustomerClaimList({ customer_id: +id }))
    }
  }, [id, fetchedClaim])

  useEffect(() => {
    if (customerClaimData && Object.keys(customerClaimData).length > 0) {
      setCurrentPageNumber(customerClaimData.current_page)
      setTotalDataNumber(customerClaimData?.total || 0)
    }
  }, [customerClaimData])

  useEffect(() => {
    if (selectedIds?.length === customerClaimData?.data?.length && customerClaimData?.data?.length > 0) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, customerClaimData?.data])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowConfirmDeleteModal(false);
        setIsShowFilterModal(false)
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(customerClaimData?.data?.map(item => item.id) || []);
    } else {
      setSelectedIds([]);
    }
  }

  const handleSelectItem = (isChecked, itemId) => {
    if (isChecked) {
      setSelectedIds([...selectedIds, itemId])
    } else {
      setSelectedIds(selectedIds?.filter(id => id !== itemId) || [])
    }
  }

  const handleFilterSearchApply = (searchText) => {
    if (isDisableSubmit) return;
    const data = {
      customer_id: +id,
      search: normalizeString(searchText),
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
      dispatch(actions.getCustomerClaimList({ ...data, onError, onSuccess }));
      setSelectedIds([]);
      setSubmitting(true);
      setIsDisableSubmit(true);
      setMessageError('');
      setIsShowFilterModal(false)
    }
  }

  const handleSelectDeleteInfo = (claim) => {
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
        setSelectedDeleteIds([claim.id])
        setIsShowConfirmDeleteModal(true)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }))
    }
  }

  const handleInputDateFilter = (date, field) => {
    if (submitting) return;
    if (field === FILTER.LABEL.START_DATE) {
      setStartDateFilter(date);
    } else {
      setEndDateFilter(date);
    }
    setIsInputChanged(!isInputChanged);
  }

  const handleSearch = () => {
    if (!id || submitting) return;
    const data = {
      customer_id: +id,
      search: normalizeString(searchText),
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
      dispatch(actions.getCustomerClaimList({ ...data, onError, onSuccess }));
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError('');
      setIsShowFilterModal(false)
    }
  }

  const handleAcceptDelete = () => {
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
        claim_id: selectedDeleteIds,
        onDeleteSuccess,
        onError,
      }))
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const handleCheckIsNoCopiedClaim = (id, data) => {
    const claim = data.find(claim => claim.id === id);
    return claim && +claim.is_copied === CLAIM.IS_NOT_COPIED;
  };

  const handleCheckIsNoReceivedClaim = (id, data) => {
    const claim = data.find(claim => claim.id === id);
    return claim && +claim.status === CLAIM.STATUS_VALUE.PENDING;
  };

  const getDescription = (isNoCopiedItem, isNoReceivedItem, length) => {
    if (!isNoReceivedItem) {
      return length > 1 ? CLAIM.MESSAGE.HAS_PAYMENT_ITEM : CLAIM.MESSAGE.PAYMENT_RECEIVED;
    } else if (!isNoCopiedItem) {
      return length > 1 ? CLAIM.MESSAGE.HAS_COPIED_ITEM : CLAIM.MESSAGE.IS_COPIED;
    }
  };

  const handleClickApply = (actionType) => {
    if (!actionType) return
    switch (actionType) {
      case ACTIONS.MAIN[0].action: // delete action
        if (selectedIds.length > 0) {
          const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.DELETE)
          if (isAllowed) {
            const isNoCopiedItem = selectedIds.every(id => handleCheckIsNoCopiedClaim(id, customerClaimData.data));
            const isNoReceivedItem = selectedIds.every(id => handleCheckIsNoReceivedClaim(id, customerClaimData.data));

            if (isNoCopiedItem && isNoReceivedItem) {
              setSelectedDeleteIds(selectedIds)
              setIsShowConfirmDeleteModal(true);
            } else {
              const description = getDescription(isNoCopiedItem, isNoReceivedItem, selectedIds.length);
              dispatch(alertActions.openAlert({
                type: ALERT.FAILED_VALUE,
                title: 'Deletion Failed',
                description: description,
              }));
            }
          } else {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: MESSAGE.ERROR.EMPTY_ACTION,
            }));
          }
        } else {
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Action Deny',
            description: MESSAGE.ERROR.AUTH_ACTION,
          }))
        }
        return;
      case ACTIONS.MAIN[1].action: //export csv action
        if (selectedIds.length > 0) {
          dispatch(claimsActions.getExportClaimsCSV({ claim_ids: selectedIds, onSuccess, onError }))
        } else {
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Exportation Failed',
            description: MESSAGE.ERROR.EMPTY_ACTION
          }));
        }
        return
      default:
        return
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    const params = {
      customer_id: +id,
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    };
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }
    if (startDateFilter) {
      params.start_date = dayjs(startDateFilter).format('YYYY-MM-DD');
    }
    if (endDateFilter) {
      params.end_date = dayjs(endDateFilter).format('YYYY-MM-DD');
    }
    dispatch(actions.getCustomerClaimList(params));
    setSelectedIds([])
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setIsShowFilterModal(false)
    dispatch(actions.getCustomerClaimList({
      customer_id: +id,
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
      onError,
    }))
  }

  const handleClickDownload = (claimId) => {
    if (claimId) {
      dispatch(claimsActions.downloadClaimPDF({ claim_id: claimId }))
    }
  }

  const renderClaimList = () => {
    return customerClaimData?.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      const status = STATUS.CLAIM.find(item => item.value === data.status);
      const formattedDate = data?.issue_date && formatDate(data.issue_date);
      const isShowCopy = data.is_copied === CLAIM.IS_NOT_COPIED && data.status === CLAIM.STATUS_VALUE.PENDING;
      return (
        <tr key={index} className={isChecked ? 'csClaimTable__selected' : ''}>
          <td className="csClaimTable__td csClaimTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="csClaimTable__td">
            <div className="csClaimTable__td--textBox">
              {data.claim_no}
            </div>
          </td>
          <td className="csClaimTable__td">
            <div className="csClaimTable__td--textBox">
              {data.reference_no}
            </div>
          </td>
          <td className="csClaimTable__td">
            <div className="csClaimTable__td--textBox">
              $ {formatPriceWithTwoDecimals(data.amount)}
            </div>
          </td>
          <td className="csClaimTable__td">
            <div className="csClaimTable__td--textBox">
              $ {formatPriceWithTwoDecimals(data.actual_paid_amount)}
            </div>
          </td>
          <td className="csClaimTable__td">
            <div className={`csClaimTable__status csClaimTable__td--textBox${status ? ` csClaimTable__status--${status.class}` : ''}`}>
              {status?.label}
            </div>
          </td>
          <td className="csClaimTable__td">
            <div className="csClaimTable__td--textBox">
              {formattedDate}
            </div>
          </td>
          <td className="csClaimTable__td">
            <div className="csClaimTable__td--buttons">
              <TableButtons
                data={data}
                isShowEdit={true}
                isShowCopy={isShowCopy}
                isShowDelete={true}
                isShowDownLoad={true}
                clickCopy={() => handleClickCopy(data)}
                clickEdit={() => goToDetailPage(data.id)}
                clickDelete={() => handleSelectDeleteInfo(data)}
                clickDownLoad={() => handleClickDownload(data.id, index)}
                idField="claim_id"
              />
            </div>
          </td>
        </tr>
      )
    });
  }

  const handleClickCopy = (data) => {
    if (data?.is_copied === CLAIM.IS_NOT_COPIED) {
      dispatch(claimsActions.handleSetSelectCopyClaim(data))
      history.push('/claims/create')
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Copy Failed',
        description: CLAIM.MESSAGE.IS_COPIED,
      }));
    }
  };

  const goToDetailPage = (claimId) => {
    claimId && history.push(`/claims/${claimId}?tab=details`)
  }

  const goToCreateNewClaimPage = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CLAIM, PERMISSION.ACTION.CREATE)
    if (isAllowed) {
      history.push('/claims/create')
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }))
    }
  }

  return (
    <div className="csClaim">
      <div className="csClaim__actionBar">
        <CustomerTableAction
          isDetail={!!id}
          isShowFilter={true}
          searchText={searchText}
          buttonTitle="New Claim"
          actionList={ACTIONS.EXTEND}
          isFiltering={isFiltering}
          selectedAction={selectedItem}
          isShowFilterModal={isShowFilterModal}
          handleSearch={handleSearch}
          setSearchText={setSearchText}
          onClickApply={handleClickApply}
          setSelectedAction={setSelectedItem}
          setIsShowFilterModal={setIsShowFilterModal}
          onClickCreateNew={goToCreateNewClaimPage}
        />
      </div>
      <div className="csClaim__table">
        <div className="csClaim__divider"></div>
        <table className="csClaimTable">
          <thead>
            <tr>
              <th className="csClaimTable__th csClaimTable__th--checkbox" style={{ width: '4%' }}>
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="csClaimTable__th csClaimTable__th--claim">CLAIM NO.</th>
              <th className="csClaimTable__th csClaimTable__th--reference">REFERENCE NO.</th>
              <th className="claimsTable__th claimsTable__th--estimate">EST.AMOUNT</th>
              <th className="claimsTable__th claimsTable__th--paid">PAID AMOUNT</th>
              <th className="claimsTable__th claimsTable__th--status">STATUS</th>
              <th className="csClaimTable__th csClaimTable__th--create">ISSUED ON</th>
              <th className="csClaimTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderClaimList()}
          </tbody>
        </table>
      </div>
      <div className="csClaim__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          isDetail={!!id}
          deleteTitle="claim"
          className="topPosition"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleAcceptDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          isDetail={!!id}
          className="csClaim"
          isHiddenSortOption={true}
          submitting={submitting || false}
          searchText={searchText || ''}
          messageError={messageError || ''}
          endDateFilter={endDateFilter || ''}
          startDateFilter={startDateFilter || ''}
          isDisableSubmit={isDisableSubmit || false}
          onClickApply={handleFilterSearchApply}
          handleInputDateFilter={handleInputDateFilter}
          handleClickResetFilter={handleClickResetFilter}
          onClickCancel={() => setIsShowFilterModal(false)}
        />
      )}
    </div>
  )
}

export default CustomerClaim
