import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useInvoiceSlice } from 'src/slices/invoice'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'
import { formatDate, formatPriceWithTwoDecimals, isEmptyObject, normalizeString } from 'src/helper/helper'
import { ACTIONS, ALERT, CLAIM, CSV_TYPE, DOWNLOAD_TYPES, FILTER, INVOICE, LINKS, MESSAGE, PAGINATION, PDF_TYPE, PERMISSION, STATUS } from 'src/constants/config'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import FilterModal from 'src/components/FilterModal'
import TableAction from 'src/components/TableAction'
import TableButtons from 'src/components/TableButtons'
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const Invoice = () => {
  const { actions } = useInvoiceSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.invoice.list)
  const fetched = useSelector(state => state.invoice.fetched)
  const permissionData = useSelector(state => state.user.permissionData)

  const [searchText, setSearchText] = useState('')
  const [topPosition, setTopPosition] = useState(0)
  const [selectedIds, setSelectedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedDownloadId, setSelectedDownloadId] = useState(null)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [isShowSelectDownloadModal, setIsShowSelectDownloadModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

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

    dispatch(actions.getInvoiceList(params))
    setSelectedDeleteIds([])
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getInvoiceList({ page: PAGINATION.START_PAGE }))
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
    if (selectedIds?.length === list?.data?.length && list?.data?.length > 0) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, list?.data])

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

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(list?.data?.map(item => item.id) || []);
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
    const isEmptyRequest = !(startDateFilter || endDateFilter);
    if (isEmptyRequest) {
      setMessageError({
        message: 'Please select your request.'
      })
    } else {
      const data = {
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
        dispatch(actions.getInvoiceList({ ...data, onError }));
        setSelectedIds([]);
        setMessageError('');
        setIsShowFilterModal(false)
      }
    }
  }

  const handleClickDelete = (data) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (isDisableSubmit) return;
      if (+data.status === INVOICE.STATUS_VALUE.PENDING) {
        setSelectedDeleteIds([data.id])
        setIsShowConfirmDeleteModal(true)
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: INVOICE.MESSAGE_ERROR.PAID,
        }))
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleInputDateFilter = (date, field) => {
    if (field === FILTER.LABEL.START_DATE) {
      setStartDateFilter(date);
    } else {
      setEndDateFilter(date);
    }
    setIsInputChanged(!isInputChanged);
  }

  const handleSearch = () => {
    if (isDisableSubmit) return;
    const data = {
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
      dispatch(actions.getInvoiceList({ ...data, onError }));
      setSelectedIds([]);
      setMessageError('');
      setIsShowFilterModal(false)
    }
  }

  const handleAcceptedDelete = () => {
    if (isDisableSubmit) return;
    if (selectedDeleteIds.length === 0) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Deletion Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    } else {
      dispatch(actions.multiDeleteInvoice({
        invoice_id: selectedDeleteIds,
        onDeleteSuccess,
        onError,
      }))
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const handleCheckInvoiceDeletable = (id, data) => {
    const invoice = data.find(item => item.id === id);
    const isDeletable = +invoice.status === INVOICE.STATUS_VALUE.PENDING
    return isDeletable;
  };

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (selectedIds.length > 0) {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          const isDeletable = selectedIds.every(id => handleCheckInvoiceDeletable(id, list.data))
          if (isDeletable) {
            setSelectedDeleteIds(selectedIds)
            setIsShowConfirmDeleteModal(true)
          } else {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: selectedIds.length > 1 ?
                INVOICE.MESSAGE_ERROR.INCLUDED_PAID : INVOICE.MESSAGE_ERROR.PAID,
            }))
          }
        } else {
          dispatchAlertWithPermissionDenied()
        }
      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportInvoiceCSV({ invoice_ids: selectedIds }))
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION
      }));
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([])

    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
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

    dispatch(actions.getInvoiceList(params))
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setIsShowFilterModal(false)
    dispatch(actions.getInvoiceList({
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
    }))
  }

  const handleClickDownload = (invoiceId, index) => {
    setSelectedDownloadId(invoiceId)
    setIsShowSelectDownloadModal(true)
    setTopPosition(CLAIM.START_POINT_DOWNLOAD_MODAL + CLAIM.ROW_HEIGHT * index)
  }

  const handleDownloadInvoice = (type) => {
    if (type === PDF_TYPE && selectedDownloadId) {
      dispatch(actions.downloadInvoicePDF({
        invoice_id: +selectedDownloadId,
        onError,
      }))
    } else if (type === CSV_TYPE && selectedDownloadId) {
      dispatch(actions.getExportInvoiceCSV({ invoice_ids: [+selectedDownloadId] }))
    }
    setIsShowSelectDownloadModal(false)
  }

  const renderInvoiceList = () => {
    return list.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      const formattedDate = data?.issue_date && formatDate(data.issue_date)
      const status = STATUS.INVOICE[data.status];
      return (
        <tr key={index} className={isChecked ? 'invoiceTable__selected' : ''}>
          <td className="invoiceTable__td invoiceTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="invoiceTable__td">
            <div className="invoiceTable__td--textBox">
              {data.invoice_no}
            </div>
          </td>
          <td className="invoiceTable__td">
            <div className="invoiceTable__td--textBox">
              {data.reference_no}
            </div>
          </td>
          <td className="invoiceTable__td">
            <div className="invoiceTable__td--textBox">
              {data.customer_name}
            </div>
          </td>
          <td className="invoiceTable__td">
            <div className="invoiceTable__td--textBox">
              $ {formatPriceWithTwoDecimals(data.amount)}
            </div>
          </td>
          <td className="invoiceTable__td">
            <div className={`invoiceTable__status invoiceTable__td--textBox${status ? ` invoiceTable__status--${status.class}` : ''}`}>
              {status?.label}
            </div>
          </td>
          <td className="invoiceTable__td">
            <div className="invoiceTable__td--textBox">
              {formattedDate}
            </div>
          </td>
          <td className="invoiceTable__td">
            <div className="invoiceTable__td--buttons">
              <TableButtons
                data={data}
                isShowEdit={true}
                isShowDelete={true}
                isShowDownLoad={true}
                clickEdit={() => goToDetailPage(data)}
                clickDelete={() => handleClickDelete(data)}
                clickDownLoad={() => handleClickDownload(data.id, index)}
              />
            </div>
          </td>
        </tr>
      )
    });
  }

  const goToDetailPage = (invoice) => {
    if (!isEmptyObject(invoice) && invoice?.id) {
      history.push(`/invoice/${invoice?.id}?tab=details`)
      dispatch(actions.getSelectedInvoice(invoice))
    }
  }

  return (
    <div className="invoice">
      <TableAction
        searchText={searchText}
        isFiltering={isFiltering}
        actionList={ACTIONS.MAIN || []}
        totalQuantity={totalDataNumber || 0}
        isShowFilterModal={isShowFilterModal}
        selectedQuantity={selectedIds?.length || null}
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        onClickApply={handleClickApply}
        setIsShowFilterModal={setIsShowFilterModal}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        createURL={LINKS.CREATE.INVOICE}
        buttonTitle="New Invoice"
        tableUnit="invoice"
        permissionKey={PERMISSION.KEY.INVOICE}
      />
      <div className="invoice__table">
        <table className="invoiceTable">
          <thead>
            <tr>
              <th className="invoiceTable__th invoiceTable__th--checkbox" style={{ width: '4%' }}>
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="invoiceTable__th invoiceTable__th--invoice">INVOICE NO.</th>
              <th className="invoiceTable__th invoiceTable__th--reference">REFERENCE NO.</th>
              <th className="invoiceTable__th invoiceTable__th--customer">CUSTOMER</th>
              <th className="invoiceTable__th invoiceTable__th--amount">AMOUNT</th>
              <th className="invoiceTable__th invoiceTable__th--status">STATUS</th>
              <th className="invoiceTable__th invoiceTable__th--date">ISSUED ON</th>
              <th className="invoiceTable__th invoiceTable__th--actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderInvoiceList()}
            {isShowSelectDownloadModal &&
              <ClickOutSideWrapper onClickOutside={() => setIsShowSelectDownloadModal(false)}>
                <div className="download" style={{ top: `${topPosition}px` }}>
                  {Object.values(DOWNLOAD_TYPES).map((item, index) => (
                    <div
                      key={index}
                      className="download__option"
                      onClick={() => handleDownloadInvoice(item.name)}
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
      <div className="invoice__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="invoice"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleAcceptedDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
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

export default Invoice
