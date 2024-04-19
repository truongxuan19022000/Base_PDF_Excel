import { sendGet } from './index'

export const getSalesRevenue = (params) => sendGet('admin/claims/total-amount-per-month', params)
export const getMessages = (params) => sendGet('admin/whatsapp/conversations/unread-message', params)
