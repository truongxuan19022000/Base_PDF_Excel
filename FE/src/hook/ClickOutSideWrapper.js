import React, { useEffect, useRef } from 'react';

function useOutsideAlerter(ref, onClickOutside) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside && onClickOutside();
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [ref, onClickOutside])
}

function ClickOutSideWrapper({ onClickOutside, children }) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, onClickOutside);

  const handleClickInside = (event) => {
    event.stopPropagation();
  };

  return <div ref={wrapperRef} onClick={handleClickInside}>{children}</div>;
}

export default ClickOutSideWrapper
