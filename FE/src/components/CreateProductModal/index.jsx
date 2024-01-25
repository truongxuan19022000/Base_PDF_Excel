import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';

import InventorySelectForm from '../InventorySelectForm'

import { DEFAULT_VALUE, INVENTORY, MESSAGE, QUOTATION } from 'src/constants/config'
import { useQuotationSectionSlice } from 'src/slices/quotationSection';
import { validateCreateSectionProduct } from 'src/helper/validation';

const CreateProductModal = ({
  setMessage,
  closeModal,
  nextOrderNumber,
  selectedSectionId,
}) => {
  const { actions } = useQuotationSectionSlice();

  const dispatch = useDispatch();

  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [quantity, setQuantity] = useState('');
  const [glassType, setGlassType] = useState('');
  const [productCode, setProductCode] = useState('');

  const [area, setArea] = useState({});
  const [storey, setStorey] = useState({});
  const [profile, setProfile] = useState({});
  const [messageError, setMessageError] = useState({});
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const onSuccess = () => {
    setMessage({ success: MESSAGE.SUCCESS.CREATE })
  }
  const onError = () => {
    setMessage({ failed: MESSAGE.ERROR.DEFAULT })
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isInputChanged])

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      width: setWidth,
      height: setHeight,
      quantity: setQuantity,
      glass_type: setGlassType,
      product_code: setProductCode,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleCreateSectionProduct = () => {
    if (!selectedSectionId || isDisableSubmit || !nextOrderNumber) return;
    const data = {
      quotation_section_id: selectedSectionId,
      order_number: +nextOrderNumber,
      product_code: productCode,
      profile: profile.value,
      glass_type: glassType,
      quantity,
      area: area.value,
      storey: storey.value,
      width,
      width_unit: DEFAULT_VALUE,
      height,
      height_unit: DEFAULT_VALUE,
      subtotal: 0,
    }
    const errors = validateCreateSectionProduct(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.createQuotationSectionProduct({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true);
      closeModal()
    }
  }

  return (
    <div className="createProductModal">
      <div className="createProductModal__innerBox">
        <div className="createProductModal__header">New Product</div>
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
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={`inputBoxForm__input${messageError?.quantity ? ' inputBoxForm__input--error' : ''}`}
              />
              {messageError?.quantity && (
                <div className="cellBox__item--message">{messageError.quantity}</div>
              )}
            </div>
          </div>
          <div className={`cellBox cellBox--selectRow${(messageError?.storey || messageError?.area) ? ' cellBox--errorRow' : ''}`}>
            <div className="cellBox__item">
              <div className="cellBox__item--select">
                <div className="cellBox__item--label">
                  STOREY
                </div>
                <InventorySelectForm
                  placeholder="Select / Type Storey"
                  selectedItem={storey}
                  keyValue="storey"
                  data={QUOTATION.STOREY}
                  setSelectedItem={setStorey}
                  messageError={messageError}
                  setMessageError={setMessageError}
                  isInputChanged={isInputChanged}
                  setIsInputChanged={setIsInputChanged}
                />
              </div>
              {messageError?.storey &&
                <div className="cellBox__item--messageSelect">{messageError.storey}</div>
              }
            </div>
            <div className="cellBox__item">
              <div className="cellBox__item--select">
                <div className="cellBox__item--label">
                  AREA
                </div>
                <InventorySelectForm
                  placeholder="Select / Type Area"
                  selectedItem={area}
                  keyValue="area"
                  data={QUOTATION.AREA}
                  setSelectedItem={setArea}
                  messageError={messageError}
                  setMessageError={setMessageError}
                  isInputChanged={isInputChanged}
                  setIsInputChanged={setIsInputChanged}
                />
              </div>
              {messageError?.area &&
                <div className="cellBox__item--messageSelect">{messageError.area}</div>
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
                  onChange={(e) => handleInputChange('width', e.target.value)}
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
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
                <span className="cellBox__item--unit">mm</span>
              </div>
              {messageError?.height && (
                <div className="cellBox__item--message">{messageError.height}</div>
              )}
            </div>
          </div>
        </div>
        <div className="createProductModal__footer">
          <button
            className="createProductModal__button"
            onClick={closeModal}
            disabled={isDisableSubmit}
          >
            Cancel
          </button>
          <button
            className="createProductModal__button createProductModal__button--apply"
            onClick={handleCreateSectionProduct}
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
