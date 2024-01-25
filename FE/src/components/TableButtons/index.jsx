import React from 'react'

import { ACTIONS } from 'src/constants/config'

const TableButtons = ({
  data = {},
  clickChat,
  clickEdit,
  clickDelete,
  clickDownLoad,
  isTemplate = false,
  isShowEdit = false,
  isShowDelete = false,
  isInventory = false,
  haveWhatsApp = false,
  isShowDownLoad = false,
}) => {
  return (
    <div className={`tableButtons${isTemplate ? ' tableButtons--template' : ''}`}>
      {isShowDelete && (
        <div
          className="tableButtons__icon"
          onClick={() => clickDelete(ACTIONS.NAME.DELETE, data?.id)}
        >
          <img
            src="/icons/delete.svg"
            alt="delete"
          />
        </div>
      )}
      {isShowEdit && (
        <div
          className="tableButtons__icon tableButtons__icon--edit"
          onClick={() => clickEdit(isInventory ? data : data?.id)}
        >
          <img
            src="/icons/edit.svg"
            alt="edit"
          />
        </div>
      )}
      {haveWhatsApp && (
        <div
          className="tableButtons__icon tableButtons__icon--chat"
          onClick={() => clickChat(data)}
        >
          <img
            src="/icons/chat-phone.svg"
            alt="chat-phone"
          />
        </div>
      )}
      {isShowDownLoad && (
        <div
          className="tableButtons__icon tableButtons__icon--chat"
          onClick={() => clickDownLoad(data?.id)}
        >
          <img
            src="/icons/download.svg"
            alt="download"
          />
        </div>
      )}
    </div>
  )
}

export default TableButtons
