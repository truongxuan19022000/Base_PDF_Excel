import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { useUserSlice } from 'src/slices/user'
import { downloadCSVFromCSVString, isEmptyObject, normalizeString } from 'src/helper/helper'
import { ACTIONS, FILTER, LINKS, MESSAGE, PAGINATION, USER_PER_PAGE, } from 'src/constants/config'
import { validateFilterRequest, validateUserDeleteRequest } from 'src/helper/validation'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import ActionMessageForm from 'src/components/ActionMessageForm'

const UserManagement = () => {
  const { actions } = useUserSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const currentURL = history.location.pathname.split('/')[1]

  const list = useSelector(state => state.user.list)
  const currentUser = useSelector(state => state.user.user)
  const fetched = useSelector(state => state.user.fetchedList)
  const userList = useSelector(state => state.user.list?.data)
  const isUserUpdated = useSelector(state => state.user.isUserUpdated)
  const csvUserData = useSelector(state => state.user.csvData)

  const [message, setMessage] = useState({})
  const [searchText, setSearchText] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
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
  const [selectedFieldFilter, setSelectedFieldFilter] = useState(FILTER.DEFAULT.NAME)

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
      dispatch(actions.getUserList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    if (isUserUpdated) {
      dispatch(actions.getUserList({ page: PAGINATION.START_PAGE }))
    }
  }, [isUserUpdated])

  useEffect(() => {
    if (list && Object.keys(list)?.length > 0) {
      setCurrentPageNumber(list.current_page)
      setTotalDataNumber(list?.total || 0)
    }
  }, [list])

  useEffect(() => {
    if (messageError && Object.keys(messageError)?.length > 0) {
      const timer = setTimeout(() => setMessageError({}), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageError]);

  useEffect(() => {
    if (!isEmptyObject(message)) {
      const timer = setTimeout(() => setMessage({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [message])

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
      setSelectedFieldFilter(FILTER.DEFAULT.NAME)
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
    if (csvUserData?.length > 0 && submitting) {
      downloadCSVFromCSVString(csvUserData, currentURL)
      setSubmitting(false)
      dispatch(actions.clearCSVUserData())
    }
  }, [submitting, csvUserData, currentURL])

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
      onSuccess, onError,
    }
    if (selectedFieldFilter?.length > 0) {
      params.sort_name = selectedFieldFilter;
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
    if (selectedFieldFilter === value) {
      setSelectedFieldFilter('');
    } else {
      setSelectedFieldFilter(value);
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
      search: searchText || '',
      sort_name: selectedFieldFilter || '',
      role_id: selectedRoleFilter ? selectedRoleFilter : undefined,
      page: PAGINATION.START_PAGE,
    };
    const errors = validateFilterRequest(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
      setIsDisableSubmit(true);
    } else {
      if (isShowFilterModal) {
        setIsFiltering(true);
      }
      dispatch(actions.getUserList({ ...data, onSuccess, onError, }));
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError('');
      setIsDisableSubmit(true);
      setIsShowFilterModal(false);
    }
  }

  const handleClickResetFilter = () => {
    setSearchText('')
    setSelectedIds([])
    setIsFiltering(false)
    setSelectedRoleFilter([])
    setSelectedFieldFilter(FILTER.DEFAULT.NAME)
    setCurrentPageNumber(PAGINATION.START_PAGE)
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
    if (deleteInfo?.actionType === ACTIONS.NAME.MULTI_DELETE || deleteInfo?.actionType === ACTIONS.NAME.DELETE) {
      const data = { user_id: deleteInfo?.deleteIds || [] };
      const errors = validateUserDeleteRequest(data, userList, currentUser)
      if (Object.keys(errors)?.length !== 0) {
        setMessageError(errors)
        setIsShowConfirmDeleteModal(false)
        setIsDisableSubmit(true)
      } else {
        dispatch(actions.multiDeleteUser({ ...data, onSuccess, onError }));
        setSelectedIds([])
        setMessageError({})
        setIsDisableSubmit(true)
        setSubmitting(true)
      }
    } else if (deleteInfo?.actionType === ACTIONS.NAME.DELETE && deleteInfo?.deleteIds) {
      const data = { user_id: deleteInfo?.deleteIds || [] };
      const errors = validateUserDeleteRequest(data, userList, currentUser)
      if (errors) {
        setMessageError(errors)
        setIsShowConfirmDeleteModal(false)
        setIsDisableSubmit(true)
      } else {
        dispatch(actions.multiDeleteUser({ ...data, onSuccess, onError }));
        setSubmitting(true)
        setMessageError('')
        setIsDisableSubmit(true)
        if (deleteInfo?.deleteIds?.length > 0) {
          setSelectedIds(selectedIds?.filter(id => !deleteInfo?.deleteIds?.includes(id)))
        }
      }
    }
  }

  const handleClickApply = (actionType) => {
    if (actionType === ACTIONS.NAME.MULTI_DELETE) {
      handleSelectDeleteInfo(actionType)
    } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
      dispatch(actions.getExportUserCSV({
        search: normalizeString(searchText),
        sort_name: selectedFieldFilter || '',
        role_id: selectedRoleFilter || [],
        user_id: selectedIds || [],
        onError
      }))
      setSubmitting(true)
      setSelectedItem(null)
    }
  }

  const goToEditPage = (userId) => {
    if (userId) {
      history.push(`/user-management/${userId}`)
    }
  }

  const renderTableList = () => {
    return userInPage?.map((data, index) => {
      const isChecked = selectedIds?.includes(data.id)
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
                clickDelete={handleSelectDeleteInfo}
              />
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="user">
      {!isEmptyObject(message) &&
        <div className="user__message">
          <ActionMessageForm
            successMessage={message.success}
            failedMessage={message.failed}
          />
        </div>
      }
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
          onClickDelete={() => handleDelete(deleteInfo)}
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
          selectedFieldFilter={selectedFieldFilter || ''}
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
