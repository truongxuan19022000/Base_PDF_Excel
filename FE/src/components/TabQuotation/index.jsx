import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { alertActions } from 'src/slices/alert'
import { ALERT, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config'
import { isEmptyObject, isSimilarObject } from 'src/helper/helper'
import { validateCreateQuotationSection, validatePermission } from 'src/helper/validation'
import { quotationSectionActions, useQuotationSectionSlice } from 'src/slices/quotationSection'
import { QuotationSectionDraggableItem } from '../QuotationSectionDraggableItem'

import AddProductItem from '../AddProductItem'
import AddSectionModal from '../AddSectionModal'
import QuotationBottom from '../QuotationBottom'
import CreateProductModal from '../CreateProductModal'
import ConfirmDeleteModal from '../ConfirmDeleteModal'
import CreateProductItemModal from '../CreateProductItemModal'
import EditProductItem from '../AddProductItem/EditProductItem'

const TabQuotation = ({
  id,
  sections = [],
  productData = [],
  materialData = [],
  isEditable = false,
}) => {
  const { actions } = useQuotationSectionSlice()

  const dispatch = useDispatch()

  const selectedDeletedInfo = useSelector(state => state.quotationSection.selectedDeletedInfo)
  const selectedEditProduct = useSelector(state => state.quotationSection.selectedProduct)
  const selectedEditSection = useSelector(state => state.quotationSection.selectedSection)
  const selectedEditProductItem = useSelector(state => state.quotationSection.selectedProductItem)
  const permissionData = useSelector(state => state.user.permissionData)
  const { fetched } = useSelector(state => state.quotationSection)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [sectionList, setSectionList] = useState([])
  const [isShowAddSectionModal, setIsShowAddSectionModal] = useState(false)
  const [isShowCreateProductModal, setIsShowCreateProductModal] = useState(false)
  const [isShowCreateProductItemModal, setIsShowCreateProductItemModal] = useState(false)

  const [sectionName, setSectionName] = useState('')
  const [messageError, setMessageError] = useState({})
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)

  const [materialType, setMaterialType] = useState(null);
  const [materialWidth, setMaterialWidth] = useState(0);
  const [materialHeight, setMaterialHeight] = useState(0);
  const [showSectionIds, setShowSectionIds] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [originalSectionOrders, setOriginalSectionOrders] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [isShowAddProductModal, setIsShowAddProductModal] = useState(false)
  const [isShowEditProductModal, setIsShowEditProductModal] = useState(false)

  const onSuccess = () => {
    setMessageError({})
    setIsDisableSubmit(false)
  }

  const onCreateSuccess = (newId) => {
    setMessageError({})
    setIsDisableSubmit(false)
    setShowSectionIds([...showSectionIds, newId])
  }

  const onError = () => {
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (id && !fetched) {
      dispatch(quotationSectionActions.getQuotationSectionList({ quotation_id: +id }))
    }
  }, [id, fetched])

  useEffect(() => {
    if (sections) {
      setSectionList(sections);
      const originalList = [...sections].map((section, index) => ({
        id: section.id,
        section_name: section.section_name,
        order_number: index + 1
      }));
      setOriginalSectionOrders(originalList);
      setShowSectionIds([...sections].map(s => s.id))
    }
  }, [sections]);

  useEffect(() => {
    if (materialType === QUOTATION.MATERIAL_VALUE.PRODUCT) {
      setSearchData(productData)
    } else {
      setSearchData(materialData)
    }
  }, [productData, materialData, materialType])

  useEffect(() => {
    setIsDisableSubmit(false)
    setMessageError({})
  }, [isInputChanged, isShowAddSectionModal])

  useEffect(() => {
    setIsShowConfirmDeleteModal(!isEmptyObject(selectedDeletedInfo))
  }, [selectedDeletedInfo])

  useEffect(() => {
    if (!isShowCreateProductModal && !isShowCreateProductItemModal) {
      setSelectedSectionId(null)
    }
  }, [isShowCreateProductModal, isShowCreateProductItemModal])

  useEffect(() => {
    if (!isShowCreateProductItemModal) {
      setSelectedProductId(null)
    }
  }, [isShowCreateProductItemModal])

  useEffect(() => {
    if (!isEmptyObject(selectedEditProductItem)) {
      setMaterialType(selectedEditProductItem.type)
    }
  }, [selectedEditProductItem])

  useEffect(() => {
    if (!isEmptyObject(selectedEditSection)) {
      setSectionName(selectedEditSection.section_name)
    }
  }, [selectedEditSection])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowAddSectionModal(false);
        setIsShowConfirmDeleteModal(false);
        setIsShowCreateProductModal(false);
        setIsShowCreateProductItemModal(false);
        setIsShowEditProductModal(false)
        setIsShowAddProductModal(false)
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const moveSection = (fromIndex, toIndex) => {
    const updatedSectionData = [...sectionList];
    const [removedSection] = updatedSectionData.splice(fromIndex, 1);
    updatedSectionData.splice(toIndex, 0, removedSection);
    setSectionList(updatedSectionData);
  };

  const handleDragAndDropSection = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      const updatedSectionListOrder = [...sectionList].map((section, index) => ({
        id: section.id,
        section_name: section.section_name,
        order_number: index + 1
      }));
      if (id && !isSimilarObject(originalSectionOrders, updatedSectionListOrder)) {
        dispatch(actions.handleDragAndDropSection({
          quotation_id: +id,
          update: updatedSectionListOrder,
          create: [],
          delete: [],
          sections: sectionList,
          onSuccess,
          onError,
        }));
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleInputChange = (field, value) => {
    if (!isEditable) return;
    const fieldSetters = {
      section_name: setSectionName,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleAddNewSection = () => {
    if (isEditAllowed) {
      if ((isDisableSubmit && !id) || !isEditable) return;
      const data = {
        quotation_id: +id,
        section_name: sectionName,
        order_number: sectionList.length + 1,
      }
      const errors = validateCreateQuotationSection(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(actions.createQuotationSection({ ...data, onCreateSuccess, onError }));
        setSectionName('')
        setIsDisableSubmit(true);
        setIsShowAddSectionModal(false);
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleEditSection = () => {
    if (isEditAllowed) {
      if (!isEditable || (isDisableSubmit && !id && isEmptyObject(selectedEditSection))) return;
      const data = {
        quotation_section_id: selectedEditSection?.id,
        quotation_id: +id,
        section_name: sectionName,
        order_number: +selectedEditSection.order_number,
      }
      const errors = validateCreateQuotationSection(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(actions.editQuotationSection({ ...data, onSuccess, onError }));
        setIsDisableSubmit(true);
        setIsShowAddSectionModal(false);
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleClickApply = (isEditMode) => {
    if (!isEditable) return;
    isEditMode ? handleEditSection() : handleAddNewSection()
  }

  const handleCloseSectionModal = () => {
    if (!isEditable) return;
    setIsShowAddSectionModal(false)
    dispatch(actions.clearSelectedSection())
  }

  const handleClickDelete = (deleteType) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      switch (deleteType) {
        case QUOTATION.LABEL.SECTION:
          handleDeleteQuotationSection()
          break;
        case QUOTATION.LABEL.PRODUCT:
          handleDeleteSectionProduct()
          break;
        case QUOTATION.LABEL.PRODUCT_ITEM:
          handleDeleteProductItem()
          break;
        case QUOTATION.LABEL.ITEM:
          handleDeleteItemMaterial()
          break;
        default:
          break;
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDeleteQuotationSection = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (!isEmptyObject(selectedDeletedInfo) && id) {
        dispatch(actions.deleteQuotationSection({
          data: { ...selectedDeletedInfo, quotation_id: +id }, onSuccess, onError
        }));
        dispatch(actions.clearSelectedDeleteInfo())
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDeleteSectionProduct = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (!isEmptyObject(selectedDeletedInfo) && id) {
        dispatch(actions.deleteSectionProduct({
          data: { ...selectedDeletedInfo, quotation_id: +id }, onSuccess, onError
        }));
        dispatch(actions.clearSelectedDeleteInfo())
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDeleteProductItem = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (!isEmptyObject(selectedDeletedInfo) && id) {
        dispatch(actions.deleteProductItem({
          data: { ...selectedDeletedInfo, quotation_id: +id }, onSuccess, onError
        }));
        dispatch(actions.clearSelectedDeleteInfo())
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDeleteItemMaterial = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (!isEmptyObject(selectedDeletedInfo) && id) {
        const { type, ...restOfInfo } = selectedDeletedInfo;
        dispatch(actions.deleteItemMaterial({
          ...restOfInfo, quotation_id: +id, onSuccess, onError,
        }));
        dispatch(actions.clearSelectedDeleteInfo())
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleShowCreateNewProductModal = (sectionId) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      setSelectedSectionId(sectionId)
      setIsShowCreateProductModal(true)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleCloseProductModal = () => {
    if (!isEditable) return;
    setIsShowCreateProductModal(false)
    dispatch(quotationSectionActions.clearSelectedProduct())
  }

  const handleShowCreateNewProductMaterialModal = (productId, type, sectionId, materialHeight, materialWidth) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      setMaterialType(type)
      setSelectedProductId(productId)
      setSelectedSectionId(sectionId)
      setMaterialHeight(materialHeight)
      setMaterialWidth(materialWidth)
      setIsShowCreateProductItemModal(true)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleShowAddSectionModal = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      setIsShowAddSectionModal(true)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const nextProductNumber = useMemo(() => {
    const selectedSection = sectionList.find(s => s.id === selectedSectionId);
    const productLength = selectedSection?.products?.length || 0;
    return productLength + 1;
  }, [sectionList, selectedSectionId]);

  return (
    <div className="tabQuotation">
      <div className="tabQuotation__innerBox">
        <div className="tabQuotation__sections">
          <div className="tabQuotation__sections--dropArea">
            <div className="quotationSectionDragContainer">
              {sectionList.map((section, index) => (
                <QuotationSectionDraggableItem
                  index={index}
                  key={section.id}
                  sectionInfo={section}
                  showSectionIds={showSectionIds}
                  isEditable={isEditable}
                  moveSection={moveSection}
                  setShowSectionIds={setShowSectionIds}
                  handleDragAndDropSection={handleDragAndDropSection}
                  setIsShowAddSectionModal={setIsShowAddSectionModal}
                  setIsShowAddProductModal={setIsShowAddProductModal}
                  setIsShowEditProductModal={setIsShowEditProductModal}
                  showCreateProductModal={handleShowCreateNewProductModal}
                  setIsShowCreateProductModal={setIsShowCreateProductModal}
                  setIsShowCreateProductItemModal={setIsShowCreateProductItemModal}
                  showCreateProductItemModal={handleShowCreateNewProductMaterialModal}
                />
              ))}
            </div>
          </div>
          <div className="tabQuotation__action">
            <div
              className="tabQuotation__button"
              onClick={handleShowAddSectionModal}
            >
              + Add Section
            </div>
          </div>
        </div>
        <div className="tabQuotation__footerBar">
          <QuotationBottom
            isEditable={isEditable}
          />
        </div>
      </div>
      {isShowCreateProductModal &&
        <CreateProductModal
          id={id}
          selectedSectionId={selectedSectionId}
          nextOrderNumber={sectionList.length + 1}
          selectedEditProduct={selectedEditProduct}
          closeModal={handleCloseProductModal}
        />
      }
      {isShowCreateProductItemModal &&
        <CreateProductItemModal
          id={id}
          searchData={searchData}
          materialType={materialType}
          sectionId={selectedSectionId}
          materialWidth={materialWidth}
          materialHeight={materialHeight}
          nextOrderNumber={nextProductNumber}
          selectedProductId={selectedProductId}
          selectedEditProductItem={selectedEditProductItem}
          closeModal={() => setIsShowCreateProductItemModal(false)}
        />
      }
      {isShowAddSectionModal &&
        <AddSectionModal
          sectionName={sectionName}
          isDisableSubmit={isDisableSubmit}
          selectedEditSection={selectedEditSection}
          messageError={messageError?.section_name}
          onClickApply={handleClickApply}
          handleInputChange={handleInputChange}
          onClickCancel={handleCloseSectionModal}
        />
      }
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          isShow={isShowConfirmDeleteModal}
          deleteTitle={selectedDeletedInfo?.type}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={() => handleClickDelete(selectedDeletedInfo?.type)}
        />
      )}
      {isShowAddProductModal &&
        <AddProductItem
          id={id}
          setIsShowModal={setIsShowAddProductModal}
        />
      }
      {isShowEditProductModal &&
        <EditProductItem
          id={id}
          setIsShowModal={setIsShowEditProductModal}
        />
      }
    </div>
  )
}

export default TabQuotation
