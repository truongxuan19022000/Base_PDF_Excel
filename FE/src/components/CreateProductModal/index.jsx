import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';

import InventorySelectForm from '../InventorySelectForm'

import { DEFAULT_VALUE, INVENTORY, MESSAGE } from 'src/constants/config'
import { useQuotationSectionSlice } from 'src/slices/quotationSection';
import { validateCreateSectionProduct } from 'src/helper/validation';
import { isEmptyObject } from 'src/helper/helper';

const CreateProductModal = ({
  id,
  closeModal,
  nextOrderNumber,
  selectedSectionId,
  selectedEditProduct = {},
}) => {
  const { actions } = useQuotationSectionSlice();

  const dispatch = useDispatch();

  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [quantity, setQuantity] = useState('');
  const [glassType, setGlassType] = useState('');
  const [productCode, setProductCode] = useState('');

  const [areaText, setAreaText] = useState('');
  const [storeyText, setStoreyText] = useState('');
  const [profile, setProfile] = useState({});
  const [messageError, setMessageError] = useState({});
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const isEditMode = useMemo(() => {
    return !isEmptyObject(selectedEditProduct)
  }, [selectedEditProduct])

  const onSuccess = () => {
    closeModal()
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  };

  useEffect(() => {
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    if (!isEmptyObject(selectedEditProduct)) {
      const profile = INVENTORY.PROFILES[selectedEditProduct.profile]
      setProfile(profile)
      setAreaText(selectedEditProduct?.area_text)
      setStoreyText(selectedEditProduct?.storey_text)
      setProductCode(selectedEditProduct.product_code)
      setGlassType(selectedEditProduct.glass_type)
      setQuantity(selectedEditProduct.quantity)
      setHeight(selectedEditProduct.height)
      setWidth(selectedEditProduct.width)
    }
  }, [selectedEditProduct])

  useEffect(() => {
    return () => {
      dispatch(actions.clearSelectedProduct())
    }
  }, [])

  const handleInputChange = (field, value) => {
    if (isDisableSubmit) return;
    const fieldSetters = {
      glass_type: setGlassType,
      product_code: setProductCode,
      storey_text: setStoreyText,
      area_text: setAreaText,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setMessageError({});
    }
  };

  const handleInputIntegerNumber = (field, value) => {
    if (isDisableSubmit) return;
    const formatted = value.replace(/\D/g, '');
    const fieldSetters = {
      width: setWidth,
      height: setHeight,
      quantity: setQuantity,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(formatted);
      setMessageError({});
    }
  }

  const handleCreateSectionProduct = () => {
    if (!id || !selectedSectionId || isDisableSubmit || !nextOrderNumber) return;
    const data = {
      quotation_section_id: selectedSectionId,
      order_number: +nextOrderNumber,
      product_code: productCode,
      profile: profile.value,
      glass_type: glassType,
      quotation_id: +id,
      quantity,
      width,
      width_unit: DEFAULT_VALUE,
      height,
      height_unit: DEFAULT_VALUE,
      storey_text: storeyText,
      area_text: areaText,
    }

    const errors = validateCreateSectionProduct(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.createQuotationSectionProduct({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
    }
  }

  const handleEditSectionProduct = () => {
    if (isDisableSubmit || !id) return;
    const isInfoChanged = (
      +width !== +selectedEditProduct.width ||
      +height !== +selectedEditProduct.height ||
      +quantity !== selectedEditProduct.quantity ||
      glassType !== selectedEditProduct.glass_type ||
      +profile.value !== +selectedEditProduct.profile ||
      productCode !== selectedEditProduct.product_code ||
      areaText !== selectedEditProduct.area_text ||
      storeyText !== selectedEditProduct.storey_text
    );
    if (!isInfoChanged) {
      return setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE,
      })
    }
    const data = {
      product_id: selectedEditProduct?.productId,
      quotation_section_id: selectedEditProduct?.quotation_section_id,
      order_number: selectedEditProduct?.order_number,
      product_code: productCode,
      profile: profile.value,
      glass_type: glassType,
      quotation_id: +id,
      quantity,
      width,
      height,
      width_unit: DEFAULT_VALUE,
      height_unit: DEFAULT_VALUE,
      storey_text: storeyText,
      area_text: areaText,
    }
    const errors = validateCreateSectionProduct(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.editSectionProduct({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
    }
  }

  const handleClickApply = () => {
    isEditMode ? handleEditSectionProduct() : handleCreateSectionProduct()
  }

  return (
    <div className="createProductModal">
      <div className="createProductModal__innerBox">
        <div className="createProductModal__header">{isEditMode ? 'Edit Product' : 'New Product'}</div>
        <div className="createProductModal__body">
          <div className={`cellBox${(messageError?.profile || messageError?.product_code) ? ' cellBox--error' : ''}`}>
            <div className="cellBox__item">
              <div className="cellBox__item--select">
                <div className="cellBox__item--label">
                  PROFILE
                </div>
                <InventorySelectForm
                  placeholder="Select Profile"
                  selectedItem={profile}
                  keyValue="profile"
                  data={INVENTORY.PROFILES}
                  setSelectedItem={setProfile}
                  messageError={messageError}
                  setMessageError={setMessageError}
                  isInputChanged={isInputChanged}
                  setIsInputChanged={setIsInputChanged}
                />
              </div>
              {messageError?.profile &&
                <div className="cellBox__item--messageSelect">{messageError.profile}</div>
              }
            </div>
            <div className="cellBox__item">
              <div className="cellBox__item--label">
                PRODUCT CODE
              </div>
              <input
                value={productCode}
                type="text"
                placeholder="Product Code"
                onChange={(e) => handleInputChange('product_code', e.target.value)}
                className={`inputBoxForm__input${messageError?.product_code ? ' inputBoxForm__input--error' : ''}`}
              />
              {messageError?.product_code && (
                <div className="cellBox__item--message">{messageError.product_code}</div>
              )}
            </div>
          </div>
          <div className={`cellBox${(messageError?.glass_type || messageError?.quantity) ? ' cellBox--error' : ''}`}>
            <div className="cellBox__item">
              <div className="cellBox__item--label">
                GLASS TYPE
              </div>
              <input
                value={glassType}
                type="text"
                placeholder="Glass Type"
                onChange={(e) => handleInputChange('glass_type', e.target.value)}
                className={`inputBoxForm__input${messageError?.glass_type ? ' inputBoxForm__input--error' : ''}`}
              />
              {messageError?.glass_type && (
                <div className="cellBox__item--message">{messageError.glass_type}</div>
              )}
            </div>
            <div className="cellBox__item">
              <div className="cellBox__item--label">
                QUANTITY
              </div>
              <input
                value={quantity}
                type="number"
                placeholder="0"
                onChange={(e) => handleInputIntegerNumber('quantity', e.target.value)}
                className={`inputBoxForm__input${messageError?.quantity ? ' inputBoxForm__input--error' : ''}`}
              />
              {messageError?.quantity && (
                <div className="cellBox__item--message">{messageError.quantity}</div>
              )}
            </div>
          </div>
          <div className={`cellBox${(messageError?.storey_text || messageError?.area_text) ? ' cellBox--errorRow' : ''}`}>
            <div className="cellBox__item">
              <div className="cellBox__item--select">
                <div className="cellBox__item--label">
                  STOREY
                </div>
                <input
                  type="text"
                  className={`cellBox__input${messageError?.storey_text ? ' cellBox__input--error' : ''}`}
                  placeholder="Storey"
                  value={storeyText || ''}
                  onChange={(e) => handleInputChange('storey_text', e.target.value)}
                />
              </div>
              {messageError?.storey_text &&
                <div className="cellBox__item--message">{messageError.storey_text}</div>
              }
            </div>
            <div className="cellBox__item">
              <div className="cellBox__item--select">
                <div className="cellBox__item--label">
                  AREA
                </div>
                <input
                  type="text"
                  className={`cellBox__input${messageError?.area_text ? ' cellBox__input--error' : ''}`}
                  placeholder="Area"
                  value={areaText || ''}
                  onChange={(e) => handleInputChange('area_text', e.target.value)}
                />
              </div>
              {messageError?.area_text &&
                <div className="cellBox__item--message">{messageError.area_text}</div>
              }
            </div>
          </div>
          <div className="cellBox">
            <div className="cellBox__item">
              <div className="cellBox__item--label">
                WIDTH
              </div>
              <div className={`cellBox__item--inputBox${messageError?.width ? ' cellBox__item--error' : ''}`}>
                <input
                  value={width}
                  type="number"
                  placeholder="0"
                  onChange={(e) => handleInputIntegerNumber('width', e.target.value)}
                />
                <span className="cellBox__item--unit">mm</span>
              </div>
              {messageError?.width && (
                <div className="cellBox__item--message">{messageError.width}</div>
              )}
            </div>
            <div className="cellBox__item">
              <div className="cellBox__item--label">
                HEIGHT
              </div>
              <div className={`cellBox__item--inputBox${messageError?.height ? ' cellBox__item--error' : ''}`}>
                <input
                  value={height}
                  type="number"
                  placeholder="0"
                  onChange={(e) => handleInputIntegerNumber('height', e.target.value)}
                />
                <span className="cellBox__item--unit">mm</span>
              </div>
              {messageError?.height && (
                <div className="cellBox__item--message">{messageError.height}</div>
              )}
            </div>
          </div>
          {messageError?.message &&
            <div className="createProductModal__message">
              {messageError.message}
            </div>
          }
        </div>
        <div className="createProductModal__footer">
          <button
            className="createProductModal__button"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="createProductModal__button createProductModal__button--apply"
            onClick={() => handleClickApply(isEditMode)}
            disabled={isDisableSubmit}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateProductModal
