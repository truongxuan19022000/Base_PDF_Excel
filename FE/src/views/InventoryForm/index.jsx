import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { DEFAULT_VALUE, INVENTORY, MESSAGE } from 'src/constants/config'
import { useMaterialSlice } from 'src/slices/material'
import { validateMaterialItem } from 'src/helper/validation'
import { capitalizeFirstLetter, formatCurrency, formatNumberWithTwoDecimalPlaces, isEmptyObject, isSimilarObject } from 'src/helper/helper'

import HeadlineBar from 'src/components/HeadlineBar'
import InventoryLogForm from 'src/components/InventoryLogForm'
import ActionMessageForm from 'src/components/ActionMessageForm'
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

  const [message, setMessage] = useState({})
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
  const [coatingPriceStatus, setCoatingPriceStatus] = useState(false)
  const [originalMaterialData, setOriginalMaterialData] = useState({});

  const isEditMode = useMemo(() => {
    return !!params.id
  }, [params.id])

  const onCreatedSuccess = () => {
    history.push('/inventory')
  }

  const onSuccess = (data) => {
    setMessage({ success: data?.message })
    setOriginalMaterialData(data.data)
    setIsDisableSubmit(true)
  }

  const onError = () => {
    setMessage({ failed: MESSAGE.ERROR.DEFAULT })
    setIsDisableSubmit(true)
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
      setProfile(INVENTORY.PROFILES[detail.profile])
      setService(INVENTORY.SERVICE[detail.service_type])
      setPriceUnit(INVENTORY.PRICE_UNIT[detail.price_unit])
      setWindowType(INVENTORY.WINDOW_TYPE[detail.door_window_type])
      setCoatingPriceUnit(INVENTORY.COATING_PRICE_UNIT[detail.coating_price_unit])
      setCoatingPriceStatus(detail.coating_price_status === INVENTORY.CHECKED)
      setOriginalMaterialData({ ...detail, category, material_id: detail.id })
    }
  }, [materialDetail, params.id])

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    if (!coatingPriceStatus) {
      setCoatingPrice('')
    }
  }, [coatingPriceStatus])

  useEffect(() => {
    if (!isEmptyObject(message)) {
      const timer = setTimeout(() => setMessage({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [message])

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

  const handleSideChange = (data) => {
    const isExist = side?.find(s => s.value === data.value)
    if (isExist) {
      setSide(side?.filter(s => s.value !== data.value))
    } else {
      setSide([...side, data])
    }
  }

  const handleBoxApplyCoating = (isChecked) => {
    setCoatingPriceStatus(!isChecked)
    setIsInputChanged(!isInputChanged)
  }

  const handleCreate = () => {
    if (isDisableSubmit) return;
    const data = {
      item,
      code,
      category,
      price: price && formatCurrency(+price),
      weight: weight && formatNumberWithTwoDecimalPlaces(+weight),
      min_size: minSize && formatNumberWithTwoDecimalPlaces(+minSize),
      raw_length: length && formatNumberWithTwoDecimalPlaces(+length),
      door_window_type: windowType?.value,
      coating_price_status: coatingPriceStatus ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
      price_unit: priceUnit?.value || DEFAULT_VALUE,
      service_type: service?.value,
      profile: profile?.value,
      raw_girth: rawGirth,
      inner_side: side?.find(s => s.value === INVENTORY.INNER_SIDE) ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
      outer_side: side?.find(s => s.value === INVENTORY.OUTER_SIDE) ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
    }
    if (coatingPrice && coatingPriceStatus) {
      data.coating_price = formatCurrency(+coatingPrice);
      data.coating_price_unit = coatingPriceUnit?.value || DEFAULT_VALUE;
    }

    const errors = validateMaterialItem(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.createMaterialItem({ ...data, onCreatedSuccess, onError }))
      setMessageError(null)
      setIsDisableSubmit(true)
    }
  }

  const handleSaveChanged = () => {
    if (isDisableSubmit) return;
    const data = {
      item,
      code,
      category,
      price: price && formatCurrency(+price),
      min_size: minSize && formatNumberWithTwoDecimalPlaces(+minSize),
      raw_length: length && formatNumberWithTwoDecimalPlaces(+length),
      weight: weight && formatNumberWithTwoDecimalPlaces(+weight),
      coating_price_status: coatingPriceStatus ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
      door_window_type: windowType?.value,
      price_unit: priceUnit?.value,
      service_type: service?.value,
      material_id: +params.id,
      profile: profile?.value,
      raw_girth: rawGirth,
      id: +params.id,
      inner_side: side?.find(s => s.value === INVENTORY.INNER_SIDE) ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
      outer_side: side?.find(s => s.value === INVENTORY.OUTER_SIDE) ? INVENTORY.CHECKED : INVENTORY.UN_CHECK,
    }

    if (coatingPrice && coatingPriceStatus) {
      data.coating_price = formatCurrency(+coatingPrice);
      data.coating_price_unit = coatingPriceUnit?.value || DEFAULT_VALUE;
    }

    if (!isSimilarObject(originalMaterialData, data)) {
      const errors = validateMaterialItem(data)
      if (Object.keys(errors).length > 0) {
        setMessageError(errors)
        setIsDisableSubmit(true)
      } else {
        dispatch(actions.updateMaterialDetail({ ...data, onSuccess, onError }))
        setMessageError('')
        setIsDisableSubmit(true)
      }
    } else {
      setMessage({
        failed: INVENTORY.MESSAGE_ERROR.NO_CHANGED
      })
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
            setPriceUnit={setPriceUnit}
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
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        );
      case INVENTORY.GLASS:
        return (
          <InventoryGlassForm
            data={glassData}
            setSizeUnit={setSizeUnit}
            setPriceUnit={setPriceUnit}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        );
      case INVENTORY.HARDWARE:
        return (
          <InventoryHardwareForm
            data={hardwareData}
            setSizeUnit={setSizeUnit}
            setPriceUnit={setPriceUnit}
            handleInputChange={handleInputChange}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        );
      case INVENTORY.SERVICES:
        return (
          <InventoryServiceForm
            data={serviceData}
            setService={setService}
            setSizeUnit={setSizeUnit}
            setPriceUnit={setPriceUnit}
            setMessageError={setMessageError}
            handleInputChange={handleInputChange}
            isEditMode={isEditMode}
            isInputChanged={isInputChanged}
            setIsInputChanged={setIsInputChanged}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="inventoryForm">
      {!isEmptyObject(message) &&
        <div className="inventoryForm__successMessage">
          <ActionMessageForm
            successMessage={message.success}
            failedMessage={message.failed}
          />
        </div>
      }
      <div className="inventoryForm__headlineBar">
        <HeadlineBar
          buttonName={isEditMode ? 'Save' : 'Create'}
          onClick={isEditMode ? handleSaveChanged : handleCreate}
          headlineTitle={headlineTitle}
          isDisableSubmit={isDisableSubmit}
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
