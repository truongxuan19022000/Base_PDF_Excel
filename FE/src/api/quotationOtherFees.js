import { sendGet, sendPost } from './index'

export const getQuotationOtherFees = (id) => sendGet('admin/other-fees', id)
export const handleQuotationOtherFees = (params) => sendPost('admin/other-fees/handle', params)
export const handleDeleteAllOtherFees = (params) => sendPost('admin/other-fees/delete-all', params)
export const updateOrderNumber = (params) => sendPost('admin/other-fees/update-order-number', params)
