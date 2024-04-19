import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { useAlertSlice } from 'src/slices/alert'
import { usePurchaseSlice } from 'src/slices/purchase'
import { validateFilterRequest, validatePermission } from 'src/helper/validation'
import { ACTIONS, ALERT, MESSAGE, PAGINATION, PERMISSION, STATUS } from 'src/constants/config'
import { formatDate, isEmptyObject, normalizeString } from 'src/helper/helper'

import Checkbox from '../Checkbox'
import Pagination from '../Pagination'
import TableButtons from '../TableButtons'
import ConfirmDeleteModal from '../ConfirmDeleteModal'
import CustomerTableAction from '../CustomerTableAction'
import FilterScrapModal from '../ScrapForms/FilterScrapModal'

const PurchaseVendor = ({
  isEditMode = false,
  purchaseData = {},
  setIsShowCreatePOModal,
}) => {
  const { actions } = usePurchaseSlice()
  const { actions: alertActions } = useAlertSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.VENDOR, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [searchText, setSearchText] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedDeleteIds, setSelectedDeleteIds] = useState([])

  const [selectedAction, setSelectedAction] = useState(null)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)

  const [isFiltering, setIsFiltering] = useState(false)
  const [endDateFilter, setEndDateFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState([])
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)

  const onDeleteSuccess = () => {
    setMessageError('')
    setIsDisableSubmit(false)
    setIsShowConfirmDeleteModal(false)
    const isLastPage = purchaseData.current_page === purchaseData.last_page
    const hasNoItem = purchaseData.data.every(item => selectedDeleteIds.includes(item.id))
    let tempoPageNumber = currentPageNumber;

    // set to prev page if current page is last page and there has no item
    if (isLastPage && hasNoItem) {
      tempoPageNumber = currentPageNumber - 1;
    }

    if (id) {
      const params = {
        vendor_id: +id,
        search: normalizeString(searchText),
        page: +tempoPageNumber <= 0 ? 1 : +tempoPageNumber,
        start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
        status: selectedStatusFilter,
      }
      dispatch(actions.getVendorPurchaseList(params))
    }
    setSelectedDeleteIds([])
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (!isEmptyObject(purchaseData)) {
      setCurrentPageNumber(purchaseData.current_page)
      setTotalDataNumber(purchaseData?.total || 0)
    }
  }, [purchaseData])

  useEffect(() => {
    if (purchaseData?.data?.length > 0 && selectedIds?.length === purchaseData?.data?.length) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [selectedIds, purchaseData?.data])

  useEffect(() => {
    if (!isFiltering && !isShowFilterModal) {
      setSelectedStatusFilter([])
      setStartDateFilter('')
      setEndDateFilter('')
    }
  }, [isFiltering, isShowFilterModal])

  useEffect(() => {
    !isShowFilterModal && setMessageError({})
  }, [isShowFilterModal])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowFilterModal(false);
        setIsShowConfirmDeleteModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectItem = (isChecked, itemId) => {
    if (isChecked) {
      setSelectedIds([...selectedIds, itemId])
    } else {
      setSelectedIds(selectedIds?.filter(id => id !== itemId) || [])
    }
  }

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      setSelectedIds(purchaseData?.data?.map(item => item.id) || []);
    } else {
      setSelectedIds([]);
    }
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickDeleteItem = (deleteId) => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.VENDOR, PERMISSION.ACTION.UPDATE)
    if (isAllowed) {
      setSelectedDeleteIds([deleteId]);
      setIsShowConfirmDeleteModal(true);
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleClickChangePage = (pageNumber) => {
    if (!id) return;
    const params = {
      vendor_id: +id,
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    }
    if (selectedStatusFilter?.length > 0) {
      params.status = selectedStatusFilter;
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
    setSelectedIds([]);
    setCurrentPageNumber(pageNumber);
    dispatch(actions.getVendorPurchaseList(params));
  }

  const handleSearch = () => {
    if (!id) return;
    const data = {
      vendor_id: +id,
      search: normalizeString(searchText),
      page: PAGINATION.START_PAGE,
      start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
      end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
      status: selectedStatusFilter,
    };
    dispatch(actions.getVendorPurchaseList({ ...data, onError }));
    setSelectedIds([]);
    setMessageError({});
    setIsShowFilterModal(false)
  }

  const handleFilterSearchApply = () => {
    if (isDisableSubmit || !id) return;
    const isEmptyRequest = !(
      selectedStatusFilter.length > 0 ||
      startDateFilter ||
      endDateFilter
    );
    if (isEmptyRequest) {
      setMessageError({
        message: 'Please select your request.'
      })
    } else {
      const data = {
        vendor_id: +id,
        search: normalizeString(searchText),
        page: PAGINATION.START_PAGE,
        start_date: startDateFilter && dayjs(startDateFilter).format('YYYY-MM-DD'),
        end_date: endDateFilter && dayjs(endDateFilter).format('YYYY-MM-DD'),
        status: selectedStatusFilter,
      };
      const errors = validateFilterRequest(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        isShowFilterModal && setIsFiltering(true);
        dispatch(actions.getVendorPurchaseList({ ...data, onError }));
        setSelectedIds([]);
        setMessageError({});
        setIsShowFilterModal(false)
      }
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

  const handleClickResetFilter = () => {
    setSelectedIds([])
    setEndDateFilter('')
    setStartDateFilter('')
    setSelectedStatusFilter([])
    setIsFiltering(false)
    setMessageError({})
    setIsShowFilterModal(false)
    dispatch(actions.getVendorPurchaseList({
      vendor_id: +id,
      search: normalizeString(searchText),
      page: PAGINATION.START_PAGE
    }))
  }

  const handleCheckBoxChange = (value) => {
    if (selectedStatusFilter.includes(value)) {
      setSelectedStatusFilter(selectedStatusFilter.filter(id => id !== value))
    } else {
      setSelectedStatusFilter([...selectedStatusFilter, value])
    }
    setMessageError({})
  }

  const handleClickApply = (actionType) => {
    if (submitting || !id) return;
    if (selectedIds.length <= 0) {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        isHovered: false,
        description: MESSAGE.ERROR.EMPTY_ACTION,
      }))
    } else {
      if (actionType === ACTIONS.NAME.MULTI_DELETE) {
        if (isEditAllowed) {
          setSelectedDeleteIds(selectedIds)
          setIsShowConfirmDeleteModal(true)
        } else {
          dispatchAlertWithPermissionDenied()
        }
      } else if (actionType === ACTIONS.NAME.EXPORT_CSV) {
        dispatch(actions.exportPurchaseCSV({
          purchase_order_ids: selectedIds,
          vendor_id: +id,
          onError,
        }))
        setSelectedAction(null)
      }
    }
  }

  const handleAcceptedDelete = () => {
    dispatch(actions.deleteMultiPurchase({
      purchase_order_id: selectedDeleteIds,
      onDeleteSuccess,
      onError
    }))
  }

  const goToDetailPage = (purchaseId) => {
    history.push(`/inventory/vendors/${id}/purchase-order/${purchaseId}?tab=purchase-order`)
  }

  const handleClickDownload = (purchaseId) => {
    dispatch(actions.downloadPurchasePDF({ purchase_order_id: purchaseId }))
  }

  const handleShowCreatePOModal = () => {
    if (isEditAllowed) {
      setIsShowCreatePOModal(true)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const renderTableList = () => {
    return purchaseData?.data?.map((data, index) => {
      const isChecked = !!selectedIds?.includes(data.id);
      const formattedDate = data?.issue_date && formatDate(data.issue_date)
      const status = STATUS.PURCHASE[data.status]

      return (
        <tr key={index} className={isChecked ? 'purchaseOrderTable__selected' : ''}>
          <td className="purchaseOrderTable__td purchaseOrderTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data.id)}
            />
          </td>
          <td className="purchaseOrderTable__td">
            <div className="purchaseOrderTable__td--textBox">
              {data.purchase_order_no}
            </div>
          </td>
          <td className="purchaseOrderTable__td">
            <div className={`purchaseOrderTable__status${status ? ` purchaseOrderTable__status--${status?.class}` : ''}`}>
              {status?.label}
            </div>
          </td>
          <td className="purchaseOrderTable__td">{formattedDate}</td>
          <td className="purchaseOrderTable__td">
            <div className="purchaseOrderTable__td--buttons">
              <TableButtons
                data={data}
                isShowEdit={true}
                isShowDelete={true}
                isShowDownLoad={true}
                clickEdit={() => goToDetailPage(+data.id)}
                clickDownLoad={() => handleClickDownload(+data.id)}
                clickDelete={() => handleClickDeleteItem(+data.id)}
              />
            </div>
          </td>
        </tr>
      )
    });
  }

  return (
    <div className="purchaseOrder">
      <div className="purchaseOrder__content">
        <div className="purchaseOrder__actionBar">
          <CustomerTableAction
            isDetail={!!id}
            isShowFilter={true}
            searchText={searchText}
            buttonTitle="New Purchase Order"
            actionList={ACTIONS.MAIN}
            isFiltering={isFiltering}
            selectedAction={selectedAction}
            isShowFilterModal={isShowFilterModal}
            handleSearch={handleSearch}
            setSearchText={setSearchText}
            onClickApply={handleClickApply}
            setSelectedAction={setSelectedAction}
            onClickCreateNew={handleShowCreatePOModal}
            setIsShowFilterModal={setIsShowFilterModal}
          />
        </div>
        <div className="purchaseOrder__table">
          <table className="purchaseOrderTable">
            <thead>
              <tr className="purchaseOrderTable__th purchaseOrderTable__th--checkBox">
                <th className="purchaseOrderTable__th purchaseOrderTable__th--checkbox">
                  <Checkbox
                    isChecked={isSelectedAll}
                    onChange={(e) => handleSelectAllItems(e.target.checked)}
                  />
                </th>
                <th className="purchaseOrderTable__th purchaseOrderTable__th--purchase">PURCHASE ORDER NO.</th>
                <th className="purchaseOrderTable__th purchaseOrderTable__th--status">STATUS</th>
                <th className="purchaseOrderTable__th purchaseOrderTable__th--create">ISSUE ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {renderTableList()}
            </tbody>
          </table>
        </div>
      </div>
      <div className="purchaseOrder__paginate">
        <Pagination
          totalNumber={totalDataNumber || 0}
          currentPageNumber={currentPageNumber}
          onClickPageChange={handleClickChangePage}
        />
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          isDetail={isEditMode}
          deleteTitle="purchase order"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleAcceptedDelete}
        />
      )}
      {isShowFilterModal && (
        <FilterScrapModal
          isDetail={isEditMode}
          isShowLength={false}
          isShowName={false}
          checkList={STATUS.PURCHASE}
          messageError={messageError}
          endDateFilter={endDateFilter}
          startDateFilter={startDateFilter}
          isDisableSubmit={isDisableSubmit}
          selectedStatus={selectedStatusFilter}
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

export default PurchaseVendor
