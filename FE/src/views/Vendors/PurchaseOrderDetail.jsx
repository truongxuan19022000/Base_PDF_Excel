import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import ShippingFeeModal from 'src/components/PurchaseOrderForm/ShippingFeeModal'
import OrderListTab from 'src/components/PurchaseOrderForm/OrderListTab'
import OrderBottom from 'src/components/PurchaseOrderForm/OrderBottom'
import ConfirmDeleteModal from 'src/components/ConfirmDeleteModal'
import ActionInvoiceForm from 'src/components/ActionInvoiceForm'
import TaxModal from 'src/components/PurchaseOrderForm/TaxModal'
import DiscountModal from 'src/components/Discount/DiscountModal'
import CreateVendor from 'src/components/VendorForm/CreateVendor'

import { PURCHASE, PURCHASE_ACTIONS, PURCHASE_DETAIL_TAB, PURCHASE_ORDER_TAB, PURCHASE_TABS, STATUS } from 'src/constants/config'
import { usePurchaseSlice } from 'src/slices/purchase'
import { sendEmail } from 'src/helper/helper'

const PurchaseOrderDetail = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { vendorId, purchaseId } = useParams()
  const { actions } = usePurchaseSlice()

  const { detail, bottomBarData } = useSelector(state => state.purchase)

  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')

  const [selectedAction, setSelectedAction] = useState({});
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);
  const [isShowShippingFeeModal, setIsShowShippingFeeModal] = useState(false);
  const [isShowDiscountModal, setIsShowDiscountModal] = useState(false);
  const [isShowTaxModal, setIsShowTaxModal] = useState(false);

  const isEditMode = useMemo(() => {
    return !!purchaseId
  }, [purchaseId])

  const isSendMail = useMemo(() => {
    return detail?.purchase_orders?.status === STATUS.SEND_VALUE
  }, [detail?.purchase_orders?.status])

  const onSendSuccess = (url) => {
    if (!isSendMail) {
      dispatch(actions.updatePurchaseStatus({
        purchase_order_id: +purchaseId, onError
      }))
    }
    const data = `To view or download attachment, click on the link below.
    ${url}`;
    sendEmail(data)
  }

  const onDeleteSuccess = () => {
    setIsDisableSubmit(false)
    setTimeout(() => {
      vendorId ?
        history.push(`/inventory/vendors/${vendorId}?tab=purchase-order`)
        : history.push('/inventory/vendors')
    }, 1000);
  }

  const onError = (data) => {
    setIsDisableSubmit(false);
  }

  useEffect(() => {
    purchaseId && dispatch(actions.getPurchaseDetail(+purchaseId))
    return () => {
      dispatch(actions.clearDetailData())
    }
  }, [purchaseId])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowConfirmDeleteModal(false);
        setIsShowShippingFeeModal(false);
        setIsShowDiscountModal(false);
        setIsShowTaxModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectView = (tab) => {
    history.push(`/inventory/vendors/${vendorId}/purchase-order/${purchaseId}?tab=${tab}`)
  }

  const handleClickDelete = () => {
    setIsShowConfirmDeleteModal(true)
  }

  const handleDelete = () => {
    if (!purchaseId || isDisableSubmit) return;
    dispatch(actions.deletePurchase({
      data: { purchase_id: +purchaseId },
      onDeleteSuccess,
      onError,
    }))
    setIsDisableSubmit(true)
    setIsShowConfirmDeleteModal(false)
  };

  const handleSelectAction = (item) => {
    setSelectedAction(item)

    if (item.value === PURCHASE.ACTION_VALUE.SEND_MAIL) {
      dispatch(actions.sendPurchasePDF({ purchase_order_id: purchaseId, onSendSuccess }))
      setSelectedAction({})
    }

    switch (item.actionValue) {
      case PURCHASE.ACTION_VALUE.DOWNLOAD_PDF_CSV:
        if (item.label === PURCHASE.ACTION_LABEL.CSV) {
          dispatch(actions.exportPurchaseCSV({
            purchase_order_ids: [purchaseId],
            vendor_id: +vendorId,
            onError,
          }))
        } else if (item.label === PURCHASE.ACTION_LABEL.PDF) {
          dispatch(actions.downloadPurchasePDF({ purchase_order_id: purchaseId }))
        }
        setSelectedAction({})
        break;
      default: return null;
    }
  }

  const detailInfo = {
    ...detail.purchase_orders,
    ...detail.purchase_orders?.vendor,
  }

  const selectedTab = () => {
    switch (viewTab) {
      case PURCHASE_ORDER_TAB: {
        return <OrderListTab
          id={purchaseId}
          viewTab={viewTab}
          isEditMode={isEditMode}
          orderData={detail.purchase_orders?.purchase_order_items}
          selectedAction={selectedAction?.action}
          resetAction={() => setSelectedAction({})}
        />
      }
      case PURCHASE_DETAIL_TAB: {
        return <CreateVendor
          isEditMode={true}
          isPurchasedOrder={true}
          purchaseId={purchaseId}
          vendorInfo={detailInfo}
          purchaseLogs={detail.activities}
          setIsClickSave={() => { }}
          setIsSubmitting={() => { }}
          setIsClickCreate={() => { }}
          selectedAction={selectedAction}
          resetAction={() => setSelectedAction({})}
        />
      }
      default: return;
    }
  };

  return (
    <div className={`purchaseOrderDetail${isEditMode ? ' purchaseOrderDetail--detail' : ''}`}>
      <div className="purchaseHeader">
        <div className="purchaseHeader__title">
          {detail.purchase_orders?.purchase_order_no || ''}
        </div>
        <div className="purchaseHeader__buttons">
          <div
            className="purchaseHeader__button"
            onClick={handleClickDelete}
          >
            <img src="/icons/brown-trash.svg" alt="delete-icon" />
            <span>Delete</span>
          </div>
          <div className="invoiceDetail__header--select">
            <ActionInvoiceForm
              data={PURCHASE_ACTIONS}
              selectedAction={selectedAction}
              setSelectedAction={handleSelectAction}
            />
          </div>
        </div>
      </div>
      <div className="tabs">
        {Object.values(PURCHASE_TABS).map((url, index) => (
          <div
            key={index}
            onClick={() => handleSelectView(url.key)}
            className={`tabs__url${viewTab === url.key ? ' tabs__url--active' : ''}`}
          >
            {url.name}
          </div>
        ))}
      </div>
      {selectedTab()}
      {viewTab === PURCHASE_ORDER_TAB &&
        <div className="purchaseOrderDetail__bottom">
          <OrderBottom
            showTaxModal={() => setIsShowTaxModal(true)}
            showDiscountModal={() => setIsShowDiscountModal(true)}
            showShippingFeeModal={() => setIsShowShippingFeeModal(true)}
          />
        </div>
      }
      {isShowConfirmDeleteModal &&
        <ConfirmDeleteModal
          deleteTitle="purchase order"
          onClickDelete={handleDelete}
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      }
      {isShowShippingFeeModal &&
        <ShippingFeeModal
          id={purchaseId}
          feeValue={bottomBarData.shippingFee}
          closeModal={() => setIsShowShippingFeeModal(false)}
        />
      }
      {isShowTaxModal &&
        <TaxModal
          id={purchaseId}
          taxValue={bottomBarData.tax}
          closeModal={() => setIsShowTaxModal(false)}
        />
      }
      {isShowDiscountModal &&
        <DiscountModal
          id={purchaseId}
          bottomBarData={bottomBarData}
          closeModal={() => setIsShowDiscountModal(false)}
        />
      }
    </div>
  )
}

export default PurchaseOrderDetail
