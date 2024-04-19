import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { alertActions } from 'src/slices/alert';
import { isSimilarObject } from 'src/helper/helper';
import { ALERT, MESSAGE, PERMISSION, QUOTATION } from 'src/constants/config';
import { validateHandleTermChange, validatePermission } from 'src/helper/validation';
import { useTermsConditionsSlice } from 'src/slices/termsConditions';

import TermDragItem from './TermDragItem';

const TermsAndConditions = ({
  id,
  viewTab = '',
  termsConditions = [],
  resetAction,
  isEditable = false,
  selectedAction = '',
}) => {
  const dispatch = useDispatch();
  const { actions } = useTermsConditionsSlice();

  const { fetched } = useSelector(state => state.termsConditions)
  const permissionData = useSelector(state => state.user.permissionData)

  const isEditAllowed = useMemo(() => {
    const isAllowed = validatePermission(permissionData, PERMISSION.KEY.QUOTATION, PERMISSION.ACTION.UPDATE)
    return isAllowed
  }, [permissionData])

  const [termList, setTermList] = useState([])
  const [messageErrors, setMessageErrors] = useState([])
  const [isTermsChanged, setIsTermsChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(false);

  const onSuccess = () => {
    setIsDisableSubmit(false)
    setIsTermsChanged(false)
    resetAction()
  }

  const onError = () => {
    setIsDisableSubmit(false)
    resetAction()
  }

  useEffect(() => {
    if (id && !fetched) {
      dispatch(actions.getTermsConditions({ quotation_id: +id }))
    }
  }, [id, fetched])

  useEffect(() => {
    termsConditions && setTermList(termsConditions)
  }, [termsConditions])

  useEffect(() => {
    if (termsConditions.length > 0 && termList.length > 0 && !isSimilarObject(termsConditions, termList)) {
      setIsTermsChanged(true)
    } else {
      setIsTermsChanged(false)
    }
  }, [termsConditions, termList])

  useEffect(() => {
    if (selectedAction === QUOTATION.SAVE_AS_DRAFT && viewTab === QUOTATION.TAB_LABEL.TERMS_CONDITIONS) {
      handleTermChange()
    }
  }, [selectedAction, viewTab])

  const dispatchAlertWithPermissionDenied = () => {
    dispatch(alertActions.openAlert({
      type: ALERT.FAILED_VALUE,
      title: 'Action Deny',
      description: MESSAGE.ERROR.AUTH_ACTION,
    }));
  };

  const handleInputChange = (e, termId) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      setTermList(termList.map(term =>
        term.id === termId ? {
          ...term,
          description: e.target.value,
        } : term
      ))
      setMessageErrors([]);
    } else {
      dispatchAlertWithPermissionDenied()
    }
  };

  const handleOnKeydown = (e, termId) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      const value = e.target.value
      if (value?.length === 0) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        setTermList(termList.map(term =>
          term.id === termId ? { ...term, description: value } : term
        ))
        setMessageErrors([])
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDeleteTerm = useCallback((termId) => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (termId) {
        setTermList(termList.filter(term => term.id !== termId))
        setMessageErrors([]);
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }, [termList, isEditable, isEditAllowed]);

  const handleAddNewTerm = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      if (id) {
        const nextNumber = termList.length + 1;
        const tempId = `new-${nextNumber}`
        const newItem = {
          id: tempId,
          description: '',
          quotation_id: +id,
          order_number: nextNumber,
        }
        setTermList([...termList, newItem])
        setMessageErrors([]);
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleDragAndDropTerm = () => {
    if (isEditAllowed) {
      if (!isEditable) return;
      const updatedTermsConditionsOrder = [...termList].map((term, index) => ({
        term_condition_id: term.id,
        order_number: index + 1
      }));
      dispatch(actions.handleDragAndDrop({
        term_conditions: updatedTermsConditionsOrder,
        termList: termList,
        onSuccess,
        onError,
      }));
    } else {
      dispatchAlertWithPermissionDenied()
    }
  }

  const handleTermChange = () => {
    if(isEditAllowed){
      if (isDisableSubmit || !id || !isEditable) return;
      if (isTermsChanged) {
        const formatTermsList = termList.map(item => {
          const newData = { ...item }
          delete newData.created_at
          return newData
        })
        const newItems = formatTermsList
          .filter(term => termsConditions.every(oldItem => oldItem.id !== term.id));
        const deletedIds = termsConditions
          .filter(oldItem => !formatTermsList.find(term => +term.id === +oldItem.id))
          .map(item => item.id);
        const updatedItems = formatTermsList.filter(term => {
          const initialTerm = termsConditions.find(initialTerm => initialTerm.id === term.id);
          return (
            initialTerm && !isSimilarObject(initialTerm, term)
          );
        });
        const data = {
          quotation_id: +id,
          create: newItems,
          delete: deletedIds,
          update: updatedItems,
        };
        const errors = validateHandleTermChange(data);
        if (errors.length > 0) {
          setMessageErrors(errors);
          resetAction()
        } else {
          dispatch(actions.handleTermsConditions({
            ...data,
            create: newItems.map(({ id, ...rest }) => rest),
            onSuccess,
            onError
          }));
          setMessageErrors([]);
          setIsDisableSubmit(true);
        }
      } else {
        resetAction()
        dispatch(alertActions.openAlert({
          type: ALERT.FAILED_VALUE,
          title: 'Action Failed',
          description: MESSAGE.ERROR.INFO_NO_CHANGE,
        }))
      }
    } else {
      dispatchAlertWithPermissionDenied()
    }
  };

  const moveTerm = (fromIndex, toIndex) => {
    if (!isEditable) return;
    const updatedTermList = [...termList];
    const [removedNote] = updatedTermList.splice(fromIndex, 1);
    updatedTermList.splice(toIndex, 0, removedNote);
    setTermList(updatedTermList);
    setMessageErrors([]);
  };

  const renderOtherFees = () => {
    return termList.map((term, index) => {
      const error = messageErrors.find(message => message.id === term.id)?.message;
      return (
        <TermDragItem
          term={term}
          key={index}
          index={index}
          error={error}
          isTermsChanged={isTermsChanged}
          moveTerm={moveTerm}
          handleOnKeydown={handleOnKeydown}
          handleDeleteTerm={handleDeleteTerm}
          handleInputChange={handleInputChange}
          handleDragAndDrop={handleDragAndDropTerm}
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
              <th className="quotationNoteTable__th quotationNoteTable__th--actions">
                <div className="quotationNoteTable__th--actions">ACTIONS</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {renderOtherFees()}
          </tbody>
        </table>
        <div
          className="quotationNote__button"
          onClick={handleAddNewTerm}
        >
          + Add T&C
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions
