import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch } from 'react-redux';

import { isEmptyObject } from 'src/helper/helper';
import { useCustomerSlice } from 'src/slices/customer';
import { useQuotationSlice } from 'src/slices/quotation';
import { SELECT_BOX_HEIGHT_UNIT, SELECT_BOX_MAX_HEIGHT } from 'src/constants/config';

import Loading from '../Loading';
import SpinnerLoading from '../SpinnerLoading';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';

const SelectCustomerForm = ({
  className = '',
  searchText = '',
  customerName = '',
  messageError = '',
  searchResults = [],
  selectedCustomer = {},
  isDetail = false,
  isSearching = false,
  isInputChange = false,
  isShowCreateNewCustomer = false,
  setSearchText,
  setSelectedCustomer,
  setIsDisableSubmit,
  handleTypeSearchChange,
  validSelectProperty = 'id',
  displayProperties = 'name',
  setCustomerName,
  setIsInputChanged,
  onClickCreateNew,
  setIsShowCreateNewCustomer,
}) => {
  const { actions } = useQuotationSlice();
  const { actions: customerActions } = useCustomerSlice();

  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectBoxHeight, setSelectBoxHeight] = useState(0);
  const [isShowItemList, setIsShowItemList] = useState(false);

  useEffect(() => {
    setHasMore(!(searchResults?.length <= data.length));
  }, [searchResults, data]);

  useEffect(() => {
    setData(searchResults?.slice(0, 10) || [])
  }, [searchResults])

  useEffect(() => {
    if (isShowCreateNewCustomer) {
      setIsShowItemList(false)
    }
  }, [isShowCreateNewCustomer])

  useEffect(() => {
    if (data?.length > 6) {
      setSelectBoxHeight(SELECT_BOX_MAX_HEIGHT)
    } else {
      setSelectBoxHeight((data?.length + 1) * SELECT_BOX_HEIGHT_UNIT)
    }
  }, [data])

  useEffect(() => {
    if (searchText?.length > 0 && isEmptyObject(selectedCustomer)) {
      setIsShowItemList(true)
    }
  }, [searchText, selectedCustomer])

  const fetchMoreData = () => {
    if (hasMore) {
      const newItems = data.concat(searchResults.slice(data.length, data.length + 10));
      setTimeout(() => {
        setData(newItems);
        if (newItems.length >= searchResults?.length) {
          setHasMore(false);
        }
      }, 500);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedCustomer(item)
    setIsShowItemList(false)
    setSearchText(item?.[displayProperties] || '')
    setIsDisableSubmit(false)
    setIsInputChanged(!isInputChange)
  }

  const handleClickInputSearch = (e) => {
    if (isShowCreateNewCustomer) return;
    e.stopPropagation()
    setIsShowItemList(true)
    handleTypeSearchChange(e)
    setIsDisableSubmit(false)
  }

  const handleClickChangeCustomer = (customerName) => {
    if (isShowCreateNewCustomer) return;
    if (customerName?.length > 0) {
      setSearchText(customerName)
      setCustomerName('')
    }
    setIsShowItemList(!isShowItemList)
  }

  const handleClickClose = (e) => {
    e.stopPropagation()
    setIsShowItemList(false)
    setIsShowCreateNewCustomer(false)
    setSearchText('')
    setCustomerName('')
    dispatch(customerActions.clearCustomerDetail())
    dispatch(actions.clearCustomerQuotationDetail())
  }

  return (
    <div className={`selectCustomerForm${(isShowItemList && !isShowCreateNewCustomer) ? ' selectCustomerForm--active' : ''}${messageError ? ' selectCustomerForm--error' : ''}${className ? ' ' + className : ''}`}>
      <div
        className="selectCustomerForm__label"
        onClick={() => handleClickChangeCustomer(customerName)}
      >
        {isShowCreateNewCustomer ? (
          <div>New Customer</div>
        ) : (
          <>
            {customerName ? (
              <div>
                {customerName || ''}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Customer"
                  className="selectCustomerForm__action--input"
                  value={searchText || ''}
                  onChange={(e) => handleClickInputSearch(e)}
                  autoFocus={searchText}
                />
                {(isShowItemList && isSearching) && (
                  <span className="selectCustomerForm__action--spinner">
                    <SpinnerLoading />
                  </span>
                )}
              </>
            )}
          </>
        )}
        {(isShowCreateNewCustomer || !isEmptyObject(selectedCustomer) || customerName) ?
          <img
            className={`selectRoleForm__arrowDown`}
            src="/icons/x-mark.svg"
            alt="close mark"
            onClick={(e) => handleClickClose(e)}
          /> :
          <img
            className={`selectRoleForm__arrowDown${isShowItemList ? ' selectRoleForm__arrowDown--rotate' : ''}`}
            src="/icons/arrow_down.svg"
            alt="arrow_down.svg"
          />
        }
      </div>
      {(isShowItemList && !isShowCreateNewCustomer) && (
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="selectCustomerForm__list">
            {isSearching ? (
              <div className="selectCustomerForm__option selectCustomerForm__option--message">
                Looking for customers...
              </div>
            ) : (
              <>
                {data?.length === 0 ? (
                  <div className="selectCustomerForm__option selectCustomerForm__option--message">
                    No found any matched result.
                  </div>
                ) : (
                  <InfiniteScroll
                    dataLength={data?.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    height={selectBoxHeight}
                    loader={<div className="selectCustomerForm__list--loading"><Loading /></div>}
                    style={{ height: `${data?.length > 4 ? '141px' : 'fit-content'}` }}
                    endMessage={
                      <p className="selectCustomerForm__list--endMessageText">
                        <b>{searchResults?.length || 0} results was found.</b>
                      </p>
                    }
                  >
                    {data?.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectItem(item)}
                        className={`selectCustomerForm__option${item?.[validSelectProperty] === selectedCustomer?.[validSelectProperty] ? ' selectCustomerForm__option--selected' : ''}`}
                      >
                        {item?.[displayProperties] || ''}
                      </div>
                    ))}
                  </InfiniteScroll>
                )}
              </>
            )}
            {!isDetail &&
              <div
                className="selectCustomerForm__list--button"
                onClick={onClickCreateNew}
              >
                + New Customer
              </div>
            }
          </div>
        </ClickOutSideWrapper>
      )}
    </div>
  )
}

export default SelectCustomerForm
