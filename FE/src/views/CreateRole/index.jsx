import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { ROLES } from 'src/constants/config'
import { useRoleSlice } from 'src/slices/role'
import { normalizeString } from 'src/helper/helper'
import { validateCreateNewRole } from 'src/helper/validation'

import HeadlineBar from 'src/components/HeadlineBar'
import PermissionForm from 'src/components/PermissionForm'

const CreateRole = () => {
  const { actions } = useRoleSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const currentRoleSetting = useSelector(state => state.role.currentRoleSetting)

  const [roleName, setRoleName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState(null)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const onSuccess = () => {
    setRoleName('')
    setSubmitting(false)
    setMessageError({})
    history.push('/roles-setting')
  }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(true)
    setSubmitting(false)
  }

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [history.location.pathname])

  useEffect(() => {
    if (normalizeString(roleName) === ROLES.ADMIN) {
      setMessageError({
        role_name: 'Cannot set role Name as "Admin". Please try another one.'
      })
    }
  }, [roleName])

  const handleInputChange = (value) => {
    if (submitting) {
      return
    }
    setRoleName(value);
    setIsInputChanged(!isInputChanged)
  }

  const handleCreate = () => {
    const isErrorExist = !!(messageError?.length > 0)
    if (isErrorExist || isDisableSubmit) {
      return
    }
    const data = {
      role_name: roleName,
      role_setting: currentRoleSetting
    }
    const errors = validateCreateNewRole(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.createRole({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
      setSubmitting(true)
    }
  }

  return (
    <div className="createRole">
      <HeadlineBar
        buttonName="Create"
        headlineTitle="New Role"
        onClick={handleCreate}
        isDisableSubmit={isDisableSubmit}
      />
      <PermissionForm
        roleName={roleName || ''}
        isInputChanged={isInputChanged}
        messageError={messageError || ''}
        setIsInputChanged={setIsInputChanged}
        handleInputChange={handleInputChange}
        setMessageError={setMessageError}
      />
    </div>
  )
}

export default CreateRole
