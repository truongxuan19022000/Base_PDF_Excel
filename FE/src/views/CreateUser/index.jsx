import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import UserForm from 'src/components/UserForm'
import HeadlineBar from 'src/components/HeadlineBar'
import useRandomPasswordGenerator from 'src/hook/PasswordGenerator'

import { useUserSlice } from 'src/slices/user'
import { useRoleSlice } from 'src/slices/role'
import { validateCreateUserInfo } from 'src/helper/validation'

const CreateUser = () => {
  const { actions } = useUserSlice()
  const { actions: roleActions } = useRoleSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const roleList = useSelector(state => state.role.roles)
  const fetched = useSelector(state => state.role.fetched)
  const isRoleStatusChange = useSelector(state => state.role.roleStatusChange)

  const [name, setName] = useState('')
  const [role, setRole] = useState({})
  const [email, setEmail] = useState('')
  const [thumb, setThumb] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

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
    setMessageError('')
    history.push('/user-management')
  }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(true)
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

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      name: setName,
      email: setEmail,
      username: setUsername,
      password: setPassword,
    };

    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleRemoveThumb = () => {
    if (submitting) {
      return
    }
    setThumb(null)
  }

  const handlePreviewThumb = (e) => {
    if (submitting) {
      return
    }
    const file = e.target.files[0]
    if (file) {
      file.preview = URL.createObjectURL(file)
      setThumb(file)
      setIsInputChanged(!isInputChanged)
    } else {
      setThumb(null)
    }
  }

  const handleGeneratePassword = () => {
    if (submitting) {
      return
    }
    const newPassword = generatePassword();
    setPassword(newPassword);
    setIsInputChanged(!isInputChanged)
  }

  const handleCreate = () => {
    const isErrorExist = !!(messageError?.length > 0)
    if (isErrorExist || isDisableSubmit) {
      return
    }

    const data = {
      name,
      email,
      username,
      password,
      role_name: role?.role_name,
      role_id: Number(role?.id),
      profile_picture: thumb || null,
    }

    const errors = validateCreateUserInfo(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.createUser({ data: data, onSuccess, onError }))
      setMessageError('')
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
        role={role || {}}
        name={name || ''}
        email={email || ''}
        thumb={thumb || null}
        roleList={roleList || []}
        username={username || ''}
        password={password || ''}
        submitting={submitting}
        messageError={messageError}
        setRole={setRole}
        handleRemoveThumb={handleRemoveThumb}
        handleInputChange={handleInputChange}
        handlePreviewThumb={handlePreviewThumb}
        handleGeneratePassword={handleGeneratePassword}
        setIsDisableSubmit={setIsDisableSubmit}
      />
    </div>
  )
}

export default CreateUser
