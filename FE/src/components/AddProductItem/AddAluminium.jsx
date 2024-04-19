import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import { INVENTORY, MESSAGE, QUOTATION } from 'src/constants/config';
import { validateAddAluminiumItem, validateEditAluminiumItem } from 'src/helper/validation';
import { useQuotationSectionSlice } from 'src/slices/quotationSection';
import { formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals, isEmptyObject, parseLocaleStringToNumber } from 'src/helper/helper';

import PriceInputForm from '../InputForm/PriceInputForm';

const AddAluminium = ({
  id,
  isEdit = false,
  scrapList = [],
  handleCancel,
  setIsShowAddItemsForm,
  isCreateWithScrapItem = false,
  setIsOpenAddAluminiumModal,
}) => {
  const dispatch = useDispatch()

  const { actions } = useQuotationSectionSlice()

  const scrapUsedInfo = useSelector(state => state.scrap.selectedScrap);
  const selectedEditItem = useSelector(state => state.quotationSection.selectedItem);
  const selectedProductInfo = useSelector(state => state.quotationSection.selectedProductItem);

  //needed items
  const [neededWidth, setNeededWidth] = useState(0);
  const [neededHeight, setNeededHeight] = useState(0);
  const [widthQuantity, setWidthQuantity] = useState(QUOTATION.QUANTITY_DEFAULT);
  const [heightQuantity, setHeightQuantity] = useState(QUOTATION.QUANTITY_DEFAULT);
  const [totalWeightNeeded, setTotalWeightNeeded] = useState(0);
  const [totalPerimeterNeeded, setTotalPerimeterNeeded] = useState(0);
  //raw items
  const [rawGrith, setRawGrith] = useState(0);
  const [rawLength, setRawLength] = useState(0);
  const [itemWeight, setItemWeight] = useState(0);
  const [rawQuantity, setRawQuantity] = useState(1);
  const [totalRawWeight, setTotalRawWeight] = useState(0);
  const [totalRawPerimeter, setTotalRawPerimeter] = useState(0);
  const [costOfRawAluminium, setCostOfRawAluminium] = useState(0);
  const [totalCostRawAluminium, setTotalCostRawAluminium] = useState(0);
  const [costOfPowderCoating, setCostOfPowderCoating] = useState(0);
  const [totalCostPowderCoating, setTotalCostPowderCoating] = useState(0);
  const [totalCostRawMaterial, setTotalCostRawMaterial] = useState(0);
  //scrap used
  const [scrapFrom, setScrapFrom] = useState('');
  const [scrapUsedLength, setScrapUsedLength] = useState(0);
  const [remainingPerimeter, setRemainingPerimeter] = useState(0);
  //scrap items
  const [scrapLength, setScrapLength] = useState(0);
  const [scrapWeight, setScrapWeight] = useState(0);
  const [totalCostScrap, setTotalCostScrap] = useState(0);
  const [costOfScrap, setCostOfScrap] = useState(QUOTATION.COST_OF_SCRAP);

  const [messageError, setMessageError] = useState({});
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);
  const [isDisabledCoating, setIsDisabledCoating] = useState(false);

  const onSuccess = () => {
    handleCancel()
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  }

  useEffect(() => {
    if (!isEmptyObject(selectedEditItem)) {
      const {
        scrap,
        weight,
        scrap_used: scrapUsed,
        raw_material_needed: rawMaterialNeeded,
        actual_material_needed: actualMaterialNeeded,
      } = selectedEditItem;

      const {
        width,
        height,
        total_weight: totalWeight,
        width_quantity: widthQuantity,
        height_quantity: heightQuantity,
        total_perimeter: totalPerimeter,
      } = actualMaterialNeeded || {};

      const {
        raw_girth: rawGirth,
        raw_length: rawLength,
        raw_quantity: rawQuantity,
        total_raw_weight: totalRawWeight,
        total_raw_perimeter: totalRawPerimeter,
        cost_of_raw_aluminium: costOfRawAluminium,
        cost_of_powder_coating: costOfPowderCoating,
        total_cost_of_raw_aluminium: totalCostOfRawAluminium,
        total_cost_of_powder_coating: totalCostOfPowderCoating,
        total_cost_of_raw_material: totalCostOfRawMaterial,
      } = rawMaterialNeeded || {};

      const {
        scrap_length: scrapLength,
        scrap_weight: scrapWeight,
        cost_of_scrap: costOfScrap,
        total_cost_of_scrap: totalCostOfScrap,
      } = scrap || {};
      const isCoating = selectedEditItem?.raw_material_needed?.coating_price_status === INVENTORY.HAS_COATING;
      setItemWeight(formatNumberWithTwoDecimalPlaces(weight))
      setNeededWidth(formatNumberWithTwoDecimalPlaces(width));
      setWidthQuantity(formatNumberWithTwoDecimalPlaces(widthQuantity));
      setNeededHeight(formatNumberWithTwoDecimalPlaces(height));
      setHeightQuantity(formatNumberWithTwoDecimalPlaces(heightQuantity));
      setTotalPerimeterNeeded(formatNumberWithTwoDecimalPlaces(totalPerimeter));
      setTotalWeightNeeded(formatNumberWithTwoDecimalPlaces(totalWeight));
      setRawLength(formatNumberWithTwoDecimalPlaces(rawLength));
      setRawQuantity(formatNumberWithTwoDecimalPlaces(rawQuantity));
      setRawGrith(formatNumberWithTwoDecimalPlaces(rawGirth));
      setTotalRawPerimeter(formatNumberWithTwoDecimalPlaces(totalRawPerimeter));
      setTotalRawWeight(formatNumberWithTwoDecimalPlaces(totalRawWeight));
      setCostOfRawAluminium(formatPriceWithTwoDecimals(costOfRawAluminium));
      setTotalCostRawAluminium(formatPriceWithTwoDecimals(totalCostOfRawAluminium));
      setCostOfPowderCoating(isCoating && formatPriceWithTwoDecimals(costOfPowderCoating));
      setTotalCostPowderCoating(formatPriceWithTwoDecimals(totalCostOfPowderCoating));
      setTotalCostRawMaterial(formatPriceWithTwoDecimals(totalCostOfRawMaterial));
      setScrapLength(formatNumberWithTwoDecimalPlaces(scrapLength));
      setScrapWeight(formatNumberWithTwoDecimalPlaces(scrapWeight));
      setCostOfScrap(formatPriceWithTwoDecimals(costOfScrap));
      setTotalCostScrap(formatPriceWithTwoDecimals(totalCostOfScrap));
      if (!isEmptyObject(scrapUsed)) {
        const remainingPerimeter = +totalPerimeter - +scrapUsed?.scrap_length
        setScrapFrom(scrapUsed?.scrap_from);
        setScrapUsedLength(formatNumberWithTwoDecimalPlaces(scrapUsed?.scrap_length));
        setRemainingPerimeter(formatNumberWithTwoDecimalPlaces(remainingPerimeter));
      }
    }
  }, [selectedEditItem]);

  //set initial values
  useEffect(() => {
    if (!isEmptyObject(selectedProductInfo?.selectedItem)) {
      const isCoating = selectedProductInfo?.selectedItem?.coating_price_status === INVENTORY.HAS_COATING;
      setRawGrith(formatNumberWithTwoDecimalPlaces(+selectedProductInfo.selectedItem?.raw_girth))
      setItemWeight(formatNumberWithTwoDecimalPlaces(+selectedProductInfo.selectedItem?.weight));
      setRawLength(formatNumberWithTwoDecimalPlaces(+selectedProductInfo.selectedItem?.raw_length))
      setCostOfRawAluminium(formatPriceWithTwoDecimals(+selectedProductInfo.selectedItem?.price))
      setCostOfPowderCoating(formatPriceWithTwoDecimals(isCoating && +selectedProductInfo.selectedItem?.coating_price))
      setNeededWidth(formatNumberWithTwoDecimalPlaces(+selectedProductInfo.productWidth / 1000))
      setNeededHeight(formatNumberWithTwoDecimalPlaces(+selectedProductInfo.productHeight / 1000))
    }
  }, [selectedProductInfo]);

  //calculate needed materials
  useEffect(() => {
    if (+widthQuantity > 0 && +heightQuantity > 0 && +neededWidth > 0 && +neededHeight > 0) {
      const widthLength = neededWidth * +widthQuantity;
      const heightLength = neededHeight * +heightQuantity;
      const totalPerimeter = formatNumberWithTwoDecimalPlaces(widthLength + heightLength);
      setTotalPerimeterNeeded(totalPerimeter);
    } else {
      setTotalPerimeterNeeded(0.00)
    }
  }, [neededWidth, neededHeight, widthQuantity, heightQuantity]);
  useEffect(() => {
    if (totalPerimeterNeeded) {
      setTotalWeightNeeded(formatNumberWithTwoDecimalPlaces(+totalPerimeterNeeded * +itemWeight))
    }
  }, [totalPerimeterNeeded, itemWeight])

  //scrap used items
  useEffect(() => {
    if (!isEmptyObject(scrapUsedInfo)) {
      setScrapFrom(scrapUsedInfo?.title)
      setScrapUsedLength(formatNumberWithTwoDecimalPlaces(+scrapUsedInfo?.scrap_length))
    }
  }, [scrapUsedInfo])
  useEffect(() => {
    const remainLength = +totalPerimeterNeeded - +scrapUsedLength
    setRemainingPerimeter(formatNumberWithTwoDecimalPlaces(remainLength || 0))
  }, [scrapUsedLength, totalPerimeterNeeded])

  //calculate raw material items
  useEffect(() => {
    if (+rawLength > 0) {
      const calculatedQuantity = isCreateWithScrapItem
        ? Math.ceil(Math.abs(+remainingPerimeter) / +rawLength)
        : +totalPerimeterNeeded / +rawLength;
      setRawQuantity(Math.ceil(calculatedQuantity || 0));
    } else {
      setRawQuantity(0);
    }
  }, [isCreateWithScrapItem, remainingPerimeter, totalPerimeterNeeded, rawLength]);
  useEffect(() => {
    setTotalRawPerimeter(formatNumberWithTwoDecimalPlaces(+rawQuantity * rawLength))
  }, [rawQuantity, rawLength])
  useEffect(() => {
    setTotalRawWeight(formatNumberWithTwoDecimalPlaces(totalRawPerimeter * itemWeight))
  }, [totalRawPerimeter, itemWeight])
  useEffect(() => {
    setTotalCostRawAluminium(formatPriceWithTwoDecimals(rawQuantity * parseLocaleStringToNumber(costOfRawAluminium)))
  }, [rawQuantity, costOfRawAluminium])
  useEffect(() => {
    const coatingCost = +rawLength * +rawQuantity * +rawGrith * parseLocaleStringToNumber(costOfPowderCoating)
    setTotalCostPowderCoating(formatPriceWithTwoDecimals(coatingCost))
  }, [rawLength, rawQuantity, rawGrith, costOfPowderCoating])
  useEffect(() => {
    const coatingCost = +rawLength * +rawQuantity * +rawGrith * parseLocaleStringToNumber(costOfPowderCoating)
    const rawCost = +totalRawWeight * parseLocaleStringToNumber(costOfRawAluminium)
    const total = formatPriceWithTwoDecimals(coatingCost + rawCost)
    setTotalCostRawMaterial(total)
  }, [rawLength, rawQuantity, rawGrith, costOfPowderCoating, totalRawWeight, costOfRawAluminium])

  //calculate scrap items
  useEffect(() => {
    let scrapCalculated;
    if (isCreateWithScrapItem) {
      scrapCalculated = remainingPerimeter > 0
        ? totalRawPerimeter - Math.abs(+remainingPerimeter)
        : scrapUsedLength - +totalPerimeterNeeded;
    } else {
      scrapCalculated = totalRawPerimeter - totalPerimeterNeeded;
    }
    setScrapLength(formatNumberWithTwoDecimalPlaces(scrapCalculated));
  }, [isCreateWithScrapItem, scrapUsedLength, remainingPerimeter, totalRawPerimeter, totalPerimeterNeeded]);
  useEffect(() => {
    const scrapWeightCalculated = scrapLength * +itemWeight
    setScrapWeight(formatNumberWithTwoDecimalPlaces(scrapWeightCalculated))
  }, [scrapLength, itemWeight])
  useEffect(() => {
    setTotalCostScrap(formatPriceWithTwoDecimals(scrapWeight * parseLocaleStringToNumber(costOfScrap)))
  }, [scrapWeight, costOfScrap])
  useEffect(() => {
    setMessageError({})
    setIsDisableSubmit(false)
  }, [isInputChanged]);
  useEffect(() => {
    const isCoating = selectedProductInfo?.selectedItem?.coating_price_status === INVENTORY.HAS_COATING ||
      selectedEditItem?.raw_material_needed?.coating_price_status === INVENTORY.HAS_COATING;
    setIsDisabledCoating(!isCoating);
  }, [selectedProductInfo, selectedEditItem]);

  const handleInputChange = (field, value) => {
    const fieldSetters = {
      width_quantity: setWidthQuantity,
      height_quantity: setHeightQuantity,
      cost_of_raw_aluminium: setCostOfRawAluminium,
      cost_of_powder_coating: setCostOfPowderCoating,
      cost_of_scrap: setCostOfScrap,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged);
    }
  };

  const handleAmountChange = (value, keyValue, field) => {
    const fieldSetters = {
      cost_of_raw_aluminium: setCostOfRawAluminium,
      cost_of_powder_coating: setCostOfPowderCoating,
      cost_of_scrap: setCostOfScrap,
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
      cost_of_raw_aluminium: setCostOfRawAluminium,
      cost_of_powder_coating: setCostOfPowderCoating,
      cost_of_scrap: setCostOfScrap,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(formatted);
      setIsInputChanged(!isInputChanged);
    }
  };

  const handleAddNewItem = () => {
    if (isDisableSubmit) return;
    const data = {
      width: selectedProductInfo?.productWidth,
      height: selectedProductInfo?.productHeight,
      quotation_id: selectedProductInfo?.quotationId,
      material_id: selectedProductInfo?.selectedItem?.id,
      product_item_id: selectedProductInfo?.productItemId,
      width_quantity: +widthQuantity,
      height_quantity: +heightQuantity,
      cost_of_powder_coating: parseLocaleStringToNumber(costOfPowderCoating),
      cost_of_raw_aluminium: parseLocaleStringToNumber(costOfRawAluminium),
      cost_of_scrap: parseLocaleStringToNumber(costOfScrap),
      product_template_id: selectedProductInfo?.productTemplateId,
      category: INVENTORY.ALUMINIUM,
      scrap_id: 0,
      scrap_length: +scrapLength,
      scrap_weight: +scrapWeight,
      hasCoating: selectedProductInfo?.selectedItem?.coating_price_status === INVENTORY.HAS_COATING,
    }
    const errors = validateAddAluminiumItem(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createMaterialItem({ ...data, onSuccess, onError }))
      setIsShowAddItemsForm(true)
      setIsDisableSubmit(true)
      setMessageError({})
    }
  }

  const handleAddNewItemWithScrap = () => {
    if (isDisableSubmit) return;
    const data = {
      width: selectedProductInfo?.productWidth,
      height: selectedProductInfo?.productHeight,
      quotation_id: selectedProductInfo?.quotationId,
      product_item_id: selectedProductInfo?.productItemId,
      width_quantity: +widthQuantity,
      height_quantity: +heightQuantity,
      cost_of_powder_coating: parseLocaleStringToNumber(costOfPowderCoating),
      cost_of_raw_aluminium: parseLocaleStringToNumber(costOfRawAluminium),
      cost_of_scrap: parseLocaleStringToNumber(costOfScrap),
      product_template_id: selectedProductInfo?.productTemplateId,
      category: INVENTORY.ALUMINIUM,
      scrap_id: +scrapUsedInfo?.scrap_id,
      scrap_length: +scrapLength,
      scrap_weight: +scrapWeight,
      material_id: +scrapUsedInfo?.material_id,
      hasCoating: selectedProductInfo?.selectedItem?.coating_price_status === INVENTORY.HAS_COATING,
    }
    const errors = validateAddAluminiumItem(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.createMaterialItem({ ...data, onSuccess, onError }))
      setIsShowAddItemsForm(true)
      setIsDisableSubmit(true)
      setMessageError({})
    }
  }

  const handleEditItem = () => {
    if (isDisableSubmit || !id) return;
    const {
      scrap,
      rawMaterialNeeded,
      actualMaterialNeeded,
    } = selectedEditItem;
    const isInfoChanged = (+widthQuantity !== +actualMaterialNeeded?.width_quantity ||
      +heightQuantity !== +actualMaterialNeeded?.height_quantity ||
      parseLocaleStringToNumber(costOfScrap) !== +scrap.cost_of_scrap ||
      parseLocaleStringToNumber(costOfRawAluminium) !== +rawMaterialNeeded?.cost_of_raw_aluminium ||
      parseLocaleStringToNumber(costOfPowderCoating) !== +rawMaterialNeeded?.cost_of_powder_coating
    )
    if (!isInfoChanged) {
      return setMessageError({
        message: MESSAGE.ERROR.INFO_NO_CHANGE,
      })
    }
    const data = {
      category: INVENTORY.ALUMINIUM,
      width: +neededWidth,
      height: +neededHeight,
      width_quantity: +widthQuantity,
      height_quantity: +heightQuantity,
      quotation_id: +id,
      material_id: +selectedEditItem?.material_id,
      product_template_material_id: selectedEditItem?.product_template_material_id || 0,
      product_item_template_id: selectedEditItem?.product_item_template_id || 0,
      product_template_id: selectedEditItem?.product_template_id || 0,
      product_item_id: selectedEditItem?.productItemId || selectedEditItem?.product_item_id,
      cost_of_powder_coating: parseLocaleStringToNumber(costOfPowderCoating),
      cost_of_raw_aluminium: parseLocaleStringToNumber(costOfRawAluminium),
      cost_of_scrap: parseLocaleStringToNumber(costOfScrap),
      scrap_id: +selectedEditItem?.scrap?.scrap_id,
      scrap_length: +scrapLength,
      scrap_weight: +scrapWeight,
      hasCoating: selectedEditItem?.raw_material_needed?.coating_price_status === INVENTORY.HAS_COATING,
    }
    const errors = validateEditAluminiumItem(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.editMaterialItem({ ...data, onSuccess, onError }))
      setIsShowAddItemsForm(true)
      setIsDisableSubmit(true)
      setMessageError({})
    }
  }

  const handleCreateItem = () => {
    isCreateWithScrapItem && remainingPerimeter > 0
      ? handleAddNewItemWithScrap()
      : handleAddNewItem()
  };

  const handleClickApply = () => {
    isEdit ? handleEditItem() : handleCreateItem()
  }

  const handleClickBack = () => {
    if (scrapList.length > 0) {
      setIsOpenAddAluminiumModal(false)
      setIsShowAddItemsForm(true)
    } else {
      setIsShowAddItemsForm(false)
    }
  }

  const isShowScrapUsed = useMemo(() => {
    if (isEdit && !isEmptyObject(selectedEditItem?.scrap_used)) return true;
    if (!isEdit && !isEmptyObject(scrapUsedInfo) && isCreateWithScrapItem) return true;
    return false;
  }, [scrapUsedInfo, selectedEditItem, isEdit, isCreateWithScrapItem])

  return (
    <div className="createItemForm createItemForm--addItemForm">
      <div className="createItemForm__inner">
        <p className="createItemForm__headerText">
          {isEdit ? 'Edit Items' : 'Add Items'}
        </p>
        <div className="addItemForm">
          <div className="addItemForm__block">
            <b className="createItemForm__label">
              ACTUAL MATERIAL NEEDED
            </b>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">WIDTH</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value={neededWidth}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">WIDTH QUANTITY</div>
                <div className={`addItemForm__input${messageError?.width_quantity ? ' addItemForm__input--error' : ''}`}>
                  <input
                    type="number"
                    placeholder="0"
                    value={widthQuantity || ''}
                    onChange={(e) => handleInputChange('width_quantity', e.target.value)}
                  />
                </div>
                {messageError?.width_quantity &&
                  <div className="addItemForm__input--message">{messageError.width_quantity}</div>
                }
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">HEIGHT</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value={neededHeight}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">HEIGHT QUANTITY</div>
                <div className={`addItemForm__input${messageError?.height_quantity ? ' addItemForm__input--error' : ''}`}>
                  <input
                    type="number"
                    placeholder="0"
                    value={heightQuantity || ''}
                    onChange={(e) => handleInputChange('height_quantity', e.target.value)}
                  />
                </div>
                {messageError?.height_quantity &&
                  <div className="addItemForm__input--message">{messageError.height_quantity}</div>
                }
              </div>
            </div>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL PERIMETER</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={totalPerimeterNeeded}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL WEIGHT</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={totalWeightNeeded}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">kg</div>
                </div>
              </div>
            </div>
          </div>
          {isShowScrapUsed &&
            <div className="addItemForm__block">
              <b className="createItemForm__label">
                SCRAP USED
              </b>
              <div className="addItemForm__blockInner">
                <div className="addItemForm__formGroup">
                  <div className="addItemForm__label">SCRAP LENGTH</div>
                  <div className="addItemForm__input addItemForm__input--readOnly">
                    <input
                      type="text"
                      placeholder="0.00"
                      value={scrapUsedLength}
                      readOnly
                    />
                    <div className="addItemForm__inputUnit">m</div>
                  </div>
                </div>
                <div className="addItemForm__formGroup">
                  <div className="addItemForm__label">SCRAP FROM</div>
                  <div className="addItemForm__input addItemForm__input--readOnly">
                    <input
                      type="text"
                      value={scrapFrom || ''}
                      readOnly
                    />
                  </div>
                </div>
                <div className="addItemForm__formGroup">
                  <div className="addItemForm__label">REMAINING PERIMETER</div>
                  <div className="addItemForm__input addItemForm__input--readOnly">
                    <input
                      type="text"
                      placeholder="0.00"
                      value={remainingPerimeter}
                      readOnly
                    />
                    <div className="addItemForm__inputUnit">m</div>
                  </div>
                </div>
              </div>
            </div>
          }
          <div className="addItemForm__block">
            <b className="createItemForm__label">
              RAW MATERIAL NEEDED
            </b>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">RAW LENGTH</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={rawLength}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">RAW QUANTITY</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="number"
                    placeholder="0"
                    value={rawQuantity}
                    readOnly
                  />
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">RAW GIRTH</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={rawGrith}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
            </div>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL PERIMETER</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    placeholder="0.00"
                    value={totalRawPerimeter}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL WEIGHT</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value={totalRawWeight}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">kg</div>
                </div>
              </div>
            </div>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">COST OF RAW ALUMINIUM</div>
                <div className={`addItemForm__input${messageError?.cost_of_raw_aluminium ? ' addItemForm__input--error' : ''}`}>
                  <div className="addItemForm__inputUnit addItemForm__inputUnit--left">$</div>
                  <PriceInputForm
                    keyValue=""
                    inputValue={costOfRawAluminium}
                    field="cost_of_raw_aluminium"
                    placeholderTitle="0.00"
                    handleAmountChange={handleAmountChange}
                    handleClickOutAmount={handleClickOutAmount}
                  />
                </div>
                {messageError?.cost_of_raw_aluminium &&
                  <div className="addItemForm__input--message">{messageError.cost_of_raw_aluminium}</div>
                }
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL COST OF RAW ALUMINIUM</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <div className="addItemForm__input--symbol">$</div>
                  <PriceInputForm
                    inputValue={totalCostRawAluminium}
                    placeholderTitle="0.00"
                    isDisabled={true}
                  />
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">COST OF POWDER COATING</div>
                <div className={`addItemForm__input${isDisabledCoating ? ' addItemForm__input--readOnly' : ''}${messageError?.cost_of_powder_coating ? ' addItemForm__input--error' : ''}`}>
                  <div className="addItemForm__input--symbol">$</div>
                  <PriceInputForm
                    keyValue=""
                    inputValue={costOfPowderCoating}
                    field="cost_of_powder_coating"
                    placeholderTitle="0.00"
                    handleAmountChange={handleAmountChange}
                    handleClickOutAmount={handleClickOutAmount}
                  />
                  <div className="addItemForm__inputUnit">m²</div>
                </div>
                {messageError?.cost_of_powder_coating &&
                  <div className="addItemForm__input--message">{messageError.cost_of_powder_coating}</div>
                }
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL COST OF POWDER COATING</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <div className="addItemForm__input--symbol">$</div>
                  <PriceInputForm
                    inputValue={totalCostPowderCoating}
                    placeholderTitle="0.00"
                    isDisabled={true}
                  />
                </div>
              </div>
            </div>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL COST OF RAW MATERIAL</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <div className="addItemForm__input--symbol">$</div>
                  <PriceInputForm
                    inputValue={totalCostRawMaterial}
                    placeholderTitle="0.00"
                    isDisabled={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="addItemForm__block">
            <b className="createItemForm__label">
              SCRAP LEFT
            </b>
            <div className="addItemForm__blockInner">
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">SCRAP LENGTH</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value={scrapLength}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">m</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">SCRAP WEIGHT</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <input
                    type="text"
                    value={scrapWeight}
                    readOnly
                  />
                  <div className="addItemForm__inputUnit">kg</div>
                </div>
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">COST OF SCRAP</div>
                <div className={`addItemForm__input${messageError?.cost_of_scrap ? ' addItemForm__input--error' : ''}`}>
                  <div className="addItemForm__input--symbol">$</div>
                  <PriceInputForm
                    keyValue=""
                    inputValue={costOfScrap}
                    field="cost_of_scrap"
                    placeholderTitle="0.00"
                    handleAmountChange={handleAmountChange}
                    handleClickOutAmount={handleClickOutAmount}
                  />
                  <div className="addItemForm__inputUnit">kg</div>
                </div>
                {messageError?.cost_of_scrap &&
                  <div className="addItemForm__input--message">{messageError.cost_of_scrap}</div>
                }
              </div>
              <div className="addItemForm__formGroup">
                <div className="addItemForm__label">TOTAL COST OF SCRAP</div>
                <div className="addItemForm__input addItemForm__input--readOnly">
                  <div className="addItemForm__input--symbol">$</div>
                  <PriceInputForm
                    inputValue={totalCostScrap}
                    placeholderTitle="0.00"
                    isDisabled={true}
                  />
                </div>
              </div>
            </div>
          </div>
          {messageError?.message &&
            <div className="addItemForm__message">
              {messageError.message}
            </div>
          }
        </div>
        <div className="createItemForm__buttonWrapper createItemForm__buttonWrapper--addItem">
          <button
            className="createItemForm__button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          {!isEdit &&
            <button
              className="createItemForm__button"
              onClick={handleClickBack}
            >
              Back
            </button>
          }
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

export default AddAluminium
