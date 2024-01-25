import React from 'react'



const customersFake = [
  { name: 'Mike Hussy', image: '/images/user-1.webp', message: 'Hey how are you?', receivedAt: '03 Apr 2022 10:30' },
  { name: 'Jose Wilson', image: '/images/user-2.webp', message: 'Hey how are you?', receivedAt: '03 Apr 2022 10:30' },
  { name: 'Angelina Dolly', image: '/images/user-3.webp', message: 'Hey how are you?', receivedAt: '03 Apr 2022 10:30' },
]

const MessageBox = () => {
  return (
    <div className="messageBox">
      <div className="messageBox__header">
        <div className="messageBox__left">
          <div className="messageBox__title">Message</div>
          <div className="messageBox__notice">You have 10 unread message</div>
        </div>
        <div className="messageBox__right">
          <img src="/icons/circle-plus.svg" alt="add-icon" />
        </div>
      </div>
      <div className="messageBox__body">
        {customersFake.map((item, index) => (
          <div key={index} className="chatBox">
            <div className="chatBox__left">
              <img src={item.image} alt={item.name} />
              <div className="chatBox__info">
                <div className="chatBox__name">{item.name}</div>
                <div className="chatBox__message">{item.message}</div>
                <div className="chatBox__time">{item.receivedAt}</div>
              </div>
            </div>
            <div className="chatBox__right">
              <img src="/icons/email-gray.svg" alt="email" />
            </div>
          </div>
        ))}
      </div>
      <div className="messageBox__footer">
        <button>
          View All Messages
        </button>
      </div>
    </div>
  )
}

export default MessageBox
