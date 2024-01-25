import React from 'react'

import { CHATS } from 'src/constants/config'

const ChatDialog = ({ handleSelectChatAction }) => {

  return (
    <div className="chatDialog">
      {CHATS.ACTIONS.CHATS.map((action, index) => (
        <div
          key={index}
          className="chatDialog__act"
          onClick={() => handleSelectChatAction(action)}
        >
          {action.label}
        </div>
      ))}
    </div>
  )
}

export default ChatDialog
