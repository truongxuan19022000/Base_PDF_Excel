import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useCustomerSlice } from 'src/slices/customer'
import { useQuotationSlice } from 'src/slices/quotation'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'
import { formatDate, normalizeString } from 'src/helper/helper'
import { ACTIONS, ALERT, FILTER, MESSAGE, PAGINATION, PERMISSION, QUOTATION, STATUS } from 'src/constants/config'

import Checkbox from '../Checkbox'
import Pagination from '../Pagination'
import ConfirmDeleteModal from '../ConfirmDeleteModal'
import CustomerTableAction from '../CustomerTableAction'
import FilterScrapModal from '../ScrapForms/FilterScrapModal'

const CustomerQuotation = ({
  id,
}) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { actions } = useCustomerSlice()
  const { actions: quotationActions } = useQuotationSlice()

  const { fetchedQuotation } = useSelector(state => state.customer)
  const permissionData = useSelector(state => state.user.permissionData)
  const customerQuotationData = useSelector(state => state.customer.customerQuotation)

  const [searchText, setSearchText] = useState('')
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [isErrorExist, setIsErrorExist] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState([])
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  const onDeleteSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    const isLastPage = customerQuotationData.current_page === customerQuotationData.last_page
    const hasNoItem = customerQuotationData.data.every(item => selectedDeleteIds.includes(item.id))
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
      dispatch(actions.getCustomerQuotationList(params))
    }
    setSelectedDeleteIds([])
  }

  useEffect(() => {
    if (id && !fetchedQuotation) {
      dispatch(actions.getCustomerQuotationList({ customer_id: +id }))
    }
  }, [id, fetchedQuotation])

  useEffect(() => {
    if (customerQuotationData && Object.keys(customerQuotationData).length > 0) {
      setCurrentPageNumber(customerQuotationData.current_page)
      setTotalDataNumber(customerQuotationData?.total || 0)
    }
  }, [customerQuotationData])

  useEffect(() => {
    if (customerQuotationData?.data?.length > 0 && selectedIds?.length === customerQuotationData?.data?.length) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, customerQuotationData?.data])

  useEffect(() => {
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isShowFilterModal])

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

  useEffect(() => {
    if (messageError?.length > 0) {
      setIsErrorExist(true)
    } else {
      setIsErrorExist(false)
    }
  }, [messageError])

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleSelectItem = (isChecked, itemId) => {
    if (isChecked) {
      setSelectedIds([...selectedIds, itemId])
    } else {
      setSelectedIds(selectedIds?.filter(id => id !== itemId) || [])
    }
  }

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(customerQuotationData?.data?.map(item => item.id) || []);
    } else {
      setSelectedIds([]);
    }
  }

  const handleClickDeleteItem = (deleteId) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (deleteId) {
        setSelectedDeleteIds([deleteId])
        setIsShowConfirmDeleteModal(true);
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MESSAGE.ERROR.UNKNOWN_ID,
        }));
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([]);

    const params = {
      customer_id: +id,
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    }
    if (selectedStatusFilter?.length > 0) {
      params.status = selectedStatusFilter;
    }
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }
    if (startDateFilter) {
      params.start_date = dayjs(startDateFilter).format('YYYY-MM-DD');
    }
    if (endDateFilter) {
      params.end_date = dayjs(endDateFilter).format('YYYY-MM-DD');
    }

    dispatch(actions.getCustomerQuotationList(params));
  }

  const handleSearch = () => {
    if (!id) return
    const data = {
      customer_id: +id,
      search: normalizeString(searchText),
      status: selectedStatusFilter,
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
      dispatch(actions.getCustomerQuotationList({ ...data, onError }));
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError('');
      setIsShowFilterModal(false)
    }
  }

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
    if (isErrorExist || isDisableSubmit || !id) return;
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
        customer_id: +id,
        search: normalizeString(searchText),
        status: selectedStatusFilter,
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
        dispatch(actions.getCustomerQuotationList({ ...data, onError }));
        setSelectedIds([]);
        setSubmitting(true);
        setMessageError('');
        setIsShowFilterModal(false)
      }
    }
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setSelectedStatusFilter([])
    setIsShowFilterModal(false)
    dispatch(actions.getCustomerQuotationList({
      customer_id: +id,
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
      onError,
    }))
  }

  const handleCheckQuotationDeletable = (id, data) => {
    const quotation = data.find(item => item.id === id);
    const isDeletable = +quotation.status === QUOTATION.STATUS_VALUE.DRAFT ||
      +quotation.status === QUOTATION.STATUS_VALUE.REJECTED
    return isDeletable;
  };

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (selectedIds.length > 0) {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          const isDeletable = selectedIds.every(id => handleCheckQuotationDeletable(id, customerQuotationData.data))
          if (isDeletable) {
            setSelectedDeleteIds(selectedIds)
            setIsShowConfirmDeleteModal(true)
          } else {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: selectedIds.length > 1 ?
                QUOTATION.MESSAGE_ERROR.INCLUDE_PROGRESS_ITEM : QUOTATION.MESSAGE_ERROR.ITEM_UNDER_PROGRESS,
            }))
          }
        } else {
          dispatchAlertWithPermissionDenied()
        }
      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(quotationActions.getExportQuotationCSV({ quotation_ids: selectedIds }))
        setSelectedAction(null)
      } else if (actionType === ACTIONS.NAME.DOWNLOAD) {
        dispatch(actions.downloadPDF({ quotation_ids: selectedIds }))
        setSelectedAction(null)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }));
    }
  }

  const handleDelete = () => {
    if (isDisableSubmit || selectedDeleteIds.length === 0) return;
    const data = { quotation_id: selectedDeleteIds };
    dispatch(actions.deleteCustomerQuotation({
      ...data,
      onDeleteSuccess,
      onError,
    }));
    setIsDisableSubmit(true)
    setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
  }

  const goToDetailPage = (quotationId) => {
    if (quotationId) {
      history.push(`/quotation/${quotationId}?tab=details`)
    }
  }

  const handleClickDownload = (quotationId) => {
    if (quotationId) {
      dispatch(quotationActions.downloadPDF({ quotation_ids: [+quotationId], onError }))
    }
  }

  const goToCreateNewQuotationPage = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.CREATE)
    if (isAllowed) {
      history.push('/quotation/create-quotation')
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const renderTableList = () => {
    return customerQuotationData?.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      const formattedDate = data?.issue_date && formatDate(data.issue_date)
      const status = STATUS.QUOTATION[data.status]
      const isShowDelete = (data.status === QUOTATION.STATUS_VALUE.DRAFT ||
        data.status === QUOTATION.STATUS_VALUE.REJECTED)

      return (
        <tr key={index} className={isChecked ? 'csQuotationTable__selected' : ''}>
          <td className="csQuotationTable__td csQuotationTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="csQuotationTable__td">
            <div className="csQuotationTable__td--textBox">
              {data.reference_no}
            </div>
          </td>
          <td className="csQuotationTable__td">
            <div className={`csQuotationTable__status${status ? ` csQuotationTable__status--${status?.class}` : ''}`}>
              {status?.label}
            </div>
          </td>
          <td className="csQuotationTable__td">{formattedDate}</td>
          <td className="csQuotationTable__td">
            <div className="csQuotationTable__td--buttons">
              <div
                className="tableButtons__icon"
                onClick={() => handleClickDownload(data?.id)}
              >
                <img
                  src="/icons/download.svg"
                  alt="download"
                />
              </div>
              <div
                className="tableButtons__icon"
                onClick={() => goToDetailPage(+data.id)}
              >
                <img
                  src="/icons/edit.svg"
                  alt="edit"
                />
              </div>
              {isShowDelete &&
                <div
                  className="tableButtons__icon"
                  onClick={() => handleClickDeleteItem(+data.id)}
                >
                  <img
                    src="/icons/delete.svg"
                    alt="delete"
                  />
                </div>
              }
            </div>
          </td>
        </tr>
      )
    });
  }

  return (
    <div className="csQuotation">
      <div className="csQuotation__content">
        <div className="csQuotation__actionBar">
          <CustomerTableAction
            isDetail={!!id}
            isShowFilter={true}
            searchText={searchText}
            buttonTitle="New Quotation"
            actionList={ACTIONS.EXTEND}
            isFiltering={isFiltering}
            selectedAction={selectedAction}
            isShowFilterModal={isShowFilterModal}
            handleSearch={handleSearch}
            setSearchText={setSearchText}
            onClickApply={handleClickApply}
            setSelectedAction={setSelectedAction}
            setIsShowFilterModal={setIsShowFilterModal}
            onClickCreateNew={goToCreateNewQuotationPage}
          />
        </div>
        <div className="csQuotation__table">
          <div className="csQuotation__divider"></div>
          <table className="csQuotationTable">
            <thead>
              <tr className="csQuotationTable__th csQuotationTable__th--checkBox">
                <th className="csQuotationTable__th csQuotationTable__th--checkbox">
                  <Checkbox
                    isChecked={isSelectedAll}
                    onChange={(e) => handleSelectAllItems(e.target.checked)}
                  />
                </th>
                <th className="csQuotationTable__th csQuotationTable__th--reference">REFERENCE NO.</th>
                <th className="csQuotationTable__th csQuotationTable__th--status">STATUS</th>
                <th className="csQuotationTable__th csQuotationTable__th--create">ISSUED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {renderTableList()}
            </tbody>
          </table>
        </div>
      </div>
      <div className="csQuotation__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          isDetail={!!id}
          deleteTitle="quotation"
          className="topPosition"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterScrapModal
          isDetail={true}
          checkList={FILTER.QUOTATION}
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
    </div>
  )
}

export default CustomerQuotation
