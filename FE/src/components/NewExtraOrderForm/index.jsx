import React from 'react'

import SelectSearchForm from '../SelectSearchForm'
import InventorySelectForm from '../InventorySelectForm'
import PriceInputForm from '../InputForm/PriceInputForm'

import { INVENTORY } from 'src/constants/config'
import { formatPriceWithTwoDecimals } from 'src/helper/helper'

const NewExtraOrderForm = ({
  data = {},
  setSearchText,
  setServiceType,
  setMessageError,
  handleInputChange,
  setIsInputChanged,
  setIsDisableSubmit,
  setSelectedServiceItem,
  handleTypeSearchChange,
  setSelectedServiceTitle,
  setQuantityUnit,
  setPriceUnit,
  setUnitPrice,
  handleAmountChange,
  handleClickOutAmount,
}) => {
  const handleSelectItem = (item) => {
    if (item) {
      const service = INVENTORY.SERVICE[item?.service_type];
      const priceUnit = INVENTORY.PRICE_UNIT[item.price_unit]?.label;
      const foundUnit = INVENTORY.QUANTITY_UNIT[item.price_unit]?.label;
      setPriceUnit(priceUnit)
      setServiceType(service)
      setQuantityUnit(foundUnit)
      setSelectedServiceItem(item)
      setUnitPrice(formatPriceWithTwoDecimals(+item.price))
    }
  }

  const handleSelectServiceType = (item) => {
    if (item) {
      setServiceType(item)
    }
  }

  return (
    <div className="createProductItemModal__body">
      <div className="cellBox">
        <div className="cellBox__item cellBox__item--fullWidth">
          <div className="cellBox__item--label">
            E/O TITLE
          </div>
          <input
            value={data.extraTitle || ''}
            type="text"
            placeholder="E/O Title"
            className={`cellBox__item--inputBox${data.messageError?.title ? ' cellBox__item--error' : ''}`}
            onChange={(e) => handleInputChange('extra_title', e.target.value)}
          />
          {data.messageError?.title && (
            <div className="cellBox__item--message">{data.messageError.title}</div>
          )}
        </div>
      </div>
      <div className={`cellBox${(data.messageError?.service_type || data.messageError?.service_item) ? ' cellBox--error' : ''}`}>
        <div className="cellBox__item">
          <div className="cellBox__item--select">
            <div className="cellBox__item--label">
              SERVICE TYPE
            </div>
            <InventorySelectForm
              placeholder="Select Service Type"
              selectedItem={data.serviceType}
              keyValue="service_type"
              className="profile2"
              data={INVENTORY.SERVICE}
              setSelectedItem={handleSelectServiceType}
              messageError={data.messageError}
              setMessageError={setMessageError}
              isInputChanged={data.isInputChanged}
              setIsInputChanged={setIsInputChanged}
            />
          </div>
          {data.messageError?.service_type &&
            <div className="cellBox__item--messageSelect">{data.messageError.service_type}</div>
          }
        </div>
        <div className="cellBox__item">
          <div className="cellBox__item--select">
            <div className="cellBox__item--label">
              ITEM
            </div>
            <SelectSearchForm
              displayProperty="item"
              validSelectProperty="id"
              placeHolderLabel="Select Item"
              searchText={data.searchText}
              isSearching={data.isSearching}
              searchResults={data.searchResults}
              selectedItem={data.selectedServiceItem}
              isInputChanged={data.isInputChanged}
              selectedItemTitle={data.selectedServiceTitle}
              setSearchText={setSearchText}
              setSelectedItem={handleSelectItem}
              setIsInputChanged={setIsInputChanged}
              setIsDisableSubmit={setIsDisableSubmit}
              messageError={data.messageError?.material_id}
              setSelectedItemTitle={setSelectedServiceTitle}
              handleTypeSearchChange={handleTypeSearchChange}
            />
          </div>
          {data.messageError?.material_id &&
            <div className="cellBox__item--message">{data.messageError.material_id}</div>
          }
        </div>
      </div>
      <div className="cellBox">
        <div className="cellBox__item">
          <div className="cellBox__item--label">
            QUANTITY
          </div>
          <div className={`cellBox__item--inputBox${data.messageError?.quantity ? ' cellBox__item--error' : ''}`}>
            <input
              value={data.extraQuantity || ''}
              type="number"
              placeholder="0"
              onChange={(e) => handleInputChange('extra_quantity', e.target.value)}
            />
            <span className={`cellBox__item--unit${data.quantityUnit ? '' : ' cellBox__item--unitDisabled'}${data.quantityUnit === INVENTORY.UNIT_LABEL.PANEL ? ' cellBox__item--unitPanel' : ''}`}>
              {data.quantityUnit || 'unit'}
            </span>
          </div>
          {data.messageError?.quantity && (
            <div className="cellBox__item--message">{data.messageError.quantity}</div>
          )}
        </div>
        <div className="cellBox__item">
          <div className="cellBox__item--label">
            UNIT PRICE
          </div>
          <div className={`cellBox__item--inputBox${data.messageError?.unit_price ? ' cellBox__item--error' : ''}`}>
            <div className="cellBox__item--unitMoney">$</div>
            <PriceInputForm
              inputValue={data.unitPrice}
              field="unit_price"
              placeholderTitle="0.00"
              handleAmountChange={handleAmountChange}
              handleClickOutAmount={handleClickOutAmount}
            />
            <span className={`cellBox__item--unit${data.priceUnit ? '' : ' cellBox__item--unitDisabled'}${data.priceUnit?.slice(1) === INVENTORY.UNIT_LABEL.PANEL ? ' cellBox__item--unitPanel' : ''}`}>
              {data.priceUnit || 'unit'}
            </span>
          </div>
          {data.messageError?.unit_price && (
            <div className="cellBox__item--message">{data.messageError.unit_price}</div>
          )}
        </div>
      </div>
      {data.messageError?.message &&
        <div className="cellBox__message">{data.messageError.message}</div>
      }
    </div>
  )
}

export default NewExtraOrderForm
