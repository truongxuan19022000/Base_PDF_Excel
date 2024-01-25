import React from 'react'

const ConfirmBeforeChangeTabModal = ({
  onClickApply,
  onClickCancel,
}) => {
  return (
    <div className="confirmBeforeChangeTabModal">
      <div className="confirmBeforeChangeTabModal__innerBox">
        <img src="/icons/save-quotation.svg" alt="save" />
        <div className="confirmBeforeChangeTabModal__header">
          Confirm Your Changes
        </div>
        <div className="confirmBeforeChangeTabModal___body">
          Please save your changes before continue.
        </div>
        <div className="createProductModal__footer">
          <button
            className="createProductModal__button"
            onClick={onClickCancel}
          >
            Cancel
          </button>
          <button
            className="createProductModal__button createProductModal__button--apply"
            onClick={onClickApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmBeforeChangeTabModal
