import React, { useEffect, useState } from 'react'

import { QUOTATION } from 'src/constants/config'
import { formatCurrency, isEmptyObject } from 'src/helper/helper'

import ArrowLeftSvg from '../Icons/ArrowLeftSvg'
import SaveSectionItemSvg from '../Icons/SaveSectionItemSvg'
import SectionItemSelectForm from '../SectionItemSelectForm'
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const PROFILE_FAKE = [
  {
    value: 1,
    label: "Euro"
  },
  {
    value: 2,
    label: "Local"
  },
]

const ITEM_FAKE = [
  {
    value: 1,
    label: "Tinted Lami - 12.52 mm"
  },
  {
    value: 2,
    label: "Tinted Lami - 15.52 mm"
  },
]

const STOREY_FAKE = [
  {
    value: 1,
    label: "1st Storey"
  },
  {
    value: 2,
    label: "2nd Storey"
  },
  {
    value: 3,
    label: "3rd Storey"
  },
  {
    value: 4,
    label: "Mezzanine"
  },
]

const AREA_FAKE = [
  {
    value: 1,
    label: "Bedroom 1"
  },
  {
    value: 2,
    label: "Bedroom 2"
  },
  {
    value: 3,
    label: "Bedroom 3"
  },
  {
    value: 4,
    label: "Kitchen"
  },
]

const TABLE_ITEM_FAKE = [
  {
    value: 1,
    label: "Alum. framing - sliding door (CN; 2 Tracks)"
  },
  {
    value: 2,
    label: "Alum. framing - sliding door (CN; 3 Tracks)"
  },
]

const ORDER_ITEM_FAKE = [
  {
    value: 1,
    label: "Open Door Fitting"
  },
  {
    value: 2,
    label: "Air Plane"
  },
  {
    value: 3,
    label: "Boat"
  },
]

