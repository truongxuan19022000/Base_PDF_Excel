import { sendGet, sendPost } from './index'

export const getQuotationList = (params) => sendGet('admin/quotations', params)
export const multiDeleteQuotation = (params) => sendPost('admin/quotations/multi-delete', params)
export const getQuotationDetail = (id) => sendGet(`admin/quotations/${id}/detail`)
export const createQuotation = (params) => sendPost('admin/quotations/create', params)
export const getExportQuotationCSV = (params) => sendGet('admin/quotations/export', params)
export const updateQuotation = (params) => sendPost('admin/quotations/update', params)
export const getAllQuotationList = () => sendGet('admin/quotations/all')
