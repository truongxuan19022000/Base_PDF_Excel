import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MESSAGE } from 'src/constants/config'

import {  formatPriceWithTwoDecimals, isEmptyObject, parseLocaleStringToNumber } from 'src/helper/helper'
import { validateAddPieceItem, validateEditPieceItem } from 'src/helper/validation'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'

import PriceInputForm from '../InputForm/PriceInputForm'

const PiecesUnitModal = ({
  id,
  isEdit = false,
  setIsShowAddItemsForm,
  serviceType = {},
  setIsShowModal,
}) => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSectionSlice()
  const selectedProductInfo = useSelector(state => state.quotationSection.selectedProductItem);
  const selectedEditItem = useSelector(state => state.quotationSection.selectedItem);

  const [quantity, setQuantity] = useState(0)
  const [costOfItem, setCostOfItem] = useState(0)
  const [totalCostOfItem, setTotalCostOfItem] = useState(0);

  const [messageError, setMessageError] = useState({});
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  useEffect(() => {
    if (!isEmptyObject(selectedEditItem)) {
      setQuantity(+selectedEditItem.quantity)
      setTotalCostOfItem(formatPriceWithTwoDecimals(+selectedEditItem?.total_cost_of_item))
      setCostOfItem(formatPriceWithTwoDecimals(+selectedEditItem?.cost_of_item));
    }
  }, [selectedEditItem]);

  useEffect(() => {
    if (!isEmptyObject(selectedProductInfo)) {
      const { selectedItem } = selectedProductInfo;
      const cost = formatPriceWithTwoDecimals(+selectedItem?.price);
      setCostOfItem(cost);
    }
  }, [selectedProductInfo]);

  useEffect(() => {
    if (quantity && costOfItem) {
      const totalCost = formatPriceWithTwoDecimals(+quantity * parseLocaleStringToNumber(costOfItem));
      setTotalCostOfItem(totalCost);
    } else {
      setTotalCostOfItem(0);
    }
  }, [quantity, costOfItem]);

  useEffect(() => {
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isInputChanged]);

  const onSuccess = () => {
    setIsShowModal(false)
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(true);
  }

  const handleAddItems = () => {
    if (isDisableSubmit) return;
    const data = {
      quotation_id: selectedProductInfo?.quotationId,
      material_id: selectedProductInfo?.selectedItem?.id,
      product_item_id: selectedProductInfo?.productItemId,
      product_template_id: selectedProductInfo?.productTemplateId,
      cost_of_item: parseLocaleStringToNumber(costOfItem),
      category: serviceType?.label,
      quantity: +quantity,
      width: 0,
      height: 0,
    }
    const errors = validateAddPieceItem(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createMaterialItem({ ...data, onSuccess, onError }))
      setIsShowAddItemsForm(true)
      setIsDisableSubmit(true)
      setMessageError({})
    }
  }

  const handleSaveChange = () => {
    if (isDisableSubmit || !id) return;
    const isInfoChanged = (+quantity !== +selectedEditItem?.quantity ||
      parseLocaleStringToNumber(costOfItem) !== +selectedEditItem?.cost_of_item
    )
    if (!isInfoChanged) {
      return setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE,
      })
    }
    const data = {
      quotation_id: +id,
      material_id: selectedEditItem?.material_id,
      product_item_id: selectedEditItem?.productItemId || selectedEditItem?.product_item_id,
      product_template_id: selectedEditItem?.product_template_id || 0,
      product_item_template_id: selectedEditItem?.product_item_template_id || 0,
      product_template_material_id: selectedEditItem?.product_template_material_id || 0,
      category: selectedEditItem?.category,
      cost_of_item: parseLocaleStringToNumber(costOfItem),
      quantity: +quantity,
      scrap_id: null,//BE require
      width: 0,
      height: 0,
    }
    const errors = validateEditPieceItem(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.editMaterialItem({ ...data, onSuccess, onError }))
      setIsShowAddItemsForm(true)
      setIsDisableSubmit(true)
      setMessageError({})
    }
  }

  const handleClickApply = () => {
    isEdit ? handleSaveChange() : handleAddItems()
  }

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      quantity: setQuantity,
      cost_of_item: setCostOfItem,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged);
    }
  };

  const handleAmountChange = (value, keyValue, field) => {
    const fieldSetters = {
      cost_of_item: setCostOfItem,
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
      cost_of_item: setCostOfItem,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(formatted);
      setIsInputChanged(!isInputChanged);
    }
  };

  return (
    <div className="createItemForm">
      <div className="createItemForm__inner">
        <p className="createItemForm__headerText">
          {isEdit ? 'Edit Items' : 'Add Items'}
        </p>
        <div className="createItemForm__formGroup">
          <label className="createItemForm__label">
            QUANTITY
          </label>
          <div className={`createItemForm__input${messageError?.quantity ? ' createItemForm__input--error' : ''}`}>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={quantity || ''}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
            />
          </div>
          {messageError?.quantity &&
            <div className="addItemForm__input--message">{messageError.quantity}</div>
          }
        </div>
        <div className="createItemForm__formGroup">
          <label className="createItemForm__label">
            COST OF ITEM
          </label>
          <div className={`createItemForm__input${messageError?.cost_of_item ? ' createItemForm__input--error' : ''}`}>
            <div className="addItemForm__inputUnit addItemForm__inputUnit--left">$</div>
            <PriceInputForm
              keyValue=""
              inputValue={costOfItem}
              field="cost_of_item"
              placeholderTitle="0.00"
              handleAmountChange={handleAmountChange}
              handleClickOutAmount={handleClickOutAmount}
            />
            <div className="addItemForm__inputUnit">/pcs</div>
          </div>
          {messageError?.cost_of_item &&
            <div className="addItemForm__input--message">{messageError.cost_of_item}</div>
          }
        </div>
        <div className="createItemForm__formGroup">
          <label className="createItemForm__label">
            TOTAL COST OF ITEM
          </label>
          <div className="createItemForm__input createItemForm__input--inActive">
            <div className="addItemForm__inputUnit addItemForm__inputUnit--left">$</div>
            <PriceInputForm
              inputValue={totalCostOfItem}
              placeholderTitle="0.00"
              isDisabled={true}
            />
          </div>
        </div>
        {messageError?.message &&
          <div className="addItemForm__input--message">{messageError.message}</div>
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
            onClick={handleClickApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default PiecesUnitModal
