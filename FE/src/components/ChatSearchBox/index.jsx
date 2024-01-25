import React from 'react'

import ArrowLeftSvg from '../Icons/ArrowLeftSvg'
import SpinnerLoading from '../SpinnerLoading'
import CloseMarkSvg from '../Icons/CloseMarkSvg'

const ChatSearchBox = ({
  searchConversationText = '',
  isSearching = false,
  isShowDialog = false,
  isSearchingCustomer = false,
  isSearchingConversation = false,
  handleCloseSearch,
  handleInputChange,
  setIsShowDialog,
}) => {
  return (
    <div className="searchBox">
      <div className="searchBox__box">
        {isSearching ? (
          <span className="searchBox__box--icon" onClick={handleCloseSearch}>
            <ArrowLeftSvg />
          </span>
        ) : (
          <img
            className="searchBox__box--icon"
            src="/icons/magnifying.svg"
            alt="magnifying"
          />
        )}
        <input
          type="text"
          placeholder="Search"
          className="searchBox__box--input"
          value={searchConversationText || ''}
          onChange={handleInputChange}
        />
        {isSearching && (
          <>
            {(isSearchingConversation || isSearchingCustomer) ? (
              <span className="searchBox__box--loading">
                <SpinnerLoading />
              </span>
            ) : (
              <span className="searchBox__box--mark" onClick={handleCloseSearch}>
                <CloseMarkSvg />
              </span>
            )}
          </>
        )}
      </div>
      <div
        className={`searchBox__star${isShowDialog ? ' searchBox__star--active' : ''}`}
        onClick={() => setIsShowDialog(!isShowDialog)}
      >
        <img src="/icons/more-icon.svg" alt="more-icon" />
      </div>
    </div>
  )
}

export default ChatSearchBox
