import { sendGet, sendPost } from './index'

export const getQuotationSectionList = (id) => sendGet('admin/quotation-sections', id)
export const createQuotationSection = (params) => sendPost('admin/quotation-sections/create', params)
export const handleQuotationSection = (params) => sendPost('admin/quotation-sections/handle', params)
export const createProductMaterial = (params) => sendPost('admin/quotation-sections/products/items/create', params)
export const createQuotationSectionProduct = (params) => sendPost('admin/quotation-sections/products/create', params)
export const handleChangeProductOrder = (params) => sendPost('admin/quotation-sections/products/update-order-number', params)
