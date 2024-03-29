import { sendPost, sendGet } from './index'

export const getUserList = (params) => sendGet('admin/users', params)
export const login = (params) => sendPost('admin/login', params)
export const createUser = (params) => sendPost('admin/users/create', params)
export const updateUser = (params) => sendPost('admin/users/update', params)
export const getUserDetail = (params) => sendGet(`admin/users/${params}/edit`)
export const resetPassword = (params) => sendPost('admin/reset-password', params)
export const forgotPassword = (params) => sendPost('admin/forgot-password', params)
export const multiDeleteUser = (params) => sendPost('admin/users/multi-delete', params)
export const getUser = () => sendGet('/admin/users/profile')
export const logout = (params) => sendPost('/admin/logout', params)
export const getExportUserCSV = (params) => sendGet('admin/users/export', params)
