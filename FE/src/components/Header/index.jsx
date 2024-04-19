import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs';

import { useUserSlice } from 'src/slices/user'
import { extractSecondNameInURL, formatTime } from 'src/helper/helper'
import {
  USER,
  TOP_BAR_TITLES,
  LINKS,
  ROLES,
  NOTIFICATION_ACTIONS,
  SELECT_NOTIFICATION_TYPES,
  NOTIFICATION,
} from 'src/constants/config'

import ProfileDialog from '../ProfileDialog'
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'
import DisplayCustomerImage from '../DisplayCustomerImage';

const Header = ({ setIsShowSidebar, isShowSidebar }) => {
  const { actions } = useUserSlice()
  const history = useHistory()
  const dispatch = useDispatch()

  const currentURL = history.location.pathname
  const subURL = extractSecondNameInURL(currentURL)

  const userStore = useSelector(state => state.user.user)
  const notifications = useSelector(state => state.user.notifications)
  const notificationsCount = useSelector(state => state.user.notificationsCount)
  const messages = useSelector(state => state.user.messages)

  const [pageTitle, setPageTitle] = useState('')
  const [isShowProfileDialog, setIsShowProfileDialog] = useState(false)
  const [isOpenNotifications, setIsOpenNotifications] = useState(false)
  const [isOpenMessage, setIsOpenMessage] = useState(false)
  const [notificationsGroup, setNotificationsGroup] = useState([])
  const [messagesGroup, setMessagesGroup] = useState([])

  useEffect(() => {
    const baseURL = currentURL.split('/')[1];
    const findTitle = TOP_BAR_TITLES.find(title => title.BASE_URL === baseURL);
    if (findTitle) {
      setPageTitle(findTitle.TITLE);
    }
  }, [currentURL])

  useEffect(() => {
    if (userStore.role_id) {
      const type = userStore.role_id === ROLES.ADMIN_ID ? [1, 2, 3] : [1, 3]
      dispatch(actions.getNotifications({ type }))
      if (userStore.role_id === ROLES.ADMIN_ID) {
        dispatch(actions.getMessages())
      }
    }
  }, [userStore.role_id])

  useEffect(() => {
    if (notifications.data?.length) {
      let groupDate = checkIsTodayAndYesterday(notifications.data[0].created_at)
      let groupNotifications = [{ ...notifications.data[0], groupDate }]
      for (let i = 1; i < notifications.data.length; i++) {
        const date = checkIsTodayAndYesterday(notifications.data[i].created_at)
        if (date !== groupDate) {
          groupDate = date
          groupNotifications = [
            ...groupNotifications,
            { ...notifications.data[i], groupDate: date }
          ]
        } else {
          groupNotifications = [
            ...groupNotifications,
            notifications.data[i]
          ]
        }
      }
      setNotificationsGroup(groupNotifications)
    } else {
      setNotificationsGroup([])
    }
  }, [notifications.data])
  useEffect(() => {
    if (messages?.length) {
      let groupDate = checkIsTodayAndYesterday(messages[0].created_at)
      let groupMessage = [{ ...messages[0], groupDate }]
      for (let i = 1; i < messages.length; i++) {
        const date = checkIsTodayAndYesterday(messages[i].created_at)
        if (date !== groupDate) {
          groupDate = date
          groupMessage = [
            ...groupMessage,
            { ...messages[i], groupDate: date }
          ]
        } else {
          groupMessage = [
            ...groupMessage,
            messages[i]
          ]
        }
      }
      setMessagesGroup(groupMessage)
    } else {
      setMessagesGroup([])
    }
  }, [messages])

  const checkIsTodayAndYesterday = (dateString) => {
    const date = dayjs(dateString);
    if (date.isSame(dayjs(), 'day')) {
      return 'Today'
    }
    if (date.isSame(dayjs().subtract(1, 'day'), 'day')) {
      return 'Yesterday'
    }
    return dayjs(dateString).format('DD/MM/YYYY')
  }

  const subTitle = useMemo(() => {
    if (subURL) {
      return LINKS.SUB.find(sub => sub.key === subURL)?.label
    }
  }, [subURL])

  const handleSelectNotifications = (data) => {
    setIsOpenNotifications(false)
    dispatch(actions.updateNotificationsStatus({
      notification_id: data.id,
      status: NOTIFICATION.SEEN_NOTIFICATION_VALUE,
      type: SELECT_NOTIFICATION_TYPES.SINGLE.id,
    }))
    history.push(`/quotation/${data.quotation_id}?tab=details`)
  }
  const handleSelectMessage = (data) => {
    setIsOpenMessage(false)
    dispatch(actions.updateMessagesStatusSuccess({
      id: data.id,
      conversation_id: data.conversation_id,
    }))
    history.push(`/customers/chats/${data.customer_id}`)
  }

  const handleClearNotifications = () => {
    const getAllIds = notificationsGroup.map(item => item.id)
    dispatch(actions.updateNotificationsStatus({
      notification_ids: getAllIds,
      status: NOTIFICATION.SEEN_NOTIFICATION_VALUE,
      type: SELECT_NOTIFICATION_TYPES.MULTI.id,
    }))
  }
  const renderNotifyBox = (index, item) => {
    const username = item.username || 'Admin';
    return item &&
      <div key={index} className="headerBox__group">
        {item.groupDate &&
          <div className="headerBox__tag mt-3">
            <p>{item.groupDate}</p>
          </div>
        }
        <div
          className="headerBox__block"
          onClick={() => handleSelectNotifications(item)}
        >
          <img src="/icons/circle-quotation.svg" alt="" />
          <div className="headerBox__blockInner">
            <b>
              <span className="headerBox__text headerBox__text--content">
                {item.reference_no}
              </span>
              <span className="headerBox__text">
                {' ' + NOTIFICATION_ACTIONS[item.type]}
              </span>
              <span className="headerBox__text headerBox__text--user">
                {' ' + username}
              </span>
            </b>
            <p className="headerBox__text headerBox__text--small headerBox__text--brown">
              {formatTime(item.created_at || '')}
            </p>
          </div>
        </div>
      </div>
  }
  return (
    <div className="header">
      <div className="header__left">
        <div
          className="header__toggle"
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
        {userStore.role_id === ROLES.ADMIN_ID &&
          <div className="position-relative header__icon " onClick={() => setIsOpenMessage(!isOpenMessage)}>
            <img
              src="/icons/messages.svg"
              alt="control_sidebar"
              width="18"
              height="21"
            />
            <div className="header__notify">
              {messages.length}
            </div>
          </div>
        }
        <div className="position-relative header__icon" onClick={() => setIsOpenNotifications(!isOpenNotifications)}>
          <img
            src="/icons/bell.svg"
            alt="control_sidebar"
            width="18"
            height="21"
          />
          <div className="header__notify">
            {notificationsCount}
          </div>
        </div>
        <div className="header__info" onClick={() => setIsShowProfileDialog(!isShowProfileDialog)}>
          <img
            src={userStore?.profile_picture ? userStore?.profile_picture : USER.DEFAULT_AVATAR.SOURCE}
            alt="user_picture"
            width="30"
            height="30"
          />
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
        {isOpenNotifications &&
          <div className="headerBox">
            <ClickOutSideWrapper onClickOutside={() => setIsOpenNotifications(false)}>
              <div className="headerBox__header">
                <p>Notifications</p>
                <img
                  src="/icons/close_icon.svg"
                  alt="close icon"
                  onClick={() => setIsOpenNotifications(false)}
                />
              </div>
              {notificationsGroup.length > 0 ?
                <>
                  <div className="headerBox__headerCount">
                    <div className="headerBox__tag">
                      <p>{notificationsCount > 0 ? notificationsCount : 0} Unread</p>
                    </div>
                    <b
                      className="headerBox__text headerBox__text--brown"
                      onClick={handleClearNotifications}
                    >
                      Mark all as Read
                    </b>
                  </div>
                  <div className="headerBox__content">
                    {notificationsGroup.map((item, index) => renderNotifyBox(index, item))}
                  </div>
                </>
                :
                <div className="headerBox__content headerBox__content--empty">
                  <p className="headerBox__text">No notifications at the moment</p>
                </div>
              }
            </ClickOutSideWrapper>
          </div>
        }
        {isOpenMessage &&
          <div className="headerBox">
            <ClickOutSideWrapper onClickOutside={() => setIsOpenMessage(false)}>
              <div className="headerBox__header">
                <p>WhatsApp</p>
                <img
                  src="/icons/close_icon.svg"
                  alt="close icon"
                  onClick={() => setIsOpenMessage(false)}
                />
              </div>
              {messages.length > 0 ?
                <>
                  <div className="headerBox__headerCount">
                    <div className="headerBox__tag">
                      <p>{messages.length} Unread</p>
                    </div>
                  </div>
                  <div className="headerBox__content">
                    {messagesGroup.map((item, index) => (
                      <div key={index} className="headerBox__group">
                        {item.groupDate &&
                          <div className="headerBox__tag mt-3">
                            <p>{item.groupDate}</p>
                          </div>
                        }
                        <div
                          className="headerBox__block"
                          onClick={() => handleSelectMessage(item)}
                        >
                          {item.customer?.avatar ?
                            <img src={item.customer.avatar} alt={item.customer.customer?.name} />
                            :
                            <DisplayCustomerImage
                              username={item.customer?.name || ''}
                              width={40}
                              height={40}
                              fontSize="17px"
                            />
                          }
                          <div className="headerBox__blockInner">
                            <b className="headerBox__text headerBox__text--content">
                              {(item.customer?.name || '') + ' '}
                              <span className="headerBox__text">
                                has new messages via WhatsApp
                              </span>
                            </b>
                            <p className="headerBox__text headerBox__text--small headerBox__text--brown">
                              {formatTime(item.created_at || '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
                :
                <div className="headerBox__content headerBox__content--empty">
                  <p className="headerBox__text">No messages at the moment</p>
                </div>
              }
            </ClickOutSideWrapper>
          </div>
        }
      </div>
    </div>
  )
}

export default Header
