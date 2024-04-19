import React, { useEffect, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { ALERT, CUSTOMERS, MESSAGE, PAGINATION, PERMISSION } from 'src/constants/config'
import { useCustomerSlice } from 'src/slices/customer'

import SaveSvg from 'src/components/Icons/SaveSvg'
import CustomerClaim from 'src/components/CustomerClaim'
import CustomerInvoice from 'src/components/CustomerInvoice'
import CustomerDocument from 'src/components/CustomerDocument'
import CustomerQuotation from 'src/components/CustomerQuotation'
import CustomerDetailTab from 'src/components/CustomerDetailTab'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import UploadFileModal from 'src/components/CustomerDocument/UploadFileModal'
import { validatePermission } from 'src/helper/validation'
import { alertActions } from 'src/slices/alert'

const CustomerDetail = () => {
  const { actions } = useCustomerSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')
  const customerDetail = useSelector(state => state.customer.detail)
  const { isCustomerUpdate, fetchedLogs } = useSelector(state => state.customer)
  const permissionData = useSelector(state => state.user.permissionData)

  const [selectedView, setSelectedView] = useState(CUSTOMERS.VIEW.QUOTATION);
  const [isClickSave, setIsClickSave] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [isShowUploadFileModal, setIsShowUploadFileModal] = useState(false);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.CUSTOMER, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const onDeleteSuccess = () => {
    setTimeout(() => {
      history.push('/customers')
    }, 2000);
  }

  const onError = () => {
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowConfirmDeleteModal(false);
        setIsShowUploadFileModal(false)
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(actions.getCustomer({ customer_id: +id }))
    }
  }, [id])

  useEffect(() => {
    if (id && !fetchedLogs) {
      dispatch(actions.getCustomerActivity({ customer_id: +id, page: PAGINATION.START_PAGE }))
    }
  }, [id, fetchedLogs])

  useEffect(() => {
    return () => {
      dispatch(actions.clearCustomerDetail())
    }
  }, [])

  useEffect(() => {
    if (isCustomerUpdate && id) {
      dispatch(actions.getCustomer({ customer_id: +id }))
    }
  }, [isCustomerUpdate, id])

  useEffect(() => {
    const detailInfo = CUSTOMERS.TAB.find(item => item.LABEL === viewTab);
    if (detailInfo) {
      setSelectedView(CUSTOMERS.VIEW[detailInfo.LABEL.toUpperCase()]);
    } else {
      setSelectedView(CUSTOMERS.VIEW.QUOTATION);
    }
  }, [viewTab])

  const handleSelectView = (tab) => {
    history.push(`/customers/${id}?tab=${tab}`)
  }

  const handleDelete = () => {
    if (isDisableSubmit || !id) return;
    dispatch(actions.multiDeleteCustomer({ customer_id: [id], onDeleteSuccess, onError }));
    setIsDisableSubmit(true)
    setIsShowConfirmDeleteModal(false)
  }

  const handleClickDelete = () => {
 if (isEditAllowed) {
      setIsShowConfirmDeleteModal(true)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }))
    }
  }

  const handleClickSave = () => {
    if (isEditAllowed) {
      setIsClickSave(true)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }))
    }
  }

  const renderView = () => {
    switch (selectedView) {
      case CUSTOMERS.VIEW.DETAILS:
        return (
          <CustomerDetailTab
            id={id}
            isClickSave={isClickSave}
            detailInfo={customerDetail}
            setIsClickSave={setIsClickSave}
          />
        );
      case CUSTOMERS.VIEW.QUOTATION:
        return (
          <CustomerQuotation
            id={id}
          />
        );
      case CUSTOMERS.VIEW.INVOICE:
        return (
          <CustomerInvoice
            id={id}
          />
        );
      case CUSTOMERS.VIEW.CLAIMS:
        return (
          <CustomerClaim
            id={id}
          />
        );
      case CUSTOMERS.VIEW.DOCUMENTS:
        return (
          <CustomerDocument
            id={id}
            setIsShowUploadFileModal={setIsShowUploadFileModal}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="customerDetail">
      <div className="customerDetail__header">
        <div className="customerDetail__header--title">
          {customerDetail?.name || ''}
        </div>
        <div className="customerDetail__header--buttons">
          <div
            className="customerDetail__header--button"
            onClick={handleClickDelete}
          >
            <img src="/icons/brown-trash.svg" alt="delete icon" />
            <span>Delete</span>
          </div>
          <div
            className="customerDetail__header--button customerDetail__header--buttonGray"
            onClick={handleClickSave}
          >
            <SaveSvg />
            <span>Save</span>
          </div>
        </div>
      </div>
      <div className="detailRoute">
        {CUSTOMERS.TAB.map((url, index) => (
          <div
            key={index}
            className={`detailRoute__url${viewTab === url.LABEL ? ' detailRoute__url--active' : ''}`}
            onClick={() => handleSelectView(url.LABEL)}
          >
            {url.LABEL}
          </div>
        ))}
      </div>
      <div className="customerDetail__content">
        {renderView()}
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="customer"
          isShow={isShowConfirmDeleteModal}
          onClickDelete={() => handleDelete(Number(id))}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      )}
      {isShowUploadFileModal &&
        <UploadFileModal
          id={id}
          closeModal={() => setIsShowUploadFileModal(false)}
        />
      }
    </div>
  )
}

export default CustomerDetail
