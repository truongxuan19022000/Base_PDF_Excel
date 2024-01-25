import React from 'react'



const InputForm = ({
  type,
  value,
  iconUrl,
  isError,
  iconEye,
  iconName,
  autoFocus,
  isMatched,
  isPassword,
  placeHolder,
  iconEyeFade,
  className = '',
  handleInputChange,
  handleShowPassword,
}) => {
  return (
    <div className={`inputForm${isError ? ' inputForm--error' : ''} ${className}${isMatched ? ' inputForm--matched' : ''}`}>
      <img className="inputForm__icon" src={iconUrl} alt={iconName} width="16" height="16" />
      <input
        value={value || ''}
        type={type || 'text'}
        autoFocus={autoFocus}
        className="inputForm__input"
        placeholder={placeHolder || ''}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      {isPassword && (
        <img
          alt="eye"
          width="18"
          height="13"
          className="inputForm__eye"
          onClick={handleShowPassword}
          src={type === 'password' ? iconEyeFade : iconEye}
        />
      )}
    </div>
  )
}

export default InputForm
