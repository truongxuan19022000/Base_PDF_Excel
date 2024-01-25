import React, { useEffect, useMemo, useState } from 'react'

import { CHATS } from 'src/constants/config'
import { formatDuration, formatPhoneNumber } from 'src/helper/helper';

const ReplyBox = ({
  message = {},
  className = '',
  customerInfo = {},
  isInputting = false,
}) => {
  const [replyContent, setReplyContent] = useState({})
  const [audioDuration, setAudioDuration] = useState(0);

  const isCustomer = useMemo(() => {
    return message?.reply_sender === CHATS.SENDER.IS_CUSTOMER;
  }, [message]);

  useEffect(() => {
    if (isInputting) {
      if (message?.content && typeof message?.content === 'object') {
        setReplyContent(message?.content);
      }
    } else {
      if (typeof message?.reply_content === 'string') {
        const parsedMessage = JSON.parse(message?.reply_content);
        setReplyContent(parsedMessage);
      } else {
        setReplyContent(message?.reply_content)
      }
    }
  }, [message, isInputting]);

  useEffect(() => {
    if (replyContent?.audio) {
      const audioElement = document.getElementById('audioElement');
      const handleLoadedMetadata = () => {
        setAudioDuration(audioElement?.duration);
      }
      if (audioElement) {
        audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
      return () => {
        if (audioElement) {
          audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, [replyContent?.audio?.link]);

  const renderReplyBody = () => {
    switch (replyContent?.type) {
      case 'video':
        return <div className="replyInfo__body--item">🎬 {replyContent?.video?.caption || 'Video'}</div>;
      case 'image':
        return <div className="replyInfo__body--item">📷 {replyContent?.image?.caption || 'Image'}</div>;
      case 'document':
      case 'application':
        return <div className="replyInfo__body--item">📁 {replyContent?.document?.filename || 'Document'}</div>;
      case 'text':
        return <div className="replyInfo__body--item">{replyContent?.text?.body || ''}</div>;
      case 'audio':
        return (
          <div className="replyInfo__body--item">
            🎧 <span>{formatDuration(audioDuration)}</span> Audio
            <audio preload="metadata" controls="controls" id="audioElement" style={{ display: 'none' }}>
              <source
                src={replyContent?.audio?.link || ''}
                alt="message audio"
                type="audio/mpeg"
              />
            </audio>
          </div>
        );
      case 'sticker':
        return (
          <div className="contactReply__sticker">
            <img src="/icons/sticker.svg" alt="sticker" width="18" height="18" /> Sticker
          </div>
        );
      case 'contacts':
        return (
          <div>
            {replyContent?.contacts?.map((info, contactIndex) => (
              <div className="contactReply" key={contactIndex}>
                <div className="contactReply__innerBox">
                  <div className="contactReply__innerBox--label">
                    <img src="/icons/user-id.svg" alt="user" width="40" height="40" />
                  </div>
                  <div className="contactReply__info">
                    <div className="contactReply__info--name">{info?.name?.formatted_name || ''}</div>
                    <div className="contactReply__info--phone">
                      {info?.phones?.map((phone, phoneIndex) => (
                        <div className="contactReply__phone" key={phoneIndex}>
                          <span className="contactReply__phone--icon">📱 </span>
                          <span className="contactReply__phone--number">{phone?.phone || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderBodyPreview = () => {
    switch (replyContent?.type) {
      case 'image':
        return (
          <div className="replyBox__right--item">
            <img
              src={replyContent?.image_video ?
                (URL.createObjectURL(replyContent?.image_video) || '') :
                (replyContent?.image?.link || '')}
              alt="message media"
            />
          </div>
        )
      case 'video':
        return (
          <div className="replyBox__right--item">
            <video preload="metadata">
              <source
                src={message?.image_video ?
                  (URL.createObjectURL(message?.image_video) || '') :
                  (replyContent?.video?.link || '')}
                alt="message media"
                type="video/mp4"
              />
            </video>
          </div>
        )
      default:
        return null;
    }
  }

  return (
    <div className={`replyBox${' ' + className}${isCustomer ? ' replyBox__borderCustomer' : ''}`}>
      <div className="replyBox__left">
        <div className="replyOwner">
          <div className="replyOwner__info">
            {isCustomer ? (
              <div className="replyOwner__owner">
                <div className="replyOwner__owner--phone">{'+' + formatPhoneNumber(customerInfo?.phone_number)}</div>
                <div className="replyOwner__owner--name">{'~' + customerInfo?.name || ''}</div>
              </div>
            ) : (
              <div className="replyOwner__owner">You</div>
            )}
          </div>
        </div>
        <div className="replyInfo">
          <div className="replyInfo__body">
            {renderReplyBody()}
          </div>
        </div>
      </div>
      <div className="replyBox__right">
        {renderBodyPreview()}
      </div>
    </div>
  )
}

export default ReplyBox
