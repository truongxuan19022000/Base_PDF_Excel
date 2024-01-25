import React from 'react'

import ReplyBox from '../ReplyBox'

const ContactTypeForm = ({
  message = {},
  customerInfo = {},
}) => {

  return (
    <div className="contacts">
      {message.reply_content && (
        <ReplyBox
          message={message}
          customerInfo={customerInfo}
        />
      )}
      {message.content?.contacts?.map((info, index) => (
        <div className="contactMessage" key={index}>
          <div className="contactMessage__left">
            <div className="contactMessage__left--label">
              <img src="/icons/user-id.svg" alt="user" width="60" height="60" />
            </div>
            <div className="contactMessage__info">
              <div className="contactMessage__info--name">{info?.name?.formatted_name || ''}</div>
              <div className="contactMessage__info--phone">
                {info?.phones?.map((phone, phoneIndex) => (
                  <div className="contactMessage__phone" key={phoneIndex}>
                    <span className="contactMessage__phone--icon">📱 </span>
                    <span className="contactMessage__phone--number">{phone?.phone || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="contactMessage__right">
            <div className="contactMessage__right--avatar">
              <img src="/icons/user.svg" alt="user" width="40" height="40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContactTypeForm
