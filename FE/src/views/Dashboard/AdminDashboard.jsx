import React, { useCallback, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { DASHBOARD, LINKS, STATUS_FIELD, REVENUE, QUOTATION_HEADERS, CLAIM_HEADERS, FILTER_TIME, PAGINATION } from 'src/constants/config'

import MessageBox from 'src/components/MessageBox'
import FilterDate from 'src/components/FilterDate'
import CustomerDiagram from 'src/components/CustomerDiagram'
import LatestItemDashboard from 'src/components/LatestItemDashboard'

import { useClaimsSlice } from 'src/slices/claims'
import { useQuotationSlice } from 'src/slices/quotation'
import { useCustomerSlice } from 'src/slices/customer'
import { useDashboardSlice } from 'src/slices/dashboard'
import { TIME_TOTAL_REVENUE } from 'src/constants/config'
import { formatPriceWithTwoDecimals } from 'src/helper/helper'

const AdminDashboard = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { actions: quotationActions } = useQuotationSlice()
  const { actions: claimAction } = useClaimsSlice()
  const { actions: customerActions } = useCustomerSlice()
  const { actions: dashboardActions } = useDashboardSlice()

  const quotationData = useSelector((state) => state.quotation.list?.data)
  const claimData = useSelector((state) => state.claims.list?.claims?.data)
  const claimDataWithId = claimData?.map((claim) => ({
    ...claim,
    id: claim.claim_id,
  }))
  const newCustomerCount = useSelector(state => state.customer?.newCustomerCount)
  const totalQuoteAmount = useSelector(state => state.quotation?.totalQuotation)
  const totalClaimAmount = useSelector(state => state.claims?.totalClaim)
  const salesRevenueData = useSelector(state => state.dashboard?.salesRevenueData)
  const unseenMessagesCount = useSelector(state => state.dashboard?.unseenMessagesCount)
  const summary = { newCustomerCount, totalQuoteAmount, totalClaimAmount }
  const { fetched, messages } = useSelector(state => state.dashboard)

  const fetchedQuotation = useSelector(state => state.quotation.fetched)
  const fetchedClaim = useSelector(state => state.claims.fetched)

  useEffect(() => {
    if (!fetchedQuotation) {
      dispatch(quotationActions.getQuotationList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetchedQuotation])

  useEffect(() => {
    if (!fetchedClaim) {
      dispatch(claimAction.getClaimsList({ page: PAGINATION.START_PAGE }))
    }
  }, [fetchedClaim])

  useEffect(() => {
    if (!fetched) {
      dispatch(dashboardActions.getMessages({ per_page: DASHBOARD.CONVERSATION_PER_PAGE }))
    }
  }, [fetched])

  useEffect(() => {
    getNewCustomerCount(FILTER_TIME.THIS_MONTH.value)
    getTotalAmountQuotation(FILTER_TIME.THIS_MONTH.value)
    getTotalAmountClaim(FILTER_TIME.THIS_MONTH.value)
  }, [])

  useEffect(() => {
    dispatch(dashboardActions.getSalesRevenue({ time: TIME_TOTAL_REVENUE[0].value }))
    // eslint-disable-next-line
  }, [])

  const renderSummary = () =>
    DASHBOARD.SUMMARY.map((item) => (
      <div key={item.category} className="dashboardBox">
        <div className="dashboardBox__headerBox">
          <div className="dashboardBox__header">
            <div className="dashboardBox__icon">
              <img src={item.iconUrl} alt={item.iconName} />
            </div>
            <div className="dashboardBox__category">{item.category}</div>
          </div>
          <div className="dashboardBox__filter">
            <FilterDate options={REVENUE.TIME} selectAction={(opt) => selectMilestone(item.key, opt.value)} />
          </div>
        </div>
        <div className="dashboardBox__content">
          <div className="dashboardBox__value">
            {item.unit ? <span className="dashboardBox__unit">{item.unit}</span> : null}
            {item.category === DASHBOARD.CUSTOMERS ?
              <span>{summary[item.key]}</span>
              :
              <span>{formatPriceWithTwoDecimals(summary[item.key])}</span>
            }
          </div>
          <div className="dashboardBox__title">{item.title}</div>
        </div>
      </div>
    ))

  const redirectToCreatePage = (redirectURL) => {
    if (redirectURL === 'handleUpload') {
      return
    } else {
      history.push(redirectURL)
    }
  }

  const selectMilestone = (key, value) => {
    switch (key) {
      case DASHBOARD.SUMMARY[0].key: {
        getNewCustomerCount(value)
        break
      }
      case DASHBOARD.SUMMARY[1].key: {
        getTotalAmountQuotation(value)
        break
      }
      case DASHBOARD.SUMMARY[2].key: {
        getTotalAmountClaim(value)
        break
      }
      default:
        break;
    }
  }

  const getNewCustomerCount = (time) => {
    dispatch(customerActions.getNewCustomerCount({ time }))
  }

  const getTotalAmountQuotation = (time) => {
    dispatch(quotationActions.getTotalAmountQuotation({ time }))
  }

  const getTotalAmountClaim = (time) => {
    dispatch(claimAction.getTotalAmountClaim({ time }))
  }

  const handleSelectedDate = useCallback((item) => {
    dispatch(dashboardActions.getSalesRevenue({ time: item.value }))
    // eslint-disable-next-line
  }, [])

  return (
    <div className="dashboard__body">
      <div className="dashboard__left">
        <div className="dashboard__summary">{renderSummary()}</div>
        <div className="dashboard__content">
          <CustomerDiagram
            setSelectedItem={handleSelectedDate}
            salesRevenueData={salesRevenueData}
          />
          <LatestItemDashboard
            tableTitle="quotation"
            headers={QUOTATION_HEADERS}
            data={quotationData?.length ? quotationData.slice(0, 3) : []}
            statusField={STATUS_FIELD.QUOTATION}
            createAction={() => redirectToCreatePage(LINKS.CREATE.QUOTATION)}
          />
          <LatestItemDashboard
            tableTitle="claim"
            headers={CLAIM_HEADERS}
            data={claimDataWithId?.length ? claimDataWithId.slice(0, 3) : []}
            statusField={STATUS_FIELD.CLAIM}
            createAction={() => redirectToCreatePage(LINKS.CREATE.CLAIM)}
          />
        </div>
      </div>
      <div className="dashboard__right">
        <MessageBox
          messages={messages}
          unseenMessagesCount={unseenMessagesCount}
        />
      </div>
    </div>
  )
}

export default AdminDashboard
