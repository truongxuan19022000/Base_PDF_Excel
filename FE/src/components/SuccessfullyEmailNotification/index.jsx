import React, { useEffect, useState } from 'react'



import { TIMER } from 'src/constants/config'

const SuccessfullyEmailNotification = ({ handleResendEmail }) => {
  const [countdown, setCountdown] = useState(TIMER.BLOCK_RESEND_MAIL * 60)
  const [isDisableResend, setIsDisableResend] = useState(true)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsDisableResend(false)
    }
  }, [countdown])

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  const handleResendClick = (e) => {
    if (isDisableResend) {
      return
    }
    setIsDisableResend(true)
    handleResendEmail(e)
    setCountdown(TIMER.BLOCK_RESEND_MAIL * 60)
  }

  return (
    <div className="sendEmail">
      <div className="sendEmail__notice">
        <p>A password reset link has been sent to your email.</p>
        <p>Please check your inbox/spam folders.</p>
      </div>
      <div className="sendEmail__resend">
        Email not received?
      </div>
      <div className="sendEmail__timer mt-15">
        Time Remaining:
        <span
          className="sendEmail__count"
        >
          {' ' + minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </span>
        <span
          className={`sendEmail__url${isDisableResend ? ' sendEmail__url--disabled' : ''}`}
          onClick={handleResendClick}
        >
          Resend Email
        </span>
      </div>
    </div>
  )
}

export default SuccessfullyEmailNotification
