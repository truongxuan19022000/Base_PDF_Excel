import React from 'react'

const HeadlineBar = ({
  onClick,
  buttonName = '',
  headlineTitle = '',
  isDisableSubmit = false,
}) => {
  return (
    <div className="headlineBar">
      <div className="headlineBar__title">{headlineTitle}</div>
      <button
        className="headlineBar__button"
        onClick={onClick}
        disabled={isDisableSubmit}
      >
        {buttonName}
      </button>
    </div>
  )
}

export default HeadlineBar
