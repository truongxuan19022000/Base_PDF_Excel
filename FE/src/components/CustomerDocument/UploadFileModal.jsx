import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { isEmptyObject, normalizeString, } from 'src/helper/helper';
import { validateUploadDocument } from 'src/helper/validation';
import { ALLOWED_FILE_FORMATS } from 'src/constants/config';
import { customerActions } from 'src/slices/customer';
import { useFileSlice } from 'src/slices/file';

import SelectSearchForm from '../SelectSearchForm';
import Loading from '../Loading';

const UploadFileModal = ({
  id,
  closeModal,
}) => {
  const dispatch = useDispatch()
  const fileInputRef = useRef(null);
  const { actions } = useFileSlice();

  const { isLoading } = useSelector(state => state.file)
  const { customerQuotationList, fetchedQuotationAll } = useSelector(state => state.customer)

  const [messageError, setMessageError] = useState({});
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState({});
  const [selectedQuotationTitle, setSelectedQuotationTitle] = useState('');

  const onSuccess = () => {
    setUploadedDocument(null)
    setIsDisableSubmit(false)
    setMessageError({})
    closeModal()
  }

  const onError = (data) => {
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!fetchedQuotationAll && id) {
      dispatch(customerActions.getQuotationListWithCustomer({ customer_id: +id }))
    }
  }, [fetchedQuotationAll, id])

  useEffect(() => {
    if (isDisableSubmit && isLoading) {
      //close modal if submit time over 10s
      const timer = setTimeout(() => {
        dispatch(actions.resetLoadingStatus())
        closeModal()
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isDisableSubmit, isLoading])

  useEffect(() => {
    if (customerQuotationList?.length > 0 && searchText?.length === 0) {
      setSearchResults(customerQuotationList)
    }
  }, [customerQuotationList, searchText])

  useEffect(() => {
    if (searchText?.length === 0) {
      setIsSearching(false)
    }
  }, [searchText])

  const handleSelectQuotation = (item) => {
    if (isDisableSubmit) return;
    if (item) {
      setSelectedQuotation(item)
      setSelectedQuotationTitle(item.reference_no)
      setMessageError({})
    }
  }

  const handleSearch = (text) => {
    if (text && text.trim().length > 0 && searchResults?.length > 0) {
      const results = searchResults.filter(item =>
        normalizeString(item.reference_no).trim().includes(text)
      );
      setSearchResults(results);
      setIsSearching(false)
    }
  };

  const handleTypeSearchChange = (e) => {
    if (isDisableSubmit) return;
    const text = e.target.value;
    setSearchText(text)
    setIsSearching(true)
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const newTypingTimeout = setTimeout(() => {
      if (text.trim() === '') {
        setIsSearching(false)
      } else {
        handleSearch(normalizeString(text));
      }
    }, 500);
    setTypingTimeout(newTypingTimeout);
  }

  const handleFileUpload = () => {
    const selectedFile = fileInputRef?.current?.files[0];
    setUploadedDocument(selectedFile);
    setIsDisableSubmit(false);
    setMessageError({})
  };

  const handleClickApply = () => {
    if (isDisableSubmit || !id) return;
    const data = {
      customer_id: +id,
      quotation_id: selectedQuotation?.id,
      document: uploadedDocument,
      reference_no: selectedQuotation?.reference_no,
    };
    const errors = validateUploadDocument(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.uploadDocument({ ...data, onSuccess, onError }));
      setMessageError({});
      setIsDisableSubmit(true);
    }
  }

  return (
    <div className="uploadFileModal">
      <div className="uploadFileModal__content">
        {isLoading &&
          <div className="uploadFileModal__loading">
            <Loading />
          </div>
        }
        <div className="uploadFileModal__title">Upload Documents</div>
        <div className="uploadFileModal__group">
          <div className="uploadFileModal__box">
            <label>SELECT FILE</label>
            <div className="fileBox">
              <input
                type="text"
                value={uploadedDocument?.name || ''}
                className={`fileBox__name${messageError?.document ? ' fileBox__name--error' : ''}`}
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
                  accept={ALLOWED_FILE_FORMATS.map(format => `.${format}`).join(',')}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {messageError?.document &&
              <div className="fileBox__message">{messageError.document}</div>
            }
          </div>
          <div className="uploadFileModal__box">
            <label>TAG TO REFERENCE NO.</label>
            <SelectSearchForm
              validSelectProperty="id"
              borderStyle="lightBorder"
              displayProperty="reference_no"
              placeHolderLabel="Reference No."
              searchText={searchText}
              isSearching={isSearching}
              searchResults={searchResults}
              selectedItem={selectedQuotation}
              selectedItemTitle={selectedQuotationTitle}
              messageError={messageError?.quotation_id}
              setSearchText={setSearchText}
              setSelectedItem={handleSelectQuotation}
              setIsInputChanged={() => { }}
              setIsDisableSubmit={setIsDisableSubmit}
              setSelectedItemTitle={setSelectedQuotationTitle}
              handleTypeSearchChange={handleTypeSearchChange}
            />
            {messageError?.quotation_id &&
              <div className="uploadFileModal__message">{messageError.quotation_id}</div>
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
            disabled={isDisableSubmit || !isEmptyObject(messageError)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadFileModal
