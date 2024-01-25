import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';

import { isEmptyObject, normalizeString } from 'src/helper/helper';
import { validateCreateExtraOrderMaterial, validateCreateGlassMaterial, validateCreateProductMaterial } from 'src/helper/validation';
import { useQuotationSectionSlice } from 'src/slices/quotationSection';
import { DEFAULT_VALUE, INVENTORY, MESSAGE, QUOTATION } from 'src/constants/config';

import NewGlassForm from '../NewGlassForm';
import NewProductForm from '../NewProductForm';
import NewExtraOrderForm from '../NewExtraOrderForm';

const CreateProductItemModal = ({
  sectionId,
  setMessage,
  closeModal,
  nextOrderNumber,
  searchData = [],
  selectedProductId,
  materialType = DEFAULT_VALUE,
  materialHeight = 0,
  materialWidth = 0,
}) => {
  const { actions } = useQuotationSectionSlice();

  const dispatch = useDispatch();

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [extraQuantity, setExtraQuantity] = useState(0);
  const [productTitle, setProductTitle] = useState('');

  const [messageError, setMessageError] = useState({});
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [serviceType, setServiceType] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState('');

  const [panel, setPanel] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [glassTitle, setGlassTitle] = useState('');
  const [selectedGlassItem, setSelectedGlassItem] = useState({});
  const [selectedGlassTitle, setSelectedGlassTitle] = useState('');

  const [priceUnit, setPriceUnit] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('');
  const [extraTitle, setExtraTitle] = useState('');
  const [selectedServiceItem, setSelectedServiceItem] = useState({});
  const [selectedServiceTitle, setSelectedServiceTitle] = useState('');

  const onSuccess = () => {
    setMessage({ success: MESSAGE.SUCCESS.CREATE })
  }

  const onError = () => {
    setMessage({ failed: MESSAGE.ERROR.DEFAULT })
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    if (searchData?.length > 0) {
      let filteredData = searchData;
      if (materialType === QUOTATION.MATERIAL_VALUE.GLASS) {
        filteredData = searchData.filter(item => item.category === INVENTORY.GLASS);
      } else if (!isEmptyObject(serviceType) && (serviceType.value !== QUOTATION.SERVICE_TYPE.OTHER)) {
        filteredData = searchData.filter(item => item.category === serviceType.label);
      }
      setSearchResults(filteredData);
    }
  }, [searchData, materialType, searchText, serviceType]);

  useEffect(() => {
    if (!isEmptyObject(serviceType)) {
      setSelectedServiceTitle('')
      setSelectedServiceItem({})
      setQuantityUnit('')
      setSearchText('')
      setPriceUnit('')
    }
  }, [serviceType])

  useEffect(() => {
    if (!isEmptyObject(selectedServiceItem)) {
      const priceUnit = INVENTORY.PRICE_UNIT[selectedServiceItem.price_unit]?.label;
      const quantityUnit = INVENTORY.QUANTITY_UNIT[selectedServiceItem.price_unit]?.label;
      setPriceUnit(priceUnit)
      setQuantityUnit(quantityUnit)
    }
  }, [selectedServiceItem])

  useEffect(() => {
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    if (materialWidth) {
      setWidth(materialWidth)
    }
  }, [materialWidth])

  useEffect(() => {
    if (materialHeight) {
      setHeight(materialHeight)
    }
  }, [materialHeight])

  useEffect(() => {
    if (materialHeight && materialWidth) {
      const calculatedQuantity = (+materialWidth / 1000) * (+materialHeight / 1000);
      const roundedQuantity = Number(calculatedQuantity.toFixed(2));
      setQuantity(roundedQuantity);
    }
  }, [materialWidth, materialHeight]);

  const roundedWidth = useMemo(() => {
    if (width && panel && materialType === QUOTATION.MATERIAL_VALUE.GLASS) {
      const calculatedWidth = (+width / +panel);
      return Math.round(calculatedWidth);
    }
    return width;
  }, [materialType, width, panel]);

  const handleSearch = (text) => {
    if (text && text.trim().length > 0 && searchResults?.length > 0) {
      const results = searchResults.filter(item =>
        normalizeString(item.item).trim().includes(text)
      );
      setSearchResults(results);
      setIsSearching(false)
    }
  };

  const handleTypeSearchChange = (e) => {
    if (isDisableSubmit) return;
    const text = e.target.value;
    setSearchText(normalizeString(text))
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

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      panel: setPanel,
      width: setWidth,
      height: setHeight,
      quantity: setQuantity,
      unit_price: setUnitPrice,
      glass_title: setGlassTitle,
      extra_title: setExtraTitle,
      product_title: setProductTitle,
      extra_quantity: setExtraQuantity,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged);
    }
  };

  const handleCreateProduct = () => {
    switch (materialType) {
      case QUOTATION.MATERIAL_VALUE.PRODUCT:
        handleCreateProductMaterial();
        break;
      case QUOTATION.MATERIAL_VALUE.GLASS:
        handleCreateGlassMaterial();
        break;
      case QUOTATION.MATERIAL_VALUE.EXTRA_ORDER:
        handleCreateExtraOrderMaterial();
        break;
      default:
        return null;
    }
  }

  const handleCreateProductMaterial = () => {
    if (!selectedProductId || !sectionId || isDisableSubmit || !nextOrderNumber) return;
    const data = {
      type: materialType,
      quotation_section_id: sectionId,
      product_id: selectedProductId,
      order_number: +nextOrderNumber,
      product_template_id: selectedTemplate.id,
      title: productTitle,
      height: +materialHeight,
      width: +materialWidth,
    }
    const errors = validateCreateProductMaterial(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.createProductMaterial({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
      closeModal()
    }
  }

  const handleCreateGlassMaterial = () => {
    if (!selectedProductId || !sectionId || isDisableSubmit || !nextOrderNumber) return;
    const data = {
      type: materialType,
      quotation_section_id: sectionId,
      product_id: selectedProductId,
      order_number: +nextOrderNumber,
      title: glassTitle,
      material_id: selectedGlassItem.id,
      unit_price: unitPrice,
      no_of_panels: panel,
      height: +materialHeight,
      width: +materialWidth,
    }
    const errors = validateCreateGlassMaterial(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.createProductMaterial({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
      closeModal()
    }
  }

  const handleCreateExtraOrderMaterial = () => {
    if (!selectedProductId || !sectionId || isDisableSubmit || !nextOrderNumber) return;
    const data = {
      type: materialType,
      quotation_section_id: sectionId,
      product_id: selectedProductId,
      order_number: +nextOrderNumber,
      title: extraTitle,
      material_id: selectedServiceItem.id,
      service_type: serviceType.value,
      unit_price: unitPrice,
      quantity: extraQuantity,
      height: +materialHeight,
      width: +materialWidth,
    }
    const errors = validateCreateExtraOrderMaterial(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.createProductMaterial({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
      closeModal()
    }
  }

  const modalTitle = QUOTATION.NEW_ITEM_MODAL[materialType]?.label;

  const productItemData = {
    width,
    height,
    quantity,
    searchText,
    isSearching,
    messageError,
    productTitle,
    searchResults,
    isInputChanged,
    selectedTemplate,
    selectedTemplateTitle,
  }

  const glassData = {
    panel,
    width,
    height,
    quantity,
    unitPrice,
    glassTitle,
    searchText,
    isSearching,
    messageError,
    searchResults,
    isInputChanged,
    selectedGlassItem,
    selectedGlassTitle,
  }

  const extraOrderData = {
    extraQuantity,
    priceUnit,
    extraTitle,
    unitPrice,
    serviceType,
    searchText,
    isSearching,
    messageError,
    quantityUnit,
    searchResults,
    isInputChanged,
    selectedServiceItem,
    selectedServiceTitle,
  }

  const renderBodyContent = () => {
    switch (materialType) {
      case QUOTATION.MATERIAL_VALUE.PRODUCT:
        return (
          <NewProductForm
            data={productItemData}
            setSearchText={setSearchText}
            handleInputChange={handleInputChange}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setSelectedTemplate={setSelectedTemplate}
            handleTypeSearchChange={handleTypeSearchChange}
            setSelectedTemplateTitle={setSelectedTemplateTitle}
          />
        );
      case QUOTATION.MATERIAL_VALUE.GLASS:
        return (
          <NewGlassForm
            data={glassData}
            roundedWidth={roundedWidth}
            setSearchText={setSearchText}
            handleInputChange={handleInputChange}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setSelectedGlassItem={setSelectedGlassItem}
            setSelectedGlassTitle={setSelectedGlassTitle}
            handleTypeSearchChange={handleTypeSearchChange}
          />
        );
      case QUOTATION.MATERIAL_VALUE.EXTRA_ORDER:
        return (
          <NewExtraOrderForm
            data={extraOrderData}
            setSearchText={setSearchText}
            setServiceType={setServiceType}
            setMessageError={setMessageError}
            handleInputChange={handleInputChange}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setSelectedServiceItem={setSelectedServiceItem}
            handleTypeSearchChange={handleTypeSearchChange}
            setSelectedServiceTitle={setSelectedServiceTitle}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="createProductItemModal">
      <div className="createProductItemModal__innerBox">
        <div className="createProductItemModal__header">{modalTitle}</div>
        {renderBodyContent()}
        <div className="createProductItemModal__footer">
          <button
            className="createProductItemModal__button"
            onClick={closeModal}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="createProductItemModal__button createProductItemModal__button--apply"
            onClick={handleCreateProduct}
            disabled={isDisableSubmit}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateProductItemModal
