import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import UserForm from 'src/components/UserForm'
import HeadlineBar from 'src/components/HeadlineBar'
import useRandomPasswordGenerator from 'src/hook/PasswordGenerator'

import { useUserSlice } from 'src/slices/user'
import { useRoleSlice } from 'src/slices/role'
import { alertActions } from 'src/slices/alert'
import { ALERT, MESSAGE, PERMISSION } from 'src/constants/config'
import { validateCreateUserInfo, validatePermission } from 'src/helper/validation'

const CreateUser = () => {
  const { actions } = useUserSlice()
  const { actions: roleActions } = useRoleSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const roleList = useSelector(state => state.role.roles)
  const fetched = useSelector(state => state.role.fetched)
  const isRoleStatusChange = useSelector(state => state.role.roleStatusChange)
  const permissionData = useSelector(state => state.user.permissionData)

  const isCreatedAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.USER, PERMISSION.ACTION.CREATE)
    return isAllowed
  }, [permissionData])

  const [name, setName] = useState('')
  const [role, setRole] = useState({})
  const [email, setEmail] = useState('')
  const [thumb, setThumb] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState({})
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [confirmedPassword, setConfirmedPassword] = useState('')

  const generatePassword = useRandomPasswordGenerator();

  const onSuccess = () => {
    setSubmitting(false)
    dispatch(roleActions.setRoleStatusChange())
    setName('')
    setRole({})
    setEmail('')
    setThumb(null)
    setUsername('')
    setPassword('')
    setMessageError({})
    setConfirmedPassword('')
    history.push('/user-management')
  }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(false)
    setSubmitting(false)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(roleActions.getAllRoles())
    }
  }, [fetched])

  useEffect(() => {
    if (isRoleStatusChange) {
      dispatch(roleActions.getAllRoles())
    }
  }, [isRoleStatusChange])

  const handleInputChange = (field, value) => {
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

  const handleRemoveThumb = () => {
    if (submitting) return
    setThumb(null)
  }

  const handlePreviewThumb = (e) => {
    if (submitting) return
    const file = e.target.files[0]
    if (file) {
      file.preview = URL.createObjectURL(file)
      setThumb(file)
      setMessageError({})
    } else {
      setThumb(null)
    }
  }

  const handleChangeRole = (value) => {
    if (isCreatedAllowed) {
      setRole(value)
      setMessageError({})
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const handleGeneratePassword = () => {
    if (submitting) return
    const newPassword = generatePassword();
    setPassword(newPassword);
    setMessageError({})
  }

  const handleCreate = () => {
    if (!isCreatedAllowed) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
      return;
    }

    if (isDisableSubmit) return

    const data = {
      name,
      email,
      username,
      password,
      role_name: role?.role_name,
      role_id: Number(role?.id),
      profile_picture: thumb || null,
      confirm_new_password: confirmedPassword,
    }

    const errors = validateCreateUserInfo(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createUser({ data: data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
      setSubmitting(true)
    }
  }

  return (
    <div className="createUser">
      <HeadlineBar
        buttonName="Create"
        onClick={handleCreate}
        headlineTitle="New User"
        isDisableSubmit={isDisableSubmit}
      />
      <UserForm
        role={role}
        name={name}
        email={email}
        thumb={thumb}
        roleList={roleList}
        username={username}
        password={password}
        submitting={submitting}
        messageError={messageError}
        setRole={handleChangeRole}
        handleRemoveThumb={handleRemoveThumb}
        handleInputChange={handleInputChange}
        handlePreviewThumb={handlePreviewThumb}
        handleGeneratePassword={handleGeneratePassword}
        setIsDisableSubmit={setIsDisableSubmit}
        isEditAllowed={isCreatedAllowed}
        confirmedPassword={confirmedPassword}
      />
    </div>
  )
}

export default CreateUser
