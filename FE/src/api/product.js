import { sendGet, sendPost } from './index'

export const getProductList = (params) => sendGet('admin/product-templates', params)
export const getAllProductList = (params) => sendGet('admin/product-templates/all', params)
export const getProductDetail = (id) => sendGet('admin/product-templates/detail', id)
export const getExportProductCSV = (params) => sendGet('admin/product-templates/export', params)
export const updateProductDetail = (params) => sendPost('admin/product-templates/update', params)
export const createProductTemplate = (params) => sendPost('admin/product-templates/create', params)
export const multiDeleteProduct = (params) => sendPost('admin/product-templates/multi-delete', params)
