import React from 'react'

import { formatPriceWithTwoDecimals } from 'src/helper/helper'

const PriceInputForm = ({
  keyValue,
  field = '',
  handleAmountChange,
  handleClickOutAmount,
  inputValue,
  placeholderTitle = '',
  isDisabled = false,
}) => {
  const handleInputChange = (e, keyValue, field) => {
    let value = e.target.value.trim();
    value = value.replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts.slice(0, 2).join('.');
    }
    handleAmountChange(value, keyValue, field);
  };

  const handleClickOutInput = (e, keyValue, field) => {
    handleClickOutAmount(e, keyValue, field)
  };

  const handleOnKeyDown = (e, keyValue, field) => {
    if (e.key === 'Enter') {
      handleClickOutAmount(e, keyValue, field);
    }
  }

  const displayPriceValue = (value) => {
    return typeof value === 'string'
      ? value
      : formatPriceWithTwoDecimals(value);
  };

  return (
    <input
      type="text"
      className="priceInput"
      placeholder={placeholderTitle}
      value={displayPriceValue(inputValue)}
      onChange={(e) => handleInputChange(e, keyValue, field)}
      onBlur={(e) => handleClickOutInput(e, keyValue, field)}
      onKeyDown={(e) => handleOnKeyDown(e, keyValue, field)}
      disabled={isDisabled}
    />
  )
}

export default PriceInputForm
