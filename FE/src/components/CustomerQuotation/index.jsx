import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { useCustomerSlice } from 'src/slices/customer'
import { validateFilterRequest } from 'src/helper/validation'
import { downloadCSVFromCSVString, formatCustomerName, normalizeString } from 'src/helper/helper'
import { ACTIONS, FILTER, MESSAGE, PAGINATION, STATUS } from 'src/constants/config'

import Checkbox from '../Checkbox'
import Pagination from '../Pagination'
import FilterModal from '../FilterModal'
import TableButtons from '../TableButtons'
import ConfirmDeleteModal from '../ConfirmDeleteModal'
import CustomerTableAction from '../CustomerTableAction'

const CustomerQuotation = ({
  customerName = '',
  setMessage,
}) => {
  const { actions } = useCustomerSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const csvData = useSelector(state => state.customer.csvData)
  const customerQuotationData = useSelector(state => state.customer.customerQuotation)

  const [searchText, setSearchText] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
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
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedFieldFilter, setSelectedFieldFilter] = useState([])
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
      dispatch(actions.getCustomerQuotationList({ customer_id: +id }))
    }
  }, [id])

  useEffect(() => {
    if (customerQuotationData && Object.keys(customerQuotationData)?.length > 0) {
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
    if (!isShowConfirmDeleteModal) {
      setDeleteInfo({})
      setIsDisableSubmit(false)
    }
  }, [isShowConfirmDeleteModal])

  useEffect(() => {
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged, isShowFilterModal])

  useEffect(() => {
    if (messageError?.length > 0) {
      setIsErrorExist(true)
    } else {
      setIsErrorExist(false)
    }
  }, [messageError])

  useEffect(() => {
    if (csvData?.length > 0 && submitting) {
      const filename = formatCustomerName(customerName) + '_quotation'
      downloadCSVFromCSVString(csvData, filename)
      setSubmitting(false)
      dispatch(actions.clearCSVDataCustomer())
    }
  }, [submitting, csvData])

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

  const handleSelectFieldFilter = (value) => {
    if (submitting) return;
    if (selectedFieldFilter?.includes(value)) {
      setSelectedFieldFilter(selectedFieldFilter?.filter(id => id !== value));
    } else {
      setSelectedFieldFilter([...selectedFieldFilter, value]);
    }
    setIsInputChanged(!isInputChanged)
  }

  const handleSelectDeleteInfo = (typeName, deleteId) => {
    if (!typeName || (typeName !== ACTIONS.NAME.DELETE && typeName !== ACTIONS.NAME.MULTI_DELETE)) return;
    if (typeName === ACTIONS.NAME.DELETE && deleteId) {
      setDeleteInfo({
        actionType: typeName,
        deleteId: deleteId,
      });
    } else if (typeName === ACTIONS.NAME.MULTI_DELETE && (!selectedIds || selectedIds.length === 0)) {
      setMessage({
        failed: MESSAGE.ERROR.NO_DELETE_ID
      })
      return;
    } else {
      setDeleteInfo({
        actionType: typeName,
      });
    }
    setIsShowConfirmDeleteModal(true);
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([]);

    const params = {
      customer_id: +id,
      page: pageNumber || PAGINATION.START_PAGE,
      onSuccess, onError,
    }
    if (selectedFieldFilter?.length > 0) {
      params.status = selectedFieldFilter;
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

    dispatch(actions.getCustomerQuotationList(params));
  }

  const handleInputDateFilter = (date, field) => {
    if (submitting) return;
    if (field === 'startDate') {
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

  const handleFilterSearchApply = (searchText) => {
    if (isErrorExist || isDisableSubmit) return;
    if (selectedFieldFilter?.length === 0 && !startDateFilter && !endDateFilter) {
      setIsShowFilterModal(false);
      setIsFiltering(false);
      dispatch(actions.getCustomerQuotationList({
        customer_id: +id,
        search: searchText || '',
        page: PAGINATION.START_PAGE,
        onSuccess,
        onError,
      }));
    } else {
      const data = {
        customer_id: +id,
        search: searchText || '',
        status: selectedFieldFilter || [],
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
        dispatch(actions.getCustomerQuotationList({ ...data, onSuccess, onError, }));
        setSelectedIds([]);
        setSubmitting(true);
        setMessageError('');
        setIsDisableSubmit(true);
      }
    }
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setSelectedFieldFilter([])
  }

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (actionType === ACTIONS.NAME.MULTI_DELETE) {
      handleSelectDeleteInfo(actionType)
    } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
      dispatch(actions.getExportCustomerQuotationCSV({
        status: selectedFieldFilter || [],
        search: normalizeString(searchText),
        start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        quotation_id: selectedIds || [],
        customer_id: +id,
        onError
      }))
      setSubmitting(true)
      setSelectedAction(null)
    }
  }

  const handleDelete = (e, actionType, deleteId) => {
    if (isDisableSubmit || !actionType) return;
    if (actionType === ACTIONS.NAME.MULTI_DELETE && selectedIds?.length > 0) {
      const data = { quotation_id: selectedIds };
      dispatch(actions.deleteCustomerQuotation({ ...data, onSuccess, onError }));
      setSelectedIds([])
      setIsDisableSubmit(true)
    } else if (actionType === ACTIONS.NAME.DELETE && deleteId) {
      e.stopPropagation()
      dispatch(actions.deleteCustomerQuotation({ quotation_id: [deleteId], onSuccess, onError }));
      setIsDisableSubmit(true)
      if (selectedIds?.includes(deleteId)) {
        setSelectedIds(selectedIds?.filter(id => id !== deleteId));
      }
    }
  }

  const goToDetailPage = (quotationId) => {
    if (quotationId) {
      history.push(`/quotation/${quotationId}?tab=details`)
    }
  }

  const handleClickDownload = () => {
  }

  const goToCreateNewQuotationPage = () => {
    history.push('/quotation/create-quotation')
  }

  const renderTableList = () => {
    return customerQuotationData?.data?.map((data, index) => {
      const isChecked = selectedIds?.includes(data.id)
      const formattedDate = data.created_at ? dayjs(data.created_at).format('DD MMM YYYY') : 'NA';
      const status = STATUS.QUOTATION[data.status]

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
              <TableButtons
                data={data}
                isShowEdit={true}
                isShowDelete={true}
                isShowDownLoad={true}
                clickEdit={goToDetailPage}
                clickDownLoad={handleClickDownload}
                clickDelete={handleSelectDeleteInfo}
              />
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
                <th className="csQuotationTable__th csQuotationTable__th--create">CREATED ON</th>
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
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={(e) => handleDelete(e, deleteInfo?.actionType, Number(deleteInfo?.deleteId))}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          isDetail={!!id}
          filterTitle="Filter Status"
          searchText={searchText || ''}
          submitting={submitting || false}
          messageError={messageError || ''}
          filterRequest={FILTER.STATUS || []}
          endDateFilter={endDateFilter || ''}
          startDateFilter={startDateFilter || ''}
          isDisableSubmit={isDisableSubmit || false}
          selectedFieldFilter={selectedFieldFilter || ''}
          onClickApply={handleFilterSearchApply}
          handleInputDateFilter={handleInputDateFilter}
          handleClickResetFilter={handleClickResetFilter}
          handleSelectFieldFilter={handleSelectFieldFilter}
          onClickCancel={() => setIsShowFilterModal(false)}
        />
      )}
    </div>
  )
}

export default CustomerQuotation
