import React, { useState } from 'react'
import { useDispatch } from 'react-redux';

import { useMessageSlice } from 'src/slices/message';
import { EMOJI_BOX_SECTION } from 'src/constants/config';
import { validateSendMessage } from 'src/helper/validation';

const EmojiInfoBox = ({
  message = {},
  customerInfo = null,
  customerPhone = null,
  businessEmoji,
  customerEmoji,
  setMessageError,
}) => {
  const dispatch = useDispatch();
  const { actions } = useMessageSlice();

  const [currentSection, setCurrentSection] = useState(EMOJI_BOX_SECTION.ALL);

  const onSendSuccess = () => { }
  const onError = () => { }
  const handleRemoveEmoji = () => {
    const data = {
      type: 'reaction',
      emoji: '',
      phone_number: customerPhone,
      whatsapp_message_id: message?.whatsapp_message_id,
      id: message?.id
    };
    const errors = validateSendMessage(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.sendMessage({ ...data, onSendSuccess, onError }))
      setMessageError({})
    }
  }

  return (
    <div className="emojiInfo">
      <div className="emojiInfo__header">
        <div
          className={`emojiInfo__section ${currentSection === EMOJI_BOX_SECTION.ALL ? 'emojiInfo__section--active' : ''} `}
          onClick={() => setCurrentSection(EMOJI_BOX_SECTION.ALL)}
        >
          <p>All</p>
          {(businessEmoji && customerEmoji) ? '2' : '1'}
        </div>
        {businessEmoji &&
          <div
            className={`emojiInfo__section ${currentSection === EMOJI_BOX_SECTION.BUSINESS ? 'emojiInfo__section--active' : ''} `}
            onClick={() => setCurrentSection(EMOJI_BOX_SECTION.BUSINESS)}
          >
            <p>{businessEmoji}</p>
            <p>1</p>
          </div>
        }
        {customerEmoji &&
          <div
            className={`emojiInfo__section ${currentSection === EMOJI_BOX_SECTION.CUSTOMER ? 'emojiInfo__section--active' : ''} `}
            onClick={() => setCurrentSection(EMOJI_BOX_SECTION.CUSTOMER)}
          >
            <p>{customerEmoji}</p>
            <p>1</p>
          </div>
        }
      </div>
      {(businessEmoji && currentSection !== EMOJI_BOX_SECTION.CUSTOMER) &&
        <div className="emojiInfo__content emojiInfo__content--business" onClick={handleRemoveEmoji}>
          <div className="emojiInfo__contentBox">
            <img src="/images/customer.png" alt="customer" />
            <div className="emojiInfo__contentInner">
              <p className="emojiInfo__contentText emojiInfo__contentText--head">
                You
              </p>
              <p className="emojiInfo__contentText">
                Click to remove emoji
              </p>
            </div>
            <div className="emojiInfo__contentEmoji">
              <p>{businessEmoji}</p>
            </div>
          </div>
        </div>
      }
      {(customerEmoji && currentSection !== EMOJI_BOX_SECTION.BUSINESS) &&
        <div className="emojiInfo__content">
          <div className="emojiInfo__contentBox">
            <img src="/images/customer.png" alt="customer" />
            <div className="emojiInfo__contentInner">
              <p className="emojiInfo__contentText emojiInfo__contentText--head">
                {customerInfo?.phone_number}
              </p>
              <p className="emojiInfo__contentText">
                {customerInfo?.name}
              </p>
            </div>
            <div className="emojiInfo__contentEmoji">
              <p>{customerEmoji}</p>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default EmojiInfoBox
