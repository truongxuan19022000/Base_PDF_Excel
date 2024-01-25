import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { INVOICE } from 'src/constants/config'
import { useInvoiceSlice } from 'src/slices/invoice'

import InvoiceNote from 'src/components/InvoiceNote'
import PaymentRecord from 'src/components/PaymentRecord'
import InvoiceSection from 'src/components/InvoiceSection'
import CreateInvoice from '../CreateInvoice'
import SaveSvg from 'src/components/Icons/SaveSvg'
import ConfirmDeleteItemModal from 'src/components/ConfirmDeleteItemModal'

const InvoiceDetail = () => {
  const { actions } = useInvoiceSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')

  const invoiceDetail = useSelector(state => state.invoice.detail)

  const [selectedView, setSelectedView] = useState(INVOICE.VIEW.OVERVIEW)
  const [isClickSave, setIsClickSave] = useState(false)
  const [isClickDelete, setIsClickDelete] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(actions.getInvoiceDetail(+id))
    }
  }, [id])

  useEffect(() => {
    const detailInfo = INVOICE.TAB.find(item => item.LABEL === viewTab);
    if (detailInfo) {
      setSelectedView(INVOICE.VIEW[detailInfo.LABEL.toUpperCase()]);
    } else {
      setSelectedView(INVOICE.VIEW.INVOICE);
    }
  }, [viewTab])

  const renderView = () => {
    switch (selectedView) {
      case INVOICE.VIEW.DETAILS:
        return <CreateInvoice
          isClickSave={isClickSave}
          invoiceDetail={invoiceDetail}
          isClickDelete={isClickDelete}
          setIsClickSave={setIsClickSave}
          setIsClickDelete={setIsClickDelete}
          setIsShowConfirmDeleteModal={setIsShowConfirmDeleteModal}
        />;
      case INVOICE.VIEW.INVOICE:
        return <InvoiceSection />;
      case INVOICE.VIEW.CLAIM:
        return <InvoiceNote />;
      default:
        return null;
    }
  }

  const handleSelectView = (tab) => {
    history.push(`/invoice/${id}?tab=${tab}`)
  }

  return (
    <div className="invoiceDetail">
      <div className="invoiceDetail__header">
        {invoiceDetail?.invoice?.invoice_no || ''}
        <div className="invoiceDetail__buttonHeader">
          <div
            className="invoiceDetail__header--button"
            onClick={() => setIsShowConfirmDeleteModal(true)}
          >
            <img src="/icons/brown-trash.svg" alt="delete-icon" />
            <span>Delete</span>
          </div>
          <div
            className="invoiceDetail__header--button invoiceDetail__header--buttonGray"
            onClick={() => setIsClickSave(true)}
          >
            <SaveSvg />
            <span>Save</span>
          </div>
        </div>
      </div>
      <div className="invoiceDetail__body">
        <div className="invoiceDetail__left">
          <div className="detailRoute">
            {INVOICE.TAB.map(url => (
              <div
                key={url.VALUE}
                className={`detailRoute__url${viewTab === url.LABEL ? ' detailRoute__url--active' : ''}`}
                onClick={() => handleSelectView(url.LABEL)}
              >
                {url.LABEL}
              </div>
            ))}
          </div>
          {renderView()}
        </div>
        {viewTab === INVOICE.ROUTE.OVERVIEW && (
          <div className="invoiceDetail__right">
            <PaymentRecord />
          </div>
        )}
      </div>
      {viewTab === INVOICE.ROUTE.INVOICE && (
        <div className="invoiceDetail__footer">
          <div className="footerLeft">
            <div className="footerLeft__title">
              0 Items Selected
            </div>
            <div className="footerLeft__title">
              <span>Total Amount Paid</span>
              <span className="footerLeft__money">$ 0</span>
            </div>
          </div>
          <div className="footerRight">
            <button>
              Download Claim
            </button>
            <button>
              Download Invoice
            </button>
          </div>
        </div>
      )}
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteItemModal
          deleteTitle="invoice"
          isShow={isShowConfirmDeleteModal}
          onClickDelete={() => setIsClickDelete(true)}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      )}
    </div>
  )
}

export default InvoiceDetail
