import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { messageActions as actions } from 'src/slices/message';

import * as api from '../api/message';
import { handleFormData } from 'src/helper/helper';

function* getConversationListSaga({ payload }) {
  try {
    const res = yield call(api.getConversationList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getConversationListSuccess(res.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getConversationWithCustomerIdSaga({ payload }) {
  try {
    const res = yield call(api.getConversationWithCustomerId, payload);
    if (res?.data?.status === 1) {
      const updatedInfo = {
        ...res.data?.data,
        customer_id: payload?.customer_id,
      }
      yield put(actions.getConversationWithCustomerIdSuccess(updatedInfo));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getMessageListSaga({ payload }) {
  try {
    const res = yield call(api.getMessageList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getMessageListSuccess(res.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* sendMessageSaga({ payload }) {
  try {
    const formData = handleFormData(payload)
    const res = yield call(api.sendMessage, formData);
    if (res?.data?.status === 1) {
      if (payload?.id) {
        yield put(actions.reactionSuccess(payload));
      } else {
        const newMessage = {
          ...res.data?.data,
          customer_id: +payload.customer_id,
          customer_name: payload.customer_name,
          customer_phone_number: payload.customer_phone_number,
          reply_sender: payload?.reply_sender,
          reply_content: payload?.reply_content,
          reaction_by_business: null,
          reaction_by_customer: null,
          starred: 0,
        }
        yield put(actions.sendMessageSuccess(newMessage));
      }
      if (payload?.onSendSuccess) {
        payload?.onSendSuccess(res.data?.message)
      }
    } else {
      const failedMessage = {
        ...payload,
        reply_sender: payload?.reply_sender,
        reply_content: payload?.reply_content,
        reaction_by_business: null,
        reaction_by_customer: null,
        starred: 0,
        status: 3,
      }
      yield put(actions.sendMessageFailed(failedMessage));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    const failedMessage = {
      ...payload,
      reply_sender: payload?.reply_sender,
      reply_content: payload?.reply_content,
      reaction_by_business: null,
      reaction_by_customer: null,
      starred: 0,
      status: 3,
    }
    yield put(actions.sendMessageFailed(failedMessage));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* multiDeleteMessageSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteMessage, payload);
    if (res?.data?.status === 1) {
      yield put(actions.multiDeleteMessageSuccess(payload));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* multiStarredMessageSaga({ payload }) {
  try {
    const res = yield call(api.multiStarredMessage, payload);
    if (res.data?.status === 1 && payload) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.multiStarredMessageSuccess(payload));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* cleanChatConversationSaga({ payload }) {
  try {
    const res = yield call(api.cleanChatConversation, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.cleanChatConversationSuccess(payload));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteChatConversationSaga({ payload }) {
  try {
    const res = yield call(api.deleteChatConversation, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.deleteChatConversationSuccess(payload));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getSearchConversationListSaga({ payload }) {
  try {
    const res = yield call(api.getConversationList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getSearchConversationListSuccess(res.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getStarredMessageListSaga({ payload }) {
  try {
    const res = yield call(api.getStarredMessageList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getStarredMessageListSuccess(res.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* unStarredAllMessagesSaga({ payload }) {
  try {
    const res = yield call(api.unStarredAllMessages, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.unStarredAllMessagesSuccess(res.data));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* pinChatConversationSaga({ payload }) {
  try {
    const res = yield call(api.pinChatConversation, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.pinChatConversationSuccess(payload));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getSearchedMessageListSaga({ payload }) {
  try {
    const res = yield call(api.getMessageList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const updatedData = {
        data: res.data.data.messages,
        messageId: payload.message_id,
      }
      yield put(actions.getSearchedMessageListSuccess(updatedData));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* messageSaga() {
  yield takeEvery(actions.sendMessage.type, sendMessageSaga);
  yield takeLatest(actions.getMessageList.type, getMessageListSaga);
  yield takeLatest(actions.multiDeleteMessage.type, multiDeleteMessageSaga);
  yield takeLatest(actions.multiStarredMessage.type, multiStarredMessageSaga);
  yield takeLatest(actions.getConversationList.type, getConversationListSaga);
  yield takeLatest(actions.cleanChatConversation.type, cleanChatConversationSaga);
  yield takeLatest(actions.deleteChatConversation.type, deleteChatConversationSaga);
  yield takeLatest(actions.getSearchConversationList.type, getSearchConversationListSaga);
  yield takeLatest(actions.getConversationWithCustomerId.type, getConversationWithCustomerIdSaga);
  yield takeLatest(actions.getStarredMessageList.type, getStarredMessageListSaga);
  yield takeLatest(actions.unStarredAllMessages.type, unStarredAllMessagesSaga);
  yield takeLatest(actions.pinChatConversation.type, pinChatConversationSaga);
  yield takeLatest(actions.getSearchedMessageList.type, getSearchedMessageListSaga);
}

export default messageSaga
