import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { useUserSlice } from 'src/slices/user'
import { validateLogin } from 'src/helper/validation'

import LoginLogo from 'src/components/LoginLogo'
import SubmitButton from 'src/components/SubmitButton'
import InputForm from 'src/components/InputForm/InputForm'

const Login = () => {
  const { actions } = useUserSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorUsername, setErrorUsername] = useState('')
  const [errorPassword, setErrorPassword] = useState('')
  const [typeInput, setTypeInput] = useState('password')
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)

  const onSuccess = () => {
    history.push('/')
  }

  const onError = (data) => {
    setMessage(data)
    setIsDisableSubmit(true)
  }

  useEffect(() => {
    setMessage(null)
    setErrorUsername(null)
    setErrorPassword(null)
    setIsDisableSubmit(false)
  }, [username])

  useEffect(() => {
    setMessage(null)
    setErrorPassword(null)
    setIsDisableSubmit(false)
  }, [password])

  const handleShowPassword = () => {
    setTypeInput(typeInput === 'password' ? 'text' : 'password')
  }

  const handleInputChange = (field, newValue) => {
    if (field === 'username') {
      setUsername(newValue)
    } else if (field === 'password') {
      setPassword(newValue)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const data = { username, password }
    const errors = validateLogin(data)
    const isErrorExist = !!(errorUsername?.length > 0 || errorPassword?.length > 0 || !!message?.length > 0)
    if (isErrorExist || isDisableSubmit) {
      return
    }

    if (Object.keys(errors).length > 0) {
      if (errors?.password) {
        setErrorPassword(errors?.password)
      }
      if (errors?.username) {
        setErrorUsername(errors?.username)
      }
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.login({ username, password, onSuccess, onError }))
      setIsDisableSubmit(true)
      setMessage('')
    }
  }

  const goToForgotPasswordPage = () => {
    history.push('/forgot-password')
  }

  return (
    <div className="wrapper">
      <div className="login">
        <form
          className="login__form"
          onSubmit={(e) => handleLogin(e)}
        >
          <LoginLogo width={177} height={177} />
          <div className="login__headline">Log In</div>
          <div>
            <div className="inputGroup">
              <InputForm
                type="text"
                iconName="user"
                value={username}
                autoFocus={true}
                placeHolder="Username"
                iconUrl="/icons/user.svg"
                isError={errorUsername?.length > 0 || !!message?.length > 0}
                handleInputChange={(value) => handleInputChange('username', value)}
              />
              {errorUsername?.length > 0 && (
                <div className="inputGroup__message">{errorUsername}</div>
              )}
            </div>
            <div className="inputGroup">
              <InputForm
                type={typeInput}
                value={password}
                isPassword={true}
                iconName="lock"
                placeHolder="Password"
                iconEye="/icons/eye.svg"
                iconUrl="/icons/lock.svg"
                iconEyeFade="/icons/eye-fade.svg"
                handleShowPassword={handleShowPassword}
                isError={errorPassword?.length > 0 || !!message?.length > 0}
                handleInputChange={(value) => handleInputChange('password', value)}
              />
              {errorPassword?.length > 0 && (
                <div className="inputGroup__message">{errorPassword}</div>
              )}
            </div>
          </div>
          <div className={`loginNote${(message?.length > 0) ? ' loginNote--error' : ''}`}>
            {(message?.length > 0) && (
              <div className="loginNote__message">{message}</div>
            )}
            <div className="loginNote__url"
              onClick={goToForgotPasswordPage}
            >Forgot password?</div>
          </div>
          <SubmitButton
            onSubmit={handleLogin}
            buttonName="Login"
            isDisabledSubmit={isDisableSubmit}
          />
        </form>
      </div>
    </div>
  )
}

export default Login
