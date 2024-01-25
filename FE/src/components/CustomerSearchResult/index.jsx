import React from 'react';

const CustomerSearchResult = ({
  customer = null
}) => {

  return (
    <div className="customerResult">
      <div className="customerResult__left">
        <img src="/images/customer.png" alt={customer?.name} />
      </div>
      <div className="customerResult__right">
        <div className="customerResult__info">
          <div className="customerResult__info--name">{customer?.name}</div>
        </div>
        <div className="customerResult__detail">
          <div className="customerResult__detail--text">{customer?.phone_number}</div>
        </div>
      </div>
    </div>
  )
}

export default CustomerSearchResult
