import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { MESSAGE, QUOTATION } from 'src/constants/config';

import SelectNoteForm from '../SelectNoteForm';

const NoteDragItem = ({
  note,
  index,
  moveNote,
  error = '',
  noteType = '',
  hasAmount = false,
  isChangingNoteList = false,
  setMessage,
  handleInputChange,
  handleAmountChange,
  handleClickOutAmount,
  handleDeleteNote,
  handleChangeType,
  handleOnKeydown,
  handleDragAndDropNote,
  actionList = QUOTATION.NOTE_ACTION
}) => {
  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false);
  const [isHoveredOnMoveIcon, setIsHoveredOnMoveIcon] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: isHoveredOnMoveIcon ? 'NOTE' : '',
    item: { id: note.id, index },
  });
  const [, drop] = useDrop({
    accept: 'NOTE',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        if (isChangingNoteList) {
          setMessage({ failed: MESSAGE.ERROR.UN_SAVE_CHANGED })
        } else {
          moveNote(draggedItem.index, index);
          draggedItem.index = index;
        }
      }
    },
    drop: () => {
      if (!isChangingNoteList) {
        handleDragAndDropNote(index);
      }
    }
  });

  return (
    <tr
      key={index}
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.6 : 1 }}
      onMouseEnter={() => setIsShowMoveIcon(true)}
      onMouseLeave={() => setIsShowMoveIcon(false)}
    >
      <td className="quotationNoteTable__td quotationNoteTable__td--description">
        <div className="quotationNoteTable__td quotationNoteTable__td--description">
          {error &&
            <div className="quotationNoteTable__td--message">{error}</div>
          }
          <>
            {isShowMoveIcon &&
              <div className="quotationNoteTable__td--move"
                onMouseEnter={() => setIsHoveredOnMoveIcon(true)}
                onMouseLeave={() => setIsHoveredOnMoveIcon(false)}
              >
                <img src="/icons/move-icon.svg" alt="move icon" />
              </div>
            }
            <textarea
              type="text"
              placeholder="Type Information & Notes..."
              className="quotationNoteTable__td--input"
              value={note.description || ''}
              onKeyDown={(e) => handleOnKeydown(e, note.id)}
              onChange={(e) => handleInputChange(e, note.id)}
            />
          </>
        </div>
      </td>
      <td>
        <div>
          <SelectNoteForm
            noteId={note.id}
            selectedItem={noteType}
            actionList={actionList}
            handleChangeType={handleChangeType}
          />
        </div>
      </td>
      {hasAmount &&
        <td className="quotationNoteTable__td">
          <input
            type="text"
            value={note.amount}
            placeholder="0"
            onChange={(e) => handleAmountChange(e, note.id)}
            onBlur={() => handleClickOutAmount(note.id)}
          />
        </td>
      }
      <td className="quotationNoteTable__td--button">
        <div
          className="quotationNoteTable__td--delete"
          onClick={() => handleDeleteNote(note.id)}
        >
          <img src="/icons/x-mark.svg" alt="x-mark" />
        </div>
      </td>
    </tr>
  );
};

export default NoteDragItem
