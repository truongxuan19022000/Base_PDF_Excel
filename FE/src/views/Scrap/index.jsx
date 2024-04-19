import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useScrapSlice } from 'src/slices/scrap'
import { validatePermission, validateScrapFilterRequest } from 'src/helper/validation'
import { ACTIONS, ALERT, MESSAGE, PAGINATION, PERMISSION, SCRAP, STATUS } from 'src/constants/config'
import { normalizeString, sendEmail } from 'src/helper/helper'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import FilterScrapModal from 'src/components/ScrapForms/FilterScrapModal'

const Scrap = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { actions } = useScrapSlice()
  const { list, fetched } = useSelector(state => state.scrap)
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
  const [maxLength, setMaxLength] = useState('');
  const [minLength, setMinLength] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [isShowFilterModal, setIsShowFilterModal] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState([]);
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
      onError,
    };

    if (searchText?.length > 0) params.search = normalizeString(searchText);
    if (startDateFilter) params.start_date = dayjs(startDateFilter).format('YYYY-MM-DD');
    if (endDateFilter) params.end_date = dayjs(endDateFilter).format('YYYY-MM-DD');
    if (selectedStatusFilter?.length > 0) params.status = selectedStatusFilter;
    if (minLength) params.min_length = minLength;
    if (maxLength) params.max_length = maxLength;

    dispatch(actions.getCustomerList(params))
    setSelectedDeleteIds([])
  }

  const onSendSuccess = (url) => {
    const data = `To view or download attachment, click on the link below.
    ${url}`;
    sendEmail(data)
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getScraps({ page: PAGINATION.START_PAGE }))
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
      setSelectedIds(list?.data?.map(item => item.scrap_id) || []);
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
      selectedStatusFilter.length > 0 ||
      startDateFilter ||
      endDateFilter ||
      minLength ||
      maxLength
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
        status: selectedStatusFilter,
        min_length: minLength,
        max_length: maxLength,
      };
      const errors = validateScrapFilterRequest(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        isShowFilterModal && setIsFiltering(true);
        dispatch(actions.getScraps({ ...data, onError }));
        setSelectedIds([]);
        setMessageError({});
        setIsShowFilterModal(false)
      }
    }
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickDelete = (data) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.SCRAP, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (data.status === STATUS.SCRAP_UN_USED) {
        setSelectedDeleteIds([+data.scrap_id])
        setIsShowConfirmDeleteModal(true);
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MESSAGE.ERROR.UNKNOWN_ID,
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
      min_length: setMinLength,
      max_length: setMaxLength,
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
      status: selectedStatusFilter,
      min_length: minLength,
      max_length: maxLength,
    };
    dispatch(actions.getScraps({ ...data, onError }));
    setSelectedIds([]);
    setMessageError({});
    setIsShowFilterModal(false)
  }

  const handleAcceptDelete = () => {
    if (selectedDeleteIds.length === 0) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Deletion Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    } else {
      dispatch(actions.deleteMultiScrap({
        scrap_id: selectedDeleteIds,
        onDeleteSuccess,
        onError,
      }))
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const handleCheckScrapDeletable = (id, data) => {
    const item = data.find(item => item.scrap_id === id);
    const isDeletable = +item.status === STATUS.SCRAP_UN_USED
    return isDeletable;
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
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.SCRAP, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          const onlyUnusedItem = selectedIds.every(id => handleCheckScrapDeletable(id, list.data))
          if (onlyUnusedItem) {
            setSelectedDeleteIds(selectedIds)
            setIsShowConfirmDeleteModal(true)
          } else {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Action Failed',
              description: SCRAP.MESSAGE_ERROR.INCLUDE_USED_ITEM
            }));
          }
        } else {
          dispatchAlertWithPermissionDenied()
        }

      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportScrapCSV({
          scrap_ids: selectedIds,
          onError
        }))
        setSelectedItem(null)
      } else if (actionType === ACTIONS.NAME.EXPORT_TO_MAIL) {
        dispatch(actions.handleExportCSVToMail({
          scrap_ids: selectedIds,
          onError,
          onSendSuccess,
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
    };

    if (searchText?.length > 0) params.search = normalizeString(searchText);
    if (startDateFilter) params.start_date = dayjs(startDateFilter).format('YYYY-MM-DD');
    if (endDateFilter) params.end_date = dayjs(endDateFilter).format('YYYY-MM-DD');
    if (selectedStatusFilter?.length > 0) params.status = selectedStatusFilter;
    if (minLength) params.min_length = minLength;
    if (maxLength) params.max_length = maxLength;

    dispatch(actions.getScraps(params))
  }

  const handleClickResetFilter = () => {
    setMinLength('')
    setMaxLength('')
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setSelectedStatusFilter([])
    setIsFiltering(false)
    setMessageError({})
    setIsShowFilterModal(false)
    dispatch(actions.getScraps({
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
    }))
  }

  const handleCheckBoxChange = (value) => {
    if (selectedStatusFilter.includes(value)) {
      setSelectedStatusFilter(selectedStatusFilter.filter(id => id !== value))
    } else {
      setSelectedStatusFilter([...selectedStatusFilter, value])
    }
    setMessageError({})
  }

  const renderScrapList = () => {
    return list?.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.scrap_id);
      const status = STATUS.SCRAP.find(item => item.value === data.status)
      const isShowIcon = data.status === STATUS.SCRAP_UN_USED;
      const formattedDate = data.created_at ? dayjs(data.created_at).format('DD MMM YYYY') : '';
      return (
        <tr key={index} className={isChecked ? 'scrapTable__selected' : ''}>
          <td className="scrapTable__td scrapTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.scrap_id)}
            />
          </td>
          <td className="scrapTable__td">
            <div className="scrapTable__td--textBox">
              {data.item}
            </div>
          </td>
          <td className="scrapTable__td">
            <div className="scrapTable__td--textBox">
              {data.code}
            </div>
          </td>
          <td className="scrapTable__td">
            <div className="scrapTable__td--textBox">
              {data.reference_no}
            </div>
          </td>
          <td className="scrapTable__td">
            <div className="scrapTable__td--textBox">
              {data.product_code}
            </div>
          </td>
          <td className="scrapTable__td">
            <div className="scrapTable__td--textBox">
              {data.scrap_length} m
            </div>
          </td>
          <td className="scrapTable__td">
            <div className={`scrapTable__td--textBox scrapTable__status${status ? ` scrapTable__status--${status?.class}` : ''}`}>
              {status?.label}
            </div>
          </td>
          <td className="scrapTable__td">
            <div className="scrapTable__td--textBox">
              {formattedDate}
            </div>
          </td>
          <td className="scrapTable__td">
            <div className="scrapTable__td--buttons">
              <div
                className="tableButtons__icon"
                onClick={() => goToDetailPage(+data.scrap_id)}
              >
                <img
                  src="/icons/edit.svg"
                  alt="edit"
                />
              </div>
              {isShowIcon &&
                <>
                  <div
                    className="tableButtons__icon"
                    onClick={() => handleClickDelete(data)}
                  >
                    <img
                      src="/icons/delete.svg"
                      alt="delete"
                    />
                  </div>
                  <div
                    className="tableButtons__icon"
                    onClick={() => handleClickMail(+data.scrap_id)}
                  >
                    <img
                      src="/icons/mail.svg"
                      alt="mail"
                    />
                  </div>
                </>
              }
            </div>
          </td>
        </tr>
      )
    });
  }

  const goToDetailPage = (scrapId) => {
    scrapId && history.push(`/scrap-management/${scrapId}`)
  }

  const handleClickMail = (scrapId) => {
    scrapId && dispatch(actions.handleExportCSVToMail({
      scrap_ids: [scrapId],
      onError,
      onSendSuccess,
    }))
  }

  return (
    <div className="scrap">
      <TableAction
        tableUnit="scrap"
        isScrap={true}
        searchText={searchText}
        isFiltering={isFiltering}
        selectedItem={selectedItem}
        totalQuantity={totalDataNumber}
        actionList={ACTIONS.SCRAP_SCREEN}
        isShowFilterModal={isShowFilterModal}
        selectedQuantity={selectedIds?.length}
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        onClickApply={handleClickApply}
        setSelectedItem={setSelectedItem}
        setIsShowFilterModal={setIsShowFilterModal}
        isShowCreateButton={false}
      />
      <div className="scrap__table">
        <table className="scrapTable">
          <thead>
            <tr>
              <th className="scrapTable__th scrapTable__th--checkbox" style={{ width: '4%' }}>
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="scrapTable__th scrapTable__th--item">ITEM</th>
              <th className="scrapTable__th scrapTable__th--code">ITEM CODE</th>
              <th className="scrapTable__th scrapTable__th--reference">REFERENCE NO.</th>
              <th className="scrapTable__th scrapTable__th--product">PDT CODE</th>
              <th className="scrapTable__th scrapTable__th--length">LENGTH</th>
              <th className="scrapTable__th scrapTable__th--status">STATUS</th>
              <th className="scrapTable__th scrapTable__th--date">CREATED ON</th>
              <th className="scrapTable__th scrapTable__th--actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderScrapList()}
          </tbody>
        </table>
      </div>
      <div className="scrap__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="scrap"
          isShow={isShowConfirmDeleteModal}
          onClickDelete={handleAcceptDelete}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      )}
      {isShowFilterModal && (
        <FilterScrapModal
          isShowName={false}
          checkList={STATUS.SCRAP}
          minLength={minLength}
          maxLength={maxLength}
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

export default Scrap
