import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'

import { useUserSlice } from 'src/slices/user'
import { extractSecondNameInURL, isEmptyObject } from 'src/helper/helper'
import { USER, TOP_BAR_TITLES, LINKS } from 'src/constants/config'

import ProfileDialog from '../ProfileDialog'
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const Header = ({ setIsShowSidebar, isShowSidebar }) => {
  const { actions } = useUserSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const currentURL = history.location.pathname
  const subURL = extractSecondNameInURL(currentURL)

  const userStore = useSelector(state => state.user.user)
  const isUserChange = useSelector(state => state.user.isUserUpdated)
  const isRoleUpdated = useSelector(state => state.role.roleStatusChange)

  const [pageTitle, setPageTitle] = useState('')
  const [isPictureExist, setIsPictureExist] = useState(false)
  const [isShowProfileDialog, setIsShowProfileDialog] = useState(false)

  useEffect(() => {
    const baseURL = currentURL.split('/')[1];
    const findTitle = TOP_BAR_TITLES.find(title => title.BASE_URL === baseURL);
    if (findTitle) {
      setPageTitle(findTitle.TITLE);
    }
  }, [currentURL])

  useEffect(() => {
    if (isUserChange) {
      dispatch(actions.getUser())
    }
  }, [isUserChange])

  useEffect(() => {
    if (isRoleUpdated) {
      dispatch(actions.getUser())
    }
  }, [isRoleUpdated])

  useEffect(() => {
    if (!isEmptyObject(userStore)) {
      if (userStore.profile_picture === USER.AVATAR.NO_PICTURE_URL) {
        setIsPictureExist(false)
      } else {
        setIsPictureExist(true)
      }
    } else {
      setIsPictureExist(false)
    }
  }, [userStore])

  const subTitle = useMemo(() => {
    if (subURL) {
      return LINKS.SUB.find(sub => sub.key === subURL)?.label
    }
  }, [subURL])

  return (
    <div className="header">
      <div className="header__left">
        <div
          className="header__icon"
          onClick={() => setIsShowSidebar(!isShowSidebar)}
        >
          <img
            src="/icons/control_sidebar.svg"
            alt="control_sidebar"
            width="18"
            height="15"
          />
        </div>
        <div className="header__text header__text--left">
          {pageTitle}
          {subTitle && ' - ' + subTitle}
        </div>
      </div>
      <div className="header__right">
        <div className="position-relative">
          <img
            src="/icons/bell.svg"
            alt="control_sidebar"
            width="18"
            height="21"
          />
          <div className="header__notify">10</div>
        </div>
        <div className="header__info" onClick={() => setIsShowProfileDialog(!isShowProfileDialog)}>
          <div className="pl-4">
            <img
              src={isPictureExist ? userStore?.profile_picture : USER.DEFAULT_AVATAR.SOURCE}
              alt="user_picture"
              width="30"
              height="30"
            />
          </div>
          <div className="header__text header__text--right">{userStore.name ? userStore.name : 'User'}</div>
          <div>
            <img
              src="/icons/arrow_down.svg"
              alt="arrow_down"
              width="10"
              height="7"
            />
          </div>
        </div>
        {isShowProfileDialog && (
          <ClickOutSideWrapper onClickOutside={() => setIsShowProfileDialog(false)}>
            <ProfileDialog
              userData={userStore}
              isShow={isShowProfileDialog}
              closeModal={() => setIsShowProfileDialog(false)}
            />
          </ClickOutSideWrapper>
        )}
      </div>
    </div>
  )
}

export default Header
