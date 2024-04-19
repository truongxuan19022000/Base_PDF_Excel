import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import customerSaga from 'src/sagas/customer';

export const initialState = {
  list: {},
  detail: {},
  csvData: {},
  customerAll: [],
  searchedData: [],
  customerList: [],
  detailInvoice: {},
  detailQuotation: {},
  customerListData: {},
  selectedCustomer: {},
  logsData: {},
  logsList: [],
  customerClaim: {},
  customerInvoice: {},
  customerDocument: {},
  customerQuotation: {},
  customerQuotationList: [],
  newCustomerCount: 0,
  isSearching: false,
  isCustomerUpdate: false,
  isCustomerDocumentUpdated: false,
  fetched: false,
  isLoading: false,
  fetchedAll: false,
  fetchedLogs: false,
  fetchedClaim: false,
  fetchedDetail: false,
  fetchedInvoice: false,
  fetchedDocument: false,
  fetchedQuotation: false,
  fetchedQuotationAll: false,
};

const slice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    getCustomerList(state, action) { },
    getCustomerListSuccess(state, action) {
      state.list = action.payload?.data?.customers || {}
      state.fetched = true;
    },
    createCustomer(state, action) { },
    createCustomerSuccess(state, action) {
      if (state.list.data && action?.payload) {
        if (state.list.data?.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(action.payload);
        state.list.total++
        state.fetchedAll = false;
        state.fetchedDetail = false;
      }
    },
    multiDeleteCustomer(state, action) { },
    multiDeleteCustomerSuccess(state, action) {
      if (action?.payload && state.list?.data && state.list?.total) {
        state.list.data = state.list.data.filter((item) => !action.payload.includes(item.id));
        state.list.total = state.list.total - action.payload?.length
      }
    },
    getCustomer(state, action) {
      state.isLoading = true;
    },
    getCustomerSuccess(state, action) {
      if (action?.payload) {
        state.detail = action.payload
        state.isCustomerUpdate = false;
        state.fetchedDetail = true;
        state.isLoading = false;
      }
    },
    getCustomerActivity(state) {
    },
    getCustomerActivitySuccess(state, action) {
      if (action?.payload) {
        const { data } = action.payload;
        state.logsData = action.payload;
        state.fetchedLogs = true;
        if (state.logsList) {
          // filter out prepend item which has fake id as newId-x
          const filteredList = state.logsList.filter(item => typeof item.id !== 'string')
          const updatedLogs = [...filteredList];
          // add new log to updated list
          data.forEach(log => {
            const existingLogIndex = updatedLogs.findIndex(existingLog => existingLog.id === log.id);
            if (existingLogIndex !== -1) {
              updatedLogs[existingLogIndex] = log;
            } else {
              updatedLogs.push(log);
            }
          });
          //sorted updated list by id before set state
          const sortedList = updatedLogs.sort((a, b) => b.id - a.id);
          state.logsList = sortedList;
        } else {
          //sorted updated list by id before set state
          const sortedList = data.sort((a, b) => b.id - a.id);
          state.logsList = sortedList;
        }
      }
    },
    handleResetFetchedLogsData(state) {
      state.fetchedLogs = false;
    },
    updateCustomer(state, action) { },
    updateCustomerSuccess(state, action) {
      const payload = action?.payload;
      if (payload) {
        const updatedData = {
          name: payload.name,
          email: payload.email,
          status: payload.status,
          id: Number(payload.customer_id),
          created_at: payload.created_at,
          phone_number: payload.phone_number,
        };

        // update detail
        if (state.detail) {
          const updatedDetailData = {
            company_name: payload.company_name,
            postal_code: payload.postal_code,
            address: {
              address_1: payload.address_1,
              address_2: payload.address_2,
            },
            ...updatedData,
          };
          state.detail.customer = updatedDetailData;
          state.fetchedDetail = false;
        }
        state.isCustomerUpdate = true;

        // update list
        if (state.list?.data) {
          const updatedListData = state.list.data.map((item) =>
            item.id === +updatedData.id ? updatedData : item
          );
          state.list.data = updatedListData;
        }

        // update logs
        const newLogs = {
          ...payload?.logsInfo,
          id: `newId-${state.logsData.total++}`
        }

        state.logsData.total++;
        state.logsList = [newLogs, ...state.logsList];
      };
    },
    getExportCustomerCSV() { },
    getExportCustomerCSVSuccess(state, action) {
      if (action?.payload) {
        state.csvData = action?.payload;
      }
    },
    resetFetchedList(state, action) {
      state.fetched = false;
    },
    setSelectedCustomer(state, action) {
      state.selectedCustomer = action?.payload;
    },
    clearSelectedCustomer(state) {
      state.selectedCustomer = {};
    },
    clearCSVDataCustomer(state) {
      state.csvData = {};
    },
    setSearchingStatus(state) {
      state.isSearching = true;
    },
    getSearchCustomerList(state) {
      state.isSearching = true;
    },
    getSearchCustomerListSuccess(state, action) {
      state.searchedData = action.payload?.data?.customers || []
      state.isSearching = false;
    },
    clearSearchedData(state) {
      state.searchedData = []
      state.isSearching = false;
    },
    getCustomerWithPage(state, action) { },
    getCustomerWithPageSuccess(state, action) {
      if (action?.payload) {
        const updatedData = action.payload?.data;
        const list = state.customerList;
        const filteredList = list?.filter((existingCustomer) => {
          return !updatedData.some((updatedInfo) => updatedInfo.id === existingCustomer.id);
        });
        state.customerList = [...filteredList, ...updatedData];
        state.customerListData = action.payload;
      }
    },
    getAllCustomerList() {
    },
    getAllCustomerListSuccess(state, action) {
      if (action?.payload) {
        state.customerAll = action.payload?.data?.customers;
        state.fetchedAll = true;
      }
    },
    getNewCustomerCount() {
    },
    getNewCustomerCountSuccess(state, action) {
      if (action?.payload) {
        state.newCustomerCount = action.payload?.data
      }
    },
    getCustomerQuotationList() { },
    getCustomerQuotationListSuccess(state, action) {
      if (action?.payload) {
        state.customerQuotation = action.payload?.data.quotations || {};
        state.fetchedQuotation = true;
      }
    },
    deleteCustomerQuotation(state, action) {
    },
    deleteCustomerQuotationSuccess(state, action) {
      if (action?.payload && state.customerQuotation?.data) {
        state.customerQuotation.data = state.customerQuotation?.data?.filter((item) => !action.payload.includes(item.id));
      }
    },
    getCustomerInvoiceList() { },
    getCustomerInvoiceListSuccess(state, action) {
      if (action?.payload) {
        state.customerInvoice = action.payload?.data?.invoices || {};
        state.fetchedInvoice = true;
      }
    },
    getCustomerClaimList() { },
    getCustomerClaimListSuccess(state, action) {
      if (action?.payload) {
        state.customerClaim = action.payload?.data || {};
        state.fetchedClaim = true;
      }
    },
    deleteCustomerInvoice(state, action) {
    },
    deleteCustomerInvoiceSuccess(state, action) {
      if (action?.payload && state.customerInvoice?.data) {
        state.customerInvoice.data = state.customerInvoice?.data?.filter((item) => !action.payload.includes(item.id));
      }
    },
    getCustomerDocumentList() { },
    getCustomerDocumentListSuccess(state, action) {
      if (action?.payload) {
        state.customerDocument = action.payload?.data?.documents || {};
        state.fetchedDocument = true;
        state.isCustomerDocumentUpdated = false;
      }
    },
    getExportCustomerDocumentCSV() { },
    updateNewCustomerDocument(state, action) {
      if (state.customerDocument.data && action?.payload) {
        if (state.customerDocument.data?.length >= 10) {
          state.customerDocument.data.pop();
        }
        state.customerDocument.data.unshift(action.payload);
        state.customerDocument.total++
      }
    },
    deleteCustomerDocument(state, action) {
      if (action?.payload && state.customerDocument?.data && state.customerDocument?.total) {
        state.customerDocument.data = state.customerDocument.data.filter((item) => !action.payload.includes(item.id));
        state.customerDocument.total = state.customerDocument.total - action.payload?.length
      }
      state.fetchedDocument = false;
      state.isCustomerDocumentUpdated = true;
    },
    clearCustomerDetail(state) {
      state.detail = {};
      state.customerClaim = {};
      state.customerInvoice = {};
      state.customerDocument = {};
      state.customerQuotation = {};
      state.customerQuotationList = [];
      state.fetchedLogs = false;
      state.fetchedClaim = false;
      state.fetchedDetail = false;
      state.fetchedInvoice = false;
      state.fetchedDocument = false;
      state.fetchedQuotation = false;
      state.fetchedQuotationAll = false;
      state.logsData = {};
      state.logsList = [];
    },
    getQuotationListWithCustomer(state, action) {
    },
    getQuotationListWithCustomerSuccess(state, action) {
      if (action?.payload) {
        state.customerQuotationList = action.payload?.data?.quotations;
        state.fetchedQuotationAll = true;
      }
    },
  },
})

export const { actions: customerActions } = slice

export const useCustomerSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: customerSaga })
  return { actions: slice.actions }
}
