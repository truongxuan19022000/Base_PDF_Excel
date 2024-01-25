import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { isSimilarObject } from 'src/helper/helper';
import { MESSAGE, QUOTATION } from 'src/constants/config';
import { useQuotationNoteSlice } from 'src/slices/quotationNote';
import { validateHandleNoteChange } from 'src/helper/validation';

import NoteDragItem from '../NoteDragItem';

const QuotationNote = ({
  id,
  notes = [],
  setMessage,
  resetAction,
  selectedAction = '',
}) => {
  const { actions } = useQuotationNoteSlice();
  const dispatch = useDispatch();

  const [noteList, setNoteList] = useState([])
  const [messageError, setMessageError] = useState([])
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(true)

  const [isChangingNoteList, setIsChangingNoteList] = useState(false);

  const onSuccess = () => {
    setMessage({ success: MESSAGE.SUCCESS.CHANGE })
    setIsDisableSubmit(true)
    setIsChangingNoteList(false)
  }

  const onError = () => {
    setIsDisableSubmit(true)
    setMessage({ failed: MESSAGE.ERROR.DEFAULT })
  }

  useEffect(() => {
    if (notes.length > 0) {
      setNoteList(notes)
    }
  }, [notes])

  useEffect(() => {
    if (notes.length > 0 && noteList.length > 0 && isSimilarObject(notes, noteList)) {
      setIsChangingNoteList(false)
    }
  }, [notes, noteList])

  useEffect(() => {
    if (selectedAction === 'draft') {
      handleNoteChange()
      resetAction()
    }
  }, [selectedAction])

  useEffect(() => {
    setIsDisableSubmit(false)
    setMessageError([])
  }, [isInputChanged])

  const handleInputChange = (e, noteId) => {
    setNoteList(noteList.map(note =>
      note.id === noteId ? { ...note, description: e.target.value } : note
    ))
    setIsInputChanged(!isInputChanged);
    setIsChangingNoteList(true)
  };

  const handleOnKeydown = (e, noteId) => {
    const value = e.target.value
    if (value?.length === 0) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setNoteList(noteList.map(note =>
        note.id === noteId ? { ...note, description: value } : note
      ))
      setIsInputChanged(!isInputChanged)
      setIsChangingNoteList(true)
    }
  }

  const handleChangeType = (noteId, value) => {
    const tempNotes = noteList.map(note =>
      note.id === noteId ? { ...note, type: value } : note
    )
    setNoteList(tempNotes)
    setIsInputChanged(!isInputChanged)
    setIsChangingNoteList(true)
  }

  const handleDeleteNote = useCallback((noteId) => {
    if (noteId) {
      setNoteList(noteList.filter(note => note.id !== noteId))
      setIsInputChanged(!isInputChanged);
      setIsChangingNoteList(true);
    }
  }, [isInputChanged, noteList, notes]);

  const handleAddNewNote = () => {
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
      setIsChangingNoteList(true)
    }
  }

  const handleDragAndDropNote = () => {
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
  }


  const handleNoteChange = () => {
    if (isDisableSubmit && !id) return;
    const newItems = noteList
      .filter(note => notes.every(oldItem => oldItem.id !== note.id));

    const deletedIds = notes
      .filter(oldItem => !noteList.find(note => +note.id === +oldItem.id))
      .map(item => item.id);

    const updatedItems = noteList.filter(note => {
      const initialNote = notes.find(initialNote => initialNote.id === note.id);
      return (
        initialNote && !isSimilarObject(initialNote, note)
      );
    });

    const data = {
      quotation_id: +id,
      create: newItems,
      delete: deletedIds,
      update: updatedItems,
    };

    const errors = validateHandleNoteChange(data);
    if (errors.length > 0) {
      setMessageError(errors);
    } else {
      dispatch(actions.handleQuotationNote({
        ...data,
        create: newItems.map(({ id, ...rest }) => rest),
        onSuccess,
        onError
      },
      ));
      setMessageError([]);
      setIsDisableSubmit(true);
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
          setMessage={setMessage}
          isChangingNoteList={isChangingNoteList}
          handleDragAndDropNote={handleDragAndDropNote}
        />
      )
    })
  };

  return (
    <div className="quotationNote">
      <div className="quotationNote__table">
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
