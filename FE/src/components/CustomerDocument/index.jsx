import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import { useCustomerSlice } from 'src/slices/customer'
import { useDocumentSlice } from 'src/slices/document'
import { ACTIONS, FILTER, MESSAGE, PAGINATION } from 'src/constants/config'
import { validateFilterRequest, validateUploadDocument } from 'src/helper/validation'
import { downloadCSVFromCSVString, formatCustomerName, normalizeString } from 'src/helper/helper'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import FilterModal from 'src/components/FilterModal'
import TableButtons from 'src/components/TableButtons'
import CustomerTableAction from '../CustomerTableAction'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const CustomerDocument = ({ customerName = '', setMessage }) => {
  const { actions } = useCustomerSlice()
  const { actions: documentActions } = useDocumentSlice()

  const fileInputRef = useRef(null);

  const { id } = useParams()
  const dispatch = useDispatch()

  const csvData = useSelector(state => state.customer.csvData)
  const customerDocumentData = useSelector(state => state.customer.customerDocument)
  const isCustomerDocumentUpdated = useSelector(state => state.customer.isCustomerDocumentUpdated)

  const [searchText, setSearchText] = useState('')
  const [deleteInfo, setDeleteInfo] = useState({})
  const [selectedIds, setSelectedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isClickUpload, setIsClickUpload] = useState(false)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [startDateFilter, setStartDateFilter] = useState('')
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState(null)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedFieldFilter, setSelectedFieldFilter] = useState([])
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)

  const onSuccess = () => {
    setMessageError('')
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowFilterModal(false)
    setIsShowConfirmDeleteModal(false)
    if (Object.keys(deleteInfo).length > 0) {
      setDeleteInfo({})
    }
    setUploadedDocument(null)
    setIsClickUpload(false)
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (id) {
      dispatch(actions.getCustomerDocumentList({
        customer_id: +id,
        page: PAGINATION.START_PAGE,
      }))
    }
  }, [id])

  useEffect(() => {
    if (isCustomerDocumentUpdated && id) {
      dispatch(actions.getCustomerDocumentList({
        customer_id: +id,
        page: PAGINATION.START_PAGE,
      }))
    }
  }, [isCustomerDocumentUpdated, id])

  useEffect(() => {
    if (customerDocumentData && Object.keys(customerDocumentData)?.length > 0) {
      setCurrentPageNumber(customerDocumentData.current_page)
      setTotalDataNumber(customerDocumentData?.total || 0)
    }
  }, [customerDocumentData])

  useEffect(() => {
    if (selectedIds?.length === customerDocumentData?.data?.length && customerDocumentData?.data?.length > 0) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, customerDocumentData?.data])

  useEffect(() => {
    if (isClickUpload && !isDisableSubmit) {
      handleUploadDocument()
      setIsClickUpload(false)
    }
  }, [isClickUpload, isDisableSubmit])

  useEffect(() => {
    setMessageError('')
  }, [isInputChanged])

  useEffect(() => {
    if (csvData?.length > 0 && submitting) {
      const filename = formatCustomerName(customerName) + '_document'
      downloadCSVFromCSVString(csvData, filename)
      setSubmitting(false)
      dispatch(actions.clearCSVDataCustomer())
    }
  }, [submitting, csvData])

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(customerDocumentData?.data?.map(item => item.id) || []);
    } else {
      setSelectedIds([]);
    }
  }

  const handleSelectItem = (isChecked, itemId) => {
    if (isChecked) {
      setSelectedIds([...selectedIds, itemId])
    } else {
      setSelectedIds(selectedIds?.filter(id => id !== itemId) || [])
    }
  }

  const handleFilterSearchApply = (searchText) => {
    if (isDisableSubmit) return;
    if (selectedFieldFilter?.length === 0 && !startDateFilter && !endDateFilter) {
      setIsShowFilterModal(false);
      setIsFiltering(false);
      dispatch(actions.getCustomerDocumentList({
        customer_id: +id,
        search: searchText || '',
        page: PAGINATION.START_PAGE,
        onSuccess,
        onError,
      }));
    } else {
      const data = {
        customer_id: +id,
        search: searchText || '',
        type: selectedFieldFilter || [],
        page: PAGINATION.START_PAGE,
        start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      };
      const errors = validateFilterRequest(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
        setIsDisableSubmit(true);
      } else {
        if (isShowFilterModal) {
          setIsFiltering(true);
        }
        dispatch(actions.getCustomerDocumentList({ ...data, onSuccess, onError, }));
        setSelectedIds([]);
        setSubmitting(true);
        setMessageError('');
        setIsDisableSubmit(true);
      }
    }
  }

  const handleSelectDeleteInfo = (actionType, deleteId) => {
    if (!actionType) return;
    if (actionType === ACTIONS.NAME.DELETE && deleteId) {
      setDeleteInfo({
        actionType: actionType,
        deleteIds: [deleteId],
      });
    } else if (actionType === ACTIONS.NAME.MULTI_DELETE && selectedIds?.length > 0) {
      setDeleteInfo({
        actionType: actionType,
        deleteIds: selectedIds || [],
      });
    } else {
      setMessage({
        failed: MESSAGE.ERROR.NO_DELETE_ID
      })
      return;
    }
    setIsShowConfirmDeleteModal(true);
  }

  const handleInputDateFilter = (date, field) => {
    if (submitting) return;
    if (field === FILTER.LABEL.START_DATE) {
      setStartDateFilter(date);
    } else {
      setEndDateFilter(date);
    }
    setIsInputChanged(!isInputChanged);
  }

  const handleSearch = () => {
    handleFilterSearchApply(normalizeString(searchText))
    setSelectedIds([])
  }

  const handleDelete = (deleteInfo) => {
    if (isDisableSubmit || !deleteInfo?.actionType) return;
    const isLastItem = (customerDocumentData.data?.length === 1)
    const isSelectAllItemOfLastPage = (isSelectedAll && customerDocumentData.current_page === customerDocumentData.last_page)
    const isOutOfItemInPage = isLastItem || isSelectAllItemOfLastPage
    let tempoPageNumber = null;
    if ((customerDocumentData.last_page > PAGINATION.START_PAGE) && isOutOfItemInPage) {
      tempoPageNumber = customerDocumentData.current_page - 1
    } else {
      tempoPageNumber = PAGINATION.START_PAGE
    }
    const data = {
      document_id: deleteInfo?.deleteIds || [],
      page: +tempoPageNumber,
      search: normalizeString(searchText),
      start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY/MM/DD'),
      end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY/MM/DD'),
    };
    if (deleteInfo?.actionType === ACTIONS.NAME.MULTI_DELETE) {
      dispatch(documentActions.multiDeleteDocument({ ...data, onSuccess, onError }));
      setMessageError({})
      setSubmitting(true)
      setSelectedIds([])
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
    } else if (deleteInfo?.actionType === ACTIONS.NAME.DELETE && deleteInfo?.deleteIds) {
      dispatch(documentActions.multiDeleteDocument({ ...data, onSuccess, onError }));
      setSubmitting(true)
      setMessageError({})
      setIsDisableSubmit(true)
      setIsShowConfirmDeleteModal(false)
      if (deleteInfo?.deleteIds) {
        setSelectedIds(selectedIds?.filter(id => !deleteInfo?.deleteIds?.includes(id)))
      }
    }
  }

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (actionType === ACTIONS.NAME.MULTI_DELETE) {
      handleSelectDeleteInfo(actionType)
    } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
      dispatch(actions.getExportCustomerDocumentCSV({
        search: normalizeString(searchText),
        type: selectedFieldFilter || [],
        start_date: startDateFilter && dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        document_id: selectedIds || [],
        customer_id: +id,
        onError
      }))
      setSubmitting(true)
      setSelectedItem(null)
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([]);
    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onSuccess, onError,
    }
    if (selectedFieldFilter?.length > 0) {
      params.type = selectedFieldFilter;
    }
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }
    if (startDateFilter) {
      params.start_date = dayjs(startDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }
    if (endDateFilter) {
      params.end_date = dayjs(endDateFilter, 'DD-MM-YYYY').format('YYYY-MM-DD');
    }

    dispatch(actions.getCustomerDocumentList(params));
  }

  const handleSelectFieldFilter = (value) => {
    if (submitting) return;
    if (selectedFieldFilter?.includes(value)) {
      setSelectedFieldFilter(selectedFieldFilter?.filter(type => type !== value));
    } else {
      setSelectedFieldFilter([...selectedFieldFilter, value]);
    }
    setIsInputChanged(!isInputChanged)
  }

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setIsFiltering(false)
    setIsShowFilterModal(false)
    setSelectedFieldFilter([])
    dispatch(actions.getCustomerDocumentList({
      customer_id: +id,
      page: PAGINATION.START_PAGE,
      search: normalizeString(searchText),
      onError,
    }))
  }

  const handleFileUpload = () => {
    const selectedFile = fileInputRef?.current?.files[0];
    setUploadedDocument(selectedFile);
    setIsDisableSubmit(false);
    setIsClickUpload(true)
    setIsInputChanged(!isInputChanged)
  };

  const handleUploadDocument = () => {
    setIsClickUpload(false)
    if (isDisableSubmit) return;
    const data = {
      customer_id: +id,
      document: uploadedDocument,
    };
    const errors = validateUploadDocument(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
      setIsDisableSubmit(true);
    } else {
      dispatch(documentActions.uploadDocument({ ...data, onSuccess, onError }));
      setMessageError({});
      setIsDisableSubmit(true);
    }
  };

  const handleClickDownload = (data) => { }

  const renderDocumentList = () => {
    return customerDocumentData?.data?.map((data, index) => {
      const isChecked = selectedIds?.includes(data.id)
      const formattedDate = data.created_at ? dayjs(data.created_at).format('DD MMM YYYY') : 'NA';
      return (
        <tr key={index} className={isChecked ? 'csDocumentTable__selected' : ''}>
          <td className="csDocumentTable__td csDocumentTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="csDocumentTable__td">
            <div className="csDocumentTable__td--textBox">
              {data.document_name}
            </div>
          </td>
          <td className="csDocumentTable__td csDocumentTable__td--type">{data.file_type}</td>
          <td className="csDocumentTable__td">{formattedDate}</td>
          <td className="csDocumentTable__td">
            <div className="csDocumentTable__td--buttons">
              <TableButtons
                data={data}
                isShowDelete={true}
                isShowDownLoad={true}
                clickDelete={handleSelectDeleteInfo}
                clickDownLoad={() => handleClickDownload(data)}
              />
            </div>
          </td>
        </tr>
      )
    });
  }

  return (
    <div className="csDocument">
      <div className="csDocument__actionBar">
        <CustomerTableAction
          isDetail={!!id}
          isShowFilter={true}
          isUploadDocument={true}
          searchText={searchText}
          buttonTitle="Upload"
          fileInputRef={fileInputRef}
          actionList={ACTIONS.EXTEND}
          isFiltering={isFiltering}
          selectedAction={selectedItem}
          isShowFilterModal={isShowFilterModal}
          handleSearch={handleSearch}
          setSearchText={setSearchText}
          onClickApply={handleClickApply}
          setSelectedAction={setSelectedItem}
          setIsShowFilterModal={setIsShowFilterModal}
          handleFileUpload={handleFileUpload}
        />
      </div>
      <div className="csDocument__table">
        <table className="csDocumentTable">
          <thead>
            <tr>
              <th className="csDocumentTable__th csDocumentTable__th--checkbox" style={{ width: '4%' }}>
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="csDocumentTable__th csDocumentTable__th--file">FILE NAME</th>
              <th className="csDocumentTable__th csDocumentTable__th--type">TYPE</th>
              <th className="csDocumentTable__th csDocumentTable__th--upload">UPLOADED ON</th>
              <th className="csDocumentTable__th">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderDocumentList()}
          </tbody>
        </table>
      </div>
      <div className="csDocument__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          isDetail={!!id}
          deleteTitle="customer"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={() => handleDelete(deleteInfo)}
        />
      )}
      {isShowFilterModal && (
        <FilterModal
          isDetail={!!id}
          filterTitle="FILTER TYPE"
          isDocumentFilter={true}
          submitting={submitting}
          searchText={searchText}
          messageError={messageError}
          endDateFilter={endDateFilter}
          startDateFilter={startDateFilter}
          isDisableSubmit={isDisableSubmit}
          filterRequest={FILTER.DOCUMENTS}
          selectedFieldFilter={selectedFieldFilter}
          onClickApply={handleFilterSearchApply}
          handleInputDateFilter={handleInputDateFilter}
          handleClickResetFilter={handleClickResetFilter}
          handleSelectFieldFilter={handleSelectFieldFilter}
          onClickCancel={() => setIsShowFilterModal(false)}
        />
      )}
    </div>
  )
}

export default CustomerDocument
