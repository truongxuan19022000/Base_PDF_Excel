import React from 'react';

const EditQuantityModal = ({
  data = {},
  quantity = null,
  submitting = false,
  messageError = '',
  onClickApply,
  closeModal,
  isDisableSubmit = false,
  marginTop = '',
  handleChangeQuantity,
}) => {

  return (
    <div className={`editQuantityModal${marginTop ? ` mt-${marginTop}` : ''}`}>
      <div className="editQuantityModal__content" >
        <div className="editQuantityModal__header">
          <div className="editQuantityModal__header--title">Edit Item Quantity</div>
        </div>
        <div className="editQuantityModal__body">
          <div className="editQuantityModal__title">
            {data?.item || ''}
          </div>
          <div className="editQuantityModal__inputBox">
            <div className="editQuantityModal__inputBox--label">
              QUANTITY
            </div>
            <input
              className="editQuantityModal__inputBox--input"
              type="number"
              value={quantity || ''}
              placeholder="Input quantity"
              onChange={(e) => handleChangeQuantity(e.target.value)}
            />
            {messageError?.quantity && (
              <div className="inputBoxForm__message">{messageError?.quantity}</div>
            )}
          </div>
        </div>
        <div className="d-flex w100">
          <button
            className="editQuantityModal__button"
            onClick={closeModal}
            disabled={submitting || isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="editQuantityModal__button editQuantityModal__button--apply"
            onClick={onClickApply}
            disabled={isDisableSubmit}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditQuantityModal;
