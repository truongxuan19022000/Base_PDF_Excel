import { sendGet, sendPost } from './index'

export const getInvoiceList = (params) => sendGet('admin/invoices', params)
export const createInvoice = (params) => sendPost('admin/invoices/create', params)
export const getInvoiceDetail = (id) => sendGet(`admin/invoices/${id}/detail`)
export const multiDeleteInvoice = (params) => sendPost('admin/invoices/multi-delete', params)
export const updateInvoice = (params) => sendPost('admin/invoices/update', params)
export const getExportInvoiceCSV = (params) => sendGet('admin/invoices/export', params)
export const downloadInvoicePDF = (id) => sendGet('admin/invoices/export-pdf', id)
