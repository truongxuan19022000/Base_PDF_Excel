import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import UserForm from 'src/components/UserForm'
import HeadlineBar from 'src/components/HeadlineBar'
import useRandomPasswordGenerator from 'src/hook/PasswordGenerator'

import { useUserSlice } from 'src/slices/user'
import { useRoleSlice } from 'src/slices/role'
import { useAlertSlice } from 'src/slices/alert'
import { isEmptyObject, isSimilarObject } from 'src/helper/helper'
import { ALERT, MESSAGE, PERMISSION, USER } from 'src/constants/config'
import { validateEditUserInfo, validatePermission } from 'src/helper/validation'

const EditUser = () => {
  const { actions } = useUserSlice()
  const { actions: roleActions } = useRoleSlice()
  const { actions: alertActions } = useAlertSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const { detail } = useSelector(state => state.user)
  const currentUser = useSelector(state => state.user.user)
  const roleList = useSelector(state => state.role.roles)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.USER, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const isOwnerProfile = useMemo(() => {
    return +currentUser.id === +id
  }, [currentUser, id])

  const [name, setName] = useState('')
  const [role, setRole] = useState({})
  const [email, setEmail] = useState('')
  const [thumb, setThumb] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [confirmedPassword, setConfirmedPassword] = useState('')

  const generatePassword = useRandomPasswordGenerator();

  const onSuccess = (data) => {
    if (data.isCurrentUserChanged) {
      if (data.isCurrentPasswordChanged) {
        dispatch(actions.logout())
        history.push('/login')
      }
      dispatch(actions.getUser())
    }
    dispatch(actions.getUserDetail(Number(id)))
    setSubmitting(false)
    setIsDisableSubmit(false);
    setPassword('')
    setConfirmedPassword('')
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
    setSubmitting(false)
  }

  useEffect(() => {
    dispatch(roleActions.getAllRoles())
  }, [])

  useEffect(() => {
    if (id) {
      dispatch(actions.getUserDetail(Number(id)))
    }
  }, [id])

  useEffect(() => {
    if (!isEmptyObject(detail) && roleList?.length > 0) {
      const foundRole = roleList?.find(role => Number(role.id) === Number(detail?.role_id)) ?? {};
      setRole(foundRole)
      setName(detail.name)
      setEmail(detail.email)
      setUsername(detail.username)
      setPassword(detail.password)
      setThumb(detail.profile_picture)
    }
  }, [detail, roleList])

  const handleInputChange = (field, value) => {
    if (submitting) return;
    const fieldSetters = {
      name: setName,
      email: setEmail,
      username: setUsername,
      password: setPassword,
      confirm_new_password: setConfirmedPassword,
    };

    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setMessageError({})
    }
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleRemoveThumb = () => {
    if (!isEditAllowed && isOwnerProfile) {
      if (submitting) return;
      setThumb(null)
      setMessageError({})
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handlePreviewThumb = (e) => {
    if (!isEditAllowed && isOwnerProfile) {
      if (submitting) return;
      const file = e.target.files[0]
      if (file) {
        file.preview = URL.createObjectURL(file)
        setThumb(file)
      } else {
        setThumb(null)
      }
      setMessageError({})
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleGeneratePassword = () => {
    if (submitting) return;
    const newPassword = generatePassword();
    setPassword(newPassword);
    setMessageError({})
  }

  const handleChangeRole = (value) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.USER, PERMISSION.ACTION.UPDATE)
    if (isAllowed) {
      setRole(value)
      setMessageError({})
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleSaveChange = () => {
    if (!isEditAllowed && !isOwnerProfile) {
      dispatchAlertWithPermissionDenied()
      return;
    }

    if (isDisableSubmit || !id) return;
    const data = {
      name,
      email,
      username,
      user_id: +id,
      id: +id,
      role_id: role?.id,
      role_name: role?.role_name,
    }

    if (password) {
      data.password = password
      data.confirm_new_password = confirmedPassword
    }

    if (detail.profile_picture !== thumb) {
      data.profile_picture = thumb;
    }

    if (!thumb) {
      data.is_remove_picture = USER.AVATAR.DELETE_VALUE;
    }

    if (currentUser?.id === +id) {
      data.isCurrentUserChanged = true;
      data.password && (data.isCurrentPasswordChanged = true);
    }

    const {
      is_remove_picture: isRemovePicture,
      user_id: userId, isCurrentUserChanged,
      ...restOfData
    } = data;

    const {
      profile_picture: profilePicture,
      ...detailInfoWithNoThumb
    } = detail;

    const isInfoChanged = (detail.profile_picture === thumb)
      ? isSimilarObject(restOfData, detailInfoWithNoThumb)
      : isSimilarObject(restOfData, detail)

    if (isInfoChanged) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        isHovered: false,
        description: MESSAGE.ERROR.INFO_NO_CHANGE,
      }))
    } else {
      const errors = validateEditUserInfo(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(actions.updateUser({ data, onSuccess, onError }));
        setMessageError({});
        setSubmitting(true);
        setIsDisableSubmit(true);
      }
    }
  }

  return (
    <div className="editUser">
      <HeadlineBar
        buttonName="Save"
        headlineTitle="Edit User"
        onClick={handleSaveChange}
        isDisableSubmit={isDisableSubmit}
      />
      <UserForm
        submitting={submitting}
        messageError={messageError}
        role={role}
        name={name}
        email={email}
        thumb={thumb}
        roleList={roleList}
        username={username}
        password={password}
        setRole={handleChangeRole}
        handleRemoveThumb={handleRemoveThumb}
        handleInputChange={handleInputChange}
        setIsDisableSubmit={setIsDisableSubmit}
        handlePreviewThumb={handlePreviewThumb}
        handleGeneratePassword={handleGeneratePassword}
        isEditAllowed={isEditAllowed}
        isOwnerProfile={isOwnerProfile}
        confirmedPassword={confirmedPassword}
      />
    </div>
  )
}

export default EditUser
