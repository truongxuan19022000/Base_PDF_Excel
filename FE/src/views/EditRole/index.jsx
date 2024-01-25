import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { ROLES } from 'src/constants/config'
import { useRoleSlice } from 'src/slices/role'
import { validateEditRole } from 'src/helper/validation'
import { isEmptyObject, isSimilarObject, normalizeString } from 'src/helper/helper'

import HeadlineBar from 'src/components/HeadlineBar'
import PermissionForm from 'src/components/PermissionForm'

const EditRole = () => {
  const { actions } = useRoleSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const roleDetail = useSelector(state => state.role.detail)
  const currentRoleSetting = useSelector(state => state.role.currentRoleSetting)

  const [roleName, setRoleName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState(null)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const [isInfoChanged, setIsInfoChanged] = useState(false);
  const [originalRoleData, setOriginalRoleData] = useState({});
  const [changedRoleData, setChangedRoleData] = useState(originalRoleData || {});

  const onSuccess = () => {
    setRoleName('')
    setSubmitting(false)
    setMessageError({})
    setIsInfoChanged(false)
    setOriginalRoleData(changedRoleData)
    history.push('/roles-setting')
  }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(true)
    setSubmitting(false)
  }

  useEffect(() => {
    if (id) {
      dispatch(actions.getRoleDetail(id))
    }
  }, [id])

  useEffect(() => {
    if (!isEmptyObject(roleDetail)) {
      setRoleName(roleDetail?.role_name)
      const initialRole = {
        role_name: roleDetail?.role_name,
        role: roleDetail?.role,
      }
      setOriginalRoleData(initialRole)
    }
    setIsAdmin(normalizeString(roleDetail?.role_name) === ROLES.ADMIN)
  }, [roleDetail])

  useEffect(() => {
    if (!isEmptyObject(roleDetail)) {
      const permissionArray = Object.keys(currentRoleSetting)?.map(key => {
        const { code, ...rest } = currentRoleSetting[key];
        return { [key]: rest };
      });
      const removedZeroValueItem = permissionArray?.filter(item => {
        const key = Object.keys(item)[0];
        const values = Object.values(item[key]);
        const allZero = values.every(value => value === 0);
        return !allZero;
      });
      const tempChangedData = {
        role_name: roleName,
        role: permissionArray.length > 0 ? removedZeroValueItem : roleDetail?.role,
      };
      setChangedRoleData(tempChangedData);
    }
  }, [roleDetail, roleName, currentRoleSetting]);

  useEffect(() => {
    if (!isEmptyObject(originalRoleData) && !isEmptyObject(changedRoleData)) {
      setIsInfoChanged(!isSimilarObject(originalRoleData, changedRoleData))
    } else {
      setIsInfoChanged(false)
    }
  }, [originalRoleData, changedRoleData])

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    setIsAdmin(false)
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [history.location.pathname])

  const handleInputChange = (value) => {
    if (submitting) {
      return
    }
    setRoleName(value);
    setIsInputChanged(!isInputChanged)
  }

  const handleSaveChange = () => {
    const isErrorExist = !!(messageError?.length > 0)
    if (isErrorExist || isDisableSubmit || !isInfoChanged) {
      return
    }
    const data = {
      role_id: id,
      role_name: roleName,
      role_setting: currentRoleSetting
    }
    const errors = validateEditRole(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.updateRole({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
      setSubmitting(true)
    }
  }

  return (
    <div className="editRole">
      <HeadlineBar
        buttonName="Save"
        headlineTitle="Edit Role"
        onClick={handleSaveChange}
        isDisableSubmit={isDisableSubmit}
      />
      <PermissionForm
        isEditingRole={true}
        roleName={roleName || ''}
        isAdmin={isAdmin}
        isInputChanged={isInputChanged}
        messageError={messageError || ''}
        roleDetail={roleDetail ? roleDetail?.role : []}
        setIsInputChanged={setIsInputChanged}
        handleInputChange={handleInputChange}
        setMessageError={setMessageError}
      />
    </div>
  )
}

export default EditRole
