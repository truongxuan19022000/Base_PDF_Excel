import React from 'react'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const ChatActionConfirmModal = ({
  isShow = false,
  marginTop = null,
  closeModal,
  action = {},
  onClickActionApply,
}) => {

  return (
    <div className={`chatConfirmModal${marginTop ? ' mt-' + marginTop : ''}`}>
      {isShow && (
        <ClickOutSideWrapper onClickOutside={closeModal}>
          <div className="chatConfirmModal__body">
            <div className="chatConfirmModal__icon">
              <img src={action?.icon} alt="action-icon" />
            </div>
            <div className="chatConfirmModal__title">{action?.title || ''}</div>
            <p className="chatConfirmModal__message">This action cannot be undone.</p>
            <div className="chatConfirmModal__buttons">
              <button
                className="chatConfirmModal__button"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="chatConfirmModal__button chatConfirmModal__button--delete"
                onClick={() => onClickActionApply(action?.action)}
              >
                {action?.button || ''}
              </button>
            </div>
          </div>
        </ClickOutSideWrapper>
      )}
    </div>
  )
}

export default ChatActionConfirmModal
