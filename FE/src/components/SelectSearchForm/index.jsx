import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';

import { isEmptyObject } from 'src/helper/helper';
import { SELECT_BOX_HEIGHT_UNIT, SELECT_BOX_MAX_HEIGHT } from 'src/constants/config';

import Loading from '../Loading';
import SpinnerLoading from '../SpinnerLoading';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';

const SelectSearchForm = ({
  borderStyle = '',
  searchText = '',
  messageError = '',
  selectedItemTitle = '',
  displayProperty = 'item',
  validSelectProperty = 'id',
  placeHolderLabel = 'Select Product Template',
  searchResults = [],
  selectedItem = {},
  isSearching = false,
  isInputChanged = false,
  setSelectedItemTitle,
  setSearchText,
  setSelectedItem,
  setIsInputChanged,
  setIsDisableSubmit,
  handleTypeSearchChange,
  isDisabledChange = false,
}) => {
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectBoxHeight, setSelectBoxHeight] = useState(0);
  const [isShowTemplateList, setIsShowItemList] = useState(false);

  useEffect(() => {
    setHasMore(!(searchResults.length <= data.length));
  }, [searchResults, data]);

  useEffect(() => {
    setData(searchResults.slice(0, 10) || [])
  }, [searchResults])

  useEffect(() => {
    if (data.length > 6) {
      setSelectBoxHeight(SELECT_BOX_MAX_HEIGHT)
    } else {
      setSelectBoxHeight((data.length + 1) * SELECT_BOX_HEIGHT_UNIT)
    }
  }, [data])

  useEffect(() => {
    if (searchText.length > 0 && isEmptyObject(selectedItem)) {
      setIsShowItemList(true)
    }
  }, [searchText, selectedItem])

  const fetchMoreData = () => {
    if (hasMore) {
      const newItems = data.concat(searchResults.slice(data.length, data.length + 10));
      setTimeout(() => {
        setData(newItems);
        if (newItems.length >= searchResults.length) {
          setHasMore(false);
        }
      }, 500);
    }
  };

  const handleSelectItem = (item) => {
    if (isDisabledChange) return;
    setIsDisableSubmit(false)
    setSelectedItem(item)
    setIsShowItemList(false)
    setSearchText(item[displayProperty])
    setIsInputChanged(!isInputChanged)

  }

  const handleClickInputSearch = (e) => {
    e.stopPropagation()
    setIsShowItemList(true)
    handleTypeSearchChange(e)
    setIsDisableSubmit(false)
    setIsInputChanged(!isInputChanged)
  }

  const handleClickChangeItem = (selectedItemTitle) => {
    if (isDisabledChange) return;
    if (selectedItemTitle.length > 0) {
      setSearchText(selectedItemTitle)
      setSelectedItemTitle('')
    }
    setIsShowItemList(!isShowTemplateList)
  }

  const handleClickClose = (e) => {
    e.stopPropagation()
    if (isDisabledChange) return;
    setIsShowItemList(false)
    setSearchText('')
    setSelectedItemTitle('')
    setSelectedItem({})
  }

  return (
    <div className={`selectSearchForm${borderStyle && ` selectSearchForm--${borderStyle}`}${isDisabledChange ? ' selectSearchForm--disabled' : ''}${isShowTemplateList ? ' selectSearchForm--active' : ''}${messageError ? ' selectSearchForm--error' : ''}`}>
      <div
        className="selectSearchForm__label"
        onClick={() => handleClickChangeItem(selectedItemTitle)}
      >
        {selectedItemTitle ? (
          <div>
            {selectedItemTitle || ''}
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder={placeHolderLabel}
              className="selectSearchForm__action--input"
              value={searchText || ''}
              onChange={(e) => handleClickInputSearch(e)}
              autoFocus={searchText}
              disabled={isDisabledChange}
            />
            {(isShowTemplateList && isSearching) && (
              <span className="selectSearchForm__action--spinner">
                <SpinnerLoading />
              </span>
            )}
          </>
        )}
        {(!isEmptyObject(selectedItem) || selectedItemTitle) ?
          <img
            className="selectSearchForm__arrowDown"
            src="/icons/x-mark.svg"
            alt="close mark"
            onClick={(e) => handleClickClose(e)}
          /> :
          <img
            className={`selectSearchForm__arrowDown${isShowTemplateList ? ' selectSearchForm__arrowDown--rotate' : ''}`}
            src="/icons/arrow_down.svg"
            alt="arrow down"
          />
        }
      </div>
      {isShowTemplateList &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className={`selectSearchForm__list${borderStyle && ` selectSearchForm__list--${borderStyle}`}`}>
            {isSearching ? (
              <div className="selectSearchForm__option selectSearchForm__option--message">
                Looking for...
              </div>
            ) : (
              <>
                {data.length === 0 ? (
                  <div className="selectSearchForm__option selectSearchForm__option--message">
                    No found any matched result.
                  </div>
                ) : (
                  <InfiniteScroll
                    dataLength={data.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    height={selectBoxHeight}
                    loader={<div className="selectSearchForm__list--loading"><Loading /></div>}
                    style={{ height: `${data.length > 4 ? '141px' : 'fit-content'}` }}
                    endMessage={
                      <p className="selectSearchForm__list--endMessageText">
                        <b>{searchResults.length || 0} results was found.</b>
                      </p>
                    }
                  >
                    {data.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectItem(item)}
                        className={`selectSearchForm__option${item?.[validSelectProperty] === selectedItem?.[validSelectProperty] ? ' selectSearchForm__option--selected' : ''}`}
                      >
                        {item?.[displayProperty] || ''}
                      </div>
                    ))}
                  </InfiniteScroll>
                )}
              </>
            )}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default SelectSearchForm
