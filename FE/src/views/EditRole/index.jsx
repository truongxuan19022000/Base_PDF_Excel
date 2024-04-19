import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { useRoleSlice } from 'src/slices/role'
import { alertActions } from 'src/slices/alert'
import { validateEditRole, validatePermission } from 'src/helper/validation'
import { ALERT, MESSAGE, PERMISSION, ROLES } from 'src/constants/config'
import { isEmptyObject, isSimilarObject } from 'src/helper/helper'

import HeadlineBar from 'src/components/HeadlineBar'
import PermissionForm from 'src/components/PermissionForm'

const EditRole = () => {
  const { actions } = useRoleSlice()

  const { id } = useParams()
  const dispatch = useDispatch()

  const roleDetail = useSelector(state => state.role.detail)
  const currentRoleSetting = useSelector(state => state.role.currentRoleSetting)
  const currentUser = useSelector(state => state.user?.user)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.ROLE, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const isAdmin = useMemo(() => {
    return +id === ROLES.ADMIN_ID
  }, [id])

  const [roleName, setRoleName] = useState('')
  const [messageError, setMessageError] = useState(null)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const [isInfoChanged, setIsInfoChanged] = useState(false);
  const [originalRoleData, setOriginalRoleData] = useState({});
  const [changedRoleData, setChangedRoleData] = useState(originalRoleData || {});

  const onSuccess = () => {
    setMessageError({})
    setIsDisableSubmit(false)
    setOriginalRoleData(changedRoleData)
  }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(false)
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
  }, [roleDetail])

  useEffect(() => {
    if (!isEmptyObject(roleDetail)) {
      const permissionArray = Object.keys(currentRoleSetting).map(key => {
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
    setIsInfoChanged(!isSimilarObject(originalRoleData, changedRoleData))
  }, [originalRoleData, changedRoleData])

  const handleInputChange = (value) => {
    if (isDisableSubmit) return;
    setRoleName(value);
    setMessageError({})
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleSaveChange = () => {
    if (!isEditAllowed) {
      dispatchAlertWithPermissionDenied()
      return;
    }

    if (isDisableSubmit) return;

    if (isAdmin) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EDIT_ADMIN,
      }));
      return;
    }

    if (isInfoChanged) {
      const data = {
        role_id: id,
        role_name: roleName,
        role_setting: currentRoleSetting,
        isCurrentRoleChange: +id === +currentUser.role_id,
      }

      const errors = validateEditRole(data)
      if (Object.keys(errors).length > 0) {
        setMessageError(errors)
      } else {
        dispatch(actions.updateRole({ ...data, onSuccess, onError }))
        setMessageError({})
        setIsDisableSubmit(true)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.INFO_NO_CHANGE,
      }));
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
        id={id}
        isEditingRole={true}
        roleName={roleName}
        isAdmin={isAdmin}
        isInputChanged={isInputChanged}
        messageError={messageError}
        roleDetail={roleDetail ? roleDetail?.role : []}
        setIsInputChanged={setIsInputChanged}
        handleInputChange={handleInputChange}
        setMessageError={setMessageError}
      />
    </div>
  )
}

export default EditRole
