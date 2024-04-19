import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

import { useQuotationSectionSlice } from 'src/slices/quotationSection'

const ConfirmDeleteModal = ({
  isDetail = false,
  isShow = false,
  marginTop = '',
  closeModal,
  onClickDelete,
  className = '',
  deleteTitle = '',
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSectionSlice()

  useEffect(() => {
    return () => {
      dispatch(actions.clearSelectedDeleteInfo())
    }
  }, [])

  return (
    <div className={`confirmDelete${className && ` confirmDelete--${className}`}${marginTop ? ' mt-' + marginTop : ''}${isDetail ? ' confirmDelete--detail' : ''}`}>
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
