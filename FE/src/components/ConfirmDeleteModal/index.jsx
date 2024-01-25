import React from 'react'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const ConfirmDeleteModal = ({
  isDetail = false,
  isShow = false,
  marginTop = '',
  closeModal,
  onClickDelete,
  deleteTitle = '',
}) => {
  return (
    <div className={`confirmDelete${marginTop ? ' mt-' + marginTop : ''}${isDetail ? ' confirmDelete--detail' : ''}`}>
      {isShow && (
        <ClickOutSideWrapper onClickOutside={closeModal}>
          <div className="confirmDelete__body">
            <img src="/icons/circle-delete.svg" alt="delete-icon" />
            <div className="confirmDelete__title">Delete {deleteTitle || ''}</div>
            <p className="confirmDelete__message">Are you sure you want to delete? <br />
              This action cannot be undone.</p>
            <div className="confirmDelete__buttons">
              <button
                className="confirmDelete__button"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="confirmDelete__button confirmDelete__button--delete"
                onClick={onClickDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </ClickOutSideWrapper>
      )}
    </div>
  )
}

export default ConfirmDeleteModal
