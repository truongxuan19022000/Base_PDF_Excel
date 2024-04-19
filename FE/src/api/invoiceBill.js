import { sendGet, sendPost } from './index'

export const getInvoiceBills = (invoiceId) => sendGet(`/admin/invoices/${invoiceId}/bill-schedule`)
export const handleInvoiceBills = (params) => sendPost(`/admin/invoices/${params.invoice_id}/bill-schedule/handle`, params)
export const updateTax = (params) => sendPost('admin/invoices/update-tax', params)
export const handleDragDropBill = (params) => sendPost(`/admin/invoices/${params.invoice_id}/bill-schedule/update-order-number`, params)
