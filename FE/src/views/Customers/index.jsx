import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { alertActions } from 'src/slices/alert';
import { useCustomerSlice } from 'src/slices/customer';
import { validateFilterRequest, validatePermission } from 'src/helper/validation';
import { ACTIONS, ALERT, FILTER, LINKS, MESSAGE, PAGINATION, PERMISSION, ROLES } from 'src/constants/config';
import { normalizeString } from 'src/helper/helper';

import Checkbox from 'src/components/Checkbox';
import Pagination from 'src/components/Pagination';
import FilterModal from 'src/components/FilterModal';
import TableAction from 'src/components/TableAction';
import TableButtons from 'src/components/TableButtons';
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal';

const Customers = () => {
  const { actions } = useCustomerSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const currentUser = useSelector(state => state.user.user)
  const permissionData = useSelector(state => state.user.permissionData)

  const list = useSelector(state => state.customer.list)
  const fetched = useSelector(state => state.customer.fetched)
  const customers = useSelector(state => state.customer.list?.data)

  const [searchText, setSearchText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [messageError, setMessageError] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedFieldFilter, setSelectedFieldFilter] = useState(FILTER.DEFAULT.NAME)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([])

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
      sort_name: selectedFieldFilter,
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
      dispatch(actions.getCustomerList({ page: PAGINATION.START_PAGE }))
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
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged, isShowFilterModal])

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

  const handleClickDelete = (customerId) => {
    if (isDisableSubmit) return;
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CUSTOMER, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (customerId) {
        setSelectedDeleteIds([customerId])
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
      dispatch(actions.multiDeleteCustomer({
        customer_id: selectedDeleteIds,
        onDeleteSuccess,
        onError,
      }))
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([])

    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    };

    if (selectedFieldFilter?.length > 0) {
      params.sort_name = selectedFieldFilter;
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
    dispatch(actions.getCustomerList(params));
  }

  const handleSearch = () => {
    if (isDisableSubmit) return;
    const data = {
      search: normalizeString(searchText),
      sort_name: selectedFieldFilter,
      page: PAGINATION.START_PAGE,
      start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
      end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
    };
    const errors = validateFilterRequest(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.getCustomerList({ ...data, onError }));
      setSelectedIds([]);
      setMessageError({});
      setIsShowFilterModal(false)
    }
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
    setMessageError({})
  }

  const handleFilterSearchApply = () => {
    if (isDisableSubmit) return;
    const data = {
      search: normalizeString(searchText),
      sort_name: selectedFieldFilter,
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
      dispatch(actions.getCustomerList({ ...data, onError }));
      setSelectedIds([]);
      setMessageError('');
      setIsShowFilterModal(false)
    }
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setSelectedFieldFilter(FILTER.DEFAULT.NAME)
    setIsShowFilterModal(false)
    dispatch(actions.getCustomerList({
      page: PAGINATION.START_PAGE,
      sort_name: FILTER.DEFAULT.NAME,
      search: normalizeString(searchText),
    }))
  }

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (selectedIds.length > 0) {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CUSTOMER, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          setSelectedDeleteIds(selectedIds)
          setIsShowConfirmDeleteModal(true)
        } else {
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Action Deny',
            description: MESSAGE.ERROR.AUTH_ACTION,
          }))
        }
      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportCustomerCSV({
          sort_name: selectedFieldFilter || '',
          search: normalizeString(searchText),
          start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
          end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
          customer_ids: selectedIds,
          onError
        }))
        setSelectedItem(null)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Deletion Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    }
  }

  const goToDetailPage = (customerId) => {
    if (customerId) {
      history.push(`/customers/${customerId}?tab=details`)
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
      const isChecked = !!selectedIds?.includes(data.id);
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
                haveWhatsApp={currentUser.role_id === ROLES.ADMIN_ID}
                clickChat={goToChatPage}
                clickEdit={goToDetailPage}
                clickDelete={() => handleClickDelete(+data.id)}
              />
            </div>
          </td>
        </tr>
      )
    });
  }

  return (
    <div className="customers">
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
        permissionKey={PERMISSION.KEY.CUSTOMER}
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
          onClickDelete={handleAcceptedDelete}
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
