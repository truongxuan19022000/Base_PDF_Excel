import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';

import { isEmptyObject } from 'src/helper/helper';
import { SELECT_BOX_HEIGHT_UNIT, SELECT_BOX_MAX_HEIGHT } from 'src/constants/config';

import Loading from '../Loading';
import SpinnerLoading from '../SpinnerLoading';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';

const SelectQuotationForm = ({
  className = '',
  searchText = '',
  searchResults = [],
  selectedQuotation = {},
  isSearching = false,
  setSearchText,
  setSelectedQuotation,
  setIsDisableSubmit,
  handleInputChange,
  validSelectProperty = 'id',
  displayProperties = 'reference_no',
}) => {
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
    if (data?.length > 6) {
      setSelectBoxHeight(SELECT_BOX_MAX_HEIGHT)
    } else {
      setSelectBoxHeight((data?.length + 1) * SELECT_BOX_HEIGHT_UNIT)
    }
  }, [data])

  useEffect(() => {
    if (searchText?.length > 0 && isEmptyObject(selectedQuotation)) {
      setIsShowItemList(true)
    }
  }, [searchText, selectedQuotation])

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
    setSelectedQuotation(item)
    setIsShowItemList(false)
    setSearchText(item?.[displayProperties] || '')
    setIsDisableSubmit(false)
  }

  const handleClickInputSearch = (e) => {
    setIsShowItemList(true)
    handleInputChange(e)
    setIsDisableSubmit(false)
  }

  return (
    <div className={`selectQuotationForm${isShowItemList ? ' selectQuotationForm--active' : ''} ${className}`}>
      <div
        className="selectQuotationForm__label"
        onClick={() => setIsShowItemList(!isShowItemList)}
      >
        <input
          type="text"
          placeholder="Reference No."
          className="selectQuotationForm__action--input"
          value={searchText || ''}
          onChange={(e) => handleClickInputSearch(e)}
          autoFocus={searchText?.length > 0}
        />
        {(isShowItemList && isSearching) && (
          <span className="selectQuotationForm__action--spinner">
            <SpinnerLoading />
          </span>
        )}
        <img
          className={`selectRoleForm__arrowDown${isShowItemList ? ' selectRoleForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow_down.svg"
        />
      </div>
      {isShowItemList && (
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className="selectQuotationForm__list">
            {isSearching ? (
              <div className="selectQuotationForm__option selectQuotationForm__option--message">
                Looking for quotations...
              </div>
            ) : (
              <>
                {data?.length === 0 ? (
                  <div className="selectQuotationForm__option selectQuotationForm__option--message">
                    No found any matched result.
                  </div>
                ) : (
                  <InfiniteScroll
                    dataLength={data?.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    height={selectBoxHeight}
                    loader={<div className="selectQuotationForm__list--loading"><Loading /></div>}
                    endMessage={
                      <p className="selectQuotationForm__list--endMessageText">
                        <b>{searchResults?.length || 0} results was found.</b>
                      </p>
                    }
                  >
                    {data?.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectItem(item)}
                        className={`selectQuotationForm__option${item?.[validSelectProperty] === selectedQuotation?.[validSelectProperty] ? ' selectQuotationForm__option--selected' : ''}`}
                      >
                        {item?.[displayProperties] || ''}
                      </div>
                    ))}
                  </InfiniteScroll>
                )}
              </>
            )}
          </div>
        </ClickOutSideWrapper>
      )}
    </div>
  )
}

export default SelectQuotationForm
