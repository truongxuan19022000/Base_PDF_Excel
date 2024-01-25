import React, { memo, useMemo } from 'react';

import ReplyBox from '../ReplyBox';

const MediaTypeForm = ({
  message = {},
  customerInfo = {},
  preview = '',
}) => {
  const captionText = useMemo(() => {
    const caption = message.image_video?.caption || message.content?.image?.caption || message.content?.video?.caption
    if (caption) {
      return caption?.split('\n')
    }
    return []
  }, [message])

  const renderMediaContent = () => {
    const contentType = message.content?.type;
    const mediaContent = message.content[contentType];
    switch (contentType) {
      case 'image':
      case 'sticker':
        return (
          <img
            src={mediaContent?.link || URL.createObjectURL(preview)}
            alt={contentType}
          />
        );
      case 'video':
        const videoSource = preview ? URL.createObjectURL(preview) : mediaContent?.link || '';
        return (
          <video preload="metadata" controls="controls">
            <source
              src={videoSource}
              alt="message media"
              type="video/mp4"
            />
          </video>
        );
      default:
        return null;
    }
  };

  return (
    <div className="media">
      {message.reply_content && (
        <ReplyBox
          message={message}
          className="replyBox--media"
          customerInfo={customerInfo}
        />
      )}
      <div className="media__content">
        {renderMediaContent()}
      </div>
      {captionText.map((text, index) => (
        <div key={index} className="message__text">
          {text}
        </div>
      ))}
    </div>
  )
}

export default memo(MediaTypeForm)
