import React from 'react'

const InventoryForm = ({
  item,
  type,
  price,
  SKUCode,
  category,
  thickness,
  messageError,
  handleInputChange
}) => {

  return (
    <div className="inventoryForm">
      <div className="box">
        <div className="box__left">
          <div className="box__title">Category</div>
          <input
            value={category || ''}
            type="text"
            className={`box__input${messageError?.category ? ' box__input--error' : ''}`}
            placeholder="Category"
            onChange={(e) => handleInputChange('category', e.target.value)}
          />
          {messageError?.category && (
            <div className="box__message">{messageError?.category}</div>
          )}
        </div>
        <div className="box__right">
          <div className="box__title">Item</div>
          <input
            value={item || ''}
            type="text"
            className={`box__input${messageError?.item ? ' box__input--error' : ''}`}
            placeholder="Item"
            onChange={(e) => handleInputChange('item', e.target.value)}
          />
          {messageError?.item && (
            <div className="box__message">{messageError?.item}</div>
          )}
        </div>
      </div>
      <div className="box">
        <div className="box__left">
          <div className="box__title">SKU Code</div>
          <input
            value={SKUCode || ''}
            type="text"
            className={`box__input${messageError?.sku_code ? ' box__input--error' : ''}`}
            placeholder="SKU Code"
            onChange={(e) => handleInputChange('SKUCode', e.target.value)}
          />
          {messageError?.sku_code && (
            <div className="box__message">{messageError?.sku_code}</div>
          )}
        </div>
        <div className="box__right">
          <div className="box__title">Type</div>
          <input
            value={type || ''}
            type="text"
            className={`box__input${messageError?.type ? ' box__input--error' : ''}`}
            placeholder="Type"
            onChange={(e) => handleInputChange('type', e.target.value)}
          />
          {messageError?.type && (
            <div className="box__message">{messageError?.type}</div>
          )}
        </div>
      </div>
      <div className="box">
        <div className="box__left">
          <div className="box__title">Thickness</div>
          <input
            value={thickness || ''}
            type="text"
            className={`box__input${messageError?.thickness ? ' box__input--error' : ''}`}
            placeholder="Thickness"
            onChange={(e) => handleInputChange('thickness', e.target.value)}
          />
          {messageError?.thickness && (
            <div className="box__message">{messageError?.thickness}</div>
          )}
        </div>
        <div className="box__right">
          <div className="box__title">Price</div>
          <input
            value={price || ''}
            type="text"
            className={`box__input${messageError?.price ? ' box__input--error' : ''}`}
            placeholder="Price"
            onChange={(e) => handleInputChange('price', e.target.value)}
          />
          {messageError?.price && (
            <div className="box__message">{messageError?.price}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryForm
