import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals, isEmptyObject, parseLocaleStringToNumber } from 'src/helper/helper'
import { validateAddSquareMeterItem, validateEditSquareMeterItem } from 'src/helper/validation'
import { useQuotationSectionSlice } from 'src/slices/quotationSection'
import { MESSAGE } from 'src/constants/config'

import PriceInputForm from '../InputForm/PriceInputForm'

const SquareMetersUnitModal = ({
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

  const [width, setWidth] = useState(0.00)
  const [height, setHeight] = useState(0.00)
  const [totalArea, setTotalArea] = useState(0);
  const [costOfItem, setCostOfItem] = useState(0);
  const [totalCostOfItem, setTotalCostOfItem] = useState(0);
  const [messageError, setMessageError] = useState({});
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  useEffect(() => {
    if (!isEmptyObject(selectedEditItem)) {
      setWidth(formatNumberWithTwoDecimalPlaces(+selectedEditItem.productWidth / 1000))
      setHeight(formatNumberWithTwoDecimalPlaces(+selectedEditItem.productHeight / 1000))
      setTotalArea(formatNumberWithTwoDecimalPlaces(+selectedEditItem.total_area))
      setCostOfItem(formatPriceWithTwoDecimals(+selectedEditItem?.cost_of_item));
      setTotalCostOfItem(formatPriceWithTwoDecimals(+selectedEditItem?.total_cost_of_item))
    }
  }, [selectedEditItem]);

  useEffect(() => {
    if (!isEmptyObject(selectedProductInfo)) {
      const { selectedItem, productWidth, productHeight } = selectedProductInfo;
      const cost = formatPriceWithTwoDecimals(+selectedItem?.price);
      const area = formatNumberWithTwoDecimalPlaces((productWidth / 1000) * (productHeight / 1000));
      setCostOfItem(cost);
      setTotalArea(area);
      setWidth(formatNumberWithTwoDecimalPlaces(+selectedProductInfo.productWidth / 1000))
      setHeight(formatNumberWithTwoDecimalPlaces(+selectedProductInfo.productHeight / 1000))
    }
  }, [selectedProductInfo]);

  useEffect(() => {
    if (totalArea && costOfItem) {
      const totalCost = formatPriceWithTwoDecimals(+totalArea * parseLocaleStringToNumber(costOfItem));
      setTotalCostOfItem(totalCost);
    } else {
      setTotalCostOfItem(0);
    }
  }, [totalArea, costOfItem]);

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
    setIsDisableSubmit(false);
  }

  const handleAddItems = () => {
    if (isDisableSubmit) return;
    const data = {
      width: selectedProductInfo?.productWidth,
      height: selectedProductInfo?.productHeight,
      quotation_id: selectedProductInfo?.quotationId,
      material_id: selectedProductInfo?.selectedItem?.id,
      product_item_id: selectedProductInfo?.productItemId,
      product_template_id: selectedProductInfo?.productTemplateId,
      cost_of_item: +costOfItem,
      category: serviceType?.label,
    }
    const errors = validateAddSquareMeterItem(data)
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
    if (parseLocaleStringToNumber(costOfItem) === +selectedEditItem?.cost_of_item) {
      return setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE,
      })
    }
    const data = {
      quotation_id: +id,
      width: selectedEditItem?.productWidth,
      height: selectedEditItem?.productHeight,
      material_id: selectedEditItem?.material_id,
      product_item_id: selectedEditItem?.productItemId || selectedEditItem?.product_item_id,
      product_template_id: selectedEditItem?.product_template_id,
      product_item_template_id: selectedEditItem?.product_item_template_id || 0,
      cost_of_item: parseLocaleStringToNumber(costOfItem),
      category: selectedEditItem?.category,
      product_template_material_id: selectedEditItem?.product_template_material_id || 0,
      quantity: null,//BE require
      scrap_id: null,//BE require
    }
    const errors = validateEditSquareMeterItem(data)
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
            WIDTH
          </label>
          <div className={`createItemForm__input createItemForm__input--inActive${messageError?.width ? ' createItemForm__input--error' : ''}`}>
            <input
              type="text"
              value={width}
              readOnly
            />
            <div className="addItemForm__inputUnit">m</div>
          </div>
          {messageError?.width &&
            <div className="addItemForm__input--message">{messageError.width}</div>
          }
        </div>
        <div className="createItemForm__formGroup">
          <label className="createItemForm__label">
            HEIGHT
          </label>
          <div className={`createItemForm__input createItemForm__input--inActive${messageError?.height ? ' createItemForm__input--error' : ''}`}>
            <input
              type="text"
              value={height}
              readOnly
            />
            <div className="addItemForm__inputUnit">m</div>
          </div>
          {messageError?.height &&
            <div className="addItemForm__input--message">{messageError.height}</div>
          }
        </div>
        <div className="createItemForm__formGroup">
          <label className="createItemForm__label">
            TOTAL AREA
          </label>
          <div className={`createItemForm__input createItemForm__input--inActive${messageError?.total_area ? ' createItemForm__input--error' : ''}`}>
            <input
              type="text"
              value={totalArea}
              readOnly
            />
            <div className="addItemForm__inputUnit">/m²</div>
          </div>
          {messageError?.total_area &&
            <div className="addItemForm__input--message">{messageError.total_area}</div>
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
            <div className="addItemForm__inputUnit">/m²</div>
          </div>
          {messageError?.cost_of_item &&
            <div className="addItemForm__input--message">{messageError.cost_of_item}</div>
          }
        </div>
        <div className="createItemForm__formGroup">
          <label className="createItemForm__label">
            TOTAL COST OF ITEM
          </label>
          <div className={`createItemForm__input createItemForm__input--inActive${messageError?.total_cost_of_item ? ' createItemForm__input--error' : ''}`}>
            <div className="addItemForm__inputUnit addItemForm__inputUnit--left">$</div>
            <PriceInputForm
              inputValue={totalCostOfItem}
              placeholderTitle="0.00"
              isDisabled={true}
            />
          </div>
          {messageError?.total_cost_of_item &&
            <div className="addItemForm__input--message">{messageError.total_cost_of_item}</div>
          }
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

export default SquareMetersUnitModal
