import { sendGet, sendPost } from './index'

export const getMaterialList = (params) => sendGet('admin/materials', params)
export const getAllMaterialList = (params) => sendGet('admin/materials/all', params)
export const getMaterialDetail = (id) => sendGet(`admin/materials/${id}/edit`)
export const createMaterialItem = (params) => sendPost('admin/materials/create', params)
export const getExportMaterialCSV = (params) => sendGet('admin/materials/export', params)
export const updateMaterialDetail = (params) => sendPost('admin/materials/update', params)
export const multiDeleteMaterial = (params) => sendPost('admin/materials/multi-delete', params)
export const uploadCSV = (params) => sendPost('admin/materials/import', params)
