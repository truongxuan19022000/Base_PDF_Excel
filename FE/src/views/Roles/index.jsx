import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { alertActions } from 'src/slices/alert'
import { useRoleSlice } from 'src/slices/role'
import { normalizeString } from 'src/helper/helper'
import { ACTIONS, ALERT, LINKS, MESSAGE, PAGINATION, PERMISSION, ROLES, USER } from 'src/constants/config'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const Roles = () => {
  const { actions } = useRoleSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.role.list)
  const fetched = useSelector(state => state.role.fetched)
  const roleList = useSelector(state => state.role.list?.data)
  const isRoleChange = useSelector(state => state.role.roleStatusChange)
  const permissionData = useSelector(state => state.user.permissionData)

  const [searchText, setSearchText] = useState('')
  const [messageError, setMessageError] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedItem, setSelectedItem] = useState(null);
  const [isChanged, setIsChanged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);

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
      dispatch(actions.getRoleList())
    }
  }, [fetched])

  useEffect(() => {
    return () => {
      dispatch(actions.resetFetchedList())
    }
  }, [])

  useEffect(() => {
    if (isRoleChange) {
      dispatch(actions.getRoleList())
    }
  }, [isRoleChange])

  useEffect(() => {
    if (list && Object.keys(list).length > 0) {
      setCurrentPageNumber(list.current_page)
      setTotalDataNumber(list?.total || 0)
    }
  }, [list])

  useEffect(() => {
    if (selectedIds?.length === roleList?.length && roleList?.length > 0) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds])

  useEffect(() => {
    if (messageError && Object.keys(messageError).length > 0) {
      const timer = setTimeout(() => setMessageError({}), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageError]);

  useEffect(() => {
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isChanged])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
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
      setSelectedIds(roleList?.map(item => item.id) || []);
    } else {
      setSelectedIds([]);
    }
    setIsChanged(!isChanged)
  }

  const handleSelectItem = (isChecked, itemId) => {
    if (isChecked) {
      setSelectedIds([...selectedIds, itemId])
    } else {
      setSelectedIds(selectedIds?.filter(id => id !== itemId) || [])
    }
    setIsChanged(!isChanged)
  }

  const handleClickChangePage = (pageNumber) => {
    if (submitting) return;
    setCurrentPageNumber(pageNumber);
    setSelectedIds([])
    setIsChanged(!isChanged)

    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    }
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }

    dispatch(actions.getRoleList(params));
  }

  const handleSearch = () => {
    if (submitting) return;
    handleFilterSearchApply(normalizeString(searchText))
    setSelectedIds([])
    setIsChanged(!isChanged)
  }

  const handleFilterSearchApply = (searchText) => {
    if (isDisableSubmit) return;
    const data = {
      search: normalizeString(searchText),
      page: PAGINATION.START_PAGE,
    };
    const errors = validateFilterRequest(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.getRoleList({ ...data, onError, onSuccess }));
      setSelectedIds([]);
      setSubmitting(true);
      setIsDisableSubmit(true);
      setMessageError({});
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
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.ROLE, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      const isAdminRole = normalizeString(data.role_name) === ROLES.ADMIN;
      const hasUser = data.number_user > 0;

      if (isAdminRole) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MESSAGE.ERROR.ADMIN_DELETE
        }))
      } else if (hasUser) {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: USER.MESSAGE_ERROR.HAS_USER
        }))
      } else {
        setSelectedDeleteIds([data.id])
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
      dispatch(actions.multiDeleteRole({ role_id: selectedDeleteIds, onDeleteSuccess, onError }));
      setIsShowConfirmDeleteModal(false)
      setIsDisableSubmit(true)
      setMessageError({})
      setSelectedIds(selectedIds.filter(id => !selectedDeleteIds.includes(id)))
    }
  }

  const handleCheckIncludeAdmin = (id, data) => {
    const item = data.find(item => item.id === id);
    const isDeletable = normalizeString(item.role_name) === ROLES.ADMIN
    return isDeletable;
  };

  const handleCheckUserExistence = (id, data) => {
    const item = data.find(item => item.id === id);
    const isDeletable = item.number_user > 0
    return isDeletable;
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
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.ROLE, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          const isIncludeAdmin = selectedIds.find(id => handleCheckIncludeAdmin(id, list.data))
          const isExistUser = selectedIds.every(id => handleCheckUserExistence(id, list.data))

          if (isIncludeAdmin) {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: selectedIds.length > 1 ?
                USER.MESSAGE_ERROR.INCLUDE_ADMIN : USER.MESSAGE_ERROR.DELETE_ADMIN_ROLE
            }))
          } else if (isExistUser) {
            dispatch(alertActions.openAlert({
              type: ALERT.FAILED_VALUE,
              title: 'Deletion Failed',
              description: selectedIds.length > 1 ?
                USER.MESSAGE_ERROR.INCLUDE_USER : USER.MESSAGE_ERROR.HAS_USER
            }))
          } else {
            setSelectedDeleteIds(selectedIds)
            setIsShowConfirmDeleteModal(true)
          }
        } else {
          dispatchAlertWithPermissionDenied()
        }

      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportRoleCSV({
          role_ids: selectedIds,
          onError
        }))
        setSelectedItem(null)
      }
    }
  }

  const goToEditPage = (roleId) => {
    if (roleId) {
      history.push(`/roles-setting/${roleId}`)
    }
  }

  const renderRoleItem = () => {
    return roleList?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      return (
        <tr key={index} className={isChecked ? 'roleTable__selected' : ''}>
          <td className="roleTable__td roleTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="roleTable__td">
            <div className="roleTable__td--textBox">
              {data.role_name}
            </div>
          </td>
          <td className="roleTable__td">
            <div className="roleTable__td--textBox">
              {data.number_user}
            </div>
          </td>
          <td className="roleTable__td">
            <div className="roleTable__td--buttons">
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
    <div className="role">
      <TableAction
        searchText={searchText}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        actionList={ACTIONS.MAIN || []}
        totalQuantity={totalDataNumber || 0}
        selectedQuantity={selectedIds?.length || null}
        isShowFilter={false}
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        onClickApply={handleClickApply}
        createURL={LINKS.CREATE.ROLE}
        buttonTitle="New Role"
        tableUnit="role"
        permissionKey={PERMISSION.KEY.ROLE}
      />
      <div className="role__table">
        {messageError?.user && (
          <div className="role__message">{messageError?.user}</div>
        )}
        {messageError?.admin && (
          <div className="role__message">{messageError?.admin}</div>
        )}
        <table className="roleTable">
          <thead>
            <tr>
              <th className="roleTable__th roleTable__th--checkBox">
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="roleTable__th roleTable__th--role">ROLE</th>
              <th className="roleTable__th">No. OF USERS</th>
              <th className="roleTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderRoleItem()}
          </tbody>
        </table>
      </div>
      <div className="role__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
          numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="role"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleAcceptedDelete}
        />
      )}
    </div>
  )
}

export default Roles
