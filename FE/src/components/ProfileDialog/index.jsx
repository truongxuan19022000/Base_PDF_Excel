import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { useUserSlice } from 'src/slices/user'

const ProfileDialog = ({ closeModal }) => {
  const { actions } = useUserSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const { id } = useSelector(state => state.user.user)

  const handleLogOut = () => {
    dispatch(actions.logout())
    history.push('/login')
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
