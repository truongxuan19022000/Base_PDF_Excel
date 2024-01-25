import React from 'react';

const CustomerSearchResults = ({ isSearching, searchedData, selectedItem, displayProperties, handleSelectItem }) => {
  return (
    <>
      {searchedData.length > 0 ? (
        searchedData.map((item, index) => (
          <div
            key={index}
            onClick={() => handleSelectItem(item)}
            className={`selectCustomerForm__option${item?.value === selectedItem?.value ? ' selectCustomerForm__option--selected' : ''}`}
          >
            {item?.[displayProperties] || ''}
          </div>
        ))
      ) : (
        <>
          {!isSearching && (
            <div className="selectCustomerForm__option selectCustomerForm__option--message">
              No found any matched result.
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CustomerSearchResults;
