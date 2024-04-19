import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch } from 'react-redux';

import { ALERT, MESSAGE } from 'src/constants/config';
import { alertActions } from 'src/slices/alert';

import PriceInputForm from '../InputForm/PriceInputForm';

const DragOrderItem = ({
  order,
  index,
  moveOrder,
  handleInputChange,
  handleAmountChange,
  handleClickOutAmount,
  handleDeleteOrder,
  handleDragAndDrop,
  toggleShowMoveIcon,
  isHoveredOnMoveIcon = false,
  isChangingOrderList = false,
}) => {
  const dispatch = useDispatch();

  const [{ isDragging }, drag] = useDrag({
    type: isHoveredOnMoveIcon ? 'ORDER' : '',
    item: { id: order.id, index },
  });
  const [, drop] = useDrop({
    accept: 'ORDER',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        if (isChangingOrderList) {
          dispatch(alertActions.openAlert({
            type: ALERT.FAILED_VALUE,
            title: 'Action Failed',
            description: MESSAGE.ERROR.UN_SAVE_CHANGED,
          }))
        } else {
          moveOrder(draggedItem.index, index);
          draggedItem.index = index;
        }
      }
    },
    drop: () => {
      if (!isChangingOrderList) {
        handleDragAndDrop(index);
      }
    }
  });

  const handleClickOutQuantity = (orderId, field, value) => {
    const roundValue = parseFloat(value).toFixed(0)
    handleInputChange(orderId, field, roundValue)
  }

  return (
    <tr
      key={index}
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.6 : 1 }}
      onMouseEnter={() => toggleShowMoveIcon(true, index)}
      onMouseLeave={() => toggleShowMoveIcon(false, index)}
    >
      <td className="orderListTable__td">
        <div className="orderListTable__textBox orderListTable__textBox--code">
          <input
            type="text"
            value={order.item_code}
            className="purchaseOrderTable__input purchaseOrderTable__input--code"
            placeholder="Type item code"
            onChange={(e) => handleInputChange(order.id, 'item_code', e.target.value)}
          />
        </div>
      </td>
      <td className="orderListTable__td">
        <div className="orderListTable__textBox orderListTable__textBox--description">
          <input
            type="text"
            value={order.item_description}
            className="purchaseOrderTable__input"
            placeholder="Type item description"
            onChange={(e) => handleInputChange(order.id, 'item_description', e.target.value)}
          />
        </div>
      </td>
      <td className="orderListTable__td">
        <div className="orderListTable__textBox">
          <input
            type="text"
            value={order.quantity}
            className="purchaseOrderTable__input"
            placeholder="Type quantity"
            onBlur={(e) => handleClickOutQuantity(order.id, 'quantity', e.target.value)}
            onChange={(e) => handleInputChange(order.id, 'quantity', e.target.value)}
          />
        </div>
      </td>
      <td className="orderListTable__td">
        <div className="orderListTable__textBox orderListTable__textBox--unit">
          {order.unit_price &&
            <span>$</span>
          }
          <PriceInputForm
            keyValue={order.id}
            inputValue={order.unit_price}
            field="unit_price"
            placeholderTitle="$ 0.00"
            handleAmountChange={handleAmountChange}
            handleClickOutAmount={handleClickOutAmount}
          />
        </div>
      </td>
      <td className="orderListTable__td">
        <div className="orderListTable__textBox orderListTable__textBox--unit">
          {order.amount &&
            <span>$</span>
          }
          <PriceInputForm
            inputValue={order.amount}
            placeholderTitle="Amount"
            isDisabled={true}
          />
        </div>
      </td>
      <td className="orderListTable__td--button">
        <div
          className="orderListTable__td--delete"
          onClick={() => handleDeleteOrder(order.id)}
        >
          <img src="/icons/x-mark.svg" alt="x-mark" />
        </div>
      </td>
    </tr>
  );
};

export default DragOrderItem
