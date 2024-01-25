import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import quotationSectionSaga from 'src/sagas/quotationSection';

export const initialState = {
  sections: [],
  quotationAmount: 0,
  otherFees: [],
  discount: 0,
  fetched: false,
};

const slice = createSlice({
  name: 'quotationSection',
  initialState,
  reducers: {
    getQuotationSectionList(state, action) {
    },
    getQuotationSectionListSuccess(state, action) {
      if (action?.payload) {
        state.sections = action.payload?.data?.finalData || [];
        state.quotationAmount = action.payload?.data?.sumSections;
        state.discount = action.payload?.data?.discount;
        state.otherFees = action.payload?.data?.other_fees;
        state.fetched = true;
      }
    },
    createQuotationSection() { },
    createQuotationSectionSuccess(state, action) {
      if (action?.payload) {
        state.sections = [...state.sections, action.payload]
      }
    },
    deleteQuotationSection() { },
    deleteQuotationSectionSuccess(state, action) {
      if (action?.payload) {
        state.sections = action.payload?.data;
      }
    },
    handleDragAndDropSection() { },
    handleDragAndDropSectionSuccess(state, action) {
      if (action?.payload) {
        state.sections = action.payload?.data;
      }
    },
    createQuotationSectionProduct() { },
    createQuotationSectionProductSuccess(state, action) {
      if (action?.payload) {
        const payload = action.payload;
        const updatedSectionList = state.sections?.map(section =>
          section.id === +payload.quotation_section_id
            ? { ...section, products: [...(section.products || []), payload] }
            : section
        );
        state.sections = updatedSectionList;
      }
    },
    handleChangeProductOrder() { },
    handleChangeProductOrderSuccess(state, action) {
      if (action?.payload) {
        state.sections = action?.payload;
      }
    },
    createProductMaterial() { },
    createProductMaterialSuccess(state, action) {
      if (action?.payload && state.sections && Array.isArray(state.sections)) {
        const payload = action.payload;
        const sectionIndex = state.sections.findIndex(s => s.id === +payload?.quotation_section_id);
        if (sectionIndex !== -1) {
          const updatedSectionList = [...state.sections];
          const updatedSection = { ...updatedSectionList[sectionIndex] };
          const productIndex = updatedSection.products.findIndex(p => p.productId === +payload?.product_id);
          if (productIndex !== -1) {
            const updatedProducts = [...updatedSection.products];
            const updatedProduct = { ...updatedProducts[productIndex] };
            const updatedProductItems = [...updatedProduct.product_items, payload];
            updatedProduct.product_items = updatedProductItems;
            updatedProducts[productIndex] = updatedProduct;
            updatedSection.products = updatedProducts;
            updatedSectionList[sectionIndex] = updatedSection;
            state.sections = updatedSectionList;
          }
        }
        state.fetched = false;
      }
    },
  }
})

export const { actions: quotationSectionActions } = slice

export const useQuotationSectionSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: quotationSectionSaga })
  return { actions: slice.actions }
}
