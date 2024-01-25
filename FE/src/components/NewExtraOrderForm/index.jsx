import React from 'react'

import SelectSearchForm from '../SelectSearchForm'
import InventorySelectForm from '../InventorySelectForm'

import { INVENTORY } from 'src/constants/config'

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
}) => {
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
              data={INVENTORY.SERVICE}
              setSelectedItem={setServiceType}
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
              setSelectedItem={setSelectedServiceItem}
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
            <span className="cellBox__item--unit">{data.quantityUnit}</span>
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
            <div className="cellBox__item--unit">$</div>
            <input
              value={data.unitPrice}
              type="number"
              placeholder="0.00"
              className="cellBox__item--inputUnitPrice"
              onChange={(e) => handleInputChange('unit_price', e.target.value)}
            />
            <span className="cellBox__item--unit">{data.priceUnit}</span>
          </div>
          {data.messageError?.unit_price && (
            <div className="cellBox__item--message">{data.messageError.unit_price}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewExtraOrderForm
