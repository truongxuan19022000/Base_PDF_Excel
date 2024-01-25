import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { useInvoiceSlice } from 'src/slices/invoice'
import { useCustomerSlice } from 'src/slices/customer'
import { validateFilterRequest } from 'src/helper/validation'
import { downloadCSVFromCSVString, formatCustomerName, isEmptyObject, normalizeString } from 'src/helper/helper'
import { ACTIONS, FILTER, MESSAGE, PAGINATION } from 'src/constants/config'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import CustomerTableAction from '../CustomerTableAction'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const CustomerInvoice = ({ customerName = '', setMessage }) => {
  const { actions } = useCustomerSlice()
  const { actions: invoiceActions } = useInvoiceSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const csvData = useSelector(state => state.customer.csvData)
  const customerInvoiceData = useSelector(state => state.customer.customerInvoice)

  const [searchText, setSearchText] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
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

  const onSuccess = () => {
    setMessageError('')
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowFilterModal(false)
    setIsShowConfirmDeleteModal(false)
    if (Object.keys(deleteInfo).length > 0) {
      setDeleteInfo({})
    }
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (id) {
      dispatch(actions.getCustomerInvoiceList({ page: PAGINATION.START_PAGE, customer_id: +id }))
    }
  }, [id])

  useEffect(() => {
    if (customerInvoiceData && Object.keys(customerInvoiceData)?.length > 0) {
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
    if (csvData?.length > 0 && submitting) {
      const filename = formatCustomerName(customerName) + '_invoice'
      downloadCSVFromCSVString(csvData, filename)
      setSubmitting(false)
      dispatch(actions.clearCSVDataCustomer())
    }
  }, [submitting, csvData])

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

  const handleFilterSearchApply = (searchText) => {
    if (isDisableSubmit) return;
    const data = {
      customer_id: +id,
      search: searchText || '',
      page: PAGINATION.START_PAGE,
      start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    };
    const errors = validateFilterRequest(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
      setIsDisableSubmit(true);
    } else {
      if (isShowFilterModal) {
        setIsFiltering(true);
      }
      dispatch(actions.getCustomerInvoiceList({ ...data, onSuccess, onError, }));
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError('');
      setIsDisableSubmit(true);
    }
  }

  const handleSelectDeleteInfo = (actionType, deleteId) => {
    if (!actionType) return;
    if (actionType === ACTIONS.NAME.DELETE && deleteId) {
      setDeleteInfo({
        actionType: actionType,
        deleteIds: [deleteId],
      });
    } else if (actionType === ACTIONS.NAME.MULTI_DELETE && selectedIds?.length > 0) {
      setDeleteInfo({
        actionType: actionType,
        deleteIds: selectedIds || [],
      });
    } else {
      setMessage({
        failed: MESSAGE.ERROR.NO_DELETE_ID
      })
      return;
    }
    setIsShowConfirmDeleteModal(true);
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

  const handleDelete = (deleteInfo) => {
    if (isDisableSubmit || !deleteInfo?.actionType) return;
    const isLastItem = (customerInvoiceData.data?.length === 1)
    const isSelectAllItemOfLastPage = (isSelectedAll && customerInvoiceData.current_page === customerInvoiceData.last_page)
    const isOutOfItemInPage = isLastItem || isSelectAllItemOfLastPage

    let tempoPageNumber = null;
    if ((customerInvoiceData.last_page > PAGINATION.START_PAGE) && isOutOfItemInPage) {
      tempoPageNumber = customerInvoiceData.current_page - 1
    } else {
      tempoPageNumber = PAGINATION.START_PAGE
    }

    const data = {
      invoice_id: deleteInfo?.deleteIds || [],
      page: +tempoPageNumber,
      search: normalizeString(searchText),
      start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY/MM/DD'),
      end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY/MM/DD'),
    };

    if (deleteInfo?.actionType === ACTIONS.NAME.MULTI_DELETE) {
      dispatch(actions.deleteCustomerInvoice({ ...data, onSuccess, onError }));
      setMessageError({})
      setSubmitting(true)
      setSelectedIds([])
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
    } else if (deleteInfo?.actionType === ACTIONS.NAME.DELETE && deleteInfo?.deleteIds) {
      dispatch(actions.deleteCustomerInvoice({ ...data, onSuccess, onError }));
      setSubmitting(true)
      setMessageError({})
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
      if (deleteInfo?.deleteIds) {
        setSelectedIds(selectedIds?.filter(id => !deleteInfo?.deleteIds?.includes(id)))
      }
    }
  }

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (actionType === ACTIONS.NAME.MULTI_DELETE) {
      handleSelectDeleteInfo(actionType)
    } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
      dispatch(actions.getExportCustomerInvoiceCSV({
        search: normalizeString(searchText),
        start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        invoice_id: selectedIds || [],
        customer_id: +id,
        onError
      }))
      setSubmitting(true)
      setSelectedItem(null)
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    const params = {
      customer_id: +id,
      page: pageNumber || PAGINATION.START_PAGE,
      onSuccess, onError,
    };
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }
    if (startDateFilter) {
      params.start_date = dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }
    if (endDateFilter) {
      params.end_date = dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD');
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

  const handleClickDownload = (data) => { }

  const renderInvoiceList = () => {
    return customerInvoiceData?.data?.map((data, index) => {
      const isChecked = selectedIds?.includes(data.id)
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
                clickDelete={handleSelectDeleteInfo}
                clickDownLoad={() => handleClickDownload(data)}
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
    history.push('/invoice/create-invoice')
  }

  return (
    <div className="csInvoice">
      <div className="csInvoice__actionBar">
        <CustomerTableAction
          isDetail={!!id}
          isShowFilter={true}
          searchText={searchText}
          buttonTitle="New Quotation"
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
          onClickDelete={() => handleDelete(deleteInfo)}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          isDetail={!!id}
          viewTab='invoice'
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
