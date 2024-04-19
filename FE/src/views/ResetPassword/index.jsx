import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { useUserSlice } from 'src/slices/user'
import { REGEX_PASSWORD } from 'src/constants/config'
import { validateResetPassword } from 'src/helper/validation'

import Loading from 'src/components/Loading'
import LoginLogo from 'src/components/LoginLogo'
import SubmitButton from 'src/components/SubmitButton'
import InputForm from 'src/components/InputForm/InputForm'
import PopoverPasswordMessage from 'src/components/PopoverPasswordMessage'

const ResetPassword = () => {
  const { actions } = useUserSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const [newPassword, setNewPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState({})
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [typeInput, setTypeInput] = useState('password')
  const [typeConfirmInput, setTypeConfirmInput] = useState('password')

  const [isMatched, setIsMatched] = useState(false)
  const [isChangedSuccess, setIsChangeSuccess] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isVisiblePopover, setIsVisiblePopover] = useState(false)

  const onSuccess = () => {
    setIsChangeSuccess(true)
    setIsDisableSubmit(false)
  }

  const onError = (data) => {
    setErrorMessage(typeof data === 'string' ? { message: data } : data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (newPassword || confirmNewPassword) {
      const isPassMatched = newPassword === confirmNewPassword
      setIsMatched(isPassMatched)
      setIsVisiblePopover(REGEX_PASSWORD.test(newPassword))
    }
  }, [newPassword, confirmNewPassword])

  useEffect(() => {
    setErrorMessage({})
    setIsDisableSubmit(false)
  }, [newPassword])

  useEffect(() => {
    setErrorMessage({})
    setIsDisableSubmit(false)
  }, [confirmNewPassword])

  const handleInputChange = (field, newValue) => {
    if (field === 'newPassword') {
      setNewPassword(newValue)
      setIsVisiblePopover(false)
    } else if ((field === 'confirmNewPassword')) {
      setConfirmNewPassword(newValue)
    }
  }

  const handleOnClick = (e) => {
    e.stopPropagation();
    setIsVisiblePopover(!isVisiblePopover)
  }

  const handleShowPassword = (field) => {
    if (field === 'password') {
      setTypeInput(typeInput === 'password' ? 'text' : 'password')
    } else if (field === 'confirm') {
      setTypeConfirmInput(typeConfirmInput === 'password' ? 'text' : 'password')
    }
  }

  const handleSaveResetPassword = (e) => {
    e.preventDefault()
    if (isDisableSubmit) return;
    const token = new URLSearchParams(window.location.search).get('token');
    const data = {
      reset_password_token: token,
      new_password: newPassword,
      confirm_password: confirmNewPassword
    }
    const errors = validateResetPassword(data)
    if (Object.keys(errors).length > 0) {
      setErrorMessage(errors)
    } else {
      dispatch(actions.resetPassword({
        reset_password_token: token,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
        onSuccess,
        onError
      }))
      setIsDisableSubmit(true)
    }
  }

  const goToLogin = () => {
    history.push('/login')
  }
  return (
    <div className="wrapper">
      <div className="resetPassword" onClick={() => setIsVisiblePopover(false)}>
        <form className="resetPassword__form" onSubmit={(e) => handleSaveResetPassword(e)}>
          {isDisableSubmit &&
            <div className="resetPassword__loading">
              <Loading />
            </div>
          }
          <LoginLogo />
          <div className="resetPassword__headline">Reset Password</div>
          {isChangedSuccess ? (
            <>
              <p className="resetPassword__note">Password has been successfully changed.</p>
              <div className="resetPassword__button">
                <SubmitButton
                  onSubmit={goToLogin}
                  buttonName="Back to Login"
                />
              </div>
            </>
          ) : (
            <>
              <p className="resetPassword__note">Enter your new password below.</p>
              <div className="inputGroup">
                <div className="inputGroup__box"
                  onClick={handleOnClick}
                  onMouseLeave={() => setIsVisiblePopover(false)}
                  onMouseEnter={() => setIsVisiblePopover(true)}
                >
                  <InputForm
                    iconName="lock"
                    autoFocus={true}
                    type={typeInput}
                    isPassword={true}
                    value={newPassword}
                    isMatched={isMatched}
                    placeHolder="Password"
                    iconEye="/icons/eye.svg"
                    iconUrl="/icons/lock.svg"
                    errorMessage={errorMessage?.new_password}
                    iconEyeFade="/icons/eye-fade.svg"
                    handleShowPassword={() => handleShowPassword('password')}
                    isError={errorMessage?.new_password || Object.keys(errorMessage).length > 0}
                    handleInputChange={(value) => handleInputChange('newPassword', value)}
                  />
                  {errorMessage?.new_password && (
                    <div className="inputGroup__errorMessage">{errorMessage.new_password}</div>
                  )}
                </div>
                {(isVisiblePopover && typeInput === 'text') && (<PopoverPasswordMessage />)}
                <div className="inputGroup__box">
                  <InputForm
                    iconName="lock"
                    isPassword={true}
                    type={typeConfirmInput}
                    isMatched={isMatched}
                    value={confirmNewPassword}
                    errorMessage={errorMessage}
                    iconEye="/icons/eye.svg"
                    iconUrl="/icons/lock.svg"
                    placeHolder="Confirm Password"
                    iconEyeFade="/icons/eye-fade.svg"
                    isError={errorMessage?.confirm_password || Object.keys(errorMessage).length > 0}
                    handleShowPassword={() => handleShowPassword('confirm')}
                    handleInputChange={(value) => handleInputChange('confirmNewPassword', value)}
                  />
                  {errorMessage?.confirm_password && (
                    <div className="inputGroup__errorMessage">{errorMessage.confirm_password}</div>
                  )}
                </div>
                {(errorMessage?.message) && (
                  <div className="inputGroup__errorMessage inputGroup__errorMessage--bottom">{errorMessage.message}</div>
                )}
              </div>
              <SubmitButton
                onSubmit={handleSaveResetPassword}
                buttonName="Submit"
                isDisabledSubmit={isDisableSubmit}
              />
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
