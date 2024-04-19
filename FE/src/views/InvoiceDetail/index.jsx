import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'

import { ACTIONS, ACTIVITY, ALERT, INVOICE, MESSAGE, PDF_TYPE, PERMISSION, STATUS } from 'src/constants/config'
import { sendEmail } from 'src/helper/helper'
import { alertActions } from 'src/slices/alert'
import { useInvoiceSlice } from 'src/slices/invoice'
import { validatePermission } from 'src/helper/validation'

import CreateInvoice from '../CreateInvoice'
import GSTModal from 'src/components/GSTModal'
import InvoiceSection from 'src/components/InvoiceSection'
import ActionInvoiceForm from 'src/components/ActionInvoiceForm'
import ConfirmDeleteItemModal from 'src/components/ConfirmDeleteItemModal'

const InvoiceDetail = () => {
  const { actions } = useInvoiceSlice()

  const { id } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const search = history.location.search
  const viewTab = new URLSearchParams(search).get('tab')

  const invoiceDetail = useSelector(state => state.invoice.detail)
  const permissionData = useSelector(state => state.user.permissionData)

  const [logsInfo, setLogsInfo] = useState({});
  const [selectedAction, setSelectedAction] = useState({});

  const [selectedView, setSelectedView] = useState(INVOICE.VIEW.INVOICE);
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false);

  const [gstValue, setGstValue] = useState('')
  const [isShowGSTModal, setIsShowGSTModal] = useState(false);

  const onDownloadSuccess = () => {
    setSelectedAction({})
  }

  const onError = () => {
    setSelectedAction({})
  }

  const onDeleteSuccess = () => {
    setSelectedAction({})
    setTimeout(() => {
      history.push('/invoice')
    }, 1000);
  }

  const onSendSuccess = (url) => {
    setSelectedAction({})
    const data = `To view or download attachment, click on the link below.
    ${url}`;
    sendEmail(data)
  }

  useEffect(() => {
    if (id) {
      dispatch(actions.getInvoiceDetail(+id))
    }
    return () => {
      dispatch(actions.clearInvoiceDetail())
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

  useEffect(() => {
    if (id && Object.values(invoiceDetail).length > 0) {
      const { type, username } = invoiceDetail.activities?.[0] || {};
      setLogsInfo({ type, username })
      setGstValue(invoiceDetail.invoice?.tax)
    }
  }, [id, invoiceDetail])

  const prepareLogsInfo = () => {
    return {
      ...logsInfo,
      action_type: ACTIVITY.LOGS.ACTION_VALUE.DOWNLOAD,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
  };

  const handlePDFDownload = () => {
    dispatch(actions.downloadInvoicePDF({
      invoice_id: +id,
      logsInfo: prepareLogsInfo(),
      onDownloadSuccess,
      onError,
    }));
  };

  const handleCSVDownload = () => {
    dispatch(actions.getExportInvoiceCSV({
      invoice_ids: [+id],
      logsInfo: prepareLogsInfo(),
      onDownloadSuccess,
      onError,
    }));
  };

  const handleSendInvoicePDF = () => {
    dispatch(actions.sendInvoicePDF({
      invoice_id: +id,
      send_mail: PERMISSION.ALLOW_VALUE,
      logsInfo: prepareLogsInfo(),
      onSendSuccess,
      onError,
    }));
  };

  const handleSelectDetailAction = (item) => {
    if (id) {
      setSelectedAction(item)
      if (item?.actionValue === ACTIONS.VALUE.DOWNLOAD) {
        item?.label === PDF_TYPE ? handlePDFDownload() : handleCSVDownload();
      } else if (item?.value === ACTIONS.VALUE.SEND) {
        const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.SEND)
        if (isAllowed) {
          handleSendInvoicePDF();
        } else {
          dispatchAlertWithPermissionDenied()
          setSelectedAction({})
        }
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description: 'No found the Invoice id',
      }))
    }
  }


  const handleDelete = () => {
    if (id) {
      dispatch(actions.multiDeleteInvoice({
        invoice_id: [+id],
        onDeleteSuccess,
        onError
      }));
      setIsShowConfirmDeleteModal(false)
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Deletion Failed',
        description: 'No found the Invoice id.',
      }))
    }
  }

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleClickDelete = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.INVOICE, PERMISSION.ACTION.DELETE)
    if (isAllowed) {
      const isDeletable = invoiceDetail.invoice?.status === STATUS.INVOICE_VALUE.PENDING
      if (isDeletable) {
        setIsShowConfirmDeleteModal(true)
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Deletion Failed',
          description: 'This invoice has been paid.',
        }))
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const renderView = () => {
    switch (selectedView) {
      case INVOICE.VIEW.DETAILS:
        return <CreateInvoice
          logsInfo={logsInfo}
          invoiceDetail={invoiceDetail}
          setIsShowConfirmDeleteModal={setIsShowConfirmDeleteModal}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
        />;
      case INVOICE.VIEW.INVOICE:
        return <InvoiceSection
          id={id}
          setSelectedAction={setSelectedAction}
          selectedAction={selectedAction}
          setIsShowGSTModal={setIsShowGSTModal}
        />;
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
        <div className="invoiceDetail__header--title">
          {invoiceDetail?.invoice?.invoice_no || ''}
        </div>
        <div className="invoiceDetail__header--buttons">
          <div
            className="invoiceDetail__header--button"
            onClick={handleClickDelete}
          >
            <img src="/icons/brown-trash.svg" alt="delete-icon" />
            <span>Delete</span>
          </div>
          <div className="invoiceDetail__header--select">
            <ActionInvoiceForm
              data={INVOICE.ACTIONS}
              selectedAction={selectedAction}
              setSelectedAction={handleSelectDetailAction}
            />
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
      </div>
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteItemModal
          deleteTitle="invoice"
          isShow={isShowConfirmDeleteModal}
          onClickDelete={handleDelete}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
        />
      )}
      {isShowGSTModal &&
        <GSTModal
          id={id}
          gstValue={gstValue}
          setGstValue={setGstValue}
          closeModal={() => setIsShowGSTModal(false)}
        />
      }
    </div>
  )
}

export default InvoiceDetail
