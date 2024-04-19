import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { LINKS, STATUS_FIELD, QUOTATION_HEADERS, CLAIM_HEADERS, PAGINATION } from 'src/constants/config'

import LatestItemDashboard from 'src/components/LatestItemDashboard'

import { useClaimsSlice } from 'src/slices/claims'
import { useQuotationSlice } from 'src/slices/quotation'

const NonAdminDashboard = () => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { actions: quotationActions } = useQuotationSlice()
  const { actions: claimAction } = useClaimsSlice()

  const quotationData = useSelector((state) => state.quotation.list?.data)
  const claimData = useSelector((state) => state.claims.list?.claims?.data)
  const fetchedQuotation = useSelector(state => state.quotation.fetched)
  const fetchedClaim = useSelector(state => state.claims.fetched)

  const claimDataWithId = claimData?.map((claim) => ({
    ...claim,
    id: claim.claim_id,
  }))

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

  const redirectToCreatePage = (redirectURL) => {
    if (redirectURL === 'handleUpload') {
      return
    } else {
      history.push(redirectURL)
    }
  }

  return (
    <div className="dashboard__body">
      <div className="dashboard__left">
        <div className="dashboard__content">
          <LatestItemDashboard
            tableTitle="quotation"
            headers={QUOTATION_HEADERS}
            data={quotationData?.length ? quotationData.slice(0, 5) : []}
            statusField={STATUS_FIELD.QUOTATION}
            createAction={() => redirectToCreatePage(LINKS.CREATE.QUOTATION)}
          />
          <LatestItemDashboard
            tableTitle="claim"
            headers={CLAIM_HEADERS}
            data={claimDataWithId?.length ? claimDataWithId.slice(0, 5) : []}
            statusField={STATUS_FIELD.CLAIM}
            createAction={() => redirectToCreatePage(LINKS.CREATE.CLAIM)}
          />
        </div>
      </div>
    </div>
  )
}

export default NonAdminDashboard
