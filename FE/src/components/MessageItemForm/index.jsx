import React, { memo, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';

import { ALERT, CHATS, HIDDEN_MESSAGE_LENGTH } from 'src/constants/config';
import { downloadFile } from 'src/helper/helper';
import { alertActions } from 'src/slices/alert';

import StarSvg from '../Icons/StarSvg';
import TextTypeForm from '../TextTypeForm';
import AudioTypeForm from '../AudioTypeForm';
import MediaTypeForm from '../MediaTypeForm';
import ContactTypeForm from '../ContactTypeForm';
import DocumentTypeForm from '../DocumentTypeForm';
import MessageActionDialog from '../MessageActionDialog';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';

const MessageItemForm = ({
  message = {},
  customerInfo = {},
  isStarred = false,
  isSelectedMsg = false,
  isShowMessageDialog = false,
  setIsShowMessageDialog,
}) => {
  const dispatch = useDispatch()

  const status = CHATS.STATUS?.find(status => +status.value === +message.status) || null;
  const formattedTime = message.created_at ? dayjs(message.created_at).format('HH:mm') : '';
  const messageText = message.content?.text?.body

  const [isDownloading, setIsDownloading] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState([]);

  const slicedText = useMemo(() => {
    if (messageText?.length > HIDDEN_MESSAGE_LENGTH && !expandedMessageIds.includes(message.id)) {
      return messageText.slice(0, HIDDEN_MESSAGE_LENGTH);
    } else {
      return messageText;
    }
  }, [messageText, expandedMessageIds, message]);
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

  const handleReadMore = (messageId) => {
    setExpandedMessageIds((prevExpanded) => [...prevExpanded, messageId]);
  };

  const handleClickDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const file = {
      fileName: message.content?.document?.filename,
      url: message.content?.document?.link || message.content?.document?.url,
    }

    downloadFile(file)
      .then(() => { })
      .catch((error) => {
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Download Failed',
          description: error,
        }));
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

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
            handleDownloadFile={handleClickDownload}
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

export default memo(MessageItemForm)
