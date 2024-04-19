import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useInvoiceSlice } from 'src/slices/invoice'
import { useCustomerSlice } from 'src/slices/customer'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'
import { formatPriceWithTwoDecimals, isEmptyObject, normalizeString } from 'src/helper/helper'
import { ACTIONS, ALERT, FILTER, INVOICE, MESSAGE, PAGINATION, PERMISSION, STATUS } from 'src/constants/config'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import CustomerTableAction from '../CustomerTableAction'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const CustomerInvoice = ({
  id,
}) => {
  const { actions } = useCustomerSlice()
  const { actions: invoiceActions } = useInvoiceSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const { fetchedInvoice } = useSelector(state => state.customer)
  const permissionData = useSelector(state => state.user.permissionData)
  const customerInvoiceData = useSelector(state => state.customer.customerInvoice)

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
    const isLastPage = customerInvoiceData.current_page === customerInvoiceData.last_page
    const hasNoItem = customerInvoiceData.data.every(item => selectedDeleteIds.includes(item.id))
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

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (id && !fetchedInvoice) {
      dispatch(actions.getCustomerInvoiceList({ customer_id: +id }))
    }
  }, [id, fetchedInvoice])

  useEffect(() => {
    if (customerInvoiceData && Object.keys(customerInvoiceData).length > 0) {
      setCurrentPageNumber(customerInvoiceData.current_page)
      setTotalDataNumber(customerInvoiceData?.total || 0)
    }
  }, [customerInvoiceData])

  useEffect(() => {
    if (selectedIds?.length === customerInvoiceData?.data?.length && customerInvoiceData?.data?.length > 0) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, customerInvoiceData?.data])

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

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(customerInvoiceData?.data?.map(item => item.id) || []);
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

  const handleFilterSearchApply = () => {
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
      dispatch(actions.getCustomerInvoiceList({ ...data, onError, onSuccess }));
      setSelectedIds([]);
      setSubmitting(true);
      setIsDisableSubmit(true);
      setMessageError('');
      setIsShowFilterModal(false)
    }
  }

  const handleClickDeleteItem = (data) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (+data.status === INVOICE.STATUS_VALUE.PENDING) {
        setSelectedDeleteIds([data.id]);
        setIsShowConfirmDeleteModal(true);
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
    if (submitting) return;
    if (field === FILTER.LABEL.START_DATE) {
      setStartDateFilter(date);
    } else {
      setEndDateFilter(date);
    }
    setIsInputChanged(!isInputChanged);
  }

  const handleSearch = () => {
    handleFilterSearchApply(normalizeString(searchText))
    setSelectedIds([])
  }

  const handleDelete = () => {
    if (isDisableSubmit || selectedDeleteIds.length === 0) return;
    dispatch(actions.deleteCustomerInvoice({
      invoice_id: selectedDeleteIds,
      onDeleteSuccess,
      onError
    }));
    setMessageError({})
    setIsDisableSubmit(true)
    setIsShowConfirmDeleteModal(false)
    setSelectedIds(selectedIds?.filter(id => !selectedDeleteIds.includes(id)))
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
          const isDeletable = selectedIds.every(id => handleCheckInvoiceDeletable(id, customerInvoiceData.data))
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
        dispatch(invoiceActions.getExportInvoiceCSV({ invoice_ids: selectedIds }))
        setSelectedItem(null)
      } else if (actionType === ACTIONS.NAME.DOWNLOAD) {
        dispatch(invoiceActions.downloadInvoicePDF({ invoice_ids: selectedIds }))
        setSelectedItem(null)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }));
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
    dispatch(actions.getCustomerInvoiceList(params));
    setSelectedIds([])
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setIsShowFilterModal(false)
    dispatch(actions.getCustomerInvoiceList({
      customer_id: +id,
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
      onError,
    }))
  }

  const handleClickDownload = (invoiceId) => {
    if (invoiceId) {
      dispatch(invoiceActions.downloadInvoicePDF({ invoice_id: invoiceId }))
    }
  }

  const renderInvoiceList = () => {
    return customerInvoiceData?.data?.map((data, index) => {
      const status = STATUS.INVOICE[data.status];
      const isChecked = !!selectedIds?.includes(data.id);
      const formattedDate = data.created_at ? dayjs(data.created_at).format('DD MMM YYYY') : 'NA';
      return (
        <tr key={index} className={isChecked ? 'csInvoiceTable__selected' : ''}>
          <td className="csInvoiceTable__td csInvoiceTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="csInvoiceTable__td">
            <div className="csInvoiceTable__td--textBox">
              {data.invoice_no}
            </div>
          </td>
          <td className="csInvoiceTable__td">
            <div className="csInvoiceTable__td--textBox">
              {data.reference_no}
            </div>
          </td>
          <td className="csInvoiceTable__td">
            <div className="csInvoiceTable__td--textBox">
              $ {formatPriceWithTwoDecimals(data.amount)}
            </div>
          </td>
          <td className="csInvoiceTable__td">
            <div className={`csInvoiceTable__status csInvoiceTable__td--textBox${status ? ` csInvoiceTable__status--${status.class}` : ''}`}>
              {status?.label}
            </div>
          </td>
          <td className="csInvoiceTable__td">
            <div className="csInvoiceTable__td--textBox">
              {formattedDate}
            </div>
          </td>
          <td className="csInvoiceTable__td">
            <div className="csInvoiceTable__td--buttons">
              <TableButtons
                data={data}
                isShowEdit={true}
                isShowDelete={true}
                isShowDownLoad={true}
                clickEdit={() => goToDetailPage(data)}
                clickDelete={() => handleClickDeleteItem(data)}
                clickDownLoad={() => handleClickDownload(+data.id)}
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
      dispatch(invoiceActions.getSelectedInvoice(invoice))
    }
  }

  const goToCreateNewInvoicePage = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.CREATE)
    if (isAllowed) {
      history.push('/invoice/create-invoice')
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  return (
    <div className="csInvoice">
      <div className="csInvoice__actionBar">
        <CustomerTableAction
          isDetail={!!id}
          isShowFilter={true}
          searchText={searchText}
          buttonTitle="New Invoice"
          actionList={ACTIONS.EXTEND}
          isFiltering={isFiltering}
          selectedAction={selectedItem}
          isShowFilterModal={isShowFilterModal}
          handleSearch={handleSearch}
          setSearchText={setSearchText}
          onClickApply={handleClickApply}
          setSelectedAction={setSelectedItem}
          setIsShowFilterModal={setIsShowFilterModal}
          onClickCreateNew={goToCreateNewInvoicePage}
        />
      </div>
      <div className="csInvoice__table">
        <div className="csInvoice__divider"></div>
        <table className="csInvoiceTable">
          <thead>
            <tr>
              <th className="csInvoiceTable__th csInvoiceTable__th--checkbox" style={{ width: '4%' }}>
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="csInvoiceTable__th csInvoiceTable__th--invoice">INVOICE NO.</th>
              <th className="csInvoiceTable__th csInvoiceTable__th--reference">REFERENCE NO.</th>
              <th className="invoiceTable__th invoiceTable__th--amount">AMOUNT</th>
              <th className="invoiceTable__th invoiceTable__th--status">STATUS</th>
              <th className="csInvoiceTable__th csInvoiceTable__th--create">ISSUED ON</th>
              <th className="csInvoiceTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderInvoiceList()}
          </tbody>
        </table>
      </div>
      <div className="csInvoice__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          isDetail={!!id}
          deleteTitle="invoice"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          isDetail={!!id}
          className="csInvoice"
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

export default CustomerInvoice
