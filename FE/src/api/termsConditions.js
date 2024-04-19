import { sendGet, sendPost } from './index'

export const getTermsConditions = (id) => sendGet('admin/term-conditions', id)
export const handleTermsConditions = (params) => sendPost('admin/term-conditions/handle', params)
export const updateOrderNumber = (params) => sendPost('admin/term-conditions/update-order-number', params)
