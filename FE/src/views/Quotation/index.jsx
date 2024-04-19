import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useQuotationSlice } from 'src/slices/quotation'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'
import { formatDate, formatPriceWithTwoDecimals, normalizeString } from 'src/helper/helper'
import { ACTIONS, ALERT, CSV_TYPE, DOWNLOAD_TYPES, FILTER, LINKS, MESSAGE, PAGINATION, PDF_TYPE, PERMISSION, QUOTATION, STATUS } from 'src/constants/config'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import RevenueForm from 'src/components/RevenueForm'
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import FilterScrapModal from 'src/components/ScrapForms/FilterScrapModal'

const Quotation = () => {
  const { actions } = useQuotationSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.quotation.list)
  const fetched = useSelector(state => state.quotation.fetched)
  const quotations = useSelector(state => state.quotation.list?.data)
  const permissionData = useSelector(state => state.user.permissionData)

  const [searchText, setSearchText] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [isErrorExist, setIsErrorExist] = useState(false)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState([])
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedItem, setSelectedItem] = useState(null)

  const [topPosition, setTopPosition] = useState(0);
  const [selectedDownloadId, setSelectedDownloadId] = useState(null);
  const [isShowSelectDownloadModal, setIsShowSelectDownloadModal] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);

  const onDeleteSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    const isLastPage = list.current_page === list.last_page
    const hasNoItem = list.data.every(item => selectedDeleteIds.includes(item.id))
    let tempoPageNumber = currentPageNumber;

    // set to prev page if current page is last page and there has no item
    if (isLastPage && hasNoItem) {
      tempoPageNumber = currentPageNumber - 1;
    }
    const params = {
      page: +tempoPageNumber <= 0 ? 1 : +tempoPageNumber,
      search: normalizeString(searchText),
      start_date: startDateFilter && dayjs(startDateFilter).format('YYYY/MM/DD'),
      end_date: endDateFilter && dayjs(endDateFilter).format('YYYY/MM/DD'),
      onError,
    }
    dispatch(actions.getCustomerList(params))
    setSelectedDeleteIds([])
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getQuotationList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    return () => {
      dispatch(actions.resetFetchedList())
    }
  }, [])

  useEffect(() => {
    if (list && Object.keys(list).length > 0) {
      setCurrentPageNumber(list.current_page)
      setTotalDataNumber(list?.total || 0)
    }
  }, [list])

  useEffect(() => {
    if (quotations?.length > 0 && selectedIds?.length === quotations?.length) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, quotations])

  useEffect(() => {
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isShowFilterModal])

  useEffect(() => {
    if (messageError?.length > 0) {
      setIsErrorExist(true)
    } else {
      setIsErrorExist(false)
    }
  }, [messageError])

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
    !isShowFilterModal && setMessageError({})
  }, [isShowFilterModal])

  const handleSelectItem = (isChecked, itemId) => {
    if (isChecked) {
      setSelectedIds([...selectedIds, itemId])
    } else {
      setSelectedIds(selectedIds?.filter(id => id !== itemId) || [])
    }
  }

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(quotations?.map(item => item.id) || []);
    } else {
      setSelectedIds([]);
    }
  }

  const handleClickDelete = (deleteId) => {
    if (isDisableSubmit) return;
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (deleteId) {
        setSelectedDeleteIds([deleteId])
        setIsShowConfirmDeleteModal(true)
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MESSAGE.ERROR.UNKNOWN_ID,
        }))
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }))
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    const params = {
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

    dispatch(actions.getQuotationList(params))
    setSelectedIds([])
  }

  const handleSearch = () => {
    const data = {
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
      dispatch(actions.getQuotationList({ ...data, onError }));
      setSelectedIds([]);
      setMessageError({});
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
    if (isErrorExist || isDisableSubmit) return;
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
        dispatch(actions.getQuotationList({ ...data, onError }));
        setSelectedIds([]);
        setMessageError({});
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
    dispatch(actions.getQuotationList({
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
    }))
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
      dispatch(actions.multiDeleteQuotation({
        quotation_id: selectedDeleteIds,
        onDeleteSuccess, onError
      }));
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const goToDetailPage = (id) => {
    if (id) {
      history.push(`/quotation/${id}?tab=details`)
    }
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
          const isDeletable = selectedIds.every(id => handleCheckQuotationDeletable(id, list.data))
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
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Action Deny',
            description: MESSAGE.ERROR.AUTH_ACTION,
          }))
        }
      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportQuotationCSV({ quotation_ids: selectedIds }))
      } else if (actionType === ACTIONS.NAME.DOWNLOAD) {
        dispatch(actions.downloadPDF({ quotation_ids: selectedIds }))
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    }
    setSelectedItem(null)
  }

  const handleClickDownload = (quotationId, index) => {
    setSelectedDownloadId(quotationId)
    setIsShowSelectDownloadModal(true)
    setTopPosition(QUOTATION.START_POINT_DOWNLOAD_MODAL + QUOTATION.ROW_HEIGHT * index)
  }

  const handleDownloadQuotation = (type) => {
    if (type === PDF_TYPE && selectedDownloadId) {
      dispatch(actions.downloadPDF({
        quotation_ids: [+selectedDownloadId],
        onError,
      }))
    } else if (type === CSV_TYPE && selectedDownloadId) {
      dispatch(actions.getExportQuotationCSV({ quotation_ids: [+selectedDownloadId] }))
    }
    setIsShowSelectDownloadModal(false)
  }

  const renderTableList = () => {
    return quotations?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      const formattedDate = data?.issue_date && formatDate(data.issue_date)
      const status = STATUS.QUOTATION.find(item => item.value === data.status)
      const isShowDelete = (data.status === QUOTATION.STATUS_VALUE.DRAFT ||
        data.status === QUOTATION.STATUS_VALUE.REJECTED)
      return (
        <tr key={index} className={isChecked ? 'quotationTable__selected' : ''}>
          <td className="quotationTable__td quotationTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="quotationTable__td">
            <div className="quotationTable__td--textBox">
              {data.reference_no}
            </div>
          </td>
          <td className="quotationTable__td">
            <div className="quotationTable__td--textBox">
              {data.name}
            </div>
          </td>
          <td className="quotationTable__td">
            <div className="quotationTable__td--textBox">
              $ {formatPriceWithTwoDecimals(data.amount)}
            </div>
          </td>
          <td className="quotationTable__td">
            <div className={`quotationTable__status quotationTable__td--textBox${status ? ` quotationTable__status--${status?.class}` : ''}`}>
              {status?.label}
            </div>
          </td>
          <td className="quotationTable__td">
            <div className="quotationTable__td--textBox">
              {formattedDate}
            </div>
          </td>
          <td className="quotationTable__td">
            <div className="quotationTable__td--buttons">
              <div
                className="tableButtons__icon"
                onClick={() => handleClickDownload(data?.id, index)}
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
                  onClick={() => handleClickDelete(+data.id)}
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
    <div className="quotation">
      <div className="quotation__summary">
        <RevenueForm />
      </div>
      <div className="quotation__content">
        <TableAction
          searchText={searchText}
          isFiltering={isFiltering}
          actionList={ACTIONS.EXTEND || []}
          isShowFilterModal={isShowFilterModal}
          totalQuantity={totalDataNumber || 0}
          selectedQuantity={selectedIds?.length || null}
          handleSearch={handleSearch}
          setSearchText={setSearchText}
          onClickApply={handleClickApply}
          setIsShowFilterModal={setIsShowFilterModal}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          createURL={LINKS.CREATE.QUOTATION}
          buttonTitle="New Quotation"
          tableUnit="quotation"
          permissionKey={PERMISSION.KEY.QUOTATION}
        />
        <div className="quotation__table">
          <div className="quotation__divider"></div>
          <table className="quotationTable">
            <thead>
              <tr className="quotationTable__th quotationTable__th--checkBox">
                <th className="quotationTable__th quotationTable__th--checkbox">
                  <Checkbox
                    isChecked={isSelectedAll}
                    onChange={(e) => handleSelectAllItems(e.target.checked)}
                  />
                </th>
                <th className="quotationTable__th quotationTable__th--reference">REFERENCE NO.</th>
                <th className="quotationTable__th quotationTable__th--customer">CUSTOMER</th>
                <th className="quotationTable__th quotationTable__th--amount">AMOUNT</th>
                <th className="quotationTable__th quotationTable__th--status">STATUS</th>
                <th className="quotationTable__th quotationTable__th--date">ISSUED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {renderTableList()}
              {isShowSelectDownloadModal &&
                <ClickOutSideWrapper onClickOutside={() => setIsShowSelectDownloadModal(false)}>
                  <div className="download" style={{ top: `${topPosition}px` }}>
                    {Object.values(DOWNLOAD_TYPES).map((item, index) => (
                      <div
                        key={index}
                        className="download__option"
                        onClick={() => handleDownloadQuotation(item.name)}
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
      </div>
      <div className="quotation__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.SHORT}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="quotation"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleAcceptedDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterScrapModal
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

export default Quotation
