import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { validateUploadCSV } from 'src/helper/validation';
import { UPLOAD_CSV_EXTENSION } from 'src/constants/config';
import { useMaterialSlice } from 'src/slices/material';

import Loading from 'src/components/Loading';

const UploadCSVModal = ({
  closeModal,
}) => {
  const dispatch = useDispatch()
  const fileInputRef = useRef(null);
  const { actions } = useMaterialSlice();

  const { isUploading } = useSelector(state => state.material)

  const [messageError, setMessageError] = useState({});
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);

  const onSuccess = () => {
    setUploadedDocument(null)
    setIsDisableSubmit(false)
    setMessageError({})
    closeModal()
  }

  const onError = (message) => {
    if (typeof message === 'string') {
      setMessageError({ file: message })
    }
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (isDisableSubmit && isUploading) {
      //close modal if submit time over 10s
      const timer = setTimeout(() => {
        dispatch(actions.resetUploadingStatus())
        closeModal()
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isDisableSubmit, isUploading])

  const handleFileUpload = () => {
    const selectedFile = fileInputRef?.current?.files[0];
    setUploadedDocument(selectedFile);
    setIsDisableSubmit(false);
    setMessageError({})
  };

  const handleClickApply = () => {
    if (isDisableSubmit) return;
    const data = {
      file: uploadedDocument,
    };
    const errors = validateUploadCSV(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.handleUploadCSVFile({ ...data, onSuccess, onError }));
      setMessageError({});
      setIsDisableSubmit(true);
    }
  }

  return (
    <div className="uploadFileModal">
      <div className="uploadFileModal__content">
        {isUploading &&
          <div className="uploadFileModal__loading uploadFileModal__loading--csv">
            <Loading />
          </div>
        }
        <div className="uploadFileModal__title">Upload CSV</div>
        <div className="uploadFileModal__group">
          <div className="uploadFileModal__box">
            <label>SELECT FILE</label>
            <div className="fileBox">
              <input
                type="text"
                value={uploadedDocument?.name || ''}
                className={`fileBox__name${messageError?.file ? ' fileBox__name--error' : ''}`}
                placeholder="No File Chosen"
                readOnly
              />
              <label
                className="fileBox__button"
                onClick={handleFileUpload}
              >
                Choose File
                <input
                  type="file"
                  accept={UPLOAD_CSV_EXTENSION.map(format => `.${format}`).join(',')}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {messageError?.file &&
              <div className="fileBox__message" dangerouslySetInnerHTML={{ __html: messageError.file }} />
            }
          </div>
        </div>
        <div className="uploadFileModal__buttons">
          <button
            className="uploadFileModal__button"
            onClick={closeModal}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="uploadFileModal__button uploadFileModal__button--apply"
            onClick={handleClickApply}
            disabled={isDisableSubmit}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadCSVModal
