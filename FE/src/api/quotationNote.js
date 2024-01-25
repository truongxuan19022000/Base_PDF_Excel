import { sendGet, sendPost } from './index'

export const getQuotationNotes = (id) => sendGet('admin/quotation-notes', id)
export const handleQuotationNote = (params) => sendPost('admin/quotation-notes/handle', params)
