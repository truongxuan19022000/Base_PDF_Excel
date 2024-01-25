import React, { useMemo } from 'react'

import ReplyBox from '../ReplyBox';
import DownLoadSvg from '../Icons/DownloadSvg';

const DocumentTypeForm = ({
  message = {},
  customerInfo = {},
  handleDownloadFile
}) => {

  const captionText = useMemo(() => {
    const caption = message.content.document.caption || message.caption
    if (caption) {
      return caption?.split('\n')
    }
    return []
  }, [message])

  return (
    <>
      {message.reply_content && (
        <ReplyBox
          className="replyBox--document"
          message={message}
          customerInfo={customerInfo}
        />
      )}
      <div className="message__document">
        <img className="message__documentImage" src="/images/file.webp" alt="file" />
        <div className="message__documentName">
          {message.content?.document?.filename}
        </div>
        <div className="message__documentImage" onClick={handleDownloadFile}>
          <DownLoadSvg />
        </div>
      </div>
      {captionText.map((text, index) => (
        <div key={index} className="message__text">
          {text}
        </div>
      ))}
    </>
  )
}

export default DocumentTypeForm
