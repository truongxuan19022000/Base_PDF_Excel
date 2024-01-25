import { CONVERSATION_PER_PAGE } from 'src/constants/config'
import { sendGet, sendPost, sendDelete } from './index'

// conversation api
export const getConversationList = (params) => sendGet(`admin/whatsapp/conversations?per_page=${CONVERSATION_PER_PAGE}`, params)
export const pinChatConversation = (params) => sendPost('admin/whatsapp/conversations/pin', params)
export const cleanChatConversation = (params) => sendPost('admin/whatsapp/conversations/clean', params)
export const deleteChatConversation = (params) => sendDelete('admin/whatsapp/conversations/delete', params)

// messages api
export const sendMessage = (params) => sendPost('admin/whatsapp/messages/send-message', params)
export const multiDeleteMessage = (params) => sendPost('admin/whatsapp/messages/multi-delete', params)
export const multiStarredMessage = (params) => sendPost('admin/whatsapp/messages/multi-starred', params)
export const getMedia = (params) => sendGet(`admin/whatsapp/messages/media/${params.mediaId}`, params)
export const getMessageList = (params) => sendGet('admin/whatsapp/messages/list-message-with-customer', params)
export const getConversationWithCustomerId = (params) => sendGet('admin/whatsapp/messages/list-message-with-customer', params)
export const getMediaDetail = (id) => sendGet(`admin/whatsapp/messages/media/${id}`)
export const getStarredMessageList = (params) => sendGet('admin/whatsapp/messages/list-message-with-starred', params)
export const unStarredAllMessages = () => sendPost('admin/whatsapp/messages/multi-unstar-messages')
