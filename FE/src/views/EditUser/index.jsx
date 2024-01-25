import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import UserForm from 'src/components/UserForm'
import HeadlineBar from 'src/components/HeadlineBar'
import useRandomPasswordGenerator from 'src/hook/PasswordGenerator'

import { useUserSlice } from 'src/slices/user'
import { useRoleSlice } from 'src/slices/role'
import { MESSAGE, USER } from 'src/constants/config'
import { validateEditUserInfo } from 'src/helper/validation'
import { isEmptyObject, isSimilarObject } from 'src/helper/helper'

const EditUser = () => {
  const { actions } = useUserSlice()
  const { actions: roleActions } = useRoleSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const detail = useSelector(state => state.user.detail)
  const fetched = useSelector(state => state.user.fetchedDetail)
  const currentUser = useSelector(state => state.user.user)
  const roleList = useSelector(state => state.role.roles)

  const [name, setName] = useState('')
  const [role, setRole] = useState({})
  const [email, setEmail] = useState('')
  const [thumb, setThumb] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(true)
  const [messageError, setMessageError] = useState('')
  const [isThumbChanged, setIsThumbChanged] = useState(false)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [pictureValue, setPictureValue] = useState(USER.AVATAR.DELETE_VALUE)

  const [isInfoChanged, setIsInfoChanged] = useState(false);
  const [originalUserData, setOriginalUserData] = useState({});
  const [changedUserData, setChangedUserData] = useState(originalUserData || {});

  const generatePassword = useRandomPasswordGenerator();

  const onSuccess = () => {
    if (+currentUser?.id === +id) {
      dispatch(actions.setIsUserUpdated())
    }
    setName('')
    setEmail('')
    setRole({})
    setThumb(null)
    setUsername('')
    setPassword('')
    setMessageError('')
    setSubmitting(false)
    setIsInfoChanged(false)
    setIsThumbChanged(false)
    setOriginalUserData(changedUserData)
    dispatch(roleActions.setRoleStatusChange())
    history.push('/user-management')
  }

  const onError = () => {
    setMessageError(MESSAGE.ERROR.DEFAULT)
    setIsThumbChanged(false)
    setIsDisableSubmit(true)
    setSubmitting(false)
  }

  useEffect(() => {
    if (!fetched) {
      dispatch(roleActions.getAllRoles())
      dispatch(actions.getUserDetail(Number(id)))
    }
  }, [fetched])

  useEffect(() => {
    if (fetched) {
      dispatch(actions.getUserDetail(Number(id)))
    }
  }, [fetched, id])

  useEffect(() => {
    if (!isEmptyObject(detail) && roleList?.length > 0) {
      const foundRole = roleList?.find(role => Number(role.id) === Number(detail?.role_id)) ?? {};
      const initialData = {
        name: detail?.name,
        role_id: detail?.role_id,
        username: detail?.username,
        email: detail?.email,
        is_profile_picture_changed: false,
        password: '',
      }
      setOriginalUserData(initialData)
      setRole(foundRole || {})
      setName(detail.name || '')
      setEmail(detail.email || '')
      setUsername(detail.username || '')
      setPassword(detail.password || '')
      setThumb(detail.profile_picture || null)
      setSubmitting(false)
      setIsDisableSubmit(true)
      if (detail.profile_picture === USER.AVATAR.NO_PICTURE_URL) {
        setPictureValue(USER.AVATAR.DELETE_VALUE)
      } else {
        setPictureValue(USER.AVATAR.DEFAULT_VALUE)
      }
    }
  }, [detail, roleList])

  useEffect(() => {
    if (!isEmptyObject(detail)) {
      const tempChangedData = {
        name,
        email,
        username,
        password,
        role_id: role?.id || detail?.role_id,
        is_profile_picture_changed: isThumbChanged,
      }
      setChangedUserData(tempChangedData)
    }
  }, [detail, name, email, username, password, role, isThumbChanged])

  useEffect(() => {
    if (!isEmptyObject(originalUserData) && !isEmptyObject(changedUserData)) {
      setIsInfoChanged(!isSimilarObject(originalUserData, changedUserData))
    } else {
      setIsInfoChanged(false)
    }
  }, [originalUserData, changedUserData])

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  const handleInputChange = (field, value) => {
    if (submitting) return;
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
    if (submitting) return;
    setThumb(null)
    setIsInputChanged(!isInputChanged)
    setPictureValue(USER.AVATAR.DELETE_VALUE)
  }

  const handlePreviewThumb = (e) => {
    if (submitting) return;
    const file = e.target.files[0]
    if (file) {
      file.preview = URL.createObjectURL(file)
      setThumb(file)
      setPictureValue(USER.AVATAR.DEFAULT_VALUE)
      setIsThumbChanged(true)
    } else {
      setThumb(null)
      setIsThumbChanged(false)
      setPictureValue(USER.AVATAR.DELETE_VALUE)
    }
    setIsInputChanged(!isInputChanged)
  }

  const handleGeneratePassword = () => {
    if (submitting) return;
    const newPassword = generatePassword();
    setPassword(newPassword);
    setIsInputChanged(!isInputChanged)
  }

  const handleSaveChange = () => {
    const isErrorExist = !!messageError?.length > 0;
    if (isErrorExist || isDisableSubmit || !id || !isInfoChanged) return;
    const data = {
      name,
      email,
      username,
      user_id: id,
      role_id: role?.id,
      role_name: role?.role_name,
      profile_picture: isThumbChanged ? thumb : undefined,
      is_remove_picture: pictureValue || USER.AVATAR.DEFAULT_VALUE,
    }
    if (password) {
      data.password = password;
    }
    const errors = validateEditUserInfo(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
      setIsDisableSubmit(true);
    } else {
      dispatch(actions.updateUser({ data, onSuccess, onError }));
      setMessageError('');
      setSubmitting(true);
      setIsDisableSubmit(true);
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
        role={role || {}}
        name={name || ''}
        email={email || ''}
        thumb={thumb || null}
        roleList={roleList || []}
        username={username || ''}
        password={password || ''}
        setRole={setRole}
        handleRemoveThumb={handleRemoveThumb}
        handleInputChange={handleInputChange}
        setIsDisableSubmit={setIsDisableSubmit}
        handlePreviewThumb={handlePreviewThumb}
        handleGeneratePassword={handleGeneratePassword}
      />
    </div>
  )
}

export default EditUser
