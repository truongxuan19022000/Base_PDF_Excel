import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals, isEmptyObject, normalizeString, parseLocaleStringToNumber } from 'src/helper/helper';
import { validateCreateExtraOrderMaterial, validateCreateGlassMaterial, validateCreateProductMaterial, validateEditExtraOrderMaterial, validateEditGlassMaterial, validateEditProductMaterial } from 'src/helper/validation';
import { useQuotationSectionSlice } from 'src/slices/quotationSection';
import { useProductSlice } from 'src/slices/product';
import { DEFAULT_VALUE, INVENTORY, MESSAGE, QUOTATION } from 'src/constants/config';

import NewGlassForm from '../NewGlassForm';
import NewProductForm from '../NewProductForm';
import NewExtraOrderForm from '../NewExtraOrderForm';

const CreateProductItemModal = ({
  id,
  sectionId,
  closeModal,
  nextOrderNumber,
  searchData = [],
  selectedProductId,
  materialType = DEFAULT_VALUE,
  materialHeight = 0,
  materialWidth = 0,
  selectedEditProductItem = {},
}) => {
  const { actions } = useQuotationSectionSlice();
  const { actions: productActions } = useProductSlice();

  const dispatch = useDispatch();

  const productFetched = useSelector(state => state.product.allFetched);

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
  const [isDisabledChange, setIsDisabledChange] = useState(false);

  const isEditMode = useMemo(() => {
    return !isEmptyObject(selectedEditProductItem)
  }, [selectedEditProductItem])

  const onSuccess = () => {
    closeModal()
  }

  const onError = () => {
    setIsDisableSubmit(false)
  }

    useEffect(() => {
    if (!productFetched) {
      dispatch(productActions.getAllProductList())
    }
  }, [productFetched])

  useEffect(() => {
    if (!isEmptyObject(selectedEditProductItem)) {
      const service = INVENTORY.SERVICE[selectedEditProductItem?.service_type];
      const area = +selectedEditProductItem?.width / 1000 * +selectedEditProductItem?.height / 1000;
      const foundItem = searchData?.find(s => s.id === selectedEditProductItem?.material_id) || {};
      const foundTemplate = searchData?.find(s => s.id === selectedEditProductItem?.product_template_id) || {};

      setWidth(selectedEditProductItem.width)
      setHeight(selectedEditProductItem.height)
      if (materialType === QUOTATION.MATERIAL_VALUE.PRODUCT) {
        //set product items
        setSelectedTemplate(foundTemplate)
        setSelectedTemplateTitle(foundTemplate?.item)
        setProductTitle(selectedEditProductItem.title)
        setIsDisabledChange(selectedEditProductItem.product_template?.length > 0)
        setQuantity(formatNumberWithTwoDecimalPlaces(area))
      } else if (materialType === QUOTATION.MATERIAL_VALUE.GLASS) {
        // set glass items
        const priceUnit = INVENTORY.PRICE_UNIT[selectedEditProductItem?.price_unit]?.label;
        setPriceUnit(priceUnit)
        setSelectedGlassItem(foundItem)
        setSelectedGlassTitle(foundItem?.item)
        setGlassTitle(selectedEditProductItem.title)
        setPanel(selectedEditProductItem?.no_of_panels)
        setQuantity(formatNumberWithTwoDecimalPlaces(area))
        setUnitPrice(formatPriceWithTwoDecimals(selectedEditProductItem?.unit_price))
      } else {
        //set extra order items
        const priceUnit = INVENTORY.PRICE_UNIT[selectedEditProductItem?.quantity_unit]?.label;
        const quantityUnit = INVENTORY.QUANTITY_UNIT[selectedEditProductItem?.quantity_unit]?.label;
        setPriceUnit(priceUnit)
        setServiceType(service)
        setQuantityUnit(quantityUnit)
        setSelectedServiceItem(foundItem)
        setSelectedServiceTitle(foundItem?.item)
        setExtraTitle(selectedEditProductItem.title)
        setExtraQuantity(selectedEditProductItem.quantity)
        setUnitPrice(formatPriceWithTwoDecimals(selectedEditProductItem?.unit_price))
      }
    }
  }, [selectedEditProductItem, searchData, materialType])

  useEffect(() => {
    if (searchData?.length > 0) {
      let filteredData = searchData;
      if (materialType === QUOTATION.MATERIAL_VALUE.GLASS) {
        filteredData = searchData.filter(item => item.category === INVENTORY.GLASS);
      } else if (materialType === QUOTATION.MATERIAL_VALUE.EXTRA_ORDER) {
        filteredData = searchData.filter(item => item.category === INVENTORY.SERVICES);
      }
      setSearchResults(filteredData);
    }
  }, [searchData, materialType, searchText, serviceType]);

  useEffect(() => {
    if (!isEmptyObject(selectedGlassItem) && materialType === QUOTATION.MATERIAL_VALUE.GLASS && !isEditMode) {
      const priceUnit = INVENTORY.PRICE_UNIT[selectedGlassItem.price_unit]?.label;
      setPriceUnit(priceUnit)
      setUnitPrice(formatPriceWithTwoDecimals(+selectedGlassItem.price))
    }
  }, [selectedGlassItem, materialType, isEditMode])

  useEffect(() => {
    if (!isEmptyObject(selectedServiceItem) && materialType === QUOTATION.MATERIAL_VALUE.EXTRA_ORDER && !isEditMode) {
      const priceUnit = INVENTORY.PRICE_UNIT[selectedServiceItem.price_unit]?.label;
      const foundUnit = INVENTORY.QUANTITY_UNIT[selectedServiceItem.price_unit]?.label;
      setPriceUnit(priceUnit)
      setQuantityUnit(foundUnit)
      setUnitPrice(selectedServiceItem.price)
    }
  }, [selectedServiceItem, materialType, isEditMode])

  useEffect(() => {
    return () => {
      dispatch(actions.handleResetSelectedProductItem())
    }
  }, [])

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
      const roundedQuantity = formatNumberWithTwoDecimalPlaces(calculatedQuantity);
      setQuantity(roundedQuantity);
    }
  }, [materialWidth, materialHeight]);

  const roundedWidth = useMemo(() => {
    if (width && panel && materialType === QUOTATION.MATERIAL_VALUE.GLASS && +panel > 0) {
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
      setMessageError({})
      setIsDisableSubmit(false)
    }
  };

  const handleAmountChange = (value, keyValue, field) => {
    const fieldSetters = {
      unit_price: setUnitPrice,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged);
    }
  };

  const handleClickOutAmount = (e, keyValue, field) => {
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;
    const formatted = formatPriceWithTwoDecimals(value)
    const fieldSetters = {
      unit_price: setUnitPrice,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(formatted);
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

  const handleEditProduct = () => {
    switch (materialType) {
      case QUOTATION.MATERIAL_VALUE.PRODUCT:
        handleEditProductMaterial();
        break;
      case QUOTATION.MATERIAL_VALUE.GLASS:
        handleEditGlassMaterial();
        break;
      case QUOTATION.MATERIAL_VALUE.EXTRA_ORDER:
        handleEditExtraOrderMaterial();
        break;
      default:
        return null;
    }
  }

  const handleEditProductMaterial = () => {
    if (isEmptyObject(selectedEditProductItem) || isDisableSubmit || !id) return;
    const isDataChange = (
      productTitle !== selectedEditProductItem.title ||
      +selectedTemplate.id !== +selectedEditProductItem.product_template_id
    )
    if (!isDataChange) {
      return setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE
      })
    }
    const data = {
      quotation_id: +id,
      title: productTitle,
      type: +selectedEditProductItem.type,
      quantity: +selectedEditProductItem.quantity,
      product_item_id: +selectedEditProductItem.id,
      product_id: +selectedEditProductItem.product_id,
      order_number: +selectedEditProductItem.order_number,
      width: +selectedEditProductItem.width,
      height: +selectedEditProductItem.height,
    }
    if (selectedTemplate?.id) {
      data.product_template_id = +selectedTemplate.id;
    }
    const errors = validateEditProductMaterial(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.editProductItem({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
    }
  }

  const handleCreateProductMaterial = () => {
    if (!id || !selectedProductId || !sectionId || isDisableSubmit || !nextOrderNumber) return;
    const data = {
      quotation_id: +id,
      type: materialType,
      quotation_section_id: sectionId,
      product_id: selectedProductId,
      order_number: +nextOrderNumber,
      title: productTitle,
      height: +materialHeight,
      width: +materialWidth,
    }
    if (selectedTemplate?.id) {
      data.product_template_id = selectedTemplate.id;
    }
    const errors = validateCreateProductMaterial(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.createProductMaterial({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
    }
  }

  const handleEditGlassMaterial = () => {
    if (isEmptyObject(selectedEditProductItem) || isDisableSubmit || !id) return;
    const isDataChange = (
      glassTitle !== selectedEditProductItem.title ||
      +panel !== +selectedEditProductItem.no_of_panels ||
      parseLocaleStringToNumber(unitPrice) !== +selectedEditProductItem.unit_price ||
      +selectedGlassItem.id !== +selectedEditProductItem.material_id
    )
    if (!isDataChange) {
      return setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE
      })
    }
    const data = {
      title: glassTitle,
      type: +selectedEditProductItem.type,
      product_item_id: +selectedEditProductItem.id,
      product_id: +selectedEditProductItem.product_id,
      order_number: +selectedEditProductItem.order_number,
      quotation_id: +id,
      no_of_panels: +panel,
      unit_price: parseLocaleStringToNumber(unitPrice),
      material_id: selectedGlassItem?.id,
      min_size: +selectedGlassItem?.min_size,
      quantity,
      width: +selectedEditProductItem.width,
      height: +selectedEditProductItem.height,
    }
    const errors = validateEditGlassMaterial(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.editProductItem({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
    }
  }

  const handleCreateGlassMaterial = () => {
    if (!selectedProductId || !sectionId || isDisableSubmit || !nextOrderNumber) return;
    const data = {
      quotation_id: +id,
      type: materialType,
      quotation_section_id: sectionId,
      product_id: selectedProductId,
      order_number: +nextOrderNumber,
      title: glassTitle,
      material_id: selectedGlassItem.id,
      unit_price: parseLocaleStringToNumber(unitPrice),
      no_of_panels: panel,
      height: +materialHeight,
      width: +materialWidth,
      min_size: +selectedGlassItem?.min_size,
      quantity,
    }
    const errors = validateCreateGlassMaterial(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.createProductMaterial({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
    }
  }

  const handleEditExtraOrderMaterial = () => {
    if (isEmptyObject(selectedEditProductItem) || isDisableSubmit || !id) return;
    const isDataChange = (
      extraTitle !== selectedEditProductItem.title ||
      +extraQuantity !== +selectedEditProductItem.quantity ||
      parseLocaleStringToNumber(unitPrice) !== +selectedEditProductItem.unit_price ||
      +selectedServiceItem.id !== +selectedEditProductItem.material_id ||
      +serviceType?.value !== +selectedEditProductItem.service_type
    )
    if (!isDataChange) {
      return setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE
      })
    }
    const data = {
      title: extraTitle,
      type: +selectedEditProductItem.type,
      product_item_id: +selectedEditProductItem.id,
      product_id: +selectedEditProductItem.product_id,
      order_number: +selectedEditProductItem.order_number,
      quotation_id: +id,
      unit_price: parseLocaleStringToNumber(unitPrice),
      quantity: +extraQuantity,
      service_type: +serviceType.value,
      material_id: +selectedServiceItem?.id,
      width: +selectedEditProductItem.width,
      height: +selectedEditProductItem.height,
    }
    const errors = validateEditExtraOrderMaterial(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.editProductItem({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
    }
  }

  const handleCreateExtraOrderMaterial = () => {
    if (!selectedProductId || !sectionId || isDisableSubmit || !nextOrderNumber) return;
    const data = {
      quotation_id: +id,
      type: materialType,
      quotation_section_id: sectionId,
      product_id: selectedProductId,
      order_number: +nextOrderNumber,
      title: extraTitle,
      material_id: selectedServiceItem.id,
      service_type: serviceType.value,
      unit_price: parseLocaleStringToNumber(unitPrice),
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
    }
  }

  const handleClickApply = () => {
    isEditMode ? handleEditProduct() : handleCreateProduct()
  }

  const modalTitle = isEditMode
    ? QUOTATION.EDIT_ITEM_MODAL[materialType]?.label
    : QUOTATION.NEW_ITEM_MODAL[materialType]?.label;

  const productItemData = {
    isEditMode,
    isDisabledChange,
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
    isEditMode,
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
    isEditMode,
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
            handleAmountChange={handleAmountChange}
            handleClickOutAmount={handleClickOutAmount}
          />
        );
      case QUOTATION.MATERIAL_VALUE.EXTRA_ORDER:
        return (
          <NewExtraOrderForm
            data={extraOrderData}
            setPriceUnit={setPriceUnit}
            setUnitPrice={setUnitPrice}
            setSearchText={setSearchText}
            setServiceType={setServiceType}
            setQuantityUnit={setQuantityUnit}
            setMessageError={setMessageError}
            handleInputChange={handleInputChange}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setSelectedServiceItem={setSelectedServiceItem}
            handleTypeSearchChange={handleTypeSearchChange}
            setSelectedServiceTitle={setSelectedServiceTitle}
            handleAmountChange={handleAmountChange}
            handleClickOutAmount={handleClickOutAmount}
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
            onClick={handleClickApply}
            disabled={isDisableSubmit || !isEmptyObject(messageError)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateProductItemModal
