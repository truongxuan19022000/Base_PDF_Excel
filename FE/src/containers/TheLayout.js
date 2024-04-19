import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs';
import Pusher from 'pusher-js';

import { getToken, isEmptyObject } from 'src/helper/helper'
import { useUserSlice } from 'src/slices/user'
import { useRoleSlice } from 'src/slices/role'
import { ALL_NO_NEED_AUTH_ROUTES, PUSHER_CHANEL, PUSHER_EVENT, PUSHER_NOTIFICATION_EVENT, SIDEBAR_URLS, VISIBLE_URL_LIST } from 'src/constants/config'

import '../scss/_the_layout.scss'

import TheContent from './TheContent'
import Header from 'src/components/Header'
import SideBar from 'src/components/SideBar'
import AlertForm from 'src/components/AlertForm'

import { useQuotationSlice } from 'src/slices/quotation'
import { useAlertSlice } from 'src/slices/alert'
import { useMessageSlice } from 'src/slices/message';
import { useDashboardSlice } from 'src/slices/dashboard';

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const TheLayout = () => {
  const { actions } = useUserSlice()
  const { actions: roleActions } = useRoleSlice()
  const { actions: alertActions } = useAlertSlice()
  const { actions: quotationActions } = useQuotationSlice()
  const { actions: messageActions } = useMessageSlice()
  const { actions: dashboardActions } = useDashboardSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const currentUser = useSelector(state => state.user.user)
  const isLoggedIn = useSelector(state => state.user.isLoggedIn)
  const currentRoleChanged = useSelector(state => state.role.roleStatusChange)
  const currentConversation = useSelector(state => state.message.currentConversation)
  const { isShowAlert, alertData } = useSelector(state => state.alert)

  const currentPath = history.location.pathname
  const baseURL = currentPath?.split('/')[1]

  const [isShowSidebar, setIsShowSidebar] = useState(true)
  const [isShowSidebarAndHeader, setIsShowSidebarAndHeader] = useState(true)

  useEffect(() => {
    const permissions = currentUser?.permission?.map((item) => Object.keys(item)[0]) || []
    if (permissions.length > 0) {
      const routes = SIDEBAR_URLS.flatMap(item =>
        (item.list && item.list.some(category => permissions.includes(category.key))) ? item.list.map(item => item.link) : []);
      if (!routes.includes('/' + baseURL) && !ALL_NO_NEED_AUTH_ROUTES.includes(baseURL)) {
        history.push('/')
      }
    }
  }, [baseURL, currentUser])

  useEffect(() => {
    if (currentUser && (Object.keys(currentUser).length === 0) && isLoggedIn) {
      dispatch(actions.getUser())
    }
  }, [isLoggedIn, currentUser])

  useEffect(() => {
    if (currentRoleChanged) {
      dispatch(actions.getUser())
    }
  }, [currentRoleChanged])

  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe(PUSHER_CHANEL);
    channel.bind(PUSHER_EVENT, (data) => {
      if (data && Object.keys(data).length > 0) {
        const customerData = {
          customer: {
            name: data.message.message.customer_name,
            id: data.message.message.customer_id
          },
          latest_message: {
            content: data.message.message.content
          },
          conversation_id: data.message.message.conversation_id
        }
        dispatch(messageActions.pushNewMessageToList(data.message?.message))
        if (currentConversation.id !== customerData.conversation_id) {
          dispatch(actions.pushNewMessageToList({ ...customerData, ...data.message?.message }))
          dispatch(dashboardActions.pushNewMessageToList({ ...customerData, ...data.message?.message }))
        }
      }
    });
    return () => {
      pusher.unsubscribe(PUSHER_CHANEL);
    };
  }, [currentConversation]);

  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe(PUSHER_CHANEL);
    channel.bind(PUSHER_NOTIFICATION_EVENT, (data) => {
      if (data && Object.keys(data).length > 0) {
        dispatch(actions.pushNewNotificationToList(data.data))
      }
    });
    return () => {
      pusher.unsubscribe(PUSHER_CHANEL);
    };
  }, []);

  useEffect(() => {
    const isIncludeCurrentPath = !!VISIBLE_URL_LIST.find(route => route.slice(1) === baseURL);
    setIsShowSidebarAndHeader(isIncludeCurrentPath);

    const token = getToken('access_token');
    if (!token && !ALL_NO_NEED_AUTH_ROUTES.includes(baseURL)) {
      history.push('/login');
    }
  }, [baseURL]);

  return (
    <div className="layout">
      {isShowSidebarAndHeader ? (
        <>
          <SideBar isShowSidebar={isShowSidebar} />
          <div className={`layout__main ${!isShowSidebar ? 'ml-0' : ''}`}>
            <Header setIsShowSidebar={setIsShowSidebar} isShowSidebar={isShowSidebar} />
            <TheContent isShowSidebar={isShowSidebar} />
            {(isShowAlert && !isEmptyObject(alertData)) &&
              <div className="alertBox"><AlertForm /></div>
            }
          </div>
        </>
      ) : (
        <div className={`layout__main ${!isShowSidebar ? 'ml-0' : ''}`}>
          <TheContent isShowSidebar={isShowSidebar} />
          {(isShowAlert && !isEmptyObject(alertData)) &&
            <div className="alertBox"><AlertForm /></div>
          }
        </div>
      )}
    </div>
  )
}

export default TheLayout
