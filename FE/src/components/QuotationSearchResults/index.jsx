import React from 'react';

const QuotationSearchResults = ({
  isSearching = false,
  searchedData = [],
  selectedId = null,
  validSelectProperty = 'id',
  displayProperties = 'reference_no',
  handleSelectItem,
}) => {

  return (
    <>
      {searchedData.length > 0 ? (
        searchedData.map((item, index) => (
          <div
            key={index}
            onClick={() => handleSelectItem(item)}
            className={`selectQuotationForm__option${item?.[validSelectProperty] === selectedId ? ' selectQuotationForm__option--selected' : ''}`}
          >
            {item?.[displayProperties] || ''}
          </div>
        ))
      ) : (
        <>
          {!isSearching && (
            <div className="selectQuotationForm__option selectQuotationForm__option--message">
              No found any matched result.
            </div>
          )}
        </>
      )}
    </>
  );
};

export default QuotationSearchResults;
