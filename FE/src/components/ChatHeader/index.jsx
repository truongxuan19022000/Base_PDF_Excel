import React from 'react'

import ChatDialog from '../ChatDialog'
import DisplayCustomerImage from '../DisplayCustomerImage'
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const ChatHeader = ({
  customerInfo = {},
  isShowChatDialog = false,
  setIsShowChatDialog,
  handleSelectChatAction,
}) => {
  return (
    <div className="chatHeader">
      <div className="chatHeader__left">
        <div className="chatHeader__avatar">
          <DisplayCustomerImage
            username={customerInfo?.name}
            width={35}
            height={35}
          />
        </div>
        <div className="chatHeader__info">
          <div className="chatHeader__info--name">{customerInfo?.name || 'Customer'}</div>
        </div>
      </div>
      <div
        className={`chatHeader__right${isShowChatDialog ? ' chatHeader__right--show' : ''}`}
        onClick={() => setIsShowChatDialog(!isShowChatDialog)}
      >
        <img src="/icons/more-icon.svg" alt="more-icon" />
      </div>
      {isShowChatDialog && (
        <ClickOutSideWrapper onClickOutside={() => setIsShowChatDialog(false)}>
          <div className="chatHeader__dialog">
            <ChatDialog
              handleSelectChatAction={handleSelectChatAction}
            />
          </div>
        </ClickOutSideWrapper>
      )}
    </div>
  )
}

export default ChatHeader
