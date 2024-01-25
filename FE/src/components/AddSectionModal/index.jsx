import React from 'react';

const AddSectionModal = ({
  marginTop = '',
  sectionName = '',
  messageError = '',
  isDisableSubmit = false,
  onClickApply,
  onClickCancel,
  handleInputChange,
}) => {

  return (
    <div className={`addSectionModal${marginTop ? ` mt-${marginTop}` : ''}`}>
      <div className="addSectionModal__content" >
        <div className="addSectionModal__header">
          <div className="addSectionModal__header--title">New Section</div>
        </div>
        <div className="addSectionModal__body">
          <div className="addSectionModal__inputBox">
            <div className="addSectionModal__inputBox--label">
              SECTION NAME
            </div>
            <input
              className="addSectionModal__inputBox--input"
              type="text"
              value={sectionName || ''}
              placeholder="Section Name"
              onChange={(e) => handleInputChange('section_name', e.target.value)}
            />
            {messageError && (
              <div className="inputBoxForm__message">{messageError}</div>
            )}
          </div>
        </div>
        <div className="d-flex w100">
          <button
            className="addSectionModal__button"
            onClick={onClickCancel}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="addSectionModal__button addSectionModal__button--apply"
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

export default AddSectionModal;
