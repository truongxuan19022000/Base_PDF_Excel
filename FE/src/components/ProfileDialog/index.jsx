import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'



import { getToken } from 'src/helper/helper'
import { useUserSlice } from 'src/slices/user'

const ProfileDialog = ({ closeModal }) => {
  const { actions } = useUserSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const { id } = useSelector(state => state.user.user)

  const onSuccess = () => {
    history.push('/login')
  }

  const onError = () => {
    setIsDisableSubmit(false)
  }

  const handleLogOut = () => {
    if (isDisableSubmit) {
      return
    }
    const token = getToken('access_token')
    if (token) {
      dispatch(actions.logout({ onSuccess, onError }))
      setIsDisableSubmit(true)
    } else {
      history.push('/login')
    }
  }
  const handleNavigateToProfile = () => {
    history.push(`/user-management/${id}/edit`)
    closeModal()
  }

  return (
    <div className="profile">
      <div className="profile__item" onClick={handleNavigateToProfile}>
        <img src="/icons/user-dialog.svg" alt="user" />
        <div className="profile__url">Profile</div>
      </div>
      <div className="profile__item" onClick={handleLogOut}>
        <img src="/icons/logout-dialog.svg" alt="logout" />
        <div className="profile__url">Logout</div>
      </div>
    </div>
  )
}

export default ProfileDialog
