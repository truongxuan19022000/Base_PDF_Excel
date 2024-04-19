import React, { useMemo, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';

import { ALERT, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config';
import { validatePermission } from 'src/helper/validation';
import { alertActions } from 'src/slices/alert';

import SelectNoteForm from '../SelectNoteForm';
import PriceInputForm from '../InputForm/PriceInputForm';

const NoteDragItem = ({
  note,
  index,
  moveNote,
  error = '',
  noteType = '',
  hasAmount = false,
  isEditable = false,
  isChangingNoteList = false,
  handleInputChange,
  handleAmountChange,
  handleClickOutAmount,
  handleDeleteNote,
  handleChangeType,
  handleOnKeydown,
  handleDragAndDropNote,
  actionList = QUOTATION.NOTE_ACTION
}) => {
  const dispatch = useDispatch();
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

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
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Action Failed',
            isHovered: false,
            description: MESSAGE.ERROR.UN_SAVE_CHANGED,
          }))
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
          {(isShowMoveIcon && isEditAllowed && isEditable) &&
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
            className="quotationNoteTable__td--textarea"
            value={note.description || ''}
            onKeyDown={(e) => handleOnKeydown(e, note.id)}
            onChange={(e) => handleInputChange(e, note.id)}
            readOnly={!isEditAllowed}
          />
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
          <PriceInputForm
            keyValue={note.id}
            inputValue={note.amount}
            placeholderTitle="0.00"
            handleAmountChange={handleAmountChange}
            handleClickOutAmount={handleClickOutAmount}
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
