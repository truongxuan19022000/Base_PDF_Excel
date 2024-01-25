import React from 'react'
import Checkbox from '../Checkbox'

const PaymentRecord = () => {
  return (
    <div className="paymentRecord">
      <div className="paymentRecord__headline">Payment Record</div>
      <div className="paymentRecord__table">
        <table className="recordTable">
          <thead>
            <tr>
              <th>
                <Checkbox
                  isDisabled={true}
                />
              </th>
              <th>PAYMENT RECIEVED</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Checkbox
                  isDisabled={true}
                />
              </td>
              <td>
                <div className="recordTable__td">
                  <div className="recordTable__title">Payment made - </div>
                  <div className="recordTable__money">$ 4,000.00</div>
                </div>
              </td>
              <td>26 May 2023</td>
            </tr>
            <tr>
              <td>
                <Checkbox
                  isDisabled={true}
                />
              </td>
              <td>
                <div className="recordTable__td">
                  <div className="recordTable__title">Payment made - </div>
                  <div className="recordTable__money">$ 4,000.00</div>
                </div>
              </td>
              <td>26 May 2023</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="paymentRecord__buttons">
        <button>
          Send a Claim
        </button>
        <button>
          Remove Payment
        </button>
        <button>
          Edit Payment
        </button>
      </div>
    </div>
  )
}

export default PaymentRecord
