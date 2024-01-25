import React from 'react'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const SectionItemDetailModal = ({ isShowSidebar, setIsShowSectionItemDetailModal }) => {
  return (
    <div className="sectionItemModal">
      <ClickOutSideWrapper onClickOutside={() => setIsShowSectionItemDetailModal(false)}>
        <div className={`sectionItemModal__content${isShowSidebar ? ' mr-250' : ''}`}>
          <div className="sectionItemModal__header">Aluminium framed glazed sliding door in Euro Profile</div>
          <div className="sectionItemModal__body">
            <div className="sectionItemInfo">
              <div className="sectionItemInfo__box sectionItemInfo__box--area">
                <div className="sectionItemInfo__title">PRODUCT CODE</div>
                <div className="sectionItemInfo__detail">W08</div>
              </div>
              <div className="sectionItemInfo__box sectionItemInfo__box--item">
                <div className="sectionItemInfo__title">ITEM</div>
                <div className="sectionItemInfo__detail">12.52mm Tinted Lami</div>
              </div>
              <div className="sectionItemInfo__box sectionItemInfo__box--area">
                <div className="sectionItemInfo__title">STOREY / AREA</div>
                <div className="sectionItemInfo__detail">2nd Sty / Fam. Area</div>
              </div>
              <div className="sectionItemInfo__box sectionItemInfo__box--size">
                <div className="sectionItemInfo__title">SIZE</div>
                <div className="sectionItemInfo__detail">2800 x 2975 mm</div>
              </div>
              <div className="sectionItemInfo__box sectionItemInfo__box--small">
                <div className="sectionItemInfo__title">UNIT</div>
                <div className="sectionItemInfo__detail">No</div>
              </div>
              <div className="sectionItemInfo__box sectionItemInfo__box--small">
                <div className="sectionItemInfo__title">QUANTITY</div>
                <div className="sectionItemInfo__detail">1</div>
              </div>
            </div>
            <div className="material">
              <div className="material__header">
                <div className="material__title">Material Orders</div>
                <button className="material__button">
                  + Add Item
                </button>
              </div>
              <div className="material__table">
                <table className='detailTable'>
                  <thead>
                    <tr className="detailTable__thead">
                      <th className="detailTable__item">ITEM</th>
                      <th className="detailTable__size">SIZE</th>
                      <th>UNIT</th>
                      <th>QTY</th>
                      <th>U/RATE</th>
                      <th>RATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Alum. framing - sliding door (CN; 2 Tracks)</td>
                      <td>2800 x 2975  mm </td>
                      <td>m<sup>2</sup></td>
                      <td>8.33</td>
                      <td>$ 305.00</td>
                      <td>$ 2,540.65</td>
                      <td>
                        <img
                          src="/icons/x-mark.svg"
                          alt="x-mark"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Alum. framing - sliding door (CN; 2 Tracks)</td>
                      <td>2800 x 2975  mm </td>
                      <td>m<sup>2</sup></td>
                      <td>8.33</td>
                      <td>$ 305.00</td>
                      <td>$ 2,540.65</td>
                      <td>
                        <img
                          src="/icons/x-mark.svg"
                          alt="x-mark"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="extraOrder">
              <div className="extraOrder__header">
                <div className="extraOrder__title">Extra Orders (E/O)</div>
                <button className="extraOrder__button">
                  + Add Item
                </button>
              </div>
              <div className="extraOrder__table">
                <table className='detailTable'>
                  <thead>
                    <tr>
                      <th className="detailTable__item">ITEM</th>
                      <th>UNIT</th>
                      <th>QTY</th>
                      <th>U/RATE</th>
                      <th>RATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="detailTable__item">Sliding Door Fitting</td>
                      <td>panel</td>
                      <td>2</td>
                      <td></td>
                      <td></td>
                      <td>
                        <img
                          src="/icons/x-mark.svg"
                          alt="x-mark"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="detailTable__item">Shipping</td>
                      <td>m<sup>2</sup></td>
                      <td>8.33</td>
                      <td>$ 16.00</td>
                      <td>$ 133.50</td>
                      <td>
                        <img
                          src="/icons/x-mark.svg"
                          alt="x-mark"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="totalAmount">
              <div className="totalAmount__title">SUB TOTAL RATE AMOUNT</div>
              <div className="totalAmount__number">$ 133.50</div>
            </div>
          </div>
        </div>
      </ClickOutSideWrapper>
    </div>
  )
}

export default SectionItemDetailModal
