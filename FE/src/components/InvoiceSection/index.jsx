import React, { useState } from 'react'
import Sort from '../Sort'
import Checkbox from '../Checkbox'

const InvoiceSection = () => {
  const [isShowDetail, setIsShowDetail] = useState(true)
  const [isShowProductModal, setIsShowProductModal] = useState(false)

  const handleShowDetailProductModal = () => {
    setIsShowProductModal(!isShowProductModal)
  }

  const handleShowDetailInvoice = (idInvoice) => {
    if (idInvoice) {
      setIsShowDetail(!isShowDetail)
    }
  }

  return (
    <div className="invoiceSection">
      <div className="invoiceSection__body">
        <div className="invoiceItem">
          <div className="invoiceItem__action">
            <div
              className="invoiceItem__name"
              onClick={() => handleShowDetailInvoice(1)}
            >
              <Sort
                isSorted={true}
                isHidden={true}
                isShow={isShowDetail}
              />
              <Checkbox
                isDisabled={true}
              />
              <span>
                Aluminium framed glazed sliding door in Euro Profile
              </span>
            </div>
          </div>
          <div className="invoiceItem__table">
            <table className='detailTable'>
              <thead>
                <tr>
                  <th>PRODUCT CODE</th>
                  <th>ITEM</th>
                  <th>STY/AREA</th>
                  <th>SIZE</th>
                  <th>UNIT</th>
                  <th>QTY</th>
                  <th>U/RATE</th>
                  <th>RATE</th>
                </tr>
              </thead>
              <tbody>
                <tr onClick={handleShowDetailProductModal}>
                  <td>W08</td>
                  <td>12.52mm Tinted Lami</td>
                  <td>2nd Sty / Fam. Area</td>
                  <td>&lt;2800 x 2975 mm</td>
                  <td>No</td>
                  <td>1</td>
                  <td>$ 4,508.75</td>
                  <td>$ 4,508.75</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="invoiceItem">
          <div className="invoiceItem__action">
            <div
              className="invoiceItem__name"
              onClick={() => handleShowDetailInvoice(1)}
            >
              <Sort
                isSorted={true}
                isHidden={true}
                isShow={isShowDetail}
              />
              <Checkbox
                isDisabled={true}
              />
              <span>
                Aluminium framed glazed sliding door in Euro Profile
              </span>
            </div>
          </div>
          <div className="invoiceItem__table">
            <table className='detailTable'>
              <thead>
                <tr>
                  <th>PRODUCT CODE</th>
                  <th>ITEM</th>
                  <th>STY/AREA</th>
                  <th>SIZE</th>
                  <th>UNIT</th>
                  <th>QTY</th>
                  <th>U/RATE</th>
                  <th>RATE</th>
                </tr>
              </thead>
              <tbody>
                <tr onClick={handleShowDetailProductModal}>
                  <td>W08</td>
                  <td>12.52mm Tinted Lami</td>
                  <td>2nd Sty / Fam. Area</td>
                  <td>&lt;2800 x 2975 mm</td>
                  <td>No</td>
                  <td>1</td>
                  <td>$ 4,508.75</td>
                  <td>$ 4,508.75</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceSection
