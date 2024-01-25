import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CAlert } from '@coreui/react'

import { CUSTOMERS } from 'src/constants/config'
import { useCustomerSlice } from 'src/slices/customer'

import CustomerInfo from 'src/components/CustomerInfo'
import CustomerInvoice from 'src/components/CustomerInvoice'
import CustomerDocument from 'src/components/CustomerDocument'
import CustomerQuotation from 'src/components/CustomerQuotation'
import { isEmptyObject } from 'src/helper/helper'
import ActionMessageForm from 'src/components/ActionMessageForm'

const CustomerDetail = () => {
  const { actions } = useCustomerSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const currentUser = useSelector(state => state.user.user)

  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')
  const customerDetail = useSelector(state => state.customer.detail)
  const isCustomerUpdate = useSelector(state => state.customer.isCustomerUpdate)

  const [message, setMessage] = useState({})
  const [isWarning, setIsWarning] = useState(false);
  const [haveWhatsApp, setHaveWhatsApp] = useState(false);
  const [selectedView, setSelectedView] = useState(CUSTOMERS.VIEW.QUOTATION);

  useEffect(() => {
    if (id) {
      history.push(`/customers/${id}/?tab=details`)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      dispatch(actions.getCustomer({ customer_id: +id }))
    }
  }, [id])

  useEffect(() => {
    if (isCustomerUpdate) {
      dispatch(actions.getCustomer({ customer_id: +id }))
    }
  }, [isCustomerUpdate])

  useEffect(() => {
    if (!isEmptyObject(message)) {
      const timer = setTimeout(() => setMessage({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [message])

  useEffect(() => {
    const detailInfo = CUSTOMERS.TAB.find(item => item.LABEL === viewTab);
    if (detailInfo) {
      setSelectedView(CUSTOMERS.VIEW[detailInfo.LABEL.toUpperCase()]);
    } else {
      setSelectedView(CUSTOMERS.VIEW.QUOTATION);
    }
  }, [viewTab])

  useEffect(() => {
    if (Object.keys(currentUser).length > 0) {
      const hasSendPermission = currentUser?.permission?.some(item => item.hasOwnProperty('customer') && item.customer.send === 1);
      setHaveWhatsApp(hasSendPermission)
    }
  }, [currentUser])

  const handleSelectView = (tab) => {
    history.push(`/customers/${id}/?tab=${tab}`)
  }

  const renderView = () => {
    switch (selectedView) {
      case CUSTOMERS.VIEW.DETAILS:
        return (
          <CustomerInfo
            id={id}
            setMessage={setMessage}
            haveWhatsApp={haveWhatsApp}
            customerDetail={customerDetail}
          />
        );
      case CUSTOMERS.VIEW.QUOTATION:
        return (
          <CustomerQuotation
            setMessage={setMessage}
            customerName={customerDetail?.customer?.name}
          />
        );
      case CUSTOMERS.VIEW.INVOICE:
        return (
          <CustomerInvoice
            setMessage={setMessage}
            customerName={customerDetail?.customer?.name}
          />
        );
      case CUSTOMERS.VIEW.DOCUMENTS:
        return (
          <CustomerDocument
            setMessage={setMessage}
            customerName={customerDetail?.customer?.name}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="customerDetail">
      {isWarning &&
        <div className="customerDetail__warning">
          <CAlert className="customerDetail__warningBanner" color="warning">
            Please select items before implement action
          </CAlert>
          <img
            className="customerDetail__close"
            src="/icons/close-mark.svg"
            alt="close"
            onClick={() => setIsWarning(false)}
          />
        </div>
      }
      <div className="customerDetail__header">{customerDetail?.customer?.name || ''}</div>
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
        {!isEmptyObject(message) &&
          <div className="customerDetail__content--message">
            <ActionMessageForm
              successMessage={message.success}
              failedMessage={message.failed}
            />
          </div>
        }
        {renderView()}
      </div>
    </div>
  )
}

export default CustomerDetail
