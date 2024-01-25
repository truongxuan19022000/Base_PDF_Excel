import axios from 'axios'

import { getToken } from 'src/helper/helper'

export const api = axios.create({
  baseURL: process.env.REACT_APP_END_POINT,
  timeout: 60000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
})

export const sendGet = (url, params) => {
  const token = getToken('access_token')
  api.defaults.headers.common.Authorization = `Bearer ${token}`
  return api.get(url, { params })
}
export const sendPost = (url, params) => {
  const token = getToken('access_token')
  api.defaults.headers.common.Authorization = `Bearer ${token}`
  return api.post(url, params)
}
export const sendPatch = (url, params) => {
  const token = getToken('access_token')
  api.defaults.headers.common.Authorization = `Bearer ${token}`
  return api.patch(url, params)
}
export const sendDelete = (url, params) => {
  const token = getToken('access_token')
  api.defaults.headers.common.Authorization = `Bearer ${token}`
  return api.delete(url, params)
}
