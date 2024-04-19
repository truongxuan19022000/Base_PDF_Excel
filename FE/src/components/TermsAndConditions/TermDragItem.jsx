import React, { useMemo, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';

import { MESSAGE, PERMISSION } from 'src/constants/config';
import { validatePermission } from 'src/helper/validation';

const TermDragItem = ({
  term,
  index,
  moveTerm,
  error = '',
  isTermChanged = false,
  setMessage,
  handleInputChange,
  handleDeleteTerm,
  handleOnKeydown,
  handleDragAndDrop,
}) => {
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false);
  const [isHoveredOnMoveIcon, setIsHoveredOnMoveIcon] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: isHoveredOnMoveIcon ? 'TERM' : '',
    item: { id: term.id, index },
  });

  const [, drop] = useDrop({
    accept: 'TERM',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        if (isTermChanged) {
          setMessage({ failed: MESSAGE.ERROR.UN_SAVE_CHANGED })
        } else {
          moveTerm(draggedItem.index, index);
          draggedItem.index = index;
        }
      }
    },
    drop: () => {
      if (!isTermChanged) {
        handleDragAndDrop(index);
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
            {(isShowMoveIcon && isEditAllowed) &&
              <div className="quotationNoteTable__td--move"
                onMouseEnter={() => setIsHoveredOnMoveIcon(true)}
                onMouseLeave={() => setIsHoveredOnMoveIcon(false)}
              >
                <img src="/icons/move-icon.svg" alt="move icon" />
              </div>
            }
            <textarea
              type="text"
              placeholder="Type Terms & Conditions..."
              className="quotationNoteTable__td--textarea"
              value={term.description || ''}
              onKeyDown={(e) => handleOnKeydown(e, term.id)}
              onChange={(e) => handleInputChange(e, term.id)}
            />
          </>
        </div>
      </td>
      <td className="quotationNoteTable__td--button">
        <div
          className="quotationNoteTable__td--delete"
          onClick={() => handleDeleteTerm(term.id)}
        >
          <img src="/icons/x-mark.svg" alt="x-mark" />
        </div>
      </td>
    </tr>
  );
};

export default TermDragItem
