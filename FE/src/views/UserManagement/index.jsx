import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { alertActions } from 'src/slices/alert'
import { useUserSlice } from 'src/slices/user'
import { normalizeString } from 'src/helper/helper'
import { ACTIONS, ALERT, FILTER, LINKS, MESSAGE, PAGINATION, PERMISSION, ROLES, USER, USER_PER_PAGE, } from 'src/constants/config'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const UserManagement = () => {
  const { actions } = useUserSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.user.list)
  const currentUser = useSelector(state => state.user.user)
  const fetched = useSelector(state => state.user.fetchedList)
  const userList = useSelector(state => state.user.list?.data)
  const permissionData = useSelector(state => state.user.permissionData)

  const [searchText, setSearchText] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [messageError, setMessageError] = useState({})
  const [selectedRoleFilter, setSelectedRoleFilter] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isErrorExist, setIsErrorExist] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedNameFilter, setSelectedNameFilter] = useState(FILTER.DEFAULT.NAME)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);

  const userInPage = useMemo(() => {
    if (userList?.length > USER_PER_PAGE) {
      return userList?.slice(0, USER_PER_PAGE)
    }
    return userList
  }, [userList])

  const onSuccess = () => {
    setMessageError({})
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
  }

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
      role_id: selectedRoleFilter,
      search: normalizeString(searchText),
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
      dispatch(actions.getUserList({ page: PAGINATION.START_PAGE }))
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
    if (messageError && Object.keys(messageError).length > 0) {
      const timer = setTimeout(() => setMessageError({}), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageError]);

  useEffect(() => {
    if (messageError?.length > 0) {
      setIsErrorExist(true)
    } else {
      setIsErrorExist(false)
    }
  }, [messageError])

  useEffect(() => {
    if (!isFiltering) {
      setSubmitting(false)
      setMessageError(null)
      setIsDisableSubmit(false)
      setSelectedNameFilter(FILTER.DEFAULT.NAME)
    }
  }, [isFiltering])

  useEffect(() => {
    if (userList?.length > 0 && selectedIds?.length === userList?.length) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, userList])

  useEffect(() => {
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged, isShowFilterModal])

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
      setSelectedIds(userList?.map(item => item.id) || [])
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

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([]);

    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    }
    if (selectedNameFilter?.length > 0) {
      params.sort_name = selectedNameFilter;
    }
    if (selectedRoleFilter?.length > 0) {
      params.role_id = selectedRoleFilter;
    }
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }
    dispatch(actions.getUserList(params));
  }

  const handleSearch = () => {
    handleFilterSearchApply(normalizeString(searchText))
    setSelectedIds([])
  }

  const handleSelectFieldFilter = (value) => {
    if (submitting) return;
    if (selectedNameFilter === value) {
      setSelectedNameFilter('');
    } else {
      setSelectedNameFilter(value);
    }
    setIsInputChanged(!isInputChanged)
  }

  const handleSelectRoleFilter = (itemId) => {
    if (submitting || !itemId) return;
    if (selectedRoleFilter?.includes(itemId)) {
      setSelectedRoleFilter(selectedRoleFilter?.filter(id => id !== itemId) || [])
    } else {
      setSelectedRoleFilter([...selectedRoleFilter, itemId])
    }
    setIsInputChanged(!isInputChanged);
  }

  const handleFilterSearchApply = (searchText) => {
    if (isErrorExist || isDisableSubmit) return;
    const data = {
      search: normalizeString(searchText),
      sort_name: selectedNameFilter || '',
      role_id: selectedRoleFilter ? selectedRoleFilter : undefined,
      page: PAGINATION.START_PAGE,
    };
    const errors = validateFilterRequest(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      if (isShowFilterModal) {
        setIsFiltering(true);
      }
      dispatch(actions.getUserList({ ...data, onError, onSuccess }));
      setSelectedIds([]);
      setSubmitting(true);
      setIsDisableSubmit(true);
      setMessageError('');
      setIsShowFilterModal(false);
    }
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setIsFiltering(false)
    setSelectedRoleFilter([])
    setSelectedNameFilter(FILTER.DEFAULT.NAME)
    setCurrentPageNumber(PAGINATION.START_PAGE)
    setIsShowFilterModal(false)
    dispatch(actions.getUserList({
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
    }))
  }

  const handleClickDelete = (data) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.USER, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      const isAdminRole = data.role_id === ROLES.ADMIN_ID;
      const isCurrentUser = data.id === currentUser.id;

      if (isCurrentUser) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MESSAGE.ERROR.SELF_DELETE
        }))
      } else if (isAdminRole) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MESSAGE.ERROR.ADMIN_DELETE
        }))
      } else {
        setSelectedDeleteIds([+data.id])
        setIsShowConfirmDeleteModal(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
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
      dispatch(actions.multiDeleteUser({ user_id: selectedDeleteIds, onDeleteSuccess, onError }));
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const handleCheckIncludeAdmin = (id, data) => {
    const item = data.find(item => item.id === id);
    const isDeletable = +item.role_id === ROLES.ADMIN_ID
    return isDeletable;
  };

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickApply = (actionType) => {
    if (selectedIds.length === 0) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION
      }));
    } else {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.USER, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          const isIncludeAdmin = selectedIds.find(id => handleCheckIncludeAdmin(id, list.data))
          const isIncludeCurrentUser = selectedIds.find(id => id === +currentUser.id)

          if (isIncludeCurrentUser) {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: selectedIds.length > 1 ?
                USER.MESSAGE_ERROR.INCLUDE_CURRENT_USER : USER.MESSAGE_ERROR.SELF_DELETE
            }))
          } else if (isIncludeAdmin) {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: selectedIds.length > 1 ?
                USER.MESSAGE_ERROR.INCLUDE_ADMIN : USER.MESSAGE_ERROR.DELETE_ADMIN
            }))
          } else {
            setSelectedDeleteIds(selectedIds)
            setIsShowConfirmDeleteModal(true)
          }
        } else {
          dispatchAlertWithPermissionDenied()
        }

      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportUserCSV({
          user_ids: selectedIds,
          onError
        }))
        setSelectedItem(null)
      }
    }
  }

  const goToEditPage = (userId) => {
    if (userId) {
      history.push(`/user-management/${userId}`)
    }
  }

  const renderTableList = () => {
    return userInPage?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      return (
        <tr key={index} className={isChecked ? 'userTable__selected' : ''}>
          <td className="userTable__td userTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="userTable__td">
            <div className="useTable__td--textBox">
              {data.name}
            </div>
          </td>
          <td className="userTable__td">
            <div className="useTable__td--textBox">
              {data.username}
            </div>
          </td>
          <td className="userTable__td">
            <div className="useTable__td--textBox">
              {data.role_name}
            </div>
          </td>
          <td className="userTable__td">
            <div className="useTable__td--textBox">
              {data.email}
            </div>
          </td>
          <td className="userTable__td">
            <div className="userTable__td--buttons">
              <TableButtons
                data={data}
                isShowEdit={true}
                isShowDelete={true}
                clickEdit={goToEditPage}
                clickDelete={() => handleClickDelete(data)}
              />
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="user">
      <TableAction
        searchText={searchText}
        isFiltering={isFiltering}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        actionList={ACTIONS.MAIN || []}
        totalQuantity={list?.total || 0}
        selectedQuantity={selectedIds?.length || null}
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        onClickApply={handleClickApply}
        setIsShowFilterModal={setIsShowFilterModal}
        createURL={LINKS.CREATE.USER}
        buttonTitle="New User"
        tableUnit="user"
        permissionKey={PERMISSION.KEY.USER}
      />
      <div className="user__table">
        {messageError?.admin && (
          <div className="user__message">{messageError?.admin}</div>
        )}
        {messageError?.current_user && (
          <div className="user__message">{messageError?.current_user}</div>
        )}
        <table className="userTable">
          <thead>
            <tr>
              <th className="userTable__th userTable__th--checkBox">
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="userTable__th userTable__th--name">Name</th>
              <th className="userTable__th userTable__th--userName">USERNAME</th>
              <th className="userTable__th userTable__th--role">ROLE</th>
              <th className="userTable__th userTable__th--email">EMAIL</th>
              <th className="userTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderTableList()}
          </tbody>
        </table>
      </div>
      <div className="user__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="user"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleAcceptedDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          filterTitle="Sort Name By"
          submitting={submitting || false}
          searchText={searchText || ''}
          messageError={messageError || ''}
          filterRequest={FILTER.NAME || []}
          selectedRoleFilter={selectedRoleFilter}
          isDisableSubmit={isDisableSubmit || false}
          selectedNameFilter={selectedNameFilter || ''}
          onClickApply={handleFilterSearchApply}
          handleSelectRoleFilter={handleSelectRoleFilter}
          handleClickResetFilter={handleClickResetFilter}
          handleSelectFieldFilter={handleSelectFieldFilter}
          onClickCancel={() => setIsShowFilterModal(false)}
        />
      )}
    </div>
  )
}

export default UserManagement
