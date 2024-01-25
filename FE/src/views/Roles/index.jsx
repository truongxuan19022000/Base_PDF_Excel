import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { useRoleSlice } from 'src/slices/role'
import { downloadCSVFromCSVString, isEmptyObject, normalizeString } from 'src/helper/helper'
import { ACTIONS, LINKS, MESSAGE, PAGINATION } from 'src/constants/config'
import { validateFilterRequest, validateRoleDeleteRequest } from 'src/helper/validation'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableAction from 'src/components/TableAction'
import TableButtons from 'src/components/TableButtons'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import ActionMessageForm from 'src/components/ActionMessageForm'

const Roles = () => {
  const { actions } = useRoleSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const list = useSelector(state => state.role.list)
  const fetched = useSelector(state => state.role.fetched)
  const currentURL = history.location.pathname.split('/')[1]
  const roleList = useSelector(state => state.role.list?.data)
  const isRoleChange = useSelector(state => state.role.roleStatusChange)
  const csvRoleData = useSelector(state => state.role.csvData)

  const [message, setMessage] = useState({})
  const [searchText, setSearchText] = useState('')
  const [messageError, setMessageError] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null)
  const [isChanged, setIsChanged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isErrorExist, setIsErrorExist] = useState(false)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)

  const onSuccess = () => {
    setMessageError({})
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    if (Object.keys(deleteInfo).length > 0) {
      setDeleteInfo({})
      dispatch(actions.setRoleStatusChange())
    }
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getRoleList())
    }
  }, [fetched])

  useEffect(() => {
    if (isRoleChange) {
      dispatch(actions.getRoleList())
    }
  }, [isRoleChange])

  useEffect(() => {
    if (currentURL) {
      dispatch(actions.resetFetchedList())
    }
  }, [currentURL])

  useEffect(() => {
    if (list && Object.keys(list)?.length > 0) {
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
    if (selectedIds?.length > 0) {
      const foundUserInfos = roleList?.filter(user => selectedIds?.includes(user.id))
      setSelectedUserInfo(foundUserInfos)
    } else {
      setSelectedUserInfo(roleList)
    }
  }, [selectedIds, roleList])

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
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isChanged])

  useEffect(() => {
    if (!isShowConfirmDeleteModal) {
      setDeleteInfo({})
      setIsDisableSubmit(false)
    }
  }, [isShowConfirmDeleteModal])

  useEffect(() => {
    if (csvRoleData?.length > 0 && submitting) {
      downloadCSVFromCSVString(csvRoleData, currentURL)
      setSubmitting(false)
      dispatch(actions.clearCSVRoleData())
    }
  }, [submitting, csvRoleData, currentURL])

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
      onSuccess, onError,
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
    if (isErrorExist || isDisableSubmit) return;
    const data = {
      search: searchText || '',
      page: PAGINATION.START_PAGE,
    };
    const errors = validateFilterRequest(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
      setIsDisableSubmit(true);
    } else {
      dispatch(actions.getRoleList({ ...data, onSuccess, onError, }));
      setSelectedIds([]);
      setSubmitting(true);
      setMessageError({});
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

  const handleDelete = (deleteInfo) => {
    if (isDisableSubmit || !deleteInfo?.actionType) return;

    if (deleteInfo?.actionType === ACTIONS.NAME.MULTI_DELETE) {
      const data = { role_id: deleteInfo?.deleteIds || [] };
      const errors = validateRoleDeleteRequest(data, roleList)
      if (Object.keys(errors).length > 0) {
        setMessageError(errors)
        setIsShowConfirmDeleteModal(false)
        setIsDisableSubmit(true)
      } else {
        dispatch(actions.multiDeleteRole({ ...data, onSuccess, onError }));
        setMessageError({})
        setIsDisableSubmit(true)
        setSubmitting(true)
        setSelectedIds([])
      }
    } else if (deleteInfo?.actionType === ACTIONS.NAME.DELETE && deleteInfo?.deleteIds) {
      const data = { role_id: deleteInfo?.deleteIds || [] };
      const errors = validateRoleDeleteRequest(data, roleList)
      if (Object.keys(errors).length > 0) {
        setMessageError(errors)
        setIsShowConfirmDeleteModal(false)
        setIsDisableSubmit(true)
      } else {
        dispatch(actions.multiDeleteRole({ ...data, onSuccess, onError }));
        setSubmitting(true)
        setMessageError({})
        setIsDisableSubmit(true)
        if (deleteInfo?.deleteIds) {
          setSelectedIds(selectedIds?.filter(id => !deleteInfo?.deleteIds?.includes(id)))
        }
      }
    }
  }

  const handleClickApply = (actionType) => {
    if (actionType === ACTIONS.NAME.MULTI_DELETE) {
      handleSelectDeleteInfo(actionType)
    } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
      dispatch(actions.getExportRoleCSV({
        search: normalizeString(searchText),
        role_id: selectedIds || [],
        onError
      }))
      setSubmitting(true)
      setSelectedItem(null)
    }
  }

  const goToEditPage = (roleId) => {
    if (roleId) {
      history.push(`/roles-setting/${roleId}`)
    }
  }

  const renderRoleItem = () => {
    return roleList?.map((data, index) => {
      const isChecked = selectedIds?.includes(data.id)
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
                clickDelete={handleSelectDeleteInfo}
              />
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="role">
      {!isEmptyObject(message) &&
        <div className="role__message">
          <ActionMessageForm
            successMessage={message.success}
            failedMessage={message.failed}
          />
        </div>
      }
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
          onClickDelete={() => handleDelete(deleteInfo)}
        />
      )}
    </div>
  )
}

export default Roles
