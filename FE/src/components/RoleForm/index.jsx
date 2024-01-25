import React, { useState } from 'react';

import ToggleSwitch from '../ToggleSwitch';

const RoleForm = ({ role }) => {
  const [customerToggle, setCustomerToggle] = useState(false);
  const [createToggle, setCreateToggle] = useState(false);
  const [editToggle, setEditToggle] = useState(false);
  const [deleteToggle, setDeleteToggle] = useState(false);

  const handleToggleChange = (toggleStateSetter) => {
    toggleStateSetter((prevToggleState) => !prevToggleState);
  };

  return (
    <div className="roleForm">
      <div className="roleForm__header">
        <div className="roleForm__title">
          <div className="roleForm__icon">
            <img src={role.icon} alt={role.title} />
          </div>
          <div className="roleForm__group">{role.title}</div>
        </div>
        <div className="roleForm__toggle">
          <ToggleSwitch checked={customerToggle} onChange={() => handleToggleChange(setCustomerToggle)} />
        </div>
      </div>
      <div className="roleForm__body">
        <div className="roleForm__item">
          <div className="roleForm__feature">Create new {role.title?.toLowerCase()}</div>
          <ToggleSwitch checked={createToggle} onChange={() => handleToggleChange(setCreateToggle)} />
        </div>
        <div className="roleForm__item">
          <div className="roleForm__feature">Edit {role.title?.toLowerCase()}</div>
          <ToggleSwitch checked={editToggle} onChange={() => handleToggleChange(setEditToggle)} />
        </div>
        <div className="roleForm__item">
          <div className="roleForm__feature">Delete {role.title?.toLowerCase()}</div>
          <ToggleSwitch checked={deleteToggle} onChange={() => handleToggleChange(setDeleteToggle)} />
        </div>
      </div>
    </div>
  );
}

export default RoleForm;
