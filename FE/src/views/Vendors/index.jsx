import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useVendorSlice } from 'src/slices/vendor'
import { validatePermission, validateScrapFilterRequest } from 'src/helper/validation'
import { ACTIONS, ALERT, FILTER, LINKS, MESSAGE, PAGINATION, PERMISSION, STATUS } from 'src/constants/config'
import { normalizeString } from 'src/helper/helper'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import FilterScrapModal from 'src/components/ScrapForms/FilterScrapModal'

const Vendor = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { actions } = useVendorSlice()
  const { list, fetched } = useSelector(state => state.vendor)
  const permissionData = useSelector(state => state.user.permissionData)

  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSelectedAll, setIsSelectedAll] = useState(false);
  const [totalDataNumber, setTotalDataNumber] = useState(0);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE);
  //filter's states
  const [endDateFilter, setEndDateFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [isShowFilterModal, setIsShowFilterModal] = useState(false);
  const [selectedNameFilter, setSelectedNameFilter] = useState(FILTER.VENDOR.DEFAULT_SOFT_VALUE);
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
      sort_name: selectedNameFilter,
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
      dispatch(actions.getVendorList({ page: PAGINATION.START_PAGE }))
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
    if (!isFiltering && !isShowFilterModal) {
      setSelectedNameFilter(FILTER.VENDOR.DEFAULT_SOFT_VALUE)
      setStartDateFilter('')
      setEndDateFilter('')
    }
  }, [isFiltering, isShowFilterModal])

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

  const handleFilterSearchApply = () => {
    if (isDisableSubmit) return;
    const isEmptyRequest = !(
      selectedNameFilter.length > 0 ||
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
        page: PAGINATION.START_PAGE,
        start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
        sort_name: selectedNameFilter,
      };
      const errors = validateScrapFilterRequest(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        isShowFilterModal && setIsFiltering(true);
        dispatch(actions.getVendorList({ ...data, onError }));
        setSelectedIds([]);
        setMessageError({});
        setIsShowFilterModal(false)
      }
    }
  }

  const handleClickDelete = (deleteId) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.VENDOR, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (deleteId) {
        setSelectedDeleteIds([deleteId])
        setIsShowConfirmDeleteModal(true);
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MESSAGE.ERROR.UNKNOWN_ID
        }))
      }
    } else {
      dispatchAlertWithPermissionDenied()
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

  const handleSearch = () => {
    const data = {
      search: normalizeString(searchText),
      page: PAGINATION.START_PAGE,
      start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
      end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
      sort_name: selectedNameFilter,
    };
    dispatch(actions.getVendorList({ ...data, onError }));
    setSelectedIds([]);
    setMessageError({});
    setIsShowFilterModal(false)
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
      dispatch(actions.deleteMultiVendor({
        vendor_id: selectedDeleteIds,
        onDeleteSuccess,
        onError,
      }))
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (selectedIds.length === 0) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION
      }));
    } else {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.VENDOR, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          setSelectedDeleteIds(selectedIds)
          setIsShowConfirmDeleteModal(true)
        } else {
          dispatchAlertWithPermissionDenied()
        }
      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportVendorCSV({
          vendor_ids: selectedIds,
          onError
        }))
        setSelectedItem(null)
      }
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([])
    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    }

    if (selectedNameFilter) {
      params.sort_name = selectedNameFilter;
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

    dispatch(actions.getVendorList(params))
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setSelectedNameFilter(FILTER.VENDOR.DEFAULT_SOFT_VALUE)
    setIsFiltering(false)
    setMessageError({})
    setIsShowFilterModal(false)
    dispatch(actions.getVendorList({
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
    }))
  }

  const handleCheckBoxChange = (value) => {
    setSelectedNameFilter(value)
    setMessageError({})
  }

  const renderVendorList = () => {
    return list?.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      const formattedDate = data.created_at ? dayjs(data.created_at).format('DD MMM YYYY') : '';
      return (
        <tr key={index} className={isChecked ? 'vendorTable__selected' : ''}>
          <td className="vendorTable__td vendorTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="vendorTable__td">
            <div className="vendorTable__td--textBox">
              {data.vendor_name}
            </div>
          </td>
          <td className="vendorTable__td">
            <div className="vendorTable__td--textBox">
              {data.phone}
            </div>
          </td>
          <td className="vendorTable__td">
            <div className="vendorTable__td--textBox">
              {data.email}
            </div>
          </td>
          <td className="vendorTable__td">
            <div className="vendorTable__td--textBox">
              {formattedDate}
            </div>
          </td>
          <td className="vendorTable__td">
            <div className="vendorTable__td--buttons">
              <div
                className="tableButtons__icon"
                onClick={() => goToDetailPage(+data.id)}
              >
                <img
                  src="/icons/edit.svg"
                  alt="edit"
                />
              </div>
              <div
                className="tableButtons__icon"
                onClick={() => handleClickDelete(+data.id)}
              >
                <img
                  src="/icons/delete.svg"
                  alt="delete"
                />
              </div>
            </div>
          </td>
        </tr>
      )
    });
  }

  const goToDetailPage = (vendorId) => {
    vendorId && history.push(`/inventory/vendors/${vendorId}?tab=details`)
  }

  return (
    <div className="vendor">
      <TableAction
        tableUnit="vendor"
        buttonTitle="New Vendor"
        isVendor={true}
        searchText={searchText}
        isFiltering={isFiltering}
        selectedItem={selectedItem}
        totalQuantity={totalDataNumber}
        actionList={ACTIONS.MAIN}
        createURL={LINKS.CREATE.VENDOR}
        isShowFilterModal={isShowFilterModal}
        selectedQuantity={selectedIds?.length}
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        onClickApply={handleClickApply}
        setSelectedItem={setSelectedItem}
        setIsShowFilterModal={setIsShowFilterModal}
        permissionKey={PERMISSION.KEY.VENDOR}
      />
      <div className="vendor__table">
        <table className="vendorTable">
          <thead>
            <tr>
              <th className="vendorTable__th vendorTable__th--checkbox" style={{ width: '4%' }}>
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="vendorTable__th vendorTable__th--vendor">VENDOR NAME</th>
              <th className="vendorTable__th vendorTable__th--phone">PHONE</th>
              <th className="vendorTable__th vendorTable__th--email">EMAIL</th>
              <th className="vendorTable__th vendorTable__th--date">CREATED ON</th>
              <th className="vendorTable__th vendorTable__th--actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderVendorList()}
          </tbody>
        </table>
      </div>
      <div className="vendor__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="vendor"
          isShow={isShowConfirmDeleteModal}
          onClickDelete={handleAcceptedDelete}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      )}
      {isShowFilterModal && (
        <FilterScrapModal
          checkList={STATUS.VENDOR}
          isShowStatus={false}
          isShowLength={false}
          messageError={messageError}
          endDateFilter={endDateFilter}
          startDateFilter={startDateFilter}
          isDisableSubmit={isDisableSubmit}
          selectedStatus={selectedNameFilter}
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

export default Vendor
