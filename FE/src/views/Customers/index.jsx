import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { useCustomerSlice } from 'src/slices/customer';
import { validateFilterRequest } from 'src/helper/validation';
import { ACTIONS, FILTER, LINKS, MESSAGE, PAGINATION } from 'src/constants/config';
import { downloadCSVFromCSVString, isEmptyObject, normalizeString } from 'src/helper/helper';

import Checkbox from 'src/components/Checkbox';
import Pagination from 'src/components/Pagination';
import FilterModal from 'src/components/FilterModal';
import TableAction from 'src/components/TableAction';
import TableButtons from 'src/components/TableButtons';
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal';
import ActionMessageForm from 'src/components/ActionMessageForm';

const Customers = () => {
  const { actions } = useCustomerSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.customer.list)
  const currentUser = useSelector(state => state.user.user)
  const fetched = useSelector(state => state.customer.fetched)
  const customers = useSelector(state => state.customer.list?.data)
  const csvData = useSelector(state => state.customer.csvData)
  const currentURL = history.location.pathname.split('/')[1]

  const [message, setMessage] = useState({})
  const [searchText, setSearchText] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [messageError, setMessageError] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [haveWhatsApp, setHaveWhatsApp] = useState(false)
  const [isErrorExist, setIsErrorExist] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedFieldFilter, setSelectedFieldFilter] = useState(FILTER.DEFAULT.NAME)

  const onSuccess = () => {
    setMessageError('')
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowFilterModal(false)
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getCustomerList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    if (Object.keys(currentUser).length > 0) {
      const hasSendPermission = currentUser?.permission?.some(item => item.hasOwnProperty('customer') && item.customer.send === 1);
      setHaveWhatsApp(hasSendPermission)
    }
  }, [currentUser])

  useEffect(() => {
    if (list && Object.keys(list)?.length > 0) {
      setCurrentPageNumber(list.current_page)
      setTotalDataNumber(list?.total || 0)
    }
  }, [list])

  useEffect(() => {
    if (!isFiltering) {
      setSubmitting(false)
      setEndDateFilter('')
      setMessageError(null)
      setStartDateFilter('')
      setIsDisableSubmit(false)
      setSelectedFieldFilter(FILTER.DEFAULT.NAME)
    }
  }, [isFiltering])

  useEffect(() => {
    if (customers?.length > 0 && selectedIds?.length === customers?.length) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, customers])

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
      dispatch(actions.clearCSVDataCustomer())
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
      setSelectedIds(customers?.map(item => item.id) || []);
    } else {
      setSelectedIds([]);
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
      customer_id: deleteInfo?.deleteIds || [],
      page: +tempoPageNumber,
      search: normalizeString(searchText),
      sort_name: selectedFieldFilter,
      start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY/MM/DD'),
      end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY/MM/DD'),
    };

    if (deleteInfo?.actionType === ACTIONS.NAME.MULTI_DELETE) {
      dispatch(actions.multiDeleteCustomer({ ...data, onSuccess, onError }));
      setMessageError({})
      setSubmitting(true)
      setSelectedIds([])
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
    } else if (deleteInfo?.actionType === ACTIONS.NAME.DELETE && deleteInfo?.deleteIds) {
      dispatch(actions.multiDeleteCustomer({ ...data, onSuccess, onError }));
      setSubmitting(true)
      setMessageError({})
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
      if (deleteInfo?.deleteIds) {
        setSelectedIds(selectedIds?.filter(id => !deleteInfo?.deleteIds?.includes(id)))
      }
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([])

    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onSuccess, onError,
    };

    if (selectedFieldFilter?.length > 0) {
      params.sort_name = selectedFieldFilter;
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
    dispatch(actions.getCustomerList(params));
  }

  const handleSearch = () => {
    handleFilterSearchApply(normalizeString(searchText))
    setSelectedIds([])
  }

  const handleSelectFieldFilter = (value) => {
    if (submitting) return;
    if (selectedFieldFilter === value) {
      setSelectedFieldFilter('');
    } else {
      setSelectedFieldFilter(value);
    }
    setIsInputChanged(!isInputChanged)
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

  const handleFilterSearchApply = (searchText) => {
    if (isErrorExist || isDisableSubmit) return;
    const data = {
      search: searchText || '',
      sort_name: selectedFieldFilter || '',
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
      dispatch(actions.getCustomerList({ ...data, onSuccess, onError, }));
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError('');
      setIsDisableSubmit(true);
      setIsShowFilterModal(false)
    }
  }

  const handleClickResetFilter = () => {
    setSearchText('')
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setSelectedFieldFilter(FILTER.DEFAULT.NAME)
  }

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (actionType === ACTIONS.NAME.MULTI_DELETE) {
      handleSelectDeleteInfo(actionType)
    } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
      dispatch(actions.getExportCustomerCSV({
        sort_name: selectedFieldFilter || '',
        search: normalizeString(searchText),
        start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        customer_id: selectedIds || [],
        onError
      }))
      setSubmitting(true)
      setSelectedItem(null)
    }
  }

  const goToDetailPage = (customerId) => {
    if (customerId) {
      history.push(`/customers/${customerId}`)
    }
  }

  const goToChatPage = (customer) => {
    if (customer?.id) {
      history.push(`/customers/chats/${customer?.id}`)
      dispatch(actions.setSelectedCustomer(customer))
    }
  }

  const renderCustomers = () => {
    return customers?.map((data, index) => {
      const isChecked = selectedIds?.includes(data.id)
      const formattedDate = data.created_at ? dayjs(data.created_at).format('DD MMM YYYY') : 'NA';
      return (
        <tr key={index} className={isChecked ? 'customerTable__selected' : ''}>
          <td className="customerTable__td customerTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="customerTable__td">
            <div className="customerTable__td--textBox">
              {data.name}
            </div>
          </td>
          <td className="customerTable__td">
            <div className="customerTable__td--textBox">
              {data.phone_number}
            </div>
          </td>
          <td className="customerTable__td">
            <div className="customerTable__td--textBox">
              {data.email}
            </div>
          </td>
          <td className="customerTable__td">
            <div className="customerTable__td--textBox">
              {formattedDate}
            </div>
          </td>
          <td className="customerTable__td">
            <div className="customerTable__td--buttons">
              <TableButtons
                data={data}
                isShowEdit={true}
                isShowDelete={true}
                haveWhatsApp={haveWhatsApp}
                clickChat={goToChatPage}
                clickEdit={goToDetailPage}
                clickDelete={handleSelectDeleteInfo}
              />
            </div>
          </td>
        </tr>
      )
    });
  }

  return (
    <div className="customers">
      {!isEmptyObject(message) &&
        <div className="customers__message">
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
        createURL={LINKS.CREATE.CUSTOMER}
        buttonTitle="New Customer"
        tableUnit="customer"
      />
      <div className="customers__table">
        <table className="customerTable">
          <thead>
            <tr>
              <th className="customerTable__th customerTable__th--checkbox">
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="customerTable__th customerTable__th--name">NAME</th>
              <th className="customerTable__th customerTable__th--phone">PHONE</th>
              <th className="customerTable__th customerTable__th--email">EMAIL</th>
              <th className="customerTable__th">CREATED ON</th>
              <th className="customerTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderCustomers()}
          </tbody>
        </table>
      </div>
      <div className="customers__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          isShow={isShowConfirmDeleteModal}
          deleteTitle="customer"
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={() => handleDelete(deleteInfo)}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          filterTitle="Sort Name By"
          isCustomer={true}
          submitting={submitting}
          searchText={searchText}
          messageError={messageError}
          filterRequest={FILTER.NAME}
          endDateFilter={endDateFilter}
          startDateFilter={startDateFilter}
          isDisableSubmit={isDisableSubmit}
          selectedFieldFilter={selectedFieldFilter}
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

export default Customers
