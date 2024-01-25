import React from 'react'
import PropTypes from 'prop-types';

const Checkbox = ({
  onChange,
  isChecked = false,
  isDisabled = false,
}) => {
  return (
    <label className="checkbox">
      <input type="checkbox" checked={isChecked} onChange={onChange} disabled={isDisabled} />
      <div className="checkbox__icon">
        <img src="/icons/check.svg" alt="Checkbox" />
      </div>
    </label>
  )
}

Checkbox.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Checkbox
