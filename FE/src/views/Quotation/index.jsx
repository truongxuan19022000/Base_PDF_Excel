import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { useQuotationSlice } from 'src/slices/quotation'
import { validateFilterRequest } from 'src/helper/validation'
import { downloadCSVFromCSVString, isEmptyObject, normalizeString } from 'src/helper/helper'
import { ACTIONS, FILTER, LINKS, MESSAGE, PAGINATION, QUOTATION_HEADER_FILTER, STATUS } from 'src/constants/config'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import FilterModal from 'src/components/FilterModal'
import TableAction from 'src/components/TableAction'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import { CAlert } from '@coreui/react'
import ActionMessageForm from 'src/components/ActionMessageForm'

const Quotation = () => {
  const { actions } = useQuotationSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.quotation.list)
  const fetched = useSelector(state => state.quotation.fetched)
  const quotations = useSelector(state => state.quotation.list?.data)
  const isQuotationUpdate = useSelector(state => state.quotation.isUpdated)
  const csvData = useSelector(state => state.quotation.csvData)
  const currentURL = history.location.pathname.split('/')[1]

  const [message, setMessage] = useState({})
  const [searchText, setSearchText] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
  const [selectedIds, setSelectedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [isErrorExist, setIsErrorExist] = useState(false)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedFieldFilter, setSelectedFieldFilter] = useState([])
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [isOpenBadgeBox, setIsOpenBadgeBox] = useState(false);
  const [badge, setBadge] = useState(QUOTATION_HEADER_FILTER.THIS_MONTH);
  const [selectedItem, setSelectedItem] = useState(null)

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
      dispatch(actions.getQuotationList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    if (isQuotationUpdate) {
      dispatch(actions.getQuotationList({ page: PAGINATION.START_PAGE }))
    }
  }, [isQuotationUpdate])

  useEffect(() => {
    if (list && Object.keys(list)?.length > 0) {
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
    if (!isEmptyObject(message)) {
      const timer = setTimeout(() => setMessage({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [message])

  useEffect(() => {
    if (csvData?.length > 0 && submitting) {
      downloadCSVFromCSVString(csvData, currentURL)
      setSubmitting(false)
      dispatch(actions.clearCSVQuotationData())
    }
  }, [submitting, csvData, currentURL])

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

  const handleSelectFieldFilter = (value) => {
    if (submitting) {
      return
    }

    if (selectedFieldFilter?.includes(value)) {
      setSelectedFieldFilter(selectedFieldFilter?.filter(id => id !== value));
    } else {
      setSelectedFieldFilter([...selectedFieldFilter, value]);
    }
    setIsInputChanged(!isInputChanged)
  }

  const handleSelectDeleteInfo = (typeName, deleteId) => {
    if (!typeName || (typeName !== ACTIONS.NAME.DELETE && typeName !== ACTIONS.NAME.MULTI_DELETE)) {
      return;
    }
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
    const params = {
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

    dispatch(actions.getQuotationList(params))
    setSelectedIds([])
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
    const data = {
      search: searchText || '',
      status: selectedFieldFilter || '',
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
      dispatch(actions.getQuotationList({ ...data, onSuccess, onError, }));
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError('');
      setIsDisableSubmit(true);
    }
  }

  const handleClickResetFilter = () => {
    setSearchText('')
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setSelectedFieldFilter([])
  }

  const handleDelete = (e, actionType, deleteId) => {
    if (isDisableSubmit || !actionType) {
      return;
    }

    if (actionType === ACTIONS.NAME.MULTI_DELETE && selectedIds?.length > 0) {
      const data = { quotation_id: selectedIds };
      dispatch(actions.multiDeleteQuotation({ ...data, onSuccess, onError }));
      setSelectedIds([])
      setIsDisableSubmit(true)
    } else if (actionType === ACTIONS.NAME.DELETE && deleteId) {
      e.stopPropagation()
      dispatch(actions.multiDeleteQuotation({ quotation_id: [deleteId], onSuccess, onError }));
      setIsDisableSubmit(true)
      if (selectedIds?.includes(deleteId)) {
        setSelectedIds(selectedIds?.filter(id => id !== deleteId));
      }
    }
  }

  const handleSetBadge = (item) => {
    setBadge(item)
    setIsOpenBadgeBox(false)
  }

  const goToDetailPage = (id) => {
    if (id) {
      history.push(`/quotation/${id}?tab=details`)
    }
  }

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (actionType === ACTIONS.NAME.MULTI_DELETE) {
      handleSelectDeleteInfo(actionType)
    } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
      dispatch(actions.getExportQuotationCSV({
        status: selectedFieldFilter || '',
        search: normalizeString(searchText),
        start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        quotation_id: selectedIds || [],
        onError
      }))
      setSubmitting(true)
      setSelectedItem(null)
    }
  }

  const handleClickDownload = () => {
  }

  const renderSummary = () => (
    <div className="quotationBox">
      <div className="quotationBox__wrapper">
        <div className="quotationBox__header">
          <div className="quotationBox__headerTitle">
            <img src="/icons/dollar.svg" alt="cash" />
            <p className="quotationBox__headerText">ESTIMATED REVENUE</p>
          </div>
          <div className="quotationBox__filterWrapper">
            <div className="quotationBox__filter" onClick={() => setIsOpenBadgeBox(!isOpenBadgeBox)}>
              <p>{badge}</p>
              <img src="/icons/arrow_down.svg" alt="dropdown" />
            </div>
            {isOpenBadgeBox &&
              <div className="quotationBox__filterBox">
                {Object.values(QUOTATION_HEADER_FILTER)?.map((item, index) => (
                  <div
                    key={index}
                    className={`quotationBox__filterItem ${badge === item ? 'quotationBox__filterItem--select' : 0}`}
                    onClick={() => handleSetBadge(item)}
                  >
                    {item}
                  </div>
                ))
                }
              </div>
            }
          </div>
        </div>
        <div className="quotationBox__reportWrapper">
          {STATUS.QUOTATION?.map((item, index) => (
            <div key={index} className="quotationBox__reportInner">
              <p className="quotationBox__reportInnerText">
                $ 101,000
              </p>
              <div className={`quotationBox__status quotationBox__status--${item?.class}`}>
                {item?.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="quotationBox__count">
        <div className="quotationBox__header">
          <div className="quotationBox__headerTitle">
            <img src="/icons/circle-list.svg" alt="list" />
            <p className="quotationBox__headerText">NEW QUOTATION</p>
          </div>
        </div>
        <div className="quotationBox__reportWrapper">
          <div className="quotationBox__reportInner">
            <p className="quotationBox__reportInnerText">
              5
            </p>
            <div className="quotationBox__status">
              this month
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTableList = () => {
    return quotations?.map((data, index) => {
      const isChecked = selectedIds?.includes(data.id)
      const formattedDate = data.created_at ? dayjs(data.created_at).format('DD MMM YYYY') : 'NA';
      const status = STATUS.QUOTATION.find(item => item.value === data.status)

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
    <div className="quotation">
      <div className="quotation__summary">
        {renderSummary()}
      </div>
      {!isEmptyObject(message) &&
        <div className="quotation__message">
          <ActionMessageForm
            successMessage={message.success}
            failedMessage={message.failed}
          />
        </div>
      }
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
        />
        <div className="quotation__table">
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
                <th className="quotationTable__th">STATUS</th>
                <th className="quotationTable__th">ISSUED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {renderTableList()}
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
          onClickDelete={(e) => handleDelete(e, deleteInfo?.actionType, Number(deleteInfo?.deleteId))}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          filterTitle="Filter Status"
          submitting={submitting || false}
          searchText={searchText || ''}
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

export default Quotation
