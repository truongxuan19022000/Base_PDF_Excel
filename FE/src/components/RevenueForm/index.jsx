import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import { REVENUE } from 'src/constants/config';
import { useQuotationSlice } from 'src/slices/quotation';
import { formatPriceWithTwoDecimals } from 'src/helper/helper';

const RevenueForm = () => {
  const dispatch = useDispatch()
  const { actions } = useQuotationSlice()
  const { revenueData, newQuotationNumber } = useSelector(state => state.quotation)

  const [badge, setBadge] = useState(REVENUE.TIME[0]);
  const [isOpenBadgeBox, setIsOpenBadgeBox] = useState(false);

  const handleSetBadge = (item) => {
    setBadge(item)
    setIsOpenBadgeBox(false)
    dispatch(actions.getRevenue({ time: item.value }))
  }

  return (
    <div className="quotationBox">
      <div className="quotationBox__wrapper">
        <div className="quotationBox__header">
          <div className="quotationBox__headerTitle">
            <img src="/icons/dollar.svg" alt="cash" />
            <p className="quotationBox__headerText">ESTIMATED REVENUE</p>
          </div>
          <div className="quotationBox__filterWrapper">
            <div className="quotationBox__filter" onClick={() => setIsOpenBadgeBox(!isOpenBadgeBox)}>
              <p>{badge.label}</p>
              <img src="/icons/arrow_down.svg" alt="dropdown" />
            </div>
            {isOpenBadgeBox &&
              <div className="quotationBox__filterBox">
                {Object.values(REVENUE.TIME)?.map((item, index) => (
                  <div
                    key={index}
                    className={`quotationBox__filterItem${badge.value === item.value ? ' quotationBox__filterItem--select' : ''}`}
                    onClick={() => handleSetBadge(item)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
        <div className="quotationBox__reportWrapper">
          <div className="quotationBox__reportInner">
            <p className="quotationBox__reportInnerText">
              $ {formatPriceWithTwoDecimals(revenueData.draft)}
            </p>
            <div className="quotationBox__status quotationBox__status--draft">
              Draft
            </div>
          </div>
          <div className="quotationBox__reportInner">
            <p className="quotationBox__reportInnerText">
              $ {formatPriceWithTwoDecimals(revenueData.pending)}
            </p>
            <div className="quotationBox__status quotationBox__status--pending">
              Pending Approval
            </div>
          </div>
          <div className="quotationBox__reportInner">
            <p className="quotationBox__reportInnerText">
              $ {formatPriceWithTwoDecimals(revenueData.approved)}
            </p>
            <div className="quotationBox__status quotationBox__status--approved">
              Approved
            </div>
          </div>
          <div className="quotationBox__reportInner">
            <p className="quotationBox__reportInnerText">
              $ {formatPriceWithTwoDecimals(revenueData.rejected)}
            </p>
            <div className="quotationBox__status quotationBox__status--rejected">
              Rejected
            </div>
          </div>
          <div className="quotationBox__reportInner">
            <p className="quotationBox__reportInnerText">
              $ {formatPriceWithTwoDecimals(revenueData.cancelled)}
            </p>
            <div className="quotationBox__status quotationBox__status--cancelled">
              Cancelled
            </div>
          </div>
        </div>
      </div>
      <div className="quotationBox__count">
        <div className="quotationBox__header">
          <div className="quotationBox__headerTitle">
            <img src="/icons/circle-list.svg" alt="list" />
            <p className="quotationBox__headerText">NEW QUOTATION</p>
          </div>
        </div>
        <div className="quotationBox__reportWrapper">
          <div className="quotationBox__reportInner">
            <p className="quotationBox__reportInnerText">
              {newQuotationNumber || 0}
            </p>
            <div className="quotationBox__status">
              this month
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueForm
