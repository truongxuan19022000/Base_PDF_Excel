import React from 'react'

const InputBoxForm = ({
  value = '',
  keyValue = '',
  labelName = '',
  inputType = 'text',
  placeholderTitle = '',
  messageError = {},
  handleInputChange,
}) => {
  return (
    <div className="inputBoxForm">
      <div className="inputBoxForm__title">{labelName}</div>
      <input
        value={value}
        type={inputType}
        placeholder={placeholderTitle}
        disabled={keyValue === 'category'}
        onChange={(e) => handleInputChange(keyValue, e.target.value)}
        className={`inputBoxForm__input${messageError?.[keyValue] ? ' inputBoxForm__input--error' : ''}`}
      />
    </div>
  )
}

export default InputBoxForm
