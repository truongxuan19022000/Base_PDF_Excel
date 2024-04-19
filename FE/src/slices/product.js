import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import productSaga from 'src/sagas/product';

export const initialState = {
  list: {},
  detail: {},
  csvData: {},
  allProduct: {},
  fetched: false,
  allFetched: false,
};

const slice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    getProductList() { },
    getProductListSuccess(state, action) {
      state.list = action?.payload?.data?.product_templates || {}
      state.fetched = true;
    },
    getExportProductCSV() { },
    getExportProductCSVSuccess(state, action) {
      if (action?.payload) {
        state.csvData = action?.payload;
      }
    },
    clearCSVData(state) {
      state.csvData = {};
    },
    createProductTemplate() { },
    createProductTemplateSuccess(state, action) {
      if (action?.payload && state.list.data) {
        if (state.list.data?.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(action.payload);
        state.list.total++
        state.allFetched = false;
      }
    },
    multiDeleteProduct() { },
    multiDeleteProductSuccess(state, action) {
      if (action?.payload && state.list?.data && state.list.total) {
        state.list.data = state.list?.data.filter((item) => !action.payload.includes(item.id));
        state.list.total = state.list.total - action.payload?.length
      }
      state.fetched = false;
      state.allFetched = false;
    },
    getProductDetail(state, action) {
    },
    getProductDetailSuccess(state, action) {
      state.detail = action?.payload;
    },
    updateProductDetail() {
    },
    updateProductDetailSuccess(state, action) {
      if (action?.payload) {
        const payload = action.payload;
        state.detail = payload;
        if (state.list.data) {
          state.list.data = state.list.data.map(item =>
            item.id === payload.id ? payload : item
          );
        }
        state.allFetched = false;
      }
    },
    getAllProductList() { },
    getAllProductListSuccess(state, action) {
      if (action?.payload) {
        state.allProduct = action.payload;
        state.allFetched = true;
      }
    },
    resetFetchedList(state) {
      state.fetched = false;
    }
  },
})

export const { actions: productActions } = slice

export const useProductSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: productSaga })
  return { actions: slice.actions }
}
