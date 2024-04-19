import { call, put, takeLatest } from 'redux-saga/effects';
import { quotationSectionActions as actions } from 'src/slices/quotationSection';
import { quotationActions as quotationActions } from 'src/slices/quotation';
import { alertActions } from 'src/slices/alert';
import { ALERT, INVENTORY, QUOTATION } from 'src/constants/config';

import * as api from '../api/quotationSection';

const addSuccessAlert = (title = 'Action Successfully', description = '') => alertActions.openAlert({
  type: ALERT.SUCCESS_VALUE,
  title,
  isHovered: false,
  description,
})

const addFailedAlert = (title = 'Action Failed', description = '') => alertActions.openAlert({
  type: ALERT.FAILED_VALUE,
  title,
  isHovered: false,
  description,
})

function* getQuotationSectionListSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationSectionList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const resData = res.data?.data;
      const scrapCostList = resData.finalData
        .flatMap(data => data?.products
          ?.flatMap(product => product?.product_items
            ?.filter(item => item?.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM)
            ?.flatMap(item => item?.product_template
              ?.filter(template =>
                template?.type === QUOTATION.MATERIAL_VALUE.ALUMINIUM &&
                template?.scrap?.status === INVENTORY.MATERIAL_UN_USED &&
                template?.scrap?.scrap_length > 0)
              ?.map(scrapItem => +scrapItem?.scrap?.cost_of_scrap * +scrapItem?.scrap?.scrap_weight)
            )));
      const totalEstimateScrapCost = scrapCostList.reduce((total, cost) => total + cost, 0.00);
      const bottomData = {
        discountAmount: resData.discount_amount,
        discountType: resData.discount_type,
        otherFees: resData.other_fees,
        grandTotal: resData.grand_total,
        sumSections: resData.sumSections,
        totalBeforeGST: resData.total_before_gst,
        estimateScrapCost: totalEstimateScrapCost,
      }
      yield put(actions.getQuotationSectionListSuccess(res.data));
      yield put(quotationActions.handleSetBottomBarData(bottomData));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* createQuotationSectionSaga({ payload }) {
  try {
    const res = yield call(api.createQuotationSection, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Section has been created',
      ));
      if (payload?.onCreateSuccess) {
        payload?.onCreateSuccess(res.data?.data?.id)
      }
      yield put(actions.createQuotationSectionSuccess(res.data?.data));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Section unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Section unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteQuotationSectionSaga({ payload }) {
  try {
    const res = yield call(api.deleteQuotationSection, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Section has been deleted',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const deleteInfo = {
        quotation_section_id: payload.data?.quotation_section_id,
      }
      yield put(actions.deleteQuotationSectionSuccess(deleteInfo));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Section unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Section unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleDragAndDropSectionSaga({ payload }) {
  try {
    const res = yield call(api.handleQuotationSection, payload);
    if (res.data?.data?.status) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Quotation has been save',
      ));
      yield put(actions.handleDragAndDropSectionSuccess(payload?.sections));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Quotation unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Quotation unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* createQuotationSectionProductSaga({ payload }) {
  try {
    const res = yield call(api.createQuotationSectionProduct, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Product has been created',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      if (res.data?.data?.id) {
        const newData = {
          ...res.data?.data,
          productId: res.data.data.id,
        }
        yield put(actions.createQuotationSectionProductSuccess(newData));
      }
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Product unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Product unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleChangeProductOrderSaga({ payload }) {
  try {
    const res = yield call(api.handleChangeProductOrder, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Quotation has been save',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.handleChangeProductOrderSuccess());
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Quotation unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Quotation unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* createProductMaterialSaga({ payload }) {
  try {
    const res = yield call(api.createProductMaterial, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Product material has been created',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const updatedData = {
        ...res.data?.data,
        productId: res.data?.data?.id,
        quotation_section_id: payload.quotation_section_id,
      }
      yield put(actions.createProductMaterialSuccess(updatedData));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Product material unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Product material unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteSectionProductSaga({ payload }) {
  try {
    const res = yield call(api.deleteSectionProduct, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Product has been deleted',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const deleteInfo = {
        product_id: payload.data?.product_id,
        section_id: payload.data?.section_id,
      }
      yield put(actions.deleteSectionProductSuccess(deleteInfo));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Product unable to delete',
      ));
      if (payload.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Product unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteProductItemSaga({ payload }) {
  try {
    const res = yield call(api.deleteProductItem, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Product material has been deleted',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const deleteInfo = {
        product_item_id: payload.data?.product_item_id,
        product_id: payload.data?.product_id,
        section_id: payload.data?.section_id,
      }
      yield put(actions.deleteProductItemSuccess(deleteInfo));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Product material unable to delete',
      ));
      if (payload.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Product material unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteItemMaterialSaga({ payload }) {
  try {
    const res = yield call(api.deleteItemMaterial, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Item has been deleted',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const deleteInfo = {
        product_template_material_id: payload?.product_template_material_id,
        product_item_template_id: payload?.product_item_template_id,
        product_item_id: payload?.product_item_id,
        product_id: payload?.product_id,
        section_id: payload?.section_id,
      }
      yield put(actions.deleteItemMaterialSuccess(deleteInfo));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Item unable to delete',
      ));
      if (payload.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Item unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* createMaterialItemSaga({ payload }) {
  try {
    const res = yield call(api.createMaterialItem, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Item has been created',
      ));
      yield put(actions.createMaterialItemSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Item unable to create',
      ));
      if (payload.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Item unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* editMaterialItemSaga({ payload }) {
  try {
    const res = yield call(api.editMaterialItem, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Item has been save',
      ));
      yield put(actions.editMaterialItemSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Item unable to save',
      ));
      if (payload.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Item unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* editSectionProductSaga({ payload }) {
  try {
    const res = yield call(api.editSectionProduct, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Product has been save',
      ));
      yield put(actions.editSectionProductSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Product unable to save',
      ));
      if (payload.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Product unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* editProductItemSaga({ payload }) {
  try {
    const res = yield call(api.editProductItem, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Product material has been save',
      ));
      yield put(actions.editProductItemSuccess());
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Product material unable to save',
      ));
      if (payload.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Product material unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* editQuotationSectionSaga({ payload }) {
  try {
    const res = yield call(api.editQuotationSection, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Section has been save',
      ));
      yield put(actions.editQuotationSectionSuccess(payload));
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Section unable to save',
      ));
      if (payload.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Section unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* quotationSectionSaga() {
  yield takeLatest(actions.createProductMaterial.type, createProductMaterialSaga);
  yield takeLatest(actions.createQuotationSection.type, createQuotationSectionSaga);
  yield takeLatest(actions.deleteQuotationSection.type, deleteQuotationSectionSaga);
  yield takeLatest(actions.getQuotationSectionList.type, getQuotationSectionListSaga);
  yield takeLatest(actions.handleDragAndDropSection.type, handleDragAndDropSectionSaga);
  yield takeLatest(actions.handleChangeProductOrder.type, handleChangeProductOrderSaga);
  yield takeLatest(actions.createQuotationSectionProduct.type, createQuotationSectionProductSaga);
  yield takeLatest(actions.deleteSectionProduct.type, deleteSectionProductSaga);
  yield takeLatest(actions.deleteProductItem.type, deleteProductItemSaga);
  yield takeLatest(actions.deleteItemMaterial.type, deleteItemMaterialSaga);
  yield takeLatest(actions.createMaterialItem.type, createMaterialItemSaga);
  yield takeLatest(actions.editMaterialItem.type, editMaterialItemSaga);
  yield takeLatest(actions.editSectionProduct.type, editSectionProductSaga);
  yield takeLatest(actions.editProductItem.type, editProductItemSaga);
  yield takeLatest(actions.editQuotationSection.type, editQuotationSectionSaga);
}

export default quotationSectionSaga
