import React from 'react'
import PropTypes from 'prop-types';

const CheckboxFilter = ({
  onChange,
  isChecked,
  isDisabled,
}) => {
  return (
    <label className="checkboxFilter">
      <input type="checkbox" checked={isChecked} onChange={onChange} disabled={isDisabled} />
      <div className="checkboxFilter__icon">
        <img src="/icons/check.svg" alt="Checkbox Filter" />
      </div>
    </label>
  )
}

CheckboxFilter.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CheckboxFilter
