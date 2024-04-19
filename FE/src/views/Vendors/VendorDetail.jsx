import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import CreatePurchaseOrder from 'src/components/PurchaseOrderForm/CreatePurchaseModal'
import PurchaseVendor from 'src/components/VendorForm/PurchaseVendor'
import CreateVendor from 'src/components/VendorForm/CreateVendor'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import HeadlineBar from 'src/components/HeadlineBar'
import SaveSvg from 'src/components/Icons/SaveSvg'

import { ALERT, MESSAGE, PERMISSION, VENDOR_TABS, VENDOR_TABS_DETAIL, VENDOR_TABS_PURCHASE } from 'src/constants/config'
import { validatePermission } from 'src/helper/validation'
import { usePurchaseSlice } from 'src/slices/purchase'
import { useVendorSlice } from 'src/slices/vendor'
import { alertActions } from 'src/slices/alert'

const VendorDetail = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { id } = useParams()
  const { actions } = useVendorSlice()
  const { actions: purchaseActions } = usePurchaseSlice()

  const { detail } = useSelector(state => state.vendor)
  const { vendorPurchaseList } = useSelector(state => state.purchase)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.VENDOR, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')

  const [logsInfo, setLogsInfo] = useState({});
  const [isClickSave, setIsClickSave] = useState(false);
  const [isClickCreate, setIsClickCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [isShowCreatePOModal, setIsShowCreatePOModal] = useState(false);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);

  const isEditMode = useMemo(() => {
    return !!id
  }, [id])

  const onDeleteSuccess = () => {
    setIsDisableSubmit(false)
    setTimeout(() => {
      history.push('/inventory/vendors')
    }, 1000);
  }

  const onError = (data) => {
    setIsDisableSubmit(false);
  }

  useEffect(() => {
    if (id) {
      dispatch(actions.getVendorDetail({ id }))
      dispatch(purchaseActions.getVendorPurchaseList({ vendor_id: +id }))
    }
    return () => {
      dispatch(actions.clearDetailData())
      dispatch(purchaseActions.resetFetchedList())
    }
  }, [id])

  useEffect(() => {
    if (id && Object.values(detail).length > 0) {
      const { type, username } = detail.activities?.[0] || {};
      setLogsInfo({ type, username })
    }
  }, [id, detail])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowCreatePOModal(false);
        setIsShowConfirmDeleteModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectView = (tab) => {
    history.push(`/inventory/vendors/${id}?tab=${tab}`)
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickDelete = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.VENDOR, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      setIsShowConfirmDeleteModal(true)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleClickSave = () => {
    if (isEditAllowed) {
      if (isSubmitting) return;
      if (viewTab === VENDOR_TABS_DETAIL) {
        setIsClickSave(true)
        setIsSubmitting(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDelete = () => {
    if (!id) return;
    dispatch(actions.deleteVendor({
      data: { vendor_id: +id },
      onDeleteSuccess,
      onError,
    }))
    setIsShowConfirmDeleteModal(false)
  };

  const selectedTab = () => {
    switch (viewTab) {
      case VENDOR_TABS_DETAIL: {
        return <CreateVendor
          id={id}
          logsInfo={logsInfo}
          vendorInfo={detail}
          isEditMode={isEditMode}
          isClickSave={isClickSave}
          setIsClickCreate={() => { }}
          setIsClickSave={setIsClickSave}
          setIsSubmitting={setIsSubmitting}
        />
      }
      case VENDOR_TABS_PURCHASE: {
        return <PurchaseVendor
          id={id}
          logsInfo={logsInfo}
          purchaseData={vendorPurchaseList}
          isEditMode={isEditMode}
          setIsShowCreatePOModal={setIsShowCreatePOModal}
        />
      }
      default:
        return <CreateVendor
          isEditMode={isEditMode}
          isClickCreate={isClickCreate}
          setIsClickCreate={setIsClickCreate}
          setIsClickSave={() => { }}
          setIsSubmitting={() => { }}
        />
    }
  };

  return (
    <div className={`vendorDetail${isEditMode ? ' vendorDetail--detail' : ''}`}>
      {isEditMode ?
        <>
          <div className="vendorDetailHeader">
            <div className="vendorDetailHeader__title">
              {detail.vendor?.vendor_name}
            </div>
            <div className="vendorDetailHeader__buttons">
              <div
                className="vendorDetailHeader__button"
                onClick={handleClickDelete}
              >
                <img src="/icons/brown-trash.svg" alt="delete-icon" />
                <span>Delete</span>
              </div>
              <div
                className="vendorDetailHeader__button vendorDetailHeader__button--brown"
                onClick={handleClickSave}
              >
                <SaveSvg />
                <span>Save</span>
              </div>
            </div>
          </div>
          <div className="tabs">
            {Object.values(VENDOR_TABS).map((url, index) => (
              <div
                key={index}
                onClick={() => handleSelectView(url.key)}
                className={`tabs__url${viewTab === url.key ? ' tabs__url--active' : ''}`}
              >
                {url.name}
              </div>
            ))}
          </div>
        </>
        :
        <HeadlineBar
          buttonName="Create"
          headlineTitle="New Vendor"
          onClick={() => setIsClickCreate(true)}
          isDisableSubmit={isDisableSubmit}
        />
      }
      {selectedTab()}
      {isShowConfirmDeleteModal &&
        <ConfirmDeleteModal
          deleteTitle="vendor"
          onClickDelete={handleDelete}
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      }
      {isShowCreatePOModal &&
        <CreatePurchaseOrder
          id={id}
          closeModal={() => setIsShowCreatePOModal(false)}
        />
      }
    </div>
  )
}

export default VendorDetail
