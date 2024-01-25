import React from 'react'

import { range } from 'src/helper/helper';
import { PAGINATION } from 'src/constants/config';

const Pagination = ({
  totalNumber,
  currentPageNumber,
  onClickPageChange,
}) => {
  const totalPages = Math.ceil(totalNumber / PAGINATION.NUM_PER_PAGE.LONG);
  const siblingCount = 1;

  const paginationRange = () => {
    const totalPageNumbers = siblingCount + 5;
    const leftSiblingIndex = Math.max(currentPageNumber - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPageNumber + siblingCount, totalPages);

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(
        totalPages - rightItemCount + 1,
        totalPages
      );
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
  }

  const handlePageChange = (pageNumber) => {
    if (currentPageNumber === pageNumber) {
      return
    }

    if (pageNumber !== '...') {
      onClickPageChange(pageNumber)
    }
  }

  return (
    <div className="pagination">
      {totalPages > PAGINATION.HIDDEN && (
        <div className="pagination__body">
          <button
            className="pagination__arrow"
            disabled={currentPageNumber === PAGINATION.START_PAGE}
            onClick={() => onClickPageChange(currentPageNumber - 1)}
          >
            <img
              className="pagination__arrow--left"
              src="/icons/arrow-left.svg"
              alt="arrow-left"
            />
            Previous
          </button>
          <div className="pagination__pageNumbers">
            {paginationRange().map((pageNumber, index) => (
              <div
                key={index}
                onClick={() => handlePageChange(pageNumber)}
                className={`pagination__number${currentPageNumber === pageNumber ? ' pagination__number--active' : ''}`}
              >
                {pageNumber}
              </div>
            ))}
          </div>
          <button
            className="pagination__arrow"
            disabled={currentPageNumber === totalPages}
            onClick={() => onClickPageChange(currentPageNumber + 1)}
          >
            Next
            <img
              className="pagination__arrow--right"
              src="/icons/arrow-right.svg"
              alt="arrow-right"
            />
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination
