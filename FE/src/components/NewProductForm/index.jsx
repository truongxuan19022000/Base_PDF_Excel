import React from 'react';

import SelectSearchForm from '../SelectSearchForm'

const NewProductForm = ({
  data = {},
  setSearchText,
  handleInputChange,
  setIsInputChanged,
  setIsDisableSubmit,
  setSelectedTemplate,
  handleTypeSearchChange,
  setSelectedTemplateTitle,
}) => {
  return (
    <div className="createProductItemModal__body">
      <div className={`cellBox${(data.messageError?.template || data.messageError?.title) ? ' cellBox--error' : ''}`}>
        <div className="cellBox__item">
          <div className="cellBox__item--label">
            PRODUCT TITLE
          </div>
          <input
            value={data.productTitle}
            type="text"
            placeholder="Product Title"
            onChange={(e) => handleInputChange('product_title', e.target.value)}
            className={`inputBoxForm__input${data.messageError?.title ? ' inputBoxForm__input--error' : ''}`}
          />
          {data.messageError?.title && (
            <div className="cellBox__item--message">{data.messageError.title}</div>
          )}
        </div>
        <div className="cellBox__item">
          <div className="cellBox__item--select">
            <div className="cellBox__item--label">
              PRODUCT TEMPLATE
            </div>
            <SelectSearchForm
              displayProperty="item"
              validSelectProperty="id"
              placeHolderLabel="Select Product Template"
              searchText={data.searchText}
              isSearching={data.isSearching}
              searchResults={data.searchResults}
              selectedItem={data.selectedTemplate}
              isInputChanged={data.isInputChanged}
              selectedItemTitle={data.selectedTemplateTitle}
              messageError={data.messageError?.product_template_id}
              setSearchText={setSearchText}
              setSelectedItem={setSelectedTemplate}
              setIsInputChanged={setIsInputChanged}
              setIsDisableSubmit={setIsDisableSubmit}
              setSelectedItemTitle={setSelectedTemplateTitle}
              handleTypeSearchChange={handleTypeSearchChange}
              isDisabledChange={data.isDisabledChange}
            />
          </div>
          {data.messageError?.product_template_id &&
            <div className="cellBox__item--message">{data.messageError.product_template_id}</div>
          }
        </div>
      </div>
      <div className={`cellBox${(data.messageError?.width || data.messageError?.height) ? ' cellBox--error' : ''}`}>
        <div className="cellBox__item">
          <div className="cellBox__item--label">
            Width
          </div>
          <div className={`cellBox__item--inputBox cellBox__item--disabled${data.messageError?.width ? ' cellBox__item--error' : ''}`}>
            <input
              value={data.width}
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
              value={data.height}
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
              value={data.quantity}
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
      </div>
      {data.messageError?.message &&
        <div className="cellBox__message">{data.messageError.message}</div>
      }
    </div>
  )
}

export default NewProductForm
