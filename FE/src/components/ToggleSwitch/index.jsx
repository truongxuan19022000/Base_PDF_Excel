import React from 'react';
import PropTypes from 'prop-types';

const ToggleSwitch = ({ isChecked, onChange, index, keyCode, keyId }) => {
  return (
    <div className="toggle">
      <input type="checkbox" id={`${keyId}-${keyCode}-${index}`} checked={isChecked} onChange={onChange} />
      <label htmlFor={`${keyId}-${keyCode}-${index}`} className="toggle__switch"></label>
    </div>
  );
};

ToggleSwitch.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ToggleSwitch
