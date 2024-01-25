import React from 'react'



const SubmitButton = ({
  onSubmit,
  buttonName = '',
  isDisabledSubmit = false,
}) => {
  return (
    <div className="submitButton">
      <button
        className="submitButton__btn"
        onClick={onSubmit}
        disabled={isDisabledSubmit}
      >
        {buttonName}
      </button>
    </div>
  )
}

export default SubmitButton
