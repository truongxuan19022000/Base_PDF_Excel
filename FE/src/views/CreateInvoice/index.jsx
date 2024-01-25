import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import HeadlineBar from 'src/components/HeadlineBar'
import ActivityLogsForm from 'src/components/ActivityLogsForm';
import SelectQuotationForm from 'src/components/SelectQuotationForm';

import { useInvoiceSlice } from 'src/slices/invoice';
import { useQuotationSlice } from 'src/slices/quotation';
import { validateCreateInvoice, validateUpdateInvoice } from 'src/helper/validation';
import { formatCurrency, isSimilarObject, isEmptyObject, normalizeString } from 'src/helper/helper';

const CreateInvoice = ({
  isClickSave = false,
  isClickDelete = false,
  invoiceDetail = {},
  setIsClickSave,
  setIsClickDelete,
  setIsShowConfirmDeleteModal,
}) => {
  const { actions } = useInvoiceSlice()
  const { actions: quotationActions } = useQuotationSlice()

  const params = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  const fetchedAll = useSelector(state => state.quotation.fetchedAll)
  const quotationAll = useSelector(state => state.quotation.quotationAll)

  const [errors, setErrors] = useState(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState({});

  const [originalInvoiceData, setOriginalInvoiceData] = useState(invoiceDetail?.invoice || {});
  const [changedInvoiceData, setChangedInvoiceData] = useState(originalInvoiceData || {});
  const [isInfoChanged, setIsInfoChanged] = useState(false);

  const onSuccess = () => {
    setIsDisableSubmit(false)
    setIsInfoChanged(false)
    setOriginalInvoiceData(changedInvoiceData)
    if (!isEditMode) {
      history.push('/invoice')
    }
  }

  const onError = (data) => {
    setErrors(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!fetchedAll) {
      dispatch(quotationActions.getAllQuotationList())
    }
  }, [fetchedAll])

  useEffect(() => {
    if (quotationAll?.length > 0 && searchText?.length === 0) {
      setSearchResults(quotationAll)
    }
  }, [quotationAll, searchText])

  useEffect(() => {
    if (searchText?.length === 0) {
      setIsSearching(false)
    }
  }, [searchText])

  useEffect(() => {
    setErrors(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    const invoice = invoiceDetail?.invoice
    if (!isEmptyObject(invoice)) {
      setInvoiceNo(invoice?.invoice_no)
      setSelectedQuotation(invoice?.quotation)
      setSearchText(invoice?.quotation?.reference_no)
      setOriginalInvoiceData(invoice)
    }
  }, [invoiceDetail?.invoice])

  useEffect(() => {
    if (isClickSave) {
      handleUpdateInvoice()
    }
  }, [isClickSave])

  useEffect(() => {
    if (isClickDelete) {
      handleDelete()
    }
  }, [isClickDelete])

  useEffect(() => {
    if (!isEmptyObject(selectedQuotation) && !isEmptyObject(invoiceDetail?.invoice) && invoiceNo) {
      const tempChanged = {
        created_at: invoiceDetail?.invoice?.created_at,
        id: +params.id,
        invoice_no: invoiceNo,
        quotation: selectedQuotation,
        quotation_id: +selectedQuotation?.id
      }
      setChangedInvoiceData(tempChanged)
    }
  }, [selectedQuotation, invoiceNo, invoiceDetail?.invoice, params])

  const isEditMode = useMemo(() => {
    return !!params.id
  }, [params])

  useEffect(() => {
    if (!isEmptyObject(originalInvoiceData) && !isEmptyObject(changedInvoiceData)) {
      setIsInfoChanged(!isSimilarObject(originalInvoiceData, changedInvoiceData))
    }
  }, [originalInvoiceData, changedInvoiceData])

  const handleCreateQuotation = () => {
    if (isDisableSubmit) return;
    const data = {
      invoice_no: invoiceNo,
      quotation_id: +selectedQuotation?.id,
      customer_id: +selectedQuotation?.customer_id,
      reference_no: selectedQuotation?.reference_no,
      customer_name: selectedQuotation?.name || 'Unknown',
    }
    const errors = validateCreateInvoice(data)
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.createInvoice({ ...data, onSuccess, onError }))
      setErrors({})
      setIsDisableSubmit(true)
    }
  }

  const handleUpdateInvoice = () => {
    setIsClickSave(false)
    if (isDisableSubmit || !isInfoChanged) return;
    const data = {
      id: +params.id,
      invoice_id: +params.id,
      invoice_no: invoiceNo,
      quotation_id: +selectedQuotation?.id,
      customer_id: +selectedQuotation?.customer_id,
      reference_no: selectedQuotation?.reference_no,
      customer_name: selectedQuotation?.name || 'Unknown',
      description: selectedQuotation?.description,
      price: selectedQuotation?.price,
      created_at: invoiceDetail?.invoice?.created_at,
    }
    const errors = validateUpdateInvoice(data)
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.updateInvoice({ ...data, onSuccess, onError }))
      setErrors({})
      setIsDisableSubmit(true)
    }
  }

  const handleDelete = () => {
    if (isDisableSubmit || !params.id) return;
    dispatch(actions.multiDeleteInvoice({
      invoice_id: [+params.id],
      onSuccess,
      onError
    }));
    setIsDisableSubmit(true)
    setIsShowConfirmDeleteModal(false)
    setIsClickDelete(false)
    history.push('/invoice')
  }

  const handleSearch = (text) => {
    if (text && text.trim().length > 0 && quotationAll?.length > 0) {
      const results = quotationAll.filter(item =>
        normalizeString(item.reference_no).trim().includes(text)
      );
      setSearchResults(results);
      setIsSearching(false)
    }
  };

  const handleInputChange = (e) => {
    if (isDisableSubmit) return;
    const text = e.target.value;
    setSearchText(normalizeString(text))
    setIsInputChanged(!isInputChanged)
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

  const handleInputInvoiceNo = (e) => {
    if (isDisableSubmit) return;
    setInvoiceNo(e.target.value)
    setIsInputChanged(!isInputChanged)
  }

  return (
    <div className={`createInvoice${isEditMode ? ' createInvoice--editForm' : ''}`}>
      {!isEditMode &&
        <HeadlineBar
          buttonName="Create"
          headlineTitle="New Invoice"
          onClick={handleCreateQuotation}
        />
      }
      <div className="createInvoice__container">
        <div className={`createInvoice__createForm${isEditMode ? ' createInvoice__createForm--edit' : ''}`}>
          <div className="createInvoice__col">
            <div className="createInvoice__formGroup">
              <b className="createInvoice__label">
                Invoice No.
              </b>
              <input
                name="invoice_no"
                type="text"
                className="createInvoice__input"
                value={invoiceNo || ''}
                placeholder="Invoice No."
                onChange={handleInputInvoiceNo}
              />
              {errors?.invoice_no &&
                <p className="createInvoice__error">
                  {errors.invoice_no || ''}
                </p>
              }
            </div>
            <div className="createInvoice__formGroup">
              <b className="createInvoice__label">
                Reference No.
              </b>
              <SelectQuotationForm
                validSelectProperty="id"
                displayName="reference_no"
                placeholder="Reference No."
                searchText={searchText}
                selectedQuotation={selectedQuotation}
                searchResults={searchResults}
                isSearching={isSearching}
                setSearchText={setSearchText}
                handleInputChange={handleInputChange}
                setSelectedQuotation={setSelectedQuotation}
                setIsDisableSubmit={setIsDisableSubmit}
              />
              {errors?.quotation_id &&
                <p className="createInvoice__error">
                  {errors.quotation_id || ''}
                </p>
              }
            </div>
          </div>
          <div className="createInvoice__col">
            <div className="createInvoice__formGroup">
              <b className="createInvoice__label">
                Customer
              </b>
              <input
                name="customer"
                type="text"
                className="createInvoice__input"
                placeholder="Customer"
                value={selectedQuotation?.name || ''}
                disabled={true}
              />
              {errors?.customer_id &&
                <p className="createInvoice__error">
                  {errors.customer_id || ''}
                </p>
              }
            </div>
            <div className="createInvoice__formGroup">
              <b className="createInvoice__label">
                Grand Total Amount
              </b>
              {selectedQuotation?.price ? (
                <div className="createInvoice__price createInvoice__price--selected">
                  {formatCurrency(+selectedQuotation?.price)}
                </div>
              ) : (
                <div className="createInvoice__price">
                  Grand Total Amount
                </div>
              )}
            </div>
          </div>
          <div className="createInvoice__col">
            <div className="createInvoice__formGroup">
              <b className="createInvoice__label">
                Project Description
              </b>
              <div className="createInvoice__formGroup">
                <textarea
                  name="description"
                  className="createInvoice__input createInvoice__input--textArea"
                  placeholder="Project Description"
                  value={selectedQuotation?.description || ''}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>
        {isEditMode &&
          <div className="createInvoice__activity">
            <ActivityLogsForm
              isInvoiceDetail={true}
              logsData={invoiceDetail?.activities}
            />
          </div>
        }
      </div>
    </div>
  )
}

export default CreateInvoice
