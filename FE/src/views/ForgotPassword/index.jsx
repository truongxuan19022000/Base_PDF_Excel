import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useUserSlice } from 'src/slices/user'
import { validateEmail } from 'src/helper/validation'

import Loading from 'src/components/Loading'
import LoginLogo from 'src/components/LoginLogo'
import SubmitButton from 'src/components/SubmitButton'
import InputForm from 'src/components/InputForm/InputForm'
import SuccessfullyEmailNotification from 'src/components/SuccessfullyEmailNotification'

const ForgotPassword = () => {
  const { actions } = useUserSlice()

  const dispatch = useDispatch()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errorEmail, setErrorEmail] = useState('')
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isSendMailSuccess, setIsSendMailSuccess] = useState(false)

  const onSuccess = () => {
    setMessage('')
    setErrorEmail('')
    setIsDisableSubmit(false)
    setIsSendMailSuccess(true)
  }

  const onError = (data) => {
    setMessage(data)
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    setMessage('')
    setErrorEmail('')
    setIsDisableSubmit(false)
  }, [email])

  const handleInputChange = (field, newValue) => {
    if (field === 'email') {
      setEmail(newValue)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const isErrorExist = !!(errorEmail?.length > 0 || !!message?.length > 0)
    if (isDisableSubmit || isErrorExist) {
      return
    }

    const data = { email }
    const errors = validateEmail(data)
    if (Object.keys(errors).length > 0 && errors?.email?.length > 0) {
      setErrorEmail(errors?.email)
    } else {
      dispatch(actions.forgotPassword({ email, onSuccess, onError }))
      setIsDisableSubmit(true)
    }
  }

  const handleResendEmail = (e) => {
    if (!isSendMailSuccess) {
      return
    }
    handleSubmit(e)
  }

  return (
    <div className="wrapper">
      <div className="forgotPassword">
        <form className="forgotPassword__form" onSubmit={(e) => handleSubmit(e)}>
          {isDisableSubmit &&
            <div className="forgotPassword__loading">
              <Loading />
            </div>
          }
          <LoginLogo width={177} height={177} />
          <div className="forgotPassword__headline">Forget your password?</div>
          {isSendMailSuccess ? (
            <SuccessfullyEmailNotification
              handleResendEmail={(e) => handleResendEmail(e)}
            />
          ) : (
            <>
              <div className="forgotPassword__content">
                <div className="forgotPassword__guide">
                  Instructions will be sent to your email to reset your password.
                </div>
                <InputForm
                  type="text"
                  value={email}
                  iconName="email"
                  autoFocus={true}
                  placeHolder="Email"
                  className="inputForm--email"
                  iconUrl="/icons/email.svg"
                  isError={errorEmail?.length > 0 || !!message?.length > 0}
                  handleInputChange={(value) => handleInputChange('email', value)}
                />
                {errorEmail?.length > 0 && (
                  <div className="forgotPassword__message">{errorEmail}</div>
                )}
                {(message?.length > 0) && (
                  <div className="forgotPassword__message">{message}</div>
                )}
              </div>
              <SubmitButton
                onSubmit={handleSubmit}
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

export default ForgotPassword
