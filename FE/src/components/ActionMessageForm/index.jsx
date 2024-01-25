import React from 'react'
import { CAlert } from '@coreui/react'

const ActionMessageForm = ({
  successMessage = '',
  failedMessage = '',
}) => {
  return (
    <>
      {successMessage &&
        <CAlert className="actionMessageForm" color="success">
          {successMessage}
        </CAlert>
      }
      {failedMessage &&
        <CAlert className="actionMessageForm" color="danger">
          {failedMessage}
        </CAlert>
      }
    </>
  )
}

export default ActionMessageForm
