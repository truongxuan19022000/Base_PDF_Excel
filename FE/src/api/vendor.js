import { sendDelete, sendGet, sendPost } from './index'

export const getVendorList = (params) => sendGet('admin/vendors', params)
export const getVendorDetail = (id) => sendGet(`admin/vendors/${id}/detail`)
export const deleteVendor = (params) => sendDelete('admin/vendors/delete', params)
export const deleteMultiVendor = (params) => sendPost('admin/vendors/multi-delete', params)
export const createVendor = (params) => sendPost('admin/vendors/create', params)
export const updateVendor = (params) => sendPost('admin/vendors/update', params)
export const getExportVendorCSV = (params) => sendGet('admin/vendors/export', params)
