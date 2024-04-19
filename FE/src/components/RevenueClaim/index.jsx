import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import { REVENUE } from 'src/constants/config';
import { useClaimsSlice } from 'src/slices/claims';
import { formatPriceWithTwoDecimals } from 'src/helper/helper';

const RevenueClaim = () => {
  const dispatch = useDispatch()
  const { actions } = useClaimsSlice()
  const { revenueData, newClaimNumber } = useSelector(state => state.claims)

  const [badge, setBadge] = useState(REVENUE.TIME[0]);
  const [isOpenBadgeBox, setIsOpenBadgeBox] = useState(false);

  const handleSetBadge = (item) => {
    setBadge(item)
    setIsOpenBadgeBox(false)
    dispatch(actions.getClaimRevenue({ time: item.value }))
  }

  return (
    <div className="revenueClaim">
      <div className="revenueClaim__wrapper">
        <div className="revenueClaim__header">
          <div className="revenueClaim__headerTitle">
            <img src="/icons/dollar.svg" alt="cash" />
            <p className="revenueClaim__headerText">TOTAL REVENUE</p>
          </div>
          <div className="revenueClaim__filterWrapper">
            <div className="revenueClaim__filter" onClick={() => setIsOpenBadgeBox(!isOpenBadgeBox)}>
              <p>{badge.label}</p>
              <img src="/icons/arrow_down.svg" alt="dropdown" />
            </div>
            {isOpenBadgeBox &&
              <div className="revenueClaim__filterBox">
                {Object.values(REVENUE.TIME)?.map((item, index) => (
                  <div
                    key={index}
                    className={`revenueClaim__filterItem${badge.value === item.value ? ' revenueClaim__filterItem--select' : ''}`}
                    onClick={() => handleSetBadge(item)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
        <div className="revenueClaim__reportWrapper">
          <div className="revenueClaim__reportInner">
            <p className="revenueClaim__reportInnerText">
              $ {formatPriceWithTwoDecimals(revenueData.pending)}
            </p>
            <div className="revenueClaim__status revenueClaim__status--pending">
              Pending Payment
            </div>
          </div>
          <div className="revenueClaim__reportInner">
            <p className="revenueClaim__reportInnerText">
              $ {formatPriceWithTwoDecimals(revenueData.received)}
            </p>
            <div className="revenueClaim__status revenueClaim__status--received">
              Total Received
            </div>
          </div>
        </div>
      </div>
      <div className="revenueClaim__count">
        <div className="revenueClaim__header">
          <div className="revenueClaim__headerTitle">
            <img src="/icons/circle-list.svg" alt="list" />
            <p className="revenueClaim__headerText">NEW CLAIMS</p>
          </div>
        </div>
        <div className="revenueClaim__reportWrapper">
          <div className="revenueClaim__reportInner">
            <p className="revenueClaim__reportInnerText">
              {newClaimNumber || 0}
            </p>
            <div className="revenueClaim__status">
              This Month
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueClaim
