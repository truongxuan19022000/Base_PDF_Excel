import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { isEmptyObject } from 'src/helper/helper';
import { useQuotationSectionSlice } from 'src/slices/quotationSection';

const AddSectionModal = ({
  marginTop = '',
  sectionName = '',
  messageError = '',
  isDisableSubmit = false,
  selectedEditSection = {},
  onClickApply,
  onClickCancel,
  handleInputChange,
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSectionSlice()

  const isEditMode = useMemo(() => {
    return !isEmptyObject(selectedEditSection)
  }, [selectedEditSection])

  useEffect(() => {
    return () => {
      dispatch(actions.clearSelectedDeleteInfo())
    }
  }, [])

  return (
    <div className={`addSectionModal${marginTop ? ` mt-${marginTop}` : ''}`}>
      <div className="addSectionModal__content" >
        <div className="addSectionModal__header">
          <div className="addSectionModal__header--title">{isEditMode ? 'Edit' : 'New'} Section</div>
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
            onClick={() => onClickApply(isEditMode)}
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