const SectionItemCreateModal = ({ isShowSidebar, setIsShowSectionItemCreateModal }) => {
  //section info states
  const [breadth, setBreadth] = useState(0)
  const [itemLength, setItemLength] = useState(0)
  const [productCode, setProductCode] = useState(null)
  const [itemQuantity, setItemQuantity] = useState(0)
  const [selectedArea, setSelectedArea] = useState({})
  const [selectedItem, setSelectedItem] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStorey, setSelectedStorey] = useState({})
  const [selectedProfile, setSelectedProfile] = useState({})
  const [isInputChanged, setIsInputChanged] = useState(false)
  //material orders states
  const [materialLength, setMaterialLength] = useState(0)
  const [materialBreadth, setMaterialBreadth] = useState(0)
  const [materialQuantity, setMaterialQuantity] = useState(0)
  const [materialItemArea, setMaterialItemArea] = useState(0)
  const [materialItemRate, setMaterialItemRate] = useState(0)
  const [selectedMaterialItem, setSelectedMaterialItem] = useState({})
  const [isShowSelectMaterialItem, setIsShowSelectMaterialItem] = useState(false)
  //extra orders states
  const [orderUnit, setOrderUnit] = useState(null)
  const [orderQuantity, setOrderQuantity] = useState(0)
  const [orderItemRate, setOrderItemRate] = useState(0)
  const [selectedOrderItem, setSelectedOrderItem] = useState({})
  //total amount states
  const [discount, setDiscount] = useState(0)
  //valid states
  const [isShowWarning, setIsShowWarning] = useState(false)
  const [isShowOrderWarning, setIsShowOrderWarning] = useState(false)
  const [isShowAddingOrderItem, setIsShowAddingOrderItem] = useState(false)
  const [isShowAddingMaterialItem, setIsShowAddingMaterialItem] = useState(false)

  useEffect(() => {
    if (!isEmptyObject(selectedMaterialItem) && materialLength > 0 && materialBreadth > 0 && materialQuantity > 0) {
      const areaInSquareMillimeters = materialLength * materialBreadth * materialQuantity;
      const areaInSquareMeters = areaInSquareMillimeters / QUOTATION.CONVERT_TO_METER_SQUARE_VALUE;
      const roundArea = Number(areaInSquareMeters.toFixed(2));
      setMaterialItemArea(roundArea);
    } else {
      setMaterialItemArea(0)
    }
  }, [materialLength, materialBreadth, materialQuantity, selectedMaterialItem]);

  useEffect(() => {
    if (materialItemArea > 0 && !isEmptyObject(selectedMaterialItem)) {
      const rateMaterial = materialItemArea * QUOTATION.UNIT_RATE_DEFAULT;
      const roundedRate = Number(rateMaterial.toFixed(2));
      setMaterialItemRate(roundedRate);
    } else {
      setMaterialItemRate(0)
    }
  }, [materialItemArea, selectedMaterialItem]);

  useEffect(() => {
    if (orderQuantity > 0 && !isEmptyObject(selectedOrderItem)) {
      const rateOrder = orderQuantity * QUOTATION.UNIT_RATE_DEFAULT;
      const roundedRate = Number(rateOrder.toFixed(2));
      setOrderItemRate(roundedRate);
    } else {
      setOrderItemRate(0)
    }
  }, [orderQuantity, selectedOrderItem]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsShowSectionItemCreateModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsShowSectionItemCreateModal]);

  const handleInputChange = (field, value) => {
    if (isSubmitting) return;
    const fieldSetters = {
      itemLength: setItemLength,
      breadth: setBreadth,
      itemQuantity: setItemQuantity,
      materialLength: setMaterialLength,
      materialBreadth: setMaterialBreadth,
      materialQuantity: setMaterialQuantity,
      orderUnit: setOrderUnit,
      orderQuantity: setOrderQuantity,
      discount: setDiscount,
    };
    const setter = fieldSetters[field];
    if (setter) {
      setter(value);
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleClickRemoveMaterialItem = () => {
    setIsShowWarning(false)
    setMaterialLength(null)
    setMaterialBreadth(null)
    setMaterialQuantity(null)
    setMaterialItemRate(null)
    setMaterialItemArea(null)
    setSelectedMaterialItem({})
    setIsShowAddingMaterialItem(false)
  }

  const handleClickRemoveOrderItem = () => {
    setOrderUnit(null)
    setOrderQuantity(null)
    setOrderItemRate(null)
    setSelectedOrderItem({})
    setIsShowOrderWarning(false)
    setIsShowAddingOrderItem(false)
  }

  return (
    <div className="sectionItemCreateModal">
      <ClickOutSideWrapper onClickOutside={() => setIsShowSectionItemCreateModal(true)}>
        <div className={`sectionItemCreateModal__content${isShowSidebar ? ' mr-250' : ''}`}>
          <div className="sectionItemCreateModal__header">
            <div className="sectionItemCreateModal__header--left">
              Aluminium framed glazed sliding door in Euro Profile
            </div>
            <div className="sectionItemCreateModal__header--right">
              <div
                className="sectionItemCreateModal__header--btn"
                onClick={() => setIsShowSectionItemCreateModal(false)}
              >
                <span className="sectionItemCreateModal__header--backIcon"><ArrowLeftSvg /></span>
                <span>Back</span>
              </div>
              <div
                className="sectionItemCreateModal__header--btn sectionItemCreateModal__header--saveBtn"
                onClick={() => setIsShowSectionItemCreateModal(false)}
              >
                <span className="sectionItemCreateModal__header--saveIcon"><SaveSectionItemSvg /></span>
                <span>Save</span>
              </div>
            </div>
          </div>
          <div className="sectionItemCreateModal__body">
            <div className="sectionItemInfo">
              <div className="sectionItemInfo--upperBox">
                <div className="sectionItemInfo__box">
                  <label className="sectionItemInfo__label">PROFILE</label>
                  <div className="sectionItemInfo__select">
                    <SectionItemSelectForm
                      placeHolder="Profile"
                      propertyValid="value"
                      propertyDisplay="label"
                      dataList={PROFILE_FAKE}
                      selectedItem={selectedProfile}
                      setSelectedItem={setSelectedProfile}
                      setIsShowSelectMaterialItem={setIsShowSelectMaterialItem}
                    />
                  </div>
                </div>
                <div className="sectionItemInfo__box sectionItemInfo__box--item">
                  <label className="sectionItemInfo__label">ITEM</label>
                  <div className="sectionItemInfo__select sectionItemInfo__select--item">
                    <SectionItemSelectForm
                      className="item"
                      placeHolder="Item"
                      propertyValid="value"
                      propertyDisplay="label"
                      dataList={ITEM_FAKE}
                      selectedItem={selectedItem}
                      setSelectedItem={setSelectedItem}
                      setIsShowSelectMaterialItem={setIsShowSelectMaterialItem}
                    />
                  </div>
                </div>
                <div className="sectionItemInfo__box">
                  <label className="sectionItemInfo__label">PRODUCT CODE</label>
                  <div className="sectionItemInfo__select sectionItemInfo__select--code">
                    <input
                      className="sectionItemInfo__select--input"
                      type="number"
                      value={productCode || ''}
                      placeHolder="Product Code"
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
              <div className="sectionItemInfo--lowerBox">
                <div className="sectionItemInfo__box">
                  <label className="sectionItemInfo__label">STOREY</label>
                  <div className="sectionItemInfo__select">
                    <SectionItemSelectForm
                      placeHolder="Storey"
                      propertyValid="value"
                      propertyDisplay="label"
                      dataList={STOREY_FAKE}
                      selectedItem={selectedStorey}
                      setSelectedItem={setSelectedStorey}
                      setIsShowSelectMaterialItem={setIsShowSelectMaterialItem}
                    />
                  </div>
                </div>
                <div className="sectionItemInfo__box">
                  <label className="sectionItemInfo__label">AREA</label>
                  <div className="sectionItemInfo__select">
                    <SectionItemSelectForm
                      placeHolder="Area"
                      propertyValid="value"
                      propertyDisplay="label"
                      dataList={AREA_FAKE}
                      selectedItem={selectedArea}
                      setSelectedItem={setSelectedArea}
                      setIsShowSelectMaterialItem={setIsShowSelectMaterialItem}
                    />
                  </div>
                </div>
                <div className="sectionItemInfo__box">
                  <div className="sectionItemInfo__label">LENGTH (mm)</div>
                  <div className="sectionItemInfo__select sectionItemInfo__select--default">
                    <input
                      className="sectionItemInfo__select--input"
                      type="number"
                      value={itemLength || ''}
                      placeHolder="0"
                      onChange={(e) => handleInputChange('itemLength', e.target.value)}
                    />
                  </div>
                </div>
                <div className="sectionItemInfo__box">
                  <div className="sectionItemInfo__label">BREADTH (mm)</div>
                  <div className="sectionItemInfo__select sectionItemInfo__select--default">
                    <input
                      className="sectionItemInfo__select--input"
                      type="number"
                      value={breadth || ''}
                      placeHolder="0"
                      onChange={(e) => handleInputChange('breadth', e.target.value)}
                    />
                  </div>
                </div>
                <div className="sectionItemInfo__box">
                  <div className="sectionItemInfo__label">QUANTITY</div>
                  <div className="sectionItemInfo__select sectionItemInfo__select--default">
                    <input
                      className="sectionItemInfo__select--input"
                      type="number"
                      value={itemQuantity || ''}
                      placeHolder="0"
                      onChange={(e) => handleInputChange('itemQuantity', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="material">
              <div className="material__header">
                <div className="material__title">Material Orders</div>
                <button className="material__button" onClick={() => setIsShowAddingMaterialItem(true)}>
                  + Add Item
                </button>
              </div>
              <div className="material__table">
                <table className="detailTable">
                  <thead>
                    <tr>
                      <th className="detailTable__th--item"><div className="detailTable__th--item">ITEM</div></th>
                      <th>LENGTH (mm)</th>
                      <th>BREADTH (mm)</th>
                      <th>QTY</th>
                      <th>AREA (m&sup2;)</th>
                      <th>U/RATE</th>
                      <th>RATE</th>
                      <th className="detailTable__th--actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="detailTable__td--item">Alum. framing - sliding door (CN; 2 Tracks)</td>
                      <td>2800</td>
                      <td>2975</td>
                      <td>1</td>
                      <td>8.33</td>
                      <td>$ 305.00</td>
                      <td>$ 2,540.60</td>
                      <td className="detailTable__td--actions">
                        <img className="detailTable__td--btn detailTable__td--edit" src="/icons/edit.svg" alt="edit" />
                        <img className="detailTable__td--btn detailTable__td--close" src="/icons/x-mark.svg" alt="x-mark" />
                      </td>
                    </tr>
                    {isShowAddingMaterialItem && (
                      <tr className={`${isShowAddingMaterialItem ? ' detailTable__tr--adding' : ''}`}>
                        <td className={`detailTable__td detailTable__td--outerBox${isShowAddingMaterialItem ? ' detailTable__td--adding' : ''}`}>
                          <div className={`detailTable__td--selectItem${isShowSelectMaterialItem ? ' detailTable__td--showModal' : ''}`}>
                            <SectionItemSelectForm
                              dataList={TABLE_ITEM_FAKE}
                              selectedItem={selectedMaterialItem}
                              setSelectedItem={setSelectedMaterialItem}
                              placeHolder="Item"
                              propertyDisplay="label"
                              propertyValid="value"
                              className="tableSelect"
                              setIsShowSelectMaterialItem={setIsShowSelectMaterialItem}
                            />
                            {isShowWarning && (
                              <div className="detailTable__td--warning">
                                <span><img src="/icons/create-warning.svg" alt="warning" /></span>
                                <span>Leftover for Scrap: 2 x 25 mm</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="detailTable__td--outerBox">
                          <div className="detailTable__td--box">
                            <input
                              className="detailTable__td--input"
                              type="number"
                              value={materialLength || ''}
                              placeHolder="0"
                              onChange={(e) => handleInputChange('materialLength', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="detailTable__td--outerBox">
                          <div className="detailMaterial__td--box">
                            <input
                              className="detailTable__td--input"
                              type="number"
                              value={materialBreadth || ''}
                              placeHolder="0"
                              onChange={(e) => handleInputChange('materialBreadth', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="detailTable__td--outerBox">
                          <div className="detailTable__td--box">
                            <input
                              className="detailTable__td--input detailTable__td--quantity"
                              type="number"
                              value={materialQuantity || ''}
                              placeHolder="0"
                              onChange={(e) => handleInputChange('materialQuantity', e.target.value)}
                            />
                          </div>
                        </td>
                        <td>{materialItemArea || 0}</td>
                        <td>{Object.keys(selectedMaterialItem).length > 0 ? '$ 305.00' : '$ 0.00'}</td>
                        <td>{formatCurrency(materialItemRate) || '$ 0.00'}</td>
                        <td className="detailTable__td--actions">
                          <span className="detailTable__td--btn detailTable__td--save" onClick={() => setIsShowWarning(true)}>
                            <SaveSectionItemSvg />
                          </span>
                          <img
                            className="detailTable__td--btn detailTable__td--close"
                            src="/icons/x-mark.svg" alt="x-mark"
                            onClick={handleClickRemoveMaterialItem}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="extraOrder">
              <div className="extraOrder__header">
                <div className="extraOrder__title">Extra Orders (E/O)</div>
                <button className="extraOrder__button" onClick={() => setIsShowAddingOrderItem(true)}>
                  + Add Item
                </button>
              </div>
              <div className="extraOrder__table">
                <table className="detailTable">
                  <thead>
                    <tr>
                      <th className="detailTable__th--item"><div className="detailTable__th--item">ITEM</div></th>
                      <th>QTY</th>
                      <th>UNIT</th>
                      <th>U/RATE</th>
                      <th>RATE</th>
                      <th className="detailTable__th--actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="detailTable__td--item">Sliding Door Fitting</td>
                      <td>2</td>
                      <td>panel</td>
                      <td>$ 305.00</td>
                      <td>$ 2,540.60</td>
                      <td className="detailTable__td--actions">
                        <img className="detailTable__td--btn detailTable__td--edit" src="/icons/edit.svg" alt="edit" />
                        <img className="detailTable__td--btn detailTable__td--close" src="/icons/x-mark.svg" alt="x-mark" />
                      </td>
                    </tr>
                    <tr>
                      <td className="detailTable__td--item">Shipping</td>
                      <td>8.33</td>
                      <td>m&sup2;</td>
                      <td>$ 30.00</td>
                      <td>$ 2,540.60</td>
                      <td className="detailTable__td--actions">
                        <img className="detailTable__td--btn detailTable__td--edit" src="/icons/edit.svg" alt="edit" />
                        <img className="detailTable__td--btn detailTable__td--close" src="/icons/x-mark.svg" alt="x-mark" />
                      </td>
                    </tr>
                    {isShowAddingOrderItem && (
                      <tr className={`${isShowAddingOrderItem ? ' detailTable__tr--adding' : ''}`}>
                        <td className={`detailTable__td detailTable__td--outerBox${isShowAddingOrderItem ? ' detailTable__td--adding' : ''}`}>
                          <div className={`detailTable__td--selectItem${isShowSelectMaterialItem ? ' detailTable__td--showModal' : ''}`}>
                            <SectionItemSelectForm
                              dataList={ORDER_ITEM_FAKE}
                              selectedItem={selectedOrderItem}
                              setSelectedItem={setSelectedOrderItem}
                              placeHolder="Item"
                              propertyDisplay="label"
                              propertyValid="value"
                              className="tableSelect"
                              setIsShowSelectMaterialItem={setIsShowSelectMaterialItem}
                            />
                            {isShowOrderWarning && (
                              <div className="detailTable__td--warning">
                                <span><img src="/icons/create-warning.svg" alt="warning" /></span>
                                <span>Leftover for Scrap: 2 x 25 mm</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="detailTable__td--outerBox">
                          <div className="detailTable__td--box">
                            <input
                              className="detailTable__td--input"
                              type="number"
                              value={orderQuantity || ''}
                              placeHolder="0"
                              onChange={(e) => handleInputChange('orderQuantity', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="detailTable__td--outerBox">
                          <div className="detailTable__td--box">
                            <input
                              className="detailTable__td--input"
                              type="text"
                              value={orderUnit || ''}
                              placeHolder="Unit"
                              onChange={(e) => handleInputChange('orderUnit', e.target.value)}
                            />
                          </div>
                        </td>
                        <td>{Object.keys(selectedOrderItem).length > 0 ? '$ 305.00' : '$ 0.00'}</td>
                        <td>{formatCurrency(orderItemRate) || '$ 0.00'}</td>
                        <td className="detailTable__td--actions">
                          <span className="detailTable__td--btn detailTable__td--save" onClick={() => setIsShowOrderWarning(true)}>
                            <SaveSectionItemSvg />
                          </span>
                          <img
                            className="detailTable__td--btn detailTable__td--close"
                            src="/icons/x-mark.svg" alt="x-mark"
                            onClick={handleClickRemoveOrderItem}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="totalAmount">
              <div className="totalAmount__row">
                <div className="totalAmount__title">Sub Total</div>
                <div className="totalAmount__number totalAmount__number--sub">$ 133.50</div>
              </div>
              <div className="totalAmount__row">
                <div className="totalAmount__title totalAmount__title--discount">Discount</div>
                <div className="totalAmount__number totalAmount__number--discount">
                  $
                  <input
                    className="totalAmount__number--input"
                    type="number"
                    value={discount || ''}
                    placeHolder="0"
                    onChange={(e) => handleInputChange('discount', e.target.value)}
                  />
                </div>
              </div>
              <div className="totalAmount__row">
                <div className="totalAmount__title">Total</div>
                <div className="totalAmount__number totalAmount__number--total">$ 133.50</div>
              </div>
            </div>
          </div>
        </div>
      </ClickOutSideWrapper>
    </div>
  )
}

export default SectionItemCreateModal
