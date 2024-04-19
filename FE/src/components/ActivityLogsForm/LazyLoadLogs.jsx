import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { useCustomerSlice } from 'src/slices/customer';
import { ACTIVITY, PAGINATION } from 'src/constants/config';
import { isEmptyObject } from 'src/helper/helper';

import Loading from '../Loading';

const LazyLoadActivityLogs = ({
  logsNameList = [],
  actionNameList = [],
}) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { actions } = useCustomerSlice();

  const { logsData, logsList } = useSelector(state => state.customer)

  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(PAGINATION.START_PAGE);

  useEffect(() => {
    if (!isEmptyObject(logsData)) {
      setHasMore(logsData.last_page !== logsData.current_page)
      setCurrentPage(logsData.current_page);
    }
  }, [logsData])

  const fetchMoreData = (page) => {
    if (hasMore && id) {
      dispatch(actions.getCustomerActivity({
        customer_id: +id,
        page: page + 1,
      }))
    }
  };

  const getFileName = (item) => {
    switch (item.type) {
      case ACTIVITY.LOGS.TYPE_VALUE.CUSTOMER:
        if (item.action_type !== 1) return 'Information';
      // eslint-disable-next-line no-fallthrough
      case ACTIVITY.LOGS.TYPE_VALUE.QUOTATION:
      case ACTIVITY.LOGS.TYPE_VALUE.NOTE:
      case ACTIVITY.LOGS.TYPE_VALUE.SECTION:
      case ACTIVITY.LOGS.TYPE_VALUE.OTHER_FEE:
        return item.quotation?.reference_no;
      case ACTIVITY.LOGS.TYPE_VALUE.INVOICE:
        return item.invoice?.invoice_no;
      case ACTIVITY.LOGS.TYPE_VALUE.DOCUMENT:
        return item.document?.document_name;
      case ACTIVITY.LOGS.TYPE_VALUE.CLAIM:
        return item.claim?.claim_no;
      default:
        return null;
    }
  };

  const getActionName = (item) => {
    switch (item.action_type) {
      case ACTIVITY.LOGS.ACTION_VALUE.CREATE:
        return item.type === ACTIVITY.LOGS.TYPE_VALUE.DOCUMENT ? 'uploaded' : 'created';
      default:
        return actionNameList[item.action_type] || '';
    }
  };

  const LogItem = ({ item, index }) => {
    const fileName = getFileName(item);
    const actionName = getActionName(item);
    const logsName = logsNameList[item.type];
    const username = item.username || item.user?.username;
    const logsTime = item.created_at && dayjs(item.created_at).format('DD MMM YYYY, h:mma');
    const icon = ACTIVITY.LOGS.ICON_TYPE[item.type];
    return (
      <div className="logsBoxForm">
        <div className="logsBoxForm__left">
          <img
            className="logsBoxForm__icon"
            src={icon}
            alt="activity icon"
          />
          {(index === logsList.length - 1) ? null : <div className="logsBoxForm__divider"></div>}
        </div>
        <div className="logsBoxForm__right">
          <div className="logsBoxForm__info">
            <div>{logsName || 'Item'}</div>
            <div className="logsBoxForm__detail">
              {fileName && <div className="logsBoxForm__fileName">{fileName}</div>}
              <div className="logsBoxForm__action">{actionName}</div>
            </div>
          </div>
          <div className="logsBoxForm__created">
            <span >{logsTime || ''}</span>
            <img src="/icons/dot.svg" alt="dot" />
            <span>{username || ''}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activityLogsForm">
      <div className="activityLogsForm__header">ACTIVITY LOGS</div>
      <div className="activityLogsForm__body">
        {logsList.length !== 0 &&
          <div
            className="scrollContainer"
            id="scrollTargetId"
            style={{ height: '100%', overflow: 'auto' }}
          >
            <InfiniteScroll
              dataLength={logsList.length || 0}
              next={() => fetchMoreData(currentPage)}
              hasMore={hasMore}
              style={{
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
              loader={<div className="scrollContainer__loading"><Loading /></div>}
              scrollableTarget="scrollTargetId"
            >
              {logsList?.map((log, index) =>
                log &&
                <LogItem
                  key={log.id}
                  item={log}
                  index={index}
                />
              )}
            </InfiniteScroll>
          </div>
        }
      </div>
    </div>
  )
}

export default LazyLoadActivityLogs
