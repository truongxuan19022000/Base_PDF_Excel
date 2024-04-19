import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import quotationSectionSaga from 'src/sagas/quotationSection';

export const initialState = {
  sections: [],
  fetched: false,
  selectedItem: {},
  selectedSection: {},
  selectedProduct: {},
  selectedProductItem: {},
  selectedDeletedInfo: {},
};

const slice = createSlice({
  name: 'quotationSection',
  initialState,
  reducers: {
    getQuotationSectionList(state, action) {
    },
    getQuotationSectionListSuccess(state, action) {
      if (action?.payload) {
        const payload = action.payload?.data;
        state.sections = payload.finalData || [];
        state.fetched = true;
      }
    },
    createQuotationSection() { },
    createQuotationSectionSuccess(state, action) {
      if (action?.payload && state.sections) {
        const newItem = { ...action.payload, products: [] }
        state.sections = [...(state.sections || []), newItem];
      }
    },
    deleteQuotationSection() { },
    deleteQuotationSectionSuccess(state, action) {
      if (action?.payload) {
        state.sections = state.sections.filter(item => item.id !== action.payload?.quotation_section_id);
        state.fetched = false;
      }
    },
    handleDragAndDropSection() { },
    handleDragAndDropSectionSuccess(state, action) {
      state.sections = action?.payload;
    },
    createQuotationSectionProduct() { },
    createQuotationSectionProductSuccess(state, action) {
      if (action?.payload) {
        const payload = action.payload;
        const updatedSectionList = state.sections?.map(section =>
          section.id === +payload.quotation_section_id
            ? {
              ...section,
              products: [...(section.products || []), { ...payload, product_items: [] }],
            } : section
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
      if (action?.payload) {
        state.fetched = false;
      }
    },
    resetQuotationSectionData(state, action) {
      state.sections = []
      state.quotationAmount = 0
      state.otherFees = []
      state.discount = 0
      state.fetched = false
    },
    deleteSectionProduct(state, action) { },
    deleteSectionProductSuccess(state, action) {
      const payload = action?.payload;
      if (payload) {
        state.sections = state.sections.map(section =>
          +section.id === +payload.section_id
            ? {
              ...section,
              products: (section.products || []).filter(p => +p.productId !== +payload.product_id),
            }
            : section
        );
        state.fetched = false;
      }
    },
    deleteProductItem(state, action) { },
    deleteProductItemSuccess(state, action) {
      const payload = action?.payload;
      if (payload) {
        state.sections = state.sections.map(section => ({
          ...section,
          products: section.products.map(product => ({
            ...product,
            product_items: (product.product_items || []).filter(item => +item.id !== +payload.product_item_id)
          }))
        }));
        state.fetched = false;
      }
    },
    deleteItemMaterial(state, action) { },
    deleteItemMaterialSuccess(state, action) {
      const payload = action?.payload;
      if (payload) {
        state.sections = state.sections.map(section => ({
          ...section,
          products: section.products.map(product => ({
            ...product,
            product_items: product.product_items.map(material => ({
              ...material,
              product_template: (material.product_template || []).filter(item => +item.product_template_material_id !== +payload.product_template_material_id)
            }))
          }))
        }));
        state.fetched = false;
      }
    },
    handleSetSelectedProduct(state, action) {
      state.selectedProduct = action.payload
    },
    clearSelectedProduct(state, action) {
      state.selectedProduct = {};
    },
    createMaterialItem(state, action) { },
    createMaterialItemSuccess(state, action) {
      const {
        sectionId,
        productId,
        productItemId,
        selectedItem,
        costUnit,
        costOfItem,
        totalCostOfItem,
        totalArea,
        totalPerimeter,
        quantity
      } = action.payload;
      state.sections = state.sections.map(section =>
        section.id === sectionId ? {
          ...section,
          products: section.products.map(product =>
            product.productId === productId ? {
              ...product,
              product_items: product.product_items.map(item =>
                item.id === productItemId ? {
                  ...item,
                  product_template: [
                    ...item.product_template,
                    {
                      ...selectedItem,
                      cost_unit: costUnit,
                      cost_of_item: costOfItem,
                      total_cost_of_item: totalCostOfItem,
                      total_area: totalArea,
                      total_perimeter: totalPerimeter,
                      quantity: quantity
                    }
                  ]
                } : item
              )
            } : product
          )
        } : section
      );
      state.fetched = false;
    },
    handleSelectDeleteInfo(state, action) {
      state.selectedDeletedInfo = action.payload;
    },
    clearSelectedDeleteInfo(state) {
      state.selectedDeletedInfo = {};
    },
    handleSetSelectedProductItem(state, action) {
      state.selectedProductItem = action.payload;
    },
    clearSelectedProductItem(state) {
      state.selectedProductItem = {};
    },
    handleSetSelectedSection(state, action) {
      state.selectedSection = action.payload;
    },
    clearSelectedSection(state) {
      state.selectedSection = {};
    },
    handleSetSelectedItem(state, action) {
      state.selectedItem = action.payload;
    },
    editMaterialItem() { },
    editMaterialItemSuccess(state, action) {
      state.fetched = false;
    },
    editSectionProduct() { },
    editSectionProductSuccess(state, action) {
      state.fetched = false;
    },
    editProductItem() { },
    editProductItemSuccess(state, action) {
      state.fetched = false;
    },
    editQuotationSection() { },
    editQuotationSectionSuccess(state, action) {
      if (action?.payload) {
        state.sections = state.sections.map(section =>
          +section.id === +action.payload?.quotation_section_id
            ? {
              ...section,
              section_name: action.payload?.section_name,
            } : section)
      }
    },
    handleResetSelectedProductItem(state, action) {
      state.selectedProductItem = {}
    },
    handleResetSelectedItem(state, action) {
      state.selectedItem = {}
    },
  }
})

export const { actions: quotationSectionActions } = slice

export const useQuotationSectionSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: quotationSectionSaga })
  return { actions: slice.actions }
}
