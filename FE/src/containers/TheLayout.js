import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { getToken } from 'src/helper/helper'
import { useUserSlice } from 'src/slices/user'
import { useRoleSlice } from 'src/slices/role'
import { AUTHENTICATION, VISIBLE_URL_LIST } from 'src/constants/config'

import '../scss/_the_layout.scss'

import TheContent from './TheContent'
import Header from 'src/components/Header'
import SideBar from 'src/components/SideBar'

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const TheLayout = () => {
  const { actions } = useUserSlice()
  const { actions: roleActions } = useRoleSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const currentUser = useSelector(state => state.user.user)
  const isLoggedIn = useSelector(state => state.user.isLoggedIn)
  const isUserChange = useSelector(state => state.user.isUserUpdated)
  const isRoleUpdated = useSelector(state => state.role.roleStatusChange)

  const currentPath = history.location.pathname
  const baseURL = currentPath?.split("/")[1]

  const [isShowSidebar, setIsShowSidebar] = useState(true)
  const [isShowSidebarAndHeader, setIsShowSidebarAndHeader] = useState(true)

  useEffect(() => {
    if (currentUser && (Object.keys(currentUser).length === 0) && isLoggedIn) {
      dispatch(actions.getUser())
    }
  }, [isLoggedIn, currentUser])

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
    const isIncludeCurrentPath = VISIBLE_URL_LIST?.find(route => route.slice(1) === baseURL)
    setIsShowSidebarAndHeader(isIncludeCurrentPath);
  }, [currentPath])

  useEffect(() => {
    const token = getToken('access_token')
    if (!token) {
      if (AUTHENTICATION.URLS?.includes(baseURL)) {
        return;
      } else {
        history.push('/login');
      }
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      if (currentTime >= expirationTime) {
        history.push('/login');
      }
    } catch (error) {
      history.push('/login');
    }
  }, [currentPath])

  return (
    <div className="layout">
      {isShowSidebarAndHeader ? (
        <>
          <SideBar isShowSidebar={isShowSidebar} />
          <div className="layout__main">
            <Header setIsShowSidebar={setIsShowSidebar} isShowSidebar={isShowSidebar} />
            <TheContent isShowSidebar={isShowSidebar} />
          </div>
        </>
      ) : (
        <div className="layout__main">
          <TheContent isShowSidebar={isShowSidebar} />
        </div>
      )}
    </div>
  )
}

export default TheLayout
