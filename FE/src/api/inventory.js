import { sendGet, sendPost } from './index'

export const getInventoryList = (params) => sendGet('admin/inventories', params)
export const updateInventory = (params) => sendPost('admin/inventories/update', params)
export const createInventory = (params) => sendPost('admin/inventories/create', params)
export const getInventoryDetail = (params) => sendGet(`admin/inventories/${params}/edit`)
export const multiDeleteInventory = (params) => sendPost('admin/inventories/multi-delete', params)
