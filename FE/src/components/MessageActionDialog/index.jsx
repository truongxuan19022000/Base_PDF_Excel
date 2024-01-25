import React from 'react'



import { CHATS } from 'src/constants/config'

const MessageActionDialog = () => {

  return (
    <div className="messageActionDialog">
      {CHATS.ACTIONS.CHATS.map((item, index) => (
        <div key={index} className="messageActionDialog__act">
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default MessageActionDialog
