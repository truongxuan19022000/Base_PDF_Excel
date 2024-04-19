import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { useRoleSlice } from 'src/slices/role'
import { validateCreateNewRole } from 'src/helper/validation'

import HeadlineBar from 'src/components/HeadlineBar'
import PermissionForm from 'src/components/PermissionForm'

const CreateRole = () => {
  const { actions } = useRoleSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const currentRoleSetting = useSelector(state => state.role.currentRoleSetting)

  const [roleName, setRoleName] = useState('')
  const [messageError, setMessageError] = useState(null)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const onSuccess = () => {
    setIsDisableSubmit(false)
    setMessageError({})
    history.push('/roles-setting')
  }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  const handleInputChange = (value) => {
    if (isDisableSubmit) return;
    setRoleName(value);
    setMessageError({})
  }

  const handleCreate = () => {
    if (isDisableSubmit) return;
    const data = {
      role_name: roleName,
      role_setting: currentRoleSetting
    }

    const errors = validateCreateNewRole(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createRole({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
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
        roleName={roleName}
        messageError={messageError}
        handleInputChange={handleInputChange}
        setMessageError={setMessageError}
      />
    </div>
  )
}

export default CreateRole
