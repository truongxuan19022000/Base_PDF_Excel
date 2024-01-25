import { sendGet, sendPost } from './index'

export const getRoleList = (params) => sendGet('admin/roles', params)
export const getRoleDetail = (params) => sendGet(`admin/roles/${params}/edit`)
export const createRole = (params) => sendPost('admin/roles/create', params)
export const updateRole = (params) => sendPost('admin/roles/update', params)
export const multiDeleteRole = (params) => sendPost('admin/roles/multi-delete', params)
export const getExportRoleCSV = (params) => sendGet('admin/roles/export', params)
