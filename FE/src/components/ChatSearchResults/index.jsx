import React from 'react'

import CustomerSearchResults from '../CustomerSearchResult'
import ConversationSearchResult from '../ConversationSearchResult'

const ChatSearchResults = ({
  foundCustomers = [],
  foundConversations = [],
  isSearching = false,
  isSearchingCustomer = false,
  isSearchingConversation = false,
  handleSelectedCustomer,
}) => {

  const number_results = (foundCustomers?.length ?? 0) + (foundConversations.length ?? 0);

  return (
    <div className="searchResults">
      {(isSearchingCustomer || isSearchingConversation) && (
        <div className="searchResults__box--loading">
          <p>
            <span>Looking for chats, customers...</span>
          </p>
        </div>
      )}
      {foundConversations?.length > 0 && (
        <div className="searchResults__box">
          <div className="searchResults__box--header">CHATS</div>
          <div className="searchResults__box--results">
            {foundConversations.map((chat, index) => (
              <div
                key={index}
                className="searchResults__box--item"
                onClick={() => handleSelectedCustomer(chat?.customer)}
              >
                <ConversationSearchResult
                  chat={chat}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {foundCustomers?.length > 0 && (
        <div className="searchResults__box">
          <div className="searchResults__box--header">CUSTOMERS</div>
          <div className="searchResults__box--results">
            {foundCustomers.map((customer, index) => (
              <div
                key={index}
                className="searchResults__box--item"
                onClick={() => handleSelectedCustomer(customer)}
              >
                <CustomerSearchResults
                  customer={customer}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {isSearching && (
        <div className="searchResults__box--result">
          {!(isSearchingCustomer || isSearchingConversation) && (
            <>
              {(number_results === 0 && foundConversations?.length === 0 && foundConversations?.length === 0) ? (
                <p>
                  <span>No found search result.</span>
                </p>
              ) : (
                <p>
                  <span className="searchResults__box--resultNumber">{number_results}</span> {number_results > 1 ? 'results were' : 'result was'} found.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatSearchResults
