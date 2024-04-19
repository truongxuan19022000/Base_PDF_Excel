import { sendDelete, sendGet, sendPost } from './index'

export const getScrapList = (params) => sendGet('admin/scraps', params)
export const getScraps = (params) => sendGet('admin/scraps/scrap-managements', params)
export const deleteScrap = (params) => sendDelete('admin/scraps/delete', params)
export const deleteMultiScrap = (params) => sendPost('admin/scraps/multi-delete', params)
export const getScrapDetail = (id) => sendGet(`admin/scraps/${id}/detail`)
export const updateScrap = (params) => sendPost('admin/scraps/update', params)
export const getExportScrapCSV = (params) => sendGet('admin/scraps/export', params)
