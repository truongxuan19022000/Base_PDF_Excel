import React, { useMemo } from 'react';

import { CHATS, HIDDEN_UN_STARRED_MESSAGE_LENGTH } from 'src/constants/config';

import StarSvg from '../Icons/StarSvg';
import TextTypeForm from '../TextTypeForm';
import AudioTypeForm from '../AudioTypeForm';
import MediaTypeForm from '../MediaTypeForm';
import DocumentTypeForm from '../DocumentTypeForm';
import ContactTypeForm from '../ContactTypeForm';

const StarredItemForm = ({
  status = {},
  message = {},
  customerInfo = {},
  className = '',
  formattedTime = '',
}) => {
  const messageText = message.content?.text?.body || ''
  const isAdmin = message.sender === 0

  const slicedText = useMemo(() => {
    if (messageText.length > HIDDEN_UN_STARRED_MESSAGE_LENGTH) {
      return messageText.slice(0, HIDDEN_UN_STARRED_MESSAGE_LENGTH) + '...';
    } else {
      return messageText;
    }
  }, [messageText]);

  const listText = useMemo(() => {
    if (slicedText) {
      return slicedText?.split('\n');
    }
    return [];
  }, [slicedText]);

  const captionText = useMemo(() => {
    const caption = message.image_video?.caption || message.content?.image?.caption || message.content?.video?.caption
    if (caption) {
      return caption?.split('\n')
    }
    return []
  }, [message])

  const handleReadMore = () => {
  }

  const renderContent = () => {
    switch (message.content?.type) {
      case 'image':
      case 'video':
      case 'image_video':
      case 'sticker':
        return (
          <MediaTypeForm
            message={message}
            media={message.content}
            customerInfo={customerInfo}
            captionText={captionText}
            preview={message.image_video}
          />
        );
      case 'audio':
        return (
          <AudioTypeForm
            message={message}
            customerInfo={customerInfo}
          />
        );
      case 'document':
        return (
          <DocumentTypeForm
            message={message}
            customerInfo={customerInfo}
          />
        );
      case 'text':
        return (
          <TextTypeForm
            message={message}
            listText={listText}
            messageText={messageText}
            customerInfo={customerInfo}
            handleReadMore={handleReadMore}
          />
        );
      case 'contacts':
        return (
          <ContactTypeForm
            message={message}
            listText={listText}
            messageText={messageText}
            customerInfo={customerInfo}
            handleReadMore={handleReadMore}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`message__boxInner${' message__boxInner--' + className}${isAdmin ? ' message__boxInner--admin' : ' message__boxInner--user'}${message.content?.type === 'sticker' ? ' message__boxInner--stickerS' : ''}`}>
      {message.content?.forwarded === CHATS.FORWARDED && (
        <div className="message__forward">
          <img src="/icons/forward.svg" alt="forward" width="15" height="15" /> Forwarded
        </div>
      )}
      {renderContent()}
      <div className="message__textTime">
        <span className="message__textTime--star">
          <StarSvg />
        </span>
        <p className="message__textTime--dateStar">{formattedTime}</p>
        <div className="message__textTime--status">{status.icon}</div>
      </div>
    </div>
  )
}

export default StarredItemForm
