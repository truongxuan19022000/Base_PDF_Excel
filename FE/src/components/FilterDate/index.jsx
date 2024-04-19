import { useState } from 'react';

const FilterDate = ({ options, selectAction }) => {
  const [selectedItem, setSelectedItem] = useState(options[0]);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  const handleOnSelect = (item) => {
    setSelectedItem(item);
    setIsOpenDropdown(false);
    selectAction(item);
  };

  const toggleDropdown = () => {
    setIsOpenDropdown(!isOpenDropdown);
  };

  return (
    <div className="filterDate__filterWrapper">
      <div className="filterDate__filter" onClick={() => toggleDropdown()}>
        <p>{selectedItem.label}</p>
        <img src="/icons/arrow_down.svg" alt="dropdown" />
      </div>
      {isOpenDropdown && (
        <div className="filterDate__filterBox">
          {Object.values(options).map((item, index) => (
            <div
              key={index}
              className={`filterDate__filterItem${
                selectedItem.value === item.value ? ' filterDate__filterItem--select' : ''
              }`}
              onClick={() => handleOnSelect(item)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDate;
