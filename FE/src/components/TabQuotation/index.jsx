import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

import { isSimilarObject } from 'src/helper/helper'
import { MESSAGE, QUOTATION } from 'src/constants/config'
import { validateCreateQuotationSection } from 'src/helper/validation'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'
import { QuotationSectionDraggableItem } from '../QuotationSectionDraggableItem'

import AddSectionModal from '../AddSectionModal'
import CreateProductModal from '../CreateProductModal'
import ConfirmDeleteModal from '../ConfirmDeleteModal'
import CreateProductItemModal from '../CreateProductItemModal'
import QuotationBottom from '../QuotationBottom'

const bottomBarDataTemp = {
  quotation: 17288.30,
  otherFees: 17288.30,
  total: 17288.30,
  estimatedCost: 17288.30,
  discount: 0,
  discountAmount: null,
  discountType: null,
  gst: 0,
}

const TabQuotation = ({
  id,
  sections = [],
  productData = [],
  materialData = [],
  setMessage,
}) => {
  const { actions } = useQuotationSectionSlice()

  const dispatch = useDispatch()

  const [sectionList, setSectionList] = useState([])
  const [isShowAddSectionModal, setIsShowAddSectionModal] = useState(false)
  const [isShowCreateProductModal, setIsShowCreateProductModal] = useState(false)
  const [isShowCreateProductItemModal, setIsShowCreateProductItemModal] = useState(false)

  const [discount, setDiscount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [sectionName, setSectionName] = useState('')
  const [messageError, setMessageError] = useState({})
  const [subTotalAmount, setSubTotalAmount] = useState(17288)
  const [grandTotalAmount, setGrandTotalAmount] = useState(0)
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowEditDiscount, setIsShowEditDiscount] = useState(false)
  const [selectedDeleteSectionId, setSelectedDeleteSectionId] = useState(null)
  const [isShowConfirmDeleteModal, setIsShowConfirmDeleteModal] = useState(false)

  const [materialType, setMaterialType] = useState(null);
  const [materialWidth, setMaterialWidth] = useState(0);
  const [materialHeight, setMaterialHeight] = useState(0);
  const [showSectionIds, setShowSectionIds] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [originalSectionOrders, setOriginalSectionOrders] = useState([]);
  const [bottomBarData, setBottomBarData] = useState(bottomBarDataTemp);
  const [searchData, setSearchData] = useState([])

  const onSuccess = () => {
    setMessageError({})
    setIsDisableSubmit(true)
    setMessage({ success: MESSAGE.SUCCESS.ACTION })
  }

  const onError = () => {
    setMessage({ failed: MESSAGE.ERROR.DEFAULT })
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (sections?.length > 0) {
      setSectionList(sections)
      const originalList = [...sections].map((section, index) => ({
        id: section.id,
        section_name: section.section_name,
        order_number: index + 1
      }));
      setOriginalSectionOrders(originalList)
    }
  }, [sections])

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
    setIsShowConfirmDeleteModal(selectedDeleteSectionId)
  }, [selectedDeleteSectionId])

  useEffect(() => {
    if (!isShowConfirmDeleteModal) {
      setSelectedDeleteSectionId(null)
    }
  }, [isShowConfirmDeleteModal])

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
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowAddSectionModal(false);
        setIsShowConfirmDeleteModal(false);
        setIsShowCreateProductModal(false);
        setIsShowCreateProductItemModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (subTotalAmount !== 0) {
      setTaxAmount(subTotalAmount * QUOTATION.TAX_GST_PERCENTAGE)
    }
  }, [subTotalAmount]);

  useEffect(() => {
    if (discount > subTotalAmount) {
      setDiscount(subTotalAmount);
    }
    const totalAmount = subTotalAmount - discount + taxAmount
    setGrandTotalAmount(totalAmount);
  }, [discount, taxAmount, subTotalAmount]);

  const moveSection = (fromIndex, toIndex) => {
    const updatedSectionData = [...sectionList];
    const [removedSection] = updatedSectionData.splice(fromIndex, 1);
    updatedSectionData.splice(toIndex, 0, removedSection);
    setSectionList(updatedSectionData);
  };

  const handleDragAndDropSection = () => {
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
        onSuccess,
        onError,
      }));
    }
  }

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      discount: setDiscount,
      section_name: setSectionName,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleAddNewSection = () => {
    if (isDisableSubmit && !id) return;
    const data = {
      quotation_id: +id,
      section_name: sectionName,
      order_number: sectionList.length + 1,
    }
    const errors = validateCreateQuotationSection(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.createQuotationSection({ ...data, onSuccess, onError }));
      setSectionName('')
      setIsDisableSubmit(true);
      setIsShowAddSectionModal(false);
    }
  }

  const handleDeleteQuotationSection = () => {
    if (selectedDeleteSectionId && id) {
      dispatch(actions.deleteQuotationSection({
        quotation_id: +id,
        create: [],
        update: [],
        delete: [+selectedDeleteSectionId],
        onSuccess, onError
      }));
      setIsShowConfirmDeleteModal(false)
    }
  }

  const handleShowCreateNewProductModal = (sectionId) => {
    setSelectedSectionId(sectionId)
    setIsShowCreateProductModal(true)
  }

  const handleShowCreateNewProductMaterialModal = (productId, type, sectionId, materialHeight, materialWidth) => {
    setMaterialType(type)
    setSelectedProductId(productId)
    setSelectedSectionId(sectionId)
    setMaterialHeight(materialHeight)
    setMaterialWidth(materialWidth)
    setIsShowCreateProductItemModal(true)
  }

  const handleApply = useCallback((values) => {
    setBottomBarData({
      ...bottomBarData,
      discount: values.discount,
      discountType: values.discountType,
      discountAmount: values.discountAmount,
    })
  }, [bottomBarData])

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
                  setMessage={setMessage}
                  moveSection={moveSection}
                  setShowSectionIds={setShowSectionIds}
                  handleDragAndDropSection={handleDragAndDropSection}
                  setSelectedDeleteSectionId={setSelectedDeleteSectionId}
                  showCreateProductModal={handleShowCreateNewProductModal}
                  showCreateProductItemModal={handleShowCreateNewProductMaterialModal}
                />
              ))}
            </div>
          </div>
          <div className="tabQuotation__action">
            <div className="tabQuotation__button" onClick={() => setIsShowAddSectionModal(true)}>
              + Add Section
            </div>
          </div>
        </div>
        <div className="tabQuotation__footerBar">
          <QuotationBottom />
        </div>
      </div>
      {isShowCreateProductModal &&
        <CreateProductModal
          setMessage={setMessage}
          selectedSectionId={selectedSectionId}
          nextOrderNumber={sectionList.length + 1}
          closeModal={() => setIsShowCreateProductModal(false)}
        />
      }
      {isShowCreateProductItemModal &&
        <CreateProductItemModal
          setMessage={setMessage}
          searchData={searchData}
          materialType={materialType}
          sectionId={selectedSectionId}
          materialWidth={materialWidth}
          materialHeight={materialHeight}
          nextOrderNumber={nextProductNumber}
          selectedProductId={selectedProductId}
          closeModal={() => setIsShowCreateProductItemModal(false)}
        />
      }
      {isShowAddSectionModal &&
        <AddSectionModal
          sectionName={sectionName}
          isDisableSubmit={isDisableSubmit}
          messageError={messageError?.section_name}
          onClickApply={handleAddNewSection}
          handleInputChange={handleInputChange}
          onClickCancel={() => setIsShowAddSectionModal(false)}
        />
      }
      {isShowConfirmDeleteModal && (
        <ConfirmDeleteModal
          deleteTitle="section"
          isShow={isShowConfirmDeleteModal}
          closeModal={() => setIsShowConfirmDeleteModal(false)}
          onClickDelete={handleDeleteQuotationSection}
        />
      )}
    </div>
  )
}

export default TabQuotation
