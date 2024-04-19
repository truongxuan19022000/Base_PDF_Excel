import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { formatPriceWithTwoDecimals, isSimilarObject, parseLocaleStringToNumber } from 'src/helper/helper';
import { ALERT, MESSAGE, ORDER, PURCHASE_ORDER_TAB, QUOTATION } from 'src/constants/config';
import { validateHandleNoteChange } from 'src/helper/validation';
import { usePurchaseSlice } from 'src/slices/purchase';
import { alertActions } from 'src/slices/alert';

import DragOrderItem from './DragOrderItem';

const OrderListTab = ({
  id,
  viewTab = '',
  orderData = [],
  resetAction,
  selectedAction = '',
  isEditMode = false,
}) => {
  const dispatch = useDispatch();
  const { actions } = usePurchaseSlice();

  const [orderList, setOrderList] = useState([]);
  const [messageErrors, setMessageErrors] = useState([]);
  const [isInputChanged, setIsInputChanged] = useState(false);
  const [isDisableSubmit, setIsDisableSubmit] = useState(true);
  const [isChangingOrderList, setIsChangingOrderList] = useState(false);

  const [topPosition, setTopPosition] = useState(0);
  const [isShowMoveIcon, setIsShowMoveIcon] = useState(false);
  const [isHoveredOnMoveIcon, setIsHoveredOnMoveIcon] = useState(false);

  const totalOrderOrder = useMemo(() => {
    const total = orderList.reduce((total, item) => {
      const amountValue = typeof item.amount === 'string' ? parseLocaleStringToNumber(item.amount) : item.amount;
      const amountNumber = +amountValue
      const amount = amountNumber || 0
      return total += +amount
    }, 0)
    return total
  }, [orderList])

  const onSuccess = () => {
    setIsDisableSubmit(false)
    setIsChangingOrderList(false)
    resetAction()
  }

  const onError = () => {
    setIsDisableSubmit(false)
    resetAction()
  }

  useEffect(() => {
    if (orderData && orderData.length > 0) {
      setOrderList(orderData.map(item => ({
        ...item,
        amount: formatPriceWithTwoDecimals(+item.quantity * +item.unit_price),
      })))
    }
  }, [orderData])

  useEffect(() => {
    if (selectedAction === QUOTATION.SAVE_AS_DRAFT && viewTab === PURCHASE_ORDER_TAB) {
      handleOrderChange()
      resetAction()
    }
  }, [selectedAction, viewTab])

  useEffect(() => {
    setIsDisableSubmit(false)
    setMessageErrors([])
  }, [isInputChanged])

  const handleInputChange = (orderId, field, value) => {
    const updatedOrderList = orderList.map(order => {
      if (order.id !== orderId) return order;

      let updatedOrder = { ...order };

      if (field === 'quantity') {
        if (!isNaN(value)) {
          updatedOrder[field] = value;
          const quantity = +value || 0;
          const unitPrice = typeof order.unit_price === 'string'
            ? parseLocaleStringToNumber(order.unit_price)
            : order.unit_price || 0;
          updatedOrder.amount = formatPriceWithTwoDecimals(quantity * unitPrice);
        }
      } else {
        updatedOrder[field] = value;
      }
      return updatedOrder;
    });

    setOrderList(updatedOrderList);
    setIsInputChanged(!isInputChanged);
    setMessageErrors([]);
    setIsChangingOrderList(true);
  };

  const handleAmountChange = (value, orderId, field) => {
    if (!isNaN(value)) {
      setOrderList(orderList.map(order =>
        order.id === orderId ? { ...order, [field]: value } : order
      ));
      setIsInputChanged(!isInputChanged);
      setIsChangingOrderList(true);
    }
  };

  const handleClickOutAmount = (e, orderId, field) => {
    setOrderList(orderList.map(order => {
      if (order.id !== orderId) return order;
      const fieldValue = parseLocaleStringToNumber(order?.[field]);
      const unitPrice = typeof order.unit_price === 'string'
        ? parseLocaleStringToNumber(order.unit_price)
        : order.unit_price || 0;
      const quantity = +order.quantity || 1;
      const newAmount = formatPriceWithTwoDecimals(quantity * unitPrice);
      return {
        ...order,
        [field]: formatPriceWithTwoDecimals(fieldValue),
        amount: newAmount,
      };
    }));
  };

  const handleDeleteOrder = useCallback((orderId) => {
    if (orderId) {
      setOrderList(orderList.filter(order => order.id !== orderId))
      setIsInputChanged(!isInputChanged);
      setIsChangingOrderList(true);
    }
  }, [isInputChanged, orderList]);

  const handleAddNewOrder = () => {
    const nextNumber = orderList.length + 1;
    const tempId = `new-${nextNumber}`
    const newItem = {
      id: tempId,
      item_code: '',
      quantity: '',
      item_description: '',
      unit_price: '',
      amount: '',
      order_number: nextNumber,
    }
    setOrderList([...orderList, newItem])
    setIsInputChanged(!isInputChanged);
    setIsChangingOrderList(true)
  }

  const handleDragAndDrop = () => {
    const updatedOrderDataOrder = [...orderList].map((order, index) => ({
      other_order_id: order.id,
      order_number: index + 1
    }));
    dispatch(actions.handleDragAndDrop({
      other_orders: updatedOrderDataOrder,
      onSuccess,
      onError,
    }));
  }

  const handleOrderChange = () => {
    if (isDisableSubmit || !id) return;
    if (isChangingOrderList) {

      const formatOrdersList = orderList.map(item => {
        const newData = { ...item }
        delete newData.created_at
        newData.amount = parseLocaleStringToNumber(newData.amount)
        return newData
      })

      const newItems = formatOrdersList
        .filter(order => orderData.every(oldItem => oldItem.id !== order.id))
        .map(item => ({
          ...item,
          quantity: +item.quantity,
          unit_price: parseLocaleStringToNumber(item.unit_price)
        }));

      const deletedIds = orderData
        .filter(oldItem => !formatOrdersList.find(order => +order.id === +oldItem.id))
        .map(item => item.id);

      const updatedItems = formatOrdersList.filter(order => {
        const initialOrder = orderData.find(initialOrder => initialOrder.id === order.id);
        return (
          initialOrder && !isSimilarObject(initialOrder, order)
        );
      }).map(item => ({
        ...item,
        quantity: +item.quantity,
        unit_price: parseLocaleStringToNumber(item.unit_price)
      }));

      const totalOrders = formatOrdersList.filter(order =>
        order.type === QUOTATION.ORDER_INCLUDE)
        .reduce((total, order) =>
          total + parseLocaleStringToNumber(order.amount), 0);

      const data = {
        purchase_order_id: +id,
        subtotal: totalOrders,
        create: newItems.map(({ id, ...rest }) => rest),
        update: updatedItems.map(({ amount, ...rest }) => rest),
        delete: deletedIds,
      };
      const errors = validateHandleNoteChange(data);
      if (errors.length > 0) {
        setMessageErrors(errors);
        resetAction()
      } else {
        dispatch(actions.handleOrderChange({ ...data, onSuccess, onError }));
        setMessageErrors([]);
        setIsDisableSubmit(true);
      }
    } else {
      resetAction()
      dispatch(alertActions.openAlert({
        type: ALERT.FAILED_VALUE,
        title: 'Action Failed',
        description:MESSAGE.ERROR.INFO_NO_CHANGE,
      }))
    }
  };

  const moveOrder = (fromIndex, toIndex) => {
    const updatedOrderList = [...orderList];
    const [removedOrder] = updatedOrderList.splice(fromIndex, 1);
    updatedOrderList.splice(toIndex, 0, removedOrder);
    setOrderList(updatedOrderList);
    setIsInputChanged(!isInputChanged);
  };

  const toggleShowMoveIcon = (value, index) => {
    setIsShowMoveIcon(value)
    setTopPosition(ORDER.START_POINT_MOVE_ICON + ORDER.ORDER_ROW_HEIGHT * index)
  }

  const renderOtherOrders = () => {
    return orderList.map((order, index) => {
      return (
        <DragOrderItem
          order={order}
          index={index}
          key={order.id}
          moveOrder={moveOrder}
          handleInputChange={handleInputChange}
          handleDeleteOrder={handleDeleteOrder}
          handleDragAndDrop={handleDragAndDrop}
          handleAmountChange={handleAmountChange}
          handleClickOutAmount={handleClickOutAmount}
          messageErrors={messageErrors}
          isChangingOrderList={isChangingOrderList}
          isHoveredOnMoveIcon={isHoveredOnMoveIcon}
          toggleShowMoveIcon={toggleShowMoveIcon}
        />
      )
    })
  };

  return (
    <div className={`orderList${isEditMode ? '' : ' orderList--create'}`}>
      <div className="orderList__table">
        <table className="orderListTable">
          <thead>
            <tr>
              <th className="orderListTable__th orderListTable__th--code">ITEM CODE</th>
              <th className="orderListTable__th orderListTable__th--description">ITEM DESCRIPTION</th>
              <th className="orderListTable__th orderListTable__th--quantity">QUANTITY</th>
              <th className="orderListTable__th orderListTable__th--unit">UNIT PRICE</th>
              <th className="orderListTable__th orderListTable__th--amount">AMOUNT</th>
              <th className="orderListTable__th orderListTable__th--actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderOtherOrders()}
            <tr>
              <td className="orderListTable__td orderListTable__td--total">TOTAL SUM</td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <b>$ {formatPriceWithTwoDecimals(+totalOrderOrder)}</b>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div
          className="orderList__button"
          onClick={handleAddNewOrder}
        >
          + Add Order
        </div>
      </div>
      {isShowMoveIcon &&
        <div
          className="orderList__move"
          style={{ top: `${topPosition}px` }}
          onMouseEnter={() => setIsHoveredOnMoveIcon(true)}
          onMouseLeave={() => setIsHoveredOnMoveIcon(false)}
        >
          <img src="/icons/move-icon.svg" alt="move icon" />
        </div>
      }
    </div>
  );
}

export default OrderListTab
