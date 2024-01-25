import { sendGet, sendPost } from './index'

export const uploadDocument = (params) => sendPost('admin/documents/create', params)
export const getExportDocumentCSV = (params) => sendGet('admin/documents/export', params)
export const multiDeleteDocument = (params) => sendPost('admin/documents/multi-delete', params)
