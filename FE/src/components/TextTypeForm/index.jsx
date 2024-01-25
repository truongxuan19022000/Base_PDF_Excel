import React from 'react'

import { HIDDEN_MESSAGE_LENGTH } from 'src/constants/config'

import ReplyBox from '../ReplyBox'

const TextTypeForm = ({
  messageText = '',
  message = {},
  listText = [],
  customerInfo = {},
  expandedMessageIds = [],
  handleReadMore,
}) => {
  return (
    <div className="message__textWrapper">
      {message.reply_content && (
        <ReplyBox
          message={message}
          customerInfo={customerInfo}
        />
      )}
      {(messageText.length > HIDDEN_MESSAGE_LENGTH && !expandedMessageIds.includes(message.id)) ? (
        <>
          {listText?.map((text, index) => (
            <div key={index} className="message__text">
              {text}
              {listText.length - 1 === index && (
                <span style={{ marginLeft: '-4px' }}>...
                  <span className="message__button" onClick={() => handleReadMore(message.id)}>Read More</span>
                </span>
              )}
            </div>
          ))}
        </>
      ) : (
        <>
          {listText?.map((text, index) => (
            <div key={index} className="message__text">
              {text}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default TextTypeForm
