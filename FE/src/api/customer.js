import { sendGet, sendPost } from './index'

export const getAllCustomerList = () => sendGet('admin/customers/all')
export const getCustomerList = (params) => sendGet('admin/customers', params)
export const createCustomer = (params) => sendPost('admin/customers/create', params)
export const updateCustomer = (params) => sendPost('admin/customers/update', params)
export const getExportCustomerCSV = (params) => sendGet('admin/customers/export', params)
export const multiDeleteCustomer = (params) => sendPost('admin/customers/multi-delete', params)
export const getCustomer = (params) => sendGet(`admin/customers/${params.customer_id}/detail`, params)
export const getCustomerInvoiceList = (params) => sendGet(`admin/customers/${params.customer_id}/detail/invoices`, params)
export const getCustomerQuotationList = (params) => sendGet(`admin/customers/${params.customer_id}/detail/quotations`, params)
export const getCustomerDocumentList = (params) => sendGet(`admin/customers/${params.customer_id}/detail/documents`, params)
