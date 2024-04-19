import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { alertActions } from 'src/slices/alert'
import { useFileSlice } from 'src/slices/file'
import { useCustomerSlice } from 'src/slices/customer'
import { ACTIONS, ALERT, FILTER, MESSAGE, PAGINATION, PERMISSION } from 'src/constants/config'
import { validateFilterRequest, validatePermission, validateUploadDocument } from 'src/helper/validation'
import { downloadFile, normalizeString } from 'src/helper/helper'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import TableButtons from 'src/components/TableButtons'
import CustomerTableAction from '../CustomerTableAction'
import FilterScrapModal from '../ScrapForms/FilterScrapModal'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'

const CustomerDocument = ({
  id,
  setIsShowUploadFileModal,
}) => {
  const { actions } = useCustomerSlice()
  const { actions: fileActions } = useFileSlice()

  const dispatch = useDispatch()

  const { fetchedDocument, isCustomerDocumentUpdated } = useSelector(state => state.customer)
  const customerDocumentData = useSelector(state => state.customer.customerDocument)
  const permissionData = useSelector(state => state.user.permissionData)

  const [searchText, setSearchText] = useState('')
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
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [uploadedDocument, setUploadedDocument] = useState(null)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedFieldFilter, setSelectedFieldFilter] = useState([])
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const onSuccess = () => {
    setMessageError('')
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsShowFilterModal(false)
    setIsShowConfirmDeleteModal(false)
    setUploadedDocument(null)
    setIsClickUpload(false)
  }

  const onDeleteSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    const isLastPage = customerDocumentData.current_page === customerDocumentData.last_page
    const hasNoItem = customerDocumentData.data.every(item => selectedDeleteIds.includes(item.id))
    let tempoPageNumber = currentPageNumber;

    // set to prev page if current page is last page and there has no item
    if (isLastPage && hasNoItem) {
      tempoPageNumber = currentPageNumber - 1;
    }

    if (id) {
      const params = {
        customer_id: +id,
        page: +tempoPageNumber <= 0 ? 1 : +tempoPageNumber,
        search: normalizeString(searchText),
        start_date: startDateFilter && dayjs(startDateFilter).format('YYYY/MM/DD'),
        end_date: endDateFilter && dayjs(endDateFilter).format('YYYY/MM/DD'),
        onError,
      }
      dispatch(actions.getCustomerQuotationList(params))
    }
    setSelectedDeleteIds([])
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (id && !fetchedDocument) {
      dispatch(actions.getCustomerDocumentList({ customer_id: +id }))
    }
  }, [id, fetchedDocument])

  useEffect(() => {
    if (isCustomerDocumentUpdated && id) {
      dispatch(actions.getCustomerDocumentList({
        customer_id: +id,
        page: PAGINATION.START_PAGE,
      }))
    }
  }, [isCustomerDocumentUpdated, id])

  useEffect(() => {
    if (customerDocumentData && Object.keys(customerDocumentData).length > 0) {
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
    !isShowFilterModal && setMessageError({})
  }, [isShowFilterModal])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowConfirmDeleteModal(false);
        setIsShowUploadFileModal(false)
        setIsShowFilterModal(false)
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const handleInputValue = (field, value) => {
    if (isDisableSubmit) return;
    const fieldSetters = {
      start_date: setStartDateFilter,
      end_date: setEndDateFilter,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setMessageError({})
    }
  }

  const handleCheckBoxChange = (value) => {
    if (selectedFieldFilter.includes(value)) {
      setSelectedFieldFilter(selectedFieldFilter.filter(id => id !== value))
    } else {
      setSelectedFieldFilter([...selectedFieldFilter, value])
    }
    setMessageError({})
  }

  const handleFilterSearchApply = () => {
    if (isDisableSubmit) return;
    const isEmptyRequest = !(
      selectedFieldFilter.length > 0 ||
      startDateFilter ||
      endDateFilter
    );
    if (isEmptyRequest) {
      setMessageError({
        message: 'Please select your request.'
      })
    } else {
      const data = {
        customer_id: +id,
        search: normalizeString(searchText),
        type: selectedFieldFilter || [],
        page: PAGINATION.START_PAGE,
        start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
      };
      const errors = validateFilterRequest(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        if (isShowFilterModal) {
          setIsFiltering(true);
        }
        dispatch(actions.getCustomerDocumentList({ ...data, onError }));
        setSelectedIds([]);
        setMessageError('');
        setIsShowFilterModal(false)
      }
    }
  }

  const handleSelectDeleteInfo = (deleteId) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      if (deleteId) {
        setSelectedDeleteIds([deleteId])
        setIsShowConfirmDeleteModal(true);
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: MESSAGE.ERROR.UNKNOWN_ID,
        }));
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }))
    }
  }

  const handleSearch = () => {
    if (submitting) return;
    const data = {
      customer_id: +id,
      search: normalizeString(searchText),
      type: selectedFieldFilter,
      page: PAGINATION.START_PAGE,
      start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
      end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
    };
    const errors = validateFilterRequest(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.getCustomerDocumentList({ ...data, onError }));
      setSelectedIds([]);
      setMessageError('');
      setIsShowFilterModal(false)
    }
  }

  const handleDelete = () => {
    if (isDisableSubmit || selectedDeleteIds.length === 0) return;
    dispatch(fileActions.multiDeleteDocument({
      document_id: selectedDeleteIds,
      onDeleteSuccess,
      onError
    }));
    setMessageError({})
    setIsDisableSubmit(true)
    setIsShowConfirmDeleteModal(false)
    setSelectedIds(selectedIds?.filter(id => !selectedDeleteIds.includes(id)))
  }

  const handleClickApply = (actionType) => {
    if (submitting) return;
    if (selectedIds.length > 0) {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.DELETE)
        if (isAllowed) {
          setSelectedDeleteIds(selectedIds)
          setIsShowConfirmDeleteModal(true)
        } else {
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Action Deny',
            description: MESSAGE.ERROR.AUTH_ACTION,
          }))
        }
      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.getExportCustomerDocumentCSV({
          document_ids: selectedIds,
          customer_id: +id,
          onError,
          onSuccess,
        }))
        setSubmitting(true)
        setSelectedItem(null)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }));
    }
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setSelectedIds([]);
    const params = {
      customer_id: +id,
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    }
    if (selectedFieldFilter?.length > 0) {
      params.type = selectedFieldFilter;
    }
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }
    if (startDateFilter) {
      params.start_date = dayjs(startDateFilter).format('YYYY-MM-DD');
    }
    if (endDateFilter) {
      params.end_date = dayjs(endDateFilter).format('YYYY-MM-DD');
    }

    dispatch(actions.getCustomerDocumentList(params));
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

  const handleClickUploadFile = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.CREATE)
    if (isAllowed) {
      setIsShowUploadFileModal(true)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }))
    }
  }

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
    } else {
      dispatch(fileActions.uploadDocument({ ...data, onSuccess, onError }));
      setMessageError({});
      setIsDisableSubmit(true);
    }
  };

  const handleClickDownload = (data) => {
    if (isDownloading) return;
    setIsDownloading(true);

    const file = {
      fileName: data.document_name,
      url: data.file,
    };

    downloadFile(file)
      .then(() => {
        dispatch(alertActions.openAlert({
          type: ALERT.SUCCESS_VALUE,
          title: 'Successfully Download',
          description: 'File has been downloaded',
        }));
      })
      .catch((error) => {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Download Failed',
          description: error,
        }));
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  const renderDocumentList = () => {
    return customerDocumentData?.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
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
          <td className="csDocumentTable__td">{data.file_type}</td>
          <td className="csDocumentTable__td">{data.reference_no}</td>
          <td className="csDocumentTable__td">{formattedDate}</td>
          <td className="csDocumentTable__td">
            <div className="csDocumentTable__td--buttons">
              <TableButtons
                data={data}
                isShowDelete={true}
                isShowDownLoad={true}
                clickDelete={() => handleSelectDeleteInfo(+data.id)}
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
          isShowFilter={true}
          isUploadDocument={true}
          searchText={searchText}
          buttonTitle="Upload"
          actionList={ACTIONS.EXTEND}
          isFiltering={isFiltering}
          selectedAction={selectedItem}
          isShowFilterModal={isShowFilterModal}
          handleSearch={handleSearch}
          setSearchText={setSearchText}
          onClickApply={handleClickApply}
          setSelectedAction={setSelectedItem}
          setIsShowFilterModal={setIsShowFilterModal}
          handleFileUpload={handleClickUploadFile}
        />
      </div>
      <div className="csDocument__table">
        <div className="csDocument__divider"></div>
        <table className="csDocumentTable">
          <thead>
            <tr>
              <th className="csDocumentTable__th csDocumentTable__th--checkbox">
                <Checkbox
                  isChecked={isSelectedAll}
                  onChange={(e) => handleSelectAllItems(e.target.checked)}
                />
              </th>
              <th className="csDocumentTable__th csDocumentTable__th--file">FILE NAME</th>
              <th className="csDocumentTable__th csDocumentTable__th--type">TYPE</th>
              <th className="csDocumentTable__th csDocumentTable__th--reference">REFERENCE NO.</th>
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
          className="topPosition"
          deleteTitle="document"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterScrapModal
          checkList={FILTER.DOCUMENTS}
          className="customerDetail"
          isShowStatus={false}
          isShowLength={false}
          messageError={messageError}
          endDateFilter={endDateFilter}
          startDateFilter={startDateFilter}
          isDisableSubmit={isDisableSubmit}
          selectedStatus={selectedFieldFilter}
          handleInputValue={handleInputValue}
          onClickApply={handleFilterSearchApply}
          handleCheckBoxChange={handleCheckBoxChange}
          handleClickResetFilter={handleClickResetFilter}
          onClickCancel={() => setIsShowFilterModal(false)}
        />
      )}
    </div>
  )
}

export default CustomerDocument
