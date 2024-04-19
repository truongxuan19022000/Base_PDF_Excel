import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { isSimilarObject } from 'src/helper/helper';
import { ALERT, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config';
import { useQuotationNoteSlice } from 'src/slices/quotationNote';
import { validateHandleNoteChange, validatePermission } from 'src/helper/validation';
import { alertActions } from 'src/slices/alert';

import NoteDragItem from '../NoteDragItem';

const QuotationNote = ({
  id,
  originalNoteList = [],
  resetAction,
  viewTab = '',
  isEditable = false,
  selectedAction = '',
}) => {
  const dispatch = useDispatch();

  const { actions } = useQuotationNoteSlice();
  const { actions: quotationNoteActions } = useQuotationNoteSlice();

  const { fetched } = useSelector(state => state.quotationNote)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [noteList, setNoteList] = useState([])
  const [messageError, setMessageError] = useState([])
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(true)
  const [isInfoChanged, setIsInfoChanged] = useState(false);

  const onSuccess = () => {
    setIsDisableSubmit(false)
    setIsInfoChanged(false)
  }

  const onError = () => {
    setIsDisableSubmit(false)
  }

  useEffect(() => {
    if (id && !fetched) {
      dispatch(quotationNoteActions.getQuotationNotes({ quotation_id: +id }))
    }
  }, [id, fetched])

  useEffect(() => {
    if (originalNoteList.length > 0) {
      setNoteList(originalNoteList)
    }
  }, [originalNoteList])

  useEffect(() => {
    if (originalNoteList.length > 0 && noteList.length > 0 && isSimilarObject(originalNoteList, noteList)) {
      setIsInfoChanged(false)
    } else {
      setIsInfoChanged(true)
    }
  }, [originalNoteList, noteList])

  useEffect(() => {
    if (selectedAction === QUOTATION.SAVE_AS_DRAFT && viewTab === QUOTATION.TAB_LABEL.NOTES) {
      handleNoteChange()
      resetAction()
    }
  }, [selectedAction, viewTab])

  useEffect(() => {
    setIsDisableSubmit(false)
    setMessageError([])
  }, [isInputChanged])

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleInputChange = (e, noteId) => {
    if (!isEditable) return;
    setNoteList(noteList.map(note =>
      note.id === noteId ? { ...note, description: e.target.value } : note
    ))
    setIsInputChanged(!isInputChanged);
  };

  const handleOnKeydown = (e, noteId) => {
    if (!isEditable) return;
    const value = e.target.value
    if (value?.length === 0) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setNoteList(noteList.map(note =>
        note.id === noteId ? { ...note, description: value } : note
      ))
      setIsInputChanged(!isInputChanged)
    }
  }

  const handleChangeType = (noteId, value) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      const tempNotes = noteList.map(note =>
        note.id === noteId ? { ...note, type: value } : note
      )
      setNoteList(tempNotes)
      setIsInputChanged(!isInputChanged)
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDeleteNote = useCallback((noteId) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (noteId) {
        setNoteList(noteList.filter(note => note.id !== noteId))
        setIsInputChanged(!isInputChanged);
        setIsInfoChanged(true);
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }, [isInputChanged, noteList]);

  const handleAddNewNote = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (id) {
        const nextNumber = noteList.length + 1;
        const tempId = `new-${nextNumber}`
        const newItem = {
          id: tempId,
          description: '',
          quotation_id: +id,
          order: nextNumber,
          type: QUOTATION.DEFAULT_NOTE_TYPE,
        }
        setNoteList([...noteList, newItem])
        setIsInputChanged(!isInputChanged);
        setIsInfoChanged(true)
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDragAndDropNote = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (id) {
        const updatedNoteListOrder = [...noteList].map((note, index) => ({
          ...note,
          order: index + 1
        }));
        dispatch(actions.handleDragAndDropNote({
          quotation_id: +id,
          update: updatedNoteListOrder,
          create: [],
          delete: [],
          onSuccess,
          onError,
        }));
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const prepareData = () => {
    const newItems = noteList.filter(note => originalNoteList.every(oldItem => oldItem.id !== note.id));
    const deletedIds = originalNoteList.filter(oldItem => !noteList.find(note => +note.id === +oldItem.id)).map(item => item.id);
    const updatedItems = noteList.filter(note => {
      const initialNote = originalNoteList.find(initialNote => initialNote.id === note.id);
      return (initialNote && !isSimilarObject(initialNote, note));
    });
    return {
      quotation_id: +id,
      create: newItems,
      delete: deletedIds,
      update: updatedItems,
    };
  };

  const handleNoteChange = () => {
    if (isEditAllowed) {
      if ((isDisableSubmit && !id) || !isEditable) return;
      if (!isInfoChanged) {
        resetAction()
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          isHovered: false,
          description: MESSAGE.ERROR.INFO_NO_CHANGE,
        }))
        return;
      }
      const data = prepareData();
      const errors = validateHandleNoteChange(data);
      if (errors.length > 0) {
        setMessageError(errors);
      } else {
        dispatch(actions.handleQuotationNote({
          ...data,
          create: data.create.map(({ id, ...rest }) => rest),
          onSuccess,
          onError
        },
        ));
        setMessageError([]);
        setIsDisableSubmit(true);
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  };

  const moveNote = (fromIndex, toIndex) => {
    const updatedNoteList = [...noteList];
    const [removedNote] = updatedNoteList.splice(fromIndex, 1);
    updatedNoteList.splice(toIndex, 0, removedNote);
    setNoteList(updatedNoteList);
    setIsInputChanged(!isInputChanged);
  };

  const renderNotes = () => {
    return noteList.map((note, index) => {
      const type = QUOTATION.NOTE_ACTION[note.type];
      const error = messageError.find(message => message.id === note.id)?.message;
      return (
        <NoteDragItem
          note={note}
          index={index}
          key={note.id}
          moveNote={moveNote}
          handleInputChange={handleInputChange}
          handleDeleteNote={handleDeleteNote}
          handleChangeType={handleChangeType}
          handleOnKeydown={handleOnKeydown}
          error={error}
          noteType={type}
          noteList={noteList}
          isEditable={isEditable}
          isInfoChanged={isInfoChanged}
          handleDragAndDropNote={handleDragAndDropNote}
        />
      )
    })
  };

  return (
    <div className="quotationNote">
      <div className="quotationNote__table">
        <div className='quotationNote__divider'></div>
        <table className="quotationNoteTable">
          <thead>
            <tr>
              <th className="quotationNoteTable__th ">
                <div className="quotationNoteTable__th--description">
                  DESCRIPTION
                </div>
              </th>
              <th className="quotationNoteTable__th quotationNoteTable__th--type">
                <div className="quotationNoteTable__th--type">TYPE</div>
              </th>
              <th className="quotationNoteTable__th quotationNoteTable__th--actions">
                <div className="quotationNoteTable__th--actions">ACTIONS</div>
              </th>
            </tr>
          </thead>
          <tbody>{renderNotes()}</tbody>
        </table>
        <div
          className="quotationNote__button"
          onClick={handleAddNewNote}
        >
          + Add Notes
        </div>
      </div>
    </div>
  );
};

export default QuotationNote;
