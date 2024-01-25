
import React from 'react';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { CDropdown, CDropdownMenu, CDropdownToggle } from '@coreui/react';
import { useDispatch } from 'react-redux';

import { validateSendMessage } from 'src/helper/validation';
import { useMessageSlice } from 'src/slices/message';

const EmojiBox = ({
  emojiList = [],
  currentEmoji = null,
  positionCurrentEmoji = 'right',
  customerPhone = null,
  message = {},
  setMessageError,
  setIsOpenEmojiBox,
}) => {
  const dispatch = useDispatch();
  const { actions } = useMessageSlice();

  const onSendSuccess = () => {

  }
  const onError = () => {

  }
  const handleSelectEmoji = (emoji) => {
    const data = {
      type: 'reaction',
      emoji: emoji === currentEmoji ? '' : emoji,
      phone_number: customerPhone,
      whatsapp_message_id: message.whatsapp_message_id,
      id: message.id
    };
    const errors = validateSendMessage(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.sendMessage({ ...data, onSendSuccess, onError }))
      setMessageError({})
    }
    setIsOpenEmojiBox(false)
  }
  const handleAddEmoji = (emoji) => {
    handleSelectEmoji(emoji)
  }

  const EmojiBox = () => {
    return (
      <div className="dropdown">
        <CDropdown>
          <CDropdownToggle className="dropdown__toggle" color="secondary" size="sm">
            <img
              src="/icons/input-plus.svg"
              alt="input-plus"
            />
          </CDropdownToggle>
          <CDropdownMenu className="dropdown__menu">
            <Picker theme="light" data={data} onEmojiSelect={(emoji) => handleSelectEmoji(emoji.native)} />
          </CDropdownMenu>
        </CDropdown>
      </div>
    )
  }

  return (
    <div className="emoji">
      {
        positionCurrentEmoji === 'left' &&
        <EmojiBox />
      }
      {emojiList?.map((item, index) => (
        <div
          key={index}
          className="emoji__icon"
          onClick={() => handleAddEmoji(item)}
        >
          {item}
        </div>
      ))}
      {
        positionCurrentEmoji === 'right' &&
        <EmojiBox />
      }
    </div>
  )
}

export default EmojiBox
