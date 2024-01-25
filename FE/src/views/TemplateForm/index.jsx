import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { useProductSlice } from 'src/slices/product'
import { useMaterialSlice } from 'src/slices/material'
import { FILTER, INVENTORY, PAGINATION } from 'src/constants/config'
import { validateCreateProductTemplate, validateUpdateProductTemplate } from 'src/helper/validation'
import { downloadCSVFromCSVString, isEmptyObject, isSimilarObject, normalizeString } from 'src/helper/helper'

import Checkbox from 'src/components/Checkbox'
import Pagination from 'src/components/Pagination'
import HeadlineBar from 'src/components/HeadlineBar'
import FilterModal from 'src/components/FilterModal'
import InputBoxForm from 'src/components/InputBoxForm'
import EditQuantityModal from 'src/components/EditQuantityModal'
import ActionMessageForm from 'src/components/ActionMessageForm'
import InventorySelectForm from 'src/components/InventorySelectForm'
import TableActionTemplate from 'src/components/TableActionTemplate'

const TemplateForm = () => {
  const { actions } = useMaterialSlice()
  const { actions: productActions } = useProductSlice()

  const params = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const currentURL = history.location.pathname.split('/')[1]

  const list = useSelector(state => state.material.list)
  const fetched = useSelector(state => state.material.fetched)
  const csvData = useSelector(state => state.material.csvData)

  const productDetail = useSelector(state => state.product.detail)

  const [isCalled, setIsCalled] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [messageError, setMessageError] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [totalDataNumber, setTotalDataNumber] = useState(0)
  const [isSelectedAll, setIsSelectedAll] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowFilterModal, setIsShowFilterModal] = useState(false)
  const [selectedProfileFilter, setSelectedProfileFilter] = useState([])
  const [currentPageNumber, setCurrentPageNumber] = useState(PAGINATION.START_PAGE)

  const [item, setItem] = useState('')
  const [message, setMessage] = useState({})
  const [profile, setProfile] = useState({})
  const [quantity, setQuantity] = useState(null)
  const [headlineTitle, setHeadlineTitle] = useState('')
  const [isShowEditQuantityModal, setIsShowEditQuantityModal] = useState(false)

  const [tempoSelectedList, setTempoSelectedList] = useState([])
  const [selectedItemToEdit, setSelectedItemToEdit] = useState({})
  const [selectedProductList, setSelectedProductList] = useState([])
  const [tempoSelectProductIds, setTempoSelectProductIds] = useState([])
  const [isSelectedAllProduct, setIsSelectedAllProduct] = useState(false)

  const [originalProductInfo, setOriginalProductInfo] = useState({});

  const isEditMode = useMemo(() => {
    return !!params.id
  }, [params.id])

  const onSuccess = () => {
    history.push('/inventory/product-templates')
  }

  const onUpdatedSuccess = (data) => {
    setMessage({ success: data.message })
    setOriginalProductInfo(data.data)
    setIsDisableSubmit(true)
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
    setIsDisableSubmit(true)
    setMessage({ failed: data })
  }

  useEffect(() => {
    if (params.id) {
      dispatch(productActions.getProductDetail({ product_template_id: +params.id }))
    }
  }, [params.id])

  useEffect(() => {
    if (!isEmptyObject(productDetail) && params.id) {
      setItem(productDetail.item)
      setProfile(INVENTORY.PROFILES[productDetail.profile])
      setSelectedProductList(productDetail.product_template_material)
      setOriginalProductInfo({
        item: productDetail.item,
        profile: productDetail.profile,
        product_template_material: productDetail.product_template_material?.map(item => ({
          material_id: +item.material_id,
          quantity: item.quantity,
        })),
      })
    }
  }, [productDetail, params.id])

  useEffect(() => {
    if (!fetched) {
      dispatch(actions.getMaterialList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    if (list && Object.keys(list)?.length > 0) {
      setCurrentPageNumber(list.current_page)
      setTotalDataNumber(list.total || 0)
    }
  }, [list])

  useEffect(() => {
    if (!isEmptyObject(messageError)) {
      const timeoutId = setTimeout(() => setMessageError({}), 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [messageError]);

  useEffect(() => {
    if (!isEmptyObject(message)) {
      const timeoutId = setTimeout(() => setMessage({}), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  useEffect(() => {
    if (!isFiltering) {
      setSubmitting(false)
      setMessageError(null)
      setIsDisableSubmit(false)
    }
  }, [isFiltering, selectedProfileFilter])

  useEffect(() => {
    if (tempoSelectedList?.length === list.data?.length && list.data?.length > 0) {
      setIsSelectedAll(true)
    } else {
      setIsSelectedAll(false)
    }
  }, [tempoSelectedList, list.data])

  useEffect(() => {
    if (tempoSelectProductIds.length === selectedProductList.length && selectedProductList.length > 0) {
      setIsSelectedAllProduct(true)
    } else {
      setIsSelectedAllProduct(false)
    }
  }, [tempoSelectProductIds, selectedProductList])

  useEffect(() => {
    setSubmitting(false)
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isCalled, isShowFilterModal])

  useEffect(() => {
    if (csvData?.length > 0 && submitting) {
      downloadCSVFromCSVString(csvData, currentURL)
      setSubmitting(false)
      dispatch(actions.clearCSVData())
    }
  }, [submitting, csvData, currentURL])

  useEffect(() => {
    if (isEditMode) {
      setHeadlineTitle('Edit Product Template')
    } else {
      setHeadlineTitle('New Product Template')
    }
  }, [isEditMode])

  useEffect(() => {
    if (!isEmptyObject(selectedItemToEdit)) {
      setQuantity(selectedItemToEdit.quantity)
    }
  }, [selectedItemToEdit])

  const handleSelectAllItems = (isChecked) => {
    if (isChecked) {
      const isExistItem = list.data.some(item => selectedProductList.some(product => product.material_id === item.id));
      if (isExistItem) {
        setMessageError({
          select_item: INVENTORY.MESSAGE_ERROR.ITEM_SELECTED_EXISTED
        });
      } else {
        setTempoSelectedList(list.data || [])
      }
    } else {
      setTempoSelectedList([]);
    }
  }

  const handleSelectAllProductList = (isChecked) => {
    if (isChecked) {
      setTempoSelectProductIds(selectedProductList.map(item => item.material_id))
    } else {
      setTempoSelectProductIds([])
    }
  }

  const handleSelectProduct = (isChecked, itemId) => {
    if (isChecked) {
      setTempoSelectProductIds([...tempoSelectProductIds, itemId])
    } else {
      setTempoSelectProductIds(tempoSelectProductIds?.filter(id => id !== itemId) || [])
    }
  }

  const handleSelectItem = (isChecked, item) => {
    if (isChecked) {
      const isItemExisted = !!selectedProductList.find(product => product.material_id === item.id)
      if (isItemExisted) {
        setMessageError({
          select_item: `"${item.item}"` + INVENTORY.MESSAGE_ERROR.SELECT_ITEM
        });
      } else {
        setTempoSelectedList([...tempoSelectedList, item])
      }
    } else {
      setTempoSelectedList(tempoSelectedList?.filter(product => product.material_id !== item.id) || [])
    }
  }

  const handleAddToSelectedList = () => {
    if (tempoSelectedList?.length > 0) {
      const convertedArray = tempoSelectedList.map(item => ({
        ...item,
        quantity: 1,
        material_id: +item.id,
      }));
      setSelectedProductList([...convertedArray, ...selectedProductList]);
      setTempoSelectedList([]);
      setIsCalled(!isCalled)
    } else {
      setMessageError({
        add_item: INVENTORY.MESSAGE_ERROR.ADD_ITEM
      })
    }
  };

  const handleClickRemoveProduct = () => {
    if (tempoSelectProductIds.length > 0) {
      setSelectedProductList(selectedProductList.filter(product =>
        !tempoSelectProductIds.includes(product.material_id)
      ));
      setIsCalled(!isCalled);
      setTempoSelectProductIds([]);
    } else {
      setMessageError({
        remove_item: INVENTORY.MESSAGE_ERROR.REMOVE_ITEM
      });
    }
  };

  const handleClickEditQuantity = (item) => {
    if (item) {
      setSelectedItemToEdit(item)
    }
    setIsShowEditQuantityModal(true)
  }

  const handleClickChangePage = (pageNumber) => {
    setCurrentPageNumber(pageNumber);
    setTempoSelectedList([])
    const params = {
      page: pageNumber || PAGINATION.START_PAGE,
      onError,
    }

    if (selectedProfileFilter?.length > 0) {
      params.profile = selectedProfileFilter;
    }
    if (searchText?.length > 0) {
      params.search = normalizeString(searchText);
    }

    dispatch(actions.getMaterialList(params));
  }

  const handleSearch = () => {
    handleFilterSearchApply(normalizeString(searchText))
    setTempoSelectedList([])
  }

  const handleSelectProfileFilter = (itemId) => {
    if (submitting || !itemId) return;
    if (selectedProfileFilter?.includes(itemId)) {
      setSelectedProfileFilter(selectedProfileFilter?.filter(id => id !== itemId) || [])
    } else {
      setSelectedProfileFilter([...selectedProfileFilter, itemId])
    }
    setIsCalled(!isCalled);
  }

  const handleFilterSearchApply = (searchText) => {
    const params = {
      page: PAGINATION.START_PAGE,
      search: searchText,
    };
    if (selectedProfileFilter?.length > 0) {
      params.profile = selectedProfileFilter;
    };
    dispatch(actions.getMaterialList({ ...params, onError }));
    if (params.profile?.length > 0) {
      setIsFiltering(true)
    }
    setMessageError({});
    setTempoSelectedList([]);
    setIsShowFilterModal(false);
  }

  const handleClickResetFilter = () => {
    setSearchText('')
    setTempoSelectedList([])
    setIsFiltering(false)
    setSelectedProfileFilter([])
    setIsShowFilterModal(false)
    setCurrentPageNumber(PAGINATION.START_PAGE)
    dispatch(actions.getMaterialList({
      page: PAGINATION.START_PAGE,
      onError,
    }));
  }

  const handleClickCancelFilterModal = () => {
    setIsShowFilterModal(false)
    if (!isFiltering) {
      setSelectedProfileFilter([])
    }
  }

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      item: setItem,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsCalled(!isCalled)
    }
  }

  const handleChangeQuantity = (value) => {
    setQuantity(value)
    setIsCalled(!isCalled)
  }

  const handleSaveQuantityChanged = () => {
    if (!isEmptyObject(selectedItemToEdit)) {
      if (+quantity < 1) {
        setMessageError({
          quantity: INVENTORY.MESSAGE_ERROR.CHANGE_QUANTITY
        })
      } else {
        const updatedInfo = { ...selectedItemToEdit, quantity: +quantity }
        setSelectedProductList(selectedProductList.map(product =>
          product.material_id === updatedInfo.material_id ? updatedInfo : product
        ))
        setSelectedItemToEdit({})
        setIsShowEditQuantityModal(false)
        setIsCalled(!isCalled)
      }
    }
  }

  const handleCreate = () => {
    if (!isEmptyObject(messageError) || isDisableSubmit) return;
    const createdInfo = selectedProductList.map(item => ({
      material_id: item.material_id,
      quantity: item.quantity
    })) || [];
    const data = {
      item,
      profile: profile?.value,
      create: createdInfo,
    }
    const errors = validateCreateProductTemplate(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(productActions.createProductTemplate({ ...data, onSuccess, onError }))
      setMessageError({})
      setIsDisableSubmit(true)
    }
  }
  const handleSaveChanged = () => {
    if (isDisableSubmit) return;
    const removeIds = productDetail.product_template_material
      .filter(item => !selectedProductList.find(selectedItem => selectedItem.material_id === item.material_id))
      .map(item => item.material_id);

    const newItems = selectedProductList
      .filter(selectedItem => !productDetail.product_template_material.find(item => item.material_id === selectedItem.material_id));

    const updatedItems = selectedProductList
      .filter(selectedItem => {
        const matchingItem = productDetail.product_template_material.find(item => item.material_id === selectedItem.material_id);
        return matchingItem && matchingItem.quantity !== selectedItem.quantity;
      });

    const data = {
      item,
      id: +params.id,
      profile: profile.value,
      product_template_id: +params.id,
      product_template_material: selectedProductList,
      delete: removeIds,
      create: newItems.map(item => ({
        material_id: +item.material_id,
        quantity: item.quantity,
      })),
      update: updatedItems.map(item => ({
        material_id: +item.material_id,
        quantity: item.quantity,
      })),
    };

    const validObject = {
      item,
      profile: data.profile,
      product_template_material: selectedProductList.map(item => ({
        material_id: +item.material_id,
        quantity: item.quantity,
      })),
    };

    if (!isSimilarObject(originalProductInfo, validObject)) {
      const errors = validateUpdateProductTemplate(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(productActions.updateProductDetail({ ...data, onUpdatedSuccess, onError }));
        setMessageError({});
        setIsDisableSubmit(true);
      }
    } else {
      setMessage({
        failed: INVENTORY.MESSAGE_ERROR.NO_CHANGED
      })
    }
  };

  const renderProductList = () => {
    return selectedProductList.map((data, index) => {
      const isChecked = tempoSelectProductIds?.includes(data.material_id)
      const profileName = INVENTORY.PROFILES[data.profile]?.label
      return (
        <tr key={index} className={isChecked ? 'templateGroupTable__selected' : ''}>
          <td className="templateGroupTable__td templateGroupTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectProduct(e.target.checked, data.material_id)}
            />
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox">
              {data.category || ''}
            </div>
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox">
              {profileName || ''}
            </div>
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox">
              {data.item || ''}
            </div>
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox">
              {data.code || ''}
            </div>
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox">
              {data.quantity || '1'}
            </div>
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--buttons">
              <div
                className="tableButtons__icon tableButtons__icon--edit"
                onClick={() => handleClickEditQuantity(data)}
              >
                <img
                  src="/icons/edit.svg"
                  alt="edit"
                />
              </div>
            </div>
          </td>
        </tr>
      )
    })
  }

  const renderTableList = () => {
    return list.data?.map((data, index) => {
      const isChecked = !!tempoSelectedList.find(item => item.id === data.id)
      const profileName = INVENTORY.PROFILES[data.profile]?.label
      return (
        <tr key={index} className={isChecked ? 'templateGroupTable__selected' : ''}>
          <td className="templateGroupTable__td templateGroupTable__td--checkbox">
            <Checkbox
              isChecked={isChecked}
              onChange={(e) => handleSelectItem(e.target.checked, data)}
            />
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox templateGroupTable__td--category">
              {data.category || ''}
            </div>
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox">
              {profileName || ''}
            </div>
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox">
              {data.item || ''}
            </div>
          </td>
          <td className="templateGroupTable__td">
            <div className="templateGroupTable__td--textBox">
              {data.code || ''}
            </div>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="templateForm">
      {!isEmptyObject(message) &&
        <div className="templateForm__successMessage">
          <ActionMessageForm
            successMessage={message.success}
            failedMessage={message.failed}
          />
        </div>
      }
      <div className="templateForm__headlineBar">
        <HeadlineBar
          buttonName={isEditMode ? 'Save' : 'Create'}
          onClick={isEditMode ? handleSaveChanged : handleCreate}
          headlineTitle={headlineTitle}
          isDisableSubmit={isDisableSubmit}
        />
      </div>
      <div className="templateForm__content">
        <div className="templateGroup">
          <div className={`inventoryCell${messageError?.profile ? ' inventoryCell--error' : ''}`}>
            <div className="inventoryCell__item inventoryCell__item--itemPlate">
              <InputBoxForm
                value={item}
                keyValue="item"
                labelName="Item"
                inputType="text"
                placeholderTitle="Item"
                messageError={messageError}
                handleInputChange={handleInputChange}
              />
            </div>
            <div className="inventoryCell__item inventoryCell__item--profilePlate">
              <div className="inventoryCell__item--select">
                <div className="inventoryCell__item--label">
                  Profile
                </div>
                <InventorySelectForm
                  placeholder="Profile"
                  isDetail={isEditMode}
                  selectedItem={profile}
                  keyValue="profile"
                  data={INVENTORY.PROFILES}
                  setSelectedItem={setProfile}
                  messageError={messageError}
                  setMessageError={setMessageError}
                  isInputChanged={isCalled}
                  setIsInputChanged={setIsCalled}
                />
              </div>
              {messageError?.profile && (
                <div className="inventoryCell__item--messageSelect">{messageError?.profile}</div>
              )}
            </div>
          </div>
        </div>
        <div className="templateGroup templateGroup--selected">
          {messageError?.create && (
            <div className="templateGroup__errorMessage">{messageError?.create}</div>
          )}
          {messageError?.remove_item && (
            <div className="templateGroup__errorMessage templateGroup__errorMessage--right">{messageError?.remove_item}</div>
          )}
          {messageError?.failed && (
            <div className="templateGroup__errorMessage templateGroup__errorMessage--right">{messageError?.failed}</div>
          )}
          <div className="templateGroup__bar">
            <div className="templateGroup__bar--title">
              Selected Items
            </div>
            <div className="templateGroup__bar--button" onClick={handleClickRemoveProduct}>
              <img src="/icons/x-icon.svg" alt="x icon" />
              <span>Remove</span>
            </div>
          </div>
          <div className="templateGroup__table templateGroup__table--selectedList">
            <table className="templateGroupTable">
              <thead>
                <tr>
                  <th className="templateGroupTable__th templateGroupTable__th--checkBox">
                    <Checkbox
                      isChecked={isSelectedAllProduct}
                      onChange={(e) => handleSelectAllProductList(e.target.checked)}
                    />
                  </th>
                  <th className="templateGroupTable__th templateGroupTable__th--category">CATEGORY</th>
                  <th className="templateGroupTable__th templateGroupTable__th--profile">PROFILE</th>
                  <th className="templateGroupTable__th templateGroupTable__th--item">ITEM</th>
                  <th className="templateGroupTable__th templateGroupTable__th--code">CODE</th>
                  <th className="templateGroupTable__th templateGroupTable__th--quantity">QUANTITY</th>
                  <th className="templateGroupTable__th">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {renderProductList()}
              </tbody>
            </table>
          </div>
        </div>
        <div className="templateGroup">
          {messageError?.select_item && (
            <div className="templateGroup__errorMessage">{messageError?.select_item}</div>
          )}
          {messageError?.add_item && (
            <div className="templateGroup__errorMessage templateGroup__errorMessage--right">{messageError?.add_item}</div>
          )}
          <div className="templateGroup__tableAction">
            <TableActionTemplate
              searchText={searchText}
              isFiltering={isFiltering}
              handleSearch={handleSearch}
              setSearchText={setSearchText}
              isShowFilterModal={isShowFilterModal}
              setIsShowFilterModal={setIsShowFilterModal}
              handleAddToSelectedList={handleAddToSelectedList}
            />
          </div>
          <div className="templateGroup__table">
            <table className="templateGroupTable">
              <thead>
                <tr>
                  <th className="templateGroupTable__th templateGroupTable__th--checkBox">
                    <Checkbox
                      isChecked={isSelectedAll}
                      onChange={(e) => handleSelectAllItems(e.target.checked)}
                    />
                  </th>
                  <th className="templateGroupTable__th templateGroupTable__th--categoryCol">CATEGORY</th>
                  <th className="templateGroupTable__th templateGroupTable__th--profileCol">PROFILE</th>
                  <th className="templateGroupTable__th templateGroupTable__th--itemCol">ITEM</th>
                  <th className="templateGroupTable__th templateGroupTable__th--codeCol">CODE</th>
                </tr>
              </thead>
              <tbody>
                {renderTableList()}
              </tbody>
            </table>
          </div>
          {totalDataNumber > 10 &&
            <div className="templateGroup__paginate">
              <Pagination
                totalNumber={totalDataNumber || 0}
                currentPageNumber={currentPageNumber}
                onClickPageChange={handleClickChangePage}
                numberPerPage={PAGINATION.NUM_PER_PAGE.LONG}
              />
            </div>
          }
        </div>
      </div>
      {isShowFilterModal && (
        <FilterModal
          isDocumentFilter={true}
          filterTitle="SORT CATEGORY BY"
          submitting={submitting}
          searchText={searchText || ''}
          messageError={messageError || ''}
          filterRequest={FILTER.INVENTORY || []}
          isDisableSubmit={isDisableSubmit}
          selectedProfileFilter={selectedProfileFilter}
          onClickApply={handleFilterSearchApply}
          onClickCancel={handleClickCancelFilterModal}
          handleClickResetFilter={handleClickResetFilter}
          handleSelectProfileFilter={handleSelectProfileFilter}
        />
      )}
      {isShowEditQuantityModal && (
        <EditQuantityModal
          quantity={quantity}
          submitting={submitting}
          data={selectedItemToEdit}
          messageError={messageError}
          isDisableSubmit={isDisableSubmit}
          onClickApply={handleSaveQuantityChanged}
          handleChangeQuantity={handleChangeQuantity}
          closeModal={() => setIsShowEditQuantityModal(false)}
        />
      )}
    </div>
  )
}

export default TemplateForm
