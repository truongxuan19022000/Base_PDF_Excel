import React, { memo } from 'react';

import ReplyBox from '../ReplyBox';

const AudioTypeForm = ({
  message = {},
  customerInfo = {},
}) => {
  return (
    <div className="audio">
      {message.reply_content && (
        <ReplyBox
          message={message}
          className="replyBox--audio"
          customerInfo={customerInfo}
        />
      )}
      {message.content?.type === 'audio' &&
        <audio preload="metadata" controls="controls" id="audioElement">
          <source
            src={message.content?.audio?.link || ''}
            alt="message audio"
            type="video/mp4"
          />
        </audio>
      }
    </div>
  )
}

export default memo(AudioTypeForm)
