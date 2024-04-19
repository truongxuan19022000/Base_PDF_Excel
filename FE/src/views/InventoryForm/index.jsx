import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { ALERT, DEFAULT_VALUE, INVENTORY, MESSAGE, PERMISSION } from 'src/constants/config'
import { alertActions } from 'src/slices/alert'
import { useMaterialSlice } from 'src/slices/material'
import { validateMaterialItem, validatePermission } from 'src/helper/validation'
import { capitalizeFirstLetter, formatCurrency, formatNumberWithTwoDecimalPlaces, formatPriceWithTwoDecimals, isEmptyObject, isSimilarObject, parseLocaleStringToNumber } from 'src/helper/helper'

import HeadlineBar from 'src/components/HeadlineBar'
import InventoryLogForm from 'src/components/InventoryLogForm'
import InventoryGlassForm from 'src/components/InventoryGlassForm'
import InventoryServiceForm from 'src/components/InventoryServiceForm'
import InventoryHardwareForm from 'src/components/InventoryHardwareForm'
import InventoryAluminiumForm from 'src/components/InventoryAluminiumForm'

const InventoryForm = () => {
  const { actions } = useMaterialSlice()

  const params = useParams()
  const history = useHistory()
  const dispatch = useDispatch()

  const search = history.location.search
  const categoryTab = new URLSearchParams(search).get('category')

  const materialDetail = useSelector(state => state.material.detail)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.MATERIAL, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [messageError, setMessageError] = useState({})
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(true)

  const [item, setItem] = useState('')
  const [code, setCode] = useState('')
  const [side, setSide] = useState([])
  const [price, setPrice] = useState('')
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [rawGirth, setRawGirth] = useState('')
  const [minSize, setMinSize] = useState('')
  const [service, setService] = useState({})
  const [profile, setProfile] = useState({})
  const [category, setCategory] = useState('')
  const [sizeUnit, setSizeUnit] = useState({})
  const [priceUnit, setPriceUnit] = useState({})
  const [weightUnit, setWeightUnit] = useState({})
  const [lengthUnit, setLengthUnit] = useState({})
  const [rawGirthUnit, setRawGirthUnit] = useState({})
  const [windowType, setWindowType] = useState({})
  const [coatingPrice, setCoatingPrice] = useState('')
  const [headlineTitle, setHeadlineTitle] = useState('')
  const [coatingPriceUnit, setCoatingPriceUnit] = useState({})
  const [coatingPriceStatus, setCoatingPriceStatus] = useState(null);
  const [originalMaterialData, setOriginalMaterialData] = useState({});
  const [updatedMaterialData, setUpdatedMaterialData] = useState({});
  const [isInfoChanged, setIsInfoChanged] = useState(false)

  const isEditMode = useMemo(() => {
    return !!params.id
  }, [params.id])

  const isMaterialUsed = useMemo(() => {
    if (!isEditMode) return false;
    const isUsedInTemplate = materialDetail.materials?.product_template_use !== INVENTORY.UN_USED_VALUE;
    const isUsedInQuotation = materialDetail.materials?.product_item_use !== INVENTORY.UN_USED_VALUE;
    return isUsedInTemplate || isUsedInQuotation;
  }, [isEditMode, materialDetail.materials]);

  const onCreatedSuccess = () => {
    history.push('/inventory/materials')
  }

  const onSuccess = (data) => {
    setOriginalMaterialData(data.data)
    setIsDisableSubmit(false)
  }

  const onError = (data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessageError(data)
    }
    setIsDisableSubmit(false);
  }

  useEffect(() => {
    if (params.id) {
      dispatch(actions.getMaterialDetail(+params.id))
    }
  }, [params.id])

  useEffect(() => {
    if (!isEmptyObject(materialDetail) && params.id) {
      const detail = materialDetail.materials || {};
      let side = [];
      if (+detail.inner_side === INVENTORY.CHECKED) {
        side = [INVENTORY.SIDE[INVENTORY.INNER_SIDE], ...side]
      }
      if (+detail.outer_side === INVENTORY.CHECKED) {
        side = [INVENTORY.SIDE[INVENTORY.OUTER_SIDE], ...side]
      }
      setSide(side)
      setItem(detail.item)
      setCode(detail.code)
      setPrice(formatCurrency(+detail.price))
      setWeight(formatNumberWithTwoDecimalPlaces(+detail.weight))
      setMinSize(formatNumberWithTwoDecimalPlaces(+detail.min_size))
      setLength(formatNumberWithTwoDecimalPlaces(+detail.raw_length))
      setCoatingPrice(formatNumberWithTwoDecimalPlaces(+detail.coating_price))
      setRawGirth(formatNumberWithTwoDecimalPlaces(+detail.raw_girth))
      setProfile(detail.profile && INVENTORY.PROFILES[detail.profile])
      setService(detail.service_type && INVENTORY.SERVICE[detail.service_type])
      setPriceUnit(detail.price_unit && INVENTORY.PRICE_UNIT[detail.price_unit])
      setWindowType(detail.door_window_type && INVENTORY.WINDOW_TYPE[detail.door_window_type])
      setCoatingPriceUnit(detail.coating_price_unit && INVENTORY.COATING_PRICE_UNIT[detail.coating_price_unit])
      setCoatingPriceStatus(detail.coating_price_status && detail.coating_price_status)
    }
  }, [materialDetail, params.id])

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    if (!isEmptyObject(materialDetail) && params.id) {
      const detail = materialDetail.materials || {};
      const initialInfo = {
        category: detail.category,
        coating_price_status: +detail.coating_price_status || null,
        coating_price_unit: +detail.coating_price_unit || null,
        code: detail.code,
        door_window_type: +detail.door_window_type || null,
        id: +detail.id,
        inner_side: +detail.inner_side,
        item: detail.item,
        material_id: +detail.id,
        min_size: +detail.min_size,
        outer_side: +detail.outer_side,
        price: +detail.price,
        price_unit: +detail.price_unit,
        profile: +detail.profile || null,
        raw_girth: +detail.raw_girth,
        raw_length: +detail.raw_length,
        service_type: +detail.service_type || null,
        weight: +detail.weight,
        product_item_use: +detail.product_item_use,
        product_template_use: +detail.product_template_use,
      }
      if (+detail.coating_price_status === INVENTORY.CHECKED) {
        initialInfo.coating_price = +detail.coating_price
      }
      setOriginalMaterialData(initialInfo)
    }
  }, [materialDetail, params.id])

  useEffect(() => {
    if (isEditMode) {
      const updatedInfo = {
        category: materialDetail.materials?.category,
        coating_price_status: +coatingPriceStatus,
        coating_price_unit: coatingPriceUnit?.value || null,
        code,
        door_window_type: windowType?.value || null,
        id: +params.id,
        inner_side: !!side.find(i => i.value === INVENTORY.INNER_SIDE)
          ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
        item,
        material_id: +params.id,
        min_size: +minSize,
        outer_side: !!side.find(i => i.value === INVENTORY.OUTER_SIDE)
          ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
        price: +price,
        price_unit: priceUnit?.value || null,
        profile: profile?.value || null,
        raw_girth: +rawGirth,
        raw_length: +length,
        service_type: service?.value || null,
        weight: +weight,
        product_item_use: materialDetail.materials?.product_item_use,
        product_template_use: materialDetail.materials?.product_template_use,
      }
      if (coatingPriceStatus === INVENTORY.CHECKED) {
        updatedInfo.coating_price = +coatingPrice
      }
      setUpdatedMaterialData(updatedInfo)
    }
  }, [isEditMode, originalMaterialData, materialDetail, coatingPrice, coatingPriceStatus, coatingPriceUnit, code, windowType, params.id, side, item, minSize, price, priceUnit, profile, rawGirth, length, service, weight])

  useEffect(() => {
    if (isEditMode) {
      setIsInfoChanged(!isSimilarObject(updatedMaterialData, originalMaterialData))
    }
  }, [isEditMode, updatedMaterialData, originalMaterialData])

  useEffect(() => {
    if (categoryTab) {
      setCategory(capitalizeFirstLetter(categoryTab))
      if (isEditMode) {
        setHeadlineTitle(`Edit Item - ${categoryTab}`)
      } else {
        setHeadlineTitle(`New Inventory - ${categoryTab}`)
      }
    }
  }, [categoryTab, isEditMode])

  const handleInputChange = (field, value) => {
    if (isMaterialUsed) return;
    const fieldSetters = {
      item: setItem,
      min_size: setMinSize,
      code: setCode,
      price: setPrice,
      weight: setWeight,
      raw_length: setLength,
      raw_girth: setRawGirth,
      coating_price: setCoatingPrice,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleAmountChange = (value, keyValue, field) => {
    if (isMaterialUsed) return;
    const fieldSetters = {
      price: setPrice,
      coating_price: setCoatingPrice,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged);
    }
  };

  const handleClickOutAmount = (e, keyValue, field) => {
    if (isMaterialUsed) return;
    const value = typeof e.target.value === 'string'
      ? parseLocaleStringToNumber(e.target.value)
      : e.target.value || 0;
    const formatted = formatPriceWithTwoDecimals(value)
    const fieldSetters = {
      price: setPrice,
      coating_price: setCoatingPrice,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(formatted);
      setIsInputChanged(!isInputChanged);
    }
  };

  const handleSideChange = (data) => {
    if (isMaterialUsed) return;
    const isExist = !!side?.find(s => s.value === data.value)
    if (isExist) {
      setSide(side?.filter(s => s.value !== data.value))
    } else {
      setSide([...side, data])
    }
  }

  const handleBoxApplyCoating = (isChecked) => {
    if (isMaterialUsed) return;
    setCoatingPriceStatus(isChecked ? INVENTORY.UN_CHECK : INVENTORY.CHECKED)
    !isChecked && setCoatingPrice('')
    setIsInputChanged(!isInputChanged)
  }

  const handleCreate = () => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.MATERIAL, PERMISSION.ACTION.CREATE)
    if (isAllowed) {
      if (isDisableSubmit) return;
      const data = {
        item,
        code,
        category,
        price: parseLocaleStringToNumber(price),
        weight: weight && formatNumberWithTwoDecimalPlaces(+weight),
        min_size: minSize && formatNumberWithTwoDecimalPlaces(+minSize),
        raw_length: length && formatNumberWithTwoDecimalPlaces(+length),
        door_window_type: windowType?.value,
        coating_price_status: coatingPriceStatus ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
        price_unit: priceUnit?.value || DEFAULT_VALUE,
        service_type: service?.value,
        profile: profile?.value,
        raw_girth: rawGirth,
        inner_side: !!side?.find(s => s.value === INVENTORY.INNER_SIDE) ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
        outer_side: !!side?.find(s => s.value === INVENTORY.OUTER_SIDE) ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
      }
      if (coatingPrice && coatingPriceStatus) {
        data.coating_price = parseLocaleStringToNumber(coatingPrice);
        data.coating_price_unit = coatingPriceUnit?.value || DEFAULT_VALUE;
      }

      const errors = validateMaterialItem(data)
      if (Object.keys(errors).length > 0) {
        setMessageError(errors)
      } else {
        dispatch(actions.createMaterialItem({ ...data, onCreatedSuccess, onError }))
        setMessageError(null)
        setIsDisableSubmit(true)
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const handleSaveChanged = () => {
    if (isEditAllowed) {
      if (isDisableSubmit || isMaterialUsed) return;
      const data = {
        item,
        code,
        category,
        price: parseLocaleStringToNumber(price),
        min_size: minSize && formatNumberWithTwoDecimalPlaces(+minSize),
        raw_length: length && formatNumberWithTwoDecimalPlaces(+length),
        weight: weight && formatNumberWithTwoDecimalPlaces(+weight),
        coating_price_status: coatingPriceStatus,
        door_window_type: windowType?.value,
        price_unit: priceUnit?.value,
        service_type: service?.value,
        material_id: +params.id,
        profile: profile?.value,
        raw_girth: rawGirth,
        id: +params.id,
        inner_side: !!side?.find(s => s.value === INVENTORY.INNER_SIDE) ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
        outer_side: !!side?.find(s => s.value === INVENTORY.OUTER_SIDE) ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
        coating_price_unit: DEFAULT_VALUE,
      }

      if (coatingPriceStatus === INVENTORY.CHECKED) {
        data.coating_price = parseLocaleStringToNumber(coatingPrice);
      }

      if (isInfoChanged) {
        const errors = validateMaterialItem(data)
        if (Object.keys(errors).length > 0) {
          setMessageError(errors)
        } else {
          dispatch(actions.updateMaterialDetail({ ...data, onSuccess, onError }))
          setMessageError('')
          setIsDisableSubmit(true)
        }
      } else {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          isHovered: false,
          description: MESSAGE.ERROR.INFO_NO_CHANGE,
        }))
      }
    } else {
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Deny',
        description: MESSAGE.ERROR.AUTH_ACTION,
      }));
    }
  }

  const aluminiumData = {
    item,
    code,
    side,
    price,
    priceUnit,
    category,
    messageError,
    weight,
    length,
    rawGirth,
    profile,
    weightUnit,
    lengthUnit,
    rawGirthUnit,
    windowType,
    coatingPrice,
    coatingPriceUnit,
    coatingPriceStatus,
  }

  const glassData = {
    item, code, price, priceUnit, category, minSize, sizeUnit, messageError, service,
  }

  const hardwareData = {
    item, code, price, priceUnit, category, minSize, sizeUnit, messageError,
  }

  const serviceData = {
    item, code, price, priceUnit, category, minSize, sizeUnit, messageError, service,
  }

  const renderCategoryTab = () => {
    switch (category) {
      case INVENTORY.ALUMINIUM:
        return (
          <InventoryAluminiumForm
            data={aluminiumData}
            setProfile={setProfile}
            setWindowType={setWindowType}
            setWeightUnit={setWeightUnit}
            setLengthUnit={setLengthUnit}
            setRawGirthUnit={setRawGirthUnit}
            setMessageError={setMessageError}
            setCoatingPrice={setCoatingPrice}
            handleSideChange={handleSideChange}
            handleInputChange={handleInputChange}
            setCoatingPriceUnit={setCoatingPriceUnit}
            setCoatingPriceStatus={setCoatingPriceStatus}
            handleBoxApplyCoating={handleBoxApplyCoating}
            isEditMode={isEditMode}
            isMaterialUsed={isMaterialUsed}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
            handleAmountChange={handleAmountChange}
            handleClickOutAmount={handleClickOutAmount}
            isEditAllowed={isEditAllowed}
          />
        );
      case INVENTORY.GLASS:
        return (
          <InventoryGlassForm
            data={glassData}
            isMaterialUsed={isMaterialUsed}
            setSizeUnit={setSizeUnit}
            setPriceUnit={setPriceUnit}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
            handleAmountChange={handleAmountChange}
            handleClickOutAmount={handleClickOutAmount}
            isEditAllowed={isEditAllowed}
          />
        );
      case INVENTORY.HARDWARE:
        return (
          <InventoryHardwareForm
            data={hardwareData}
            isMaterialUsed={isMaterialUsed}
            setSizeUnit={setSizeUnit}
            setPriceUnit={setPriceUnit}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
            setPrice={setPrice}
            isEditAllowed={isEditAllowed}
          />
        );
      case INVENTORY.SERVICES:
        return (
          <InventoryServiceForm
            data={serviceData}
            isMaterialUsed={isMaterialUsed}
            setService={setService}
            setSizeUnit={setSizeUnit}
            setPriceUnit={setPriceUnit}
            setMessageError={setMessageError}
            handleInputChange={handleInputChange}
            isEditMode={isEditMode}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
            setPrice={setPrice}
            isEditAllowed={isEditAllowed}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="inventoryForm">
      <div className="inventoryForm__headlineBar">
        <HeadlineBar
          buttonName={isEditMode ? 'Save' : 'Create'}
          onClick={isEditMode ? handleSaveChanged : handleCreate}
          headlineTitle={headlineTitle}
          isDisableSubmit={isDisableSubmit || isMaterialUsed}
        />
      </div>
      <div className="inventoryForm__content">
        <div className="inventoryForm__groups">
          {renderCategoryTab()}
        </div>
        {isEditMode &&
          <div className="inventoryForm__activity">
            <InventoryLogForm
              logsData={materialDetail.activity}
            />
          </div>
        }
      </div>
    </div>
  )
}

export default InventoryForm
