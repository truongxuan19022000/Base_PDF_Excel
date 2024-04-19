import React from 'react'

import { ACTIONS } from 'src/constants/config'

const TableButtons = ({
  data = {},
  clickChat,
  clickEdit,
  clickMail,
  clickCopy,
  clickDelete,
  clickDownLoad,
  isShowMail = false,
  isShowCopy = false,
  isTemplate = false,
  isShowEdit = false,
  isShowDelete = false,
  isInventory = false,
  haveWhatsApp = false,
  isShowDownLoad = false,
  idField = 'id',
}) => {
  return (
    <div className={`tableButtons${isTemplate ? ' tableButtons--template' : ''}`}>
      {isShowDelete && (
        <div
          className="tableButtons__icon"
          onClick={() => clickDelete(ACTIONS.NAME.DELETE, data?.[idField])}
        >
          <img
            src="/icons/delete.svg"
            alt="delete"
          />
        </div>
      )}
      {isShowEdit && (
        <div
          className="tableButtons__icon"
          onClick={() => clickEdit(isInventory ? data : data?.[idField])}
        >
          <img
            src="/icons/edit.svg"
            alt="edit"
          />
        </div>
      )}
      {haveWhatsApp && (
        <div
          className="tableButtons__icon"
          onClick={() => clickChat(data)}
        >
          <img
            src="/icons/chat-phone.svg"
            alt="chat-phone"
          />
        </div>
      )}
      {isShowDownLoad &&
        <div
          className="tableButtons__icon"
          onClick={() => clickDownLoad(data?.[idField])}
        >
          <img
            src="/icons/download.svg"
            alt="download"
          />
        </div>
      }
      {isShowCopy &&
        <div
          className="tableButtons__icon"
          onClick={() => clickCopy(data)}
        >
          <img
            src="/icons/copy.svg"
            alt="copy"
          />
        </div>
      }
      {isShowMail &&
        <div
          className="tableButtons__icon"
          onClick={() => clickMail(data)}
        >
          <img
            src="/icons/mail.svg"
            alt="mail"
          />
        </div>
      }
    </div>
  )
}

export default TableButtons
