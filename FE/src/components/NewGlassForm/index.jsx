import React from 'react'

import SelectSearchForm from '../SelectSearchForm'
import PriceInputForm from '../InputForm/PriceInputForm'

const NewGlassForm = ({
  data = {},
  roundedWidth,
  setSearchText,
  handleInputChange,
  setIsInputChanged,
  setIsDisableSubmit,
  setSelectedGlassItem,
  handleTypeSearchChange,
  setSelectedGlassTitle,
  handleAmountChange,
  handleClickOutAmount,
}) => {
  return (
    <div className="createProductItemModal__body">
      <div className="cellBox">
        <div className="cellBox__item cellBox__item--fullWidth">
          <div className="cellBox__item--label">
            GLASS TITLE
          </div>
          <input
            value={data.glassTitle || ''}
            type="text"
            placeholder="Glass Title"
            className={`cellBox__item--inputBox${data.messageError?.title ? ' cellBox__item--error' : ''}`}
            onChange={(e) => handleInputChange('glass_title', e.target.value)}
          />
          {data.messageError?.title && (
            <div className="cellBox__item--message">{data.messageError.title}</div>
          )}
        </div>
      </div>
      <div className={`cellBox${(data.messageError?.glass_item || data.messageError?.title) ? ' cellBox--error' : ''}`}>
        <div className="cellBox__item">
          <div className="cellBox__item--select">
            <div className="cellBox__item--label">
              ITEM
            </div>
            <SelectSearchForm
              displayProperty="item"
              validSelectProperty="id"
              placeHolderLabel="Select Glass"
              searchText={data.searchText}
              isSearching={data.isSearching}
              searchResults={data.searchResults}
              selectedItem={data.selectedGlassItem}
              isInputChanged={data.isInputChanged}
              selectedItemTitle={data.selectedGlassTitle}
              setSearchText={setSearchText}
              setSelectedItem={setSelectedGlassItem}
              setIsInputChanged={setIsInputChanged}
              setIsDisableSubmit={setIsDisableSubmit}
              messageError={data.messageError?.glass_item}
              setSelectedItemTitle={setSelectedGlassTitle}
              handleTypeSearchChange={handleTypeSearchChange}
            />
          </div>
          {data.messageError?.glass_item &&
            <div className="cellBox__item--message">{data.messageError.glass_item}</div>
          }
        </div>
        <div className="cellBox__item">
          <div className="cellBox__item--label">
            NO OF PANELS
          </div>
          <div className={`cellBox__item--inputBox${data.messageError?.panel ? ' cellBox__item--error' : ''}`}>
            <input
              value={data.panel || ''}
              type="number"
              placeholder="0"
              onChange={(e) => handleInputChange('panel', e.target.value)}
            />
          </div>
          {data.messageError?.panel && (
            <div className="cellBox__item--message">{data.messageError.panel}</div>
          )}
        </div>
      </div>
      <div className={`cellBox${(data.messageError?.width || data.messageError?.height) ? ' cellBox--error' : ''}`}>
        <div className="cellBox__item">
          <div className="cellBox__item--label">
            WIDTH
          </div>
          <div className={`cellBox__item--inputBox cellBox__item--disabled${data.messageError?.width ? ' cellBox__item--error' : ''}`}>
            <input
              value={roundedWidth || ''}
              type="number"
              placeholder="0"
              disabled={true}
              onChange={(e) => handleInputChange('width', e.target.value)}
            />
            <span className="cellBox__item--unit">mm</span>
          </div>
          {data.messageError?.width && (
            <div className="cellBox__item--message">{data.messageError.width}</div>
          )}
        </div>
        <div className="cellBox__item">
          <div className="cellBox__item--label">
            HEIGHT
          </div>
          <div className={`cellBox__item--inputBox cellBox__item--disabled${data.messageError?.height ? ' cellBox__item--error' : ''}`}>
            <input
              value={data.height || ''}
              type="number"
              placeholder="0"
              disabled={true}
              onChange={(e) => handleInputChange('height', e.target.value)}
            />
            <span className="cellBox__item--unit">mm</span>
          </div>
          {data.messageError?.height && (
            <div className="cellBox__item--message">{data.messageError.height}</div>
          )}
        </div>
      </div>
      <div className="cellBox">
        <div className="cellBox__item">
          <div className="cellBox__item--label">
            QUANTITY
          </div>
          <div className={`cellBox__item--inputBox cellBox__item--disabled${data.messageError?.quantity ? ' cellBox__item--error' : ''}`}>
            <input
              value={data.quantity || ''}
              type="number"
              placeholder="0"
              disabled={true}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
            />
            <span className="cellBox__item--unit">m²</span>
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
            <span className="cellBox__item--unit">/m²</span>
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

export default NewGlassForm
