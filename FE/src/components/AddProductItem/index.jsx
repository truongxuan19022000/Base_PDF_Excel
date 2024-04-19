import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import SelectSearchForm from 'src/components/SelectSearchForm'
import SquareMetersUnitModal from './SquareMetersUnitModal'
import InventorySelectForm from '../InventorySelectForm'
import RecommendedScrap from './RecommendedScrap'
import PiecesUnitModal from './PiecesUnitModal'
import MetersUnitModal from './MetersUnitModal'
import PanelUnitModal from './PanelUnitModal'
import AddAluminium from './AddAluminium'
import Loading from '../Loading'

import { useScrapSlice } from 'src/slices/scrap'
import { useMaterialSlice } from 'src/slices/material'
import { INVENTORY, QUOTATION } from 'src/constants/config'
import { validateSelectItem } from 'src/helper/validation'
import { isEmptyObject, normalizeString } from 'src/helper/helper'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'

const AddProductItem = ({
  id,
  setIsShowModal,
}) => {
  const { actions } = useScrapSlice()
  const { actions: materialActions } = useMaterialSlice()
  const { actions: quotationSectionActions } = useQuotationSectionSlice()

  const dispatch = useDispatch()

  const scrapList = useSelector(state => state.scrap.scrapList)
  const isLoadingItem = useSelector(state => state.material.isLoading)
  const selectedItemInfo = useSelector(state => state.material.detail.materials)
  const selectedProduct = useSelector(state => state.quotationSection.selectedProduct)
  const productData = useSelector(state => state.product.allProduct) || [];
  const materialData = useSelector(state => state.material.allMaterial) || [];

  const [searchText, setSearchText] = useState('')
  const [messageError, setMessageError] = useState({})
  const [selectedItem, setSelectedItem] = useState({})
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [selectedItemTitle, setSelectedItemTitle] = useState('')
  const [isShowAddItemsForm, setIsShowAddItemsForm] = useState(false)
  const [serviceType, setServiceType] = useState(INVENTORY.SERVICE[1])
  const itemCategory = [...INVENTORY.SERVICE].slice(0, -1)

  const [isCreateWithScrapItem, setIsCreateWithScrapItem] = useState(false)
  const [isOpenAddAluminiumModal, setIsOpenAddAluminiumModal] = useState(false)

  const originalSearchResults = useMemo(() => {
    const searchData = (serviceType === QUOTATION.MATERIAL_VALUE.PRODUCT ? productData : materialData) || []
    if (serviceType === QUOTATION.MATERIAL_VALUE.GLASS) {
      return searchData.filter(item => item.category === INVENTORY.GLASS);
    }
    if (!isEmptyObject(serviceType) && (serviceType.value !== QUOTATION.SERVICE_TYPE.OTHER)) {
      return searchData.filter(item => item.category === serviceType.label);
    }
    return []
  }, [productData, materialData, serviceType])

  const selectedItemSide = useMemo(() => {
    let sideArray = []
    if (selectedItem.outer_side === INVENTORY.CHECKED) {
      sideArray = ['Outer']
    }
    if (selectedItem.inner_side === INVENTORY.CHECKED) {
      sideArray = [...sideArray, 'Inner']
    }
    return sideArray.join('-')
  }, [selectedItem])

  useEffect(() => {
    setSearchResults(originalSearchResults);
  }, [originalSearchResults]);

  useEffect(() => {
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isInputChanged]);

  useEffect(() => {
    if (!searchText) {
      setSearchResults(originalSearchResults)
    }
  }, [searchText, originalSearchResults])

  useEffect(() => {
    if (id && !isEmptyObject(selectedItem) && !isEmptyObject(selectedProduct)) {
      dispatch(actions.getScrapList({
        quotation_id: +id,
        product_id: selectedProduct?.productId,
        material_id: +selectedItem?.id,
      }))
      dispatch(materialActions.getMaterialDetail(+selectedItem?.id))
      setMessageError({})
    }
  }, [id, selectedItem, selectedProduct])

  const handleSearch = (text) => {
    if (text && text.trim().length > 0 && searchResults?.length > 0) {
      const results = searchResults.filter(item =>
        normalizeString(item.item).trim().includes(text)
      );
      setSearchResults(results);
      setIsSearching(false)
    } else {
      setSearchResults(searchResults)
    }
  };

  const handleTypeSearchChange = (e) => {
    if (isDisableSubmit) return;
    const text = e.target.value;
    setSearchText(text)
    setIsInputChanged(!isInputChanged)
    setIsSearching(true)
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const newTypingTimeout = setTimeout(() => {
      if (text.trim() === '') {
        setIsSearching(false)
      } else {
        handleSearch(normalizeString(text));
      }
    }, 500);
    setTypingTimeout(newTypingTimeout);
  }

  const handleSelectCategory = (item) => {
    setServiceType(item)
    setSelectedItem({})
    setSearchText('')
  }
  const handleOpenSelectedAddItemModal = () => {
    if (!isEmptyObject(selectedItemInfo)) {
      const isValid = (id && !isLoadingItem && !isEmptyObject(selectedProduct) && !isEmptyObject(selectedItemInfo));
      if (isValid) {
        const { productId, ...restOfSelectedProduct } = selectedProduct;
        const data = {
          ...restOfSelectedProduct,
          quotationId: +id,
          selectedItem: selectedItemInfo,
        }
        const errors = validateSelectItem(data)
        if (Object.keys(errors).length > 0) {
          setMessageError(errors)
        } else {
          dispatch(quotationSectionActions.handleSetSelectedProductItem(data))
          setIsShowAddItemsForm(true)
          setMessageError({})
        }
      }
    } else {
      setMessageError({
        material_id: QUOTATION.MESSAGE_ERROR.NO_ITEM,
      })
    }
  }

  const handleClickCancel = () => {
    setIsShowModal(false)
    setIsShowAddItemsForm(false)
  }

  const selectedAddItemModal = () => {
    if (serviceType.value === QUOTATION.MATERIAL_VALUE.ALUMINIUM) {
      const hasScrapList = scrapList.length > 0 && scrapList.some(scrap =>
        scrap.status === INVENTORY.MATERIAL_UN_USED && scrap.scrap_length > INVENTORY.MIN_MATERIAL_LENGTH);
      if (hasScrapList && !isOpenAddAluminiumModal) {
        return <RecommendedScrap
          scrapList={scrapList}
          handleCancel={handleClickCancel}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
          setIsOpenAddAluminiumModal={setIsOpenAddAluminiumModal}
          setIsCreateWithScrapItem={setIsCreateWithScrapItem}
        />
      }
      if (isOpenAddAluminiumModal) {
        return <AddAluminium
          scrapList={scrapList}
          handleCancel={handleClickCancel}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
          isCreateWithScrapItem={isCreateWithScrapItem}
          setIsOpenAddAluminiumModal={setIsOpenAddAluminiumModal}
        />
      }
      return <AddAluminium
        scrapList={scrapList}
        handleCancel={handleClickCancel}
        setIsShowAddItemsForm={setIsShowAddItemsForm}
        isCreateWithScrapItem={isCreateWithScrapItem}
        setIsOpenAddAluminiumModal={setIsOpenAddAluminiumModal}
      />
    }
    switch (selectedItem.price_unit) {
      case INVENTORY.QUANTITY_UNIT[1].value: {
        return <PiecesUnitModal
          serviceType={serviceType}
          selectedItem={selectedItem}
          setIsShowModal={setIsShowModal}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
        />
      }
      case INVENTORY.QUANTITY_UNIT[2].value: {
        return <SquareMetersUnitModal
          serviceType={serviceType}
          selectedItem={selectedItem}
          setIsShowModal={setIsShowModal}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
        />
      }
      case INVENTORY.QUANTITY_UNIT[3].value: {
        return <MetersUnitModal
          serviceType={serviceType}
          selectedItem={selectedItem}
          setIsShowModal={setIsShowModal}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
        />
      }
      case INVENTORY.QUANTITY_UNIT[4].value: {
        return <PanelUnitModal
          serviceType={serviceType}
          selectedItem={selectedItem}
          setIsShowModal={setIsShowModal}
          setIsShowAddItemsForm={setIsShowAddItemsForm}
        />
      }
      default: {
        return null
      }
    }
  }

  return (
    <div className="addItemWindow">
      {isShowAddItemsForm && !isLoadingItem ?
        selectedAddItemModal() :
        <div className="createItemForm">
          <div className="createItemForm__inner">
            <p className="createItemForm__headerText">
              Add Items
            </p>
            <div className="createItemForm__formGroup">
              <label className="createItemForm__label">
                ITEM CATEGORY
              </label>
              <InventorySelectForm
                placeholder="Select Service Type"
                selectedItem={serviceType}
                keyValue="service_type"
                data={itemCategory}
                setSelectedItem={handleSelectCategory}
                messageError={messageError}
                setMessageError={setMessageError}
                isInputChanged={isInputChanged}
                setIsInputChanged={setIsInputChanged}
              />
            </div>
            <div className="createItemForm__formGroup">
              <label className="createItemForm__label">
                ITEM
              </label>
              <SelectSearchForm
                displayProperty="item"
                validSelectProperty="id"
                placeHolderLabel="Select Item"
                searchText={searchText}
                isSearching={isSearching}
                searchResults={searchResults}
                selectedItem={selectedItem}
                isInputChanged={isInputChanged}
                selectedItemTitle={selectedItemTitle}
                messageError={messageError?.material_id}
                setSearchText={setSearchText}
                setSelectedItem={setSelectedItem}
                setIsInputChanged={setIsInputChanged}
                setIsDisableSubmit={setIsDisableSubmit}
                setSelectedItemTitle={setSelectedItemTitle}
                handleTypeSearchChange={handleTypeSearchChange}
              />
              {messageError?.material_id &&
                <div className="createItemForm__message">{messageError.material_id}</div>
              }
            </div>
            <div className="createItemForm__formGroup">
              <label className="createItemForm__label">
                ITEM CODE
              </label>
              <div className="createItemForm__input createItemForm__input--inActive">
                <input type="text" value={selectedItem.item || ''} readOnly />
              </div>
            </div>
            <div className="createItemForm__formGroup">
              <label className="createItemForm__label">
                SIDE
              </label>
              <div className="createItemForm__input createItemForm__input--inActive">
                <input value={selectedItemSide} type="text" readOnly />
              </div>
            </div>
            {messageError?.message &&
              <div className="createItemForm__message">{messageError.message}</div>
            }
            <div className="createItemForm__buttonWrapper">
              <button
                className="createItemForm__button"
                onClick={() => setIsShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="createItemForm__button createItemForm__button--brown"
                onClick={handleOpenSelectedAddItemModal}
                disabled={isLoadingItem}
              >
                {isLoadingItem ? <Loading /> : 'Next'}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default AddProductItem
