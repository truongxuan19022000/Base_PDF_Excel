import React from 'react';

import { CHATS } from 'src/constants/config';

import StarSvg from '../Icons/StarSvg';
import TextTypeForm from '../TextTypeForm';
import AudioTypeForm from '../AudioTypeForm';
import MediaTypeForm from '../MediaTypeForm';
import ContactTypeForm from '../ContactTypeForm';
import DocumentTypeForm from '../DocumentTypeForm';
import MessageActionDialog from '../MessageActionDialog';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';

const MessageItemForm = ({
  status = {},
  message = {},
  listText = [],
  captionText = [],
  customerInfo = {},
  expandedMessageIds = [],
  messageText = '',
  formattedTime = '',
  isStarred = false,
  isSelectedMsg = false,
  isShowMessageDialog = false,
  handleReadMore,
  handleDownloadFile,
  setIsShowMessageDialog,
}) => {
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
      case 'application':
        return (
          <DocumentTypeForm
            message={message}
            customerInfo={customerInfo}
            handleDownloadFile={handleDownloadFile}
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
            expandedMessageIds={expandedMessageIds}
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
            expandedMessageIds={expandedMessageIds}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className={`message__boxInner${isSelectedMsg ? ' message__boxInner--found' : ''}${message.content?.type === 'sticker' ? ' message__boxInner--sticker' : ''}`}>
      {message.content?.forwarded === CHATS.FORWARDED && (
        <div className="message__forward">
          <img src="/icons/forward.svg" alt="forward" width="15" height="15" /> Forwarded
        </div>
      )}
      {renderContent()}
      <div className="message__textTime message__textTime--message">
        {isStarred && (
          <span className="message__textTime--star">
            <StarSvg />
          </span>
        )}
        <p className="message__textTime--dateMessage">{formattedTime}</p>
        <div className="message__textTime--status">{status?.icon}</div>
      </div>
      {isShowMessageDialog && (
        <ClickOutSideWrapper onClickOutside={() => setIsShowMessageDialog(false)}>
          <div className="message__dialog">
            <MessageActionDialog />
          </div>
        </ClickOutSideWrapper>
      )}
    </div>
  )
}

export default MessageItemForm
