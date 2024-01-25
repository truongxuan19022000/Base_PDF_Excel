import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { useInvoiceSlice } from 'src/slices/invoice'
import { validateFilterRequest } from 'src/helper/validation'
import { downloadCSVFromCSVString, isEmptyObject, normalizeString } from 'src/helper/helper'
import { ACTIONS, FILTER, LINKS, MESSAGE, PAGINATION } from 'src/constants/config'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import FilterModal from 'src/components/FilterModal'
import TableAction from 'src/components/TableAction'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import ActionMessageForm from 'src/components/ActionMessageForm'

const Invoice = () => {
  const { actions } = useInvoiceSlice()
  const [selectedItem, setSelectedItem] = useState(null);

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.invoice.list)
  const csvData = useSelector(state => state.invoice.csvData)
  const fetched = useSelector(state => state.invoice.fetched)

  const [message, setMessage] = useState({})
  const [searchText, setSearchText] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
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
    if (!fetched) {
      dispatch(actions.getInvoiceList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    if (list && Object.keys(list)?.length > 0) {
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
    if (csvData?.length > 0 && submitting) {
      downloadCSVFromCSVString(csvData, 'invoice')
      setSubmitting(false)
      dispatch(actions.clearCSVData())
    }
  }, [submitting, csvData])

  useEffect(() => {
    if (!isEmptyObject(message)) {
      const timer = setTimeout(() => setMessage({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [message])

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
    const data = {
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
      dispatch(actions.getInvoiceList({ ...data, onSuccess, onError, }));
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
    const isLastItem = (list.data?.length === 1)
    const isSelectAllItemOfLastPage = (isSelectedAll && list.current_page === list.last_page)
    const isOutOfItemInPage = isLastItem || isSelectAllItemOfLastPage

    let tempoPageNumber = null;
    if ((list.last_page > PAGINATION.START_PAGE) && isOutOfItemInPage) {
      tempoPageNumber = list.current_page - 1
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
      dispatch(actions.multiDeleteInvoice({ ...data, onSuccess, onError }));
      setMessageError({})
      setSubmitting(true)
      setSelectedIds([])
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
    } else if (deleteInfo?.actionType === ACTIONS.NAME.DELETE && deleteInfo?.deleteIds) {
      dispatch(actions.multiDeleteInvoice({ ...data, onSuccess, onError }));
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
      dispatch(actions.getExportInvoiceCSV({
        search: normalizeString(searchText),
        start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        invoice_id: selectedIds || [],
        onError
      }))
      setSubmitting(true)
      setSelectedItem(null)
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([])

    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onSuccess, onError,
    }

    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }
    if (startDateFilter) {
      params.start_date = dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }
    if (endDateFilter) {
      params.end_date = dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }

    dispatch(actions.getInvoiceList(params))
  }

  const handleClickResetFilter = () => {
    setSearchText('')
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setIsShowFilterModal(false)
    dispatch(actions.getInvoiceList({ page: PAGINATION.START_PAGE }))
  }

  const handleClickDownload = (data) => { }

  const renderInvoiceList = () => {
    return list?.data?.map((data, index) => {
      const isChecked = selectedIds?.includes(data.id)
      const formattedDate = data.created_at ? dayjs(data.created_at).format('DD MMM YYYY') : 'NA';
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
      dispatch(actions.getSelectedInvoice(invoice))
    }
  }

  return (
    <div className="invoice">
      {!isEmptyObject(message) &&
        <div className="invoice__message">
          <ActionMessageForm
            successMessage={message.success}
            failedMessage={message.failed}
          />
        </div>
      }
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
              <th className="invoiceTable__th">ISSUED ON</th>
              <th className="invoiceTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderInvoiceList()}
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
          onClickDelete={() => handleDelete(deleteInfo)}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
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

export default Invoice
