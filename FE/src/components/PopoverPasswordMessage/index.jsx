import React from 'react'



const PopoverPasswordMessage = () => {

  return (
    <div className="popoverMessage">
      <img className="popoverMessage__image" src="/icons/popover-bgr.svg" alt="bgr" />
      <div className="popoverMessage__content">
        <p className='popoverMessage__title'>Password Requirements</p>
        <p>Contain at least 8 characters</p>
        <p>Contain at least 1 uppercase letter</p>
        <p>Contain at least 1 lowercase letter</p>
        <p>Contain at least 1 numeric character</p>
        <p>Contain at least 1 special character</p>
      </div>
    </div>
  )
}

export default PopoverPasswordMessage
