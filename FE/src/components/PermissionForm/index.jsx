import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRoleSlice } from 'src/slices/role'
import { isEmptyObject, normalizeString } from 'src/helper/helper'
import { ACTIONS, ROLES } from 'src/constants/config'

import ToggleSwitch from '../ToggleSwitch'

const PermissionForm = ({
  roleName = '',
  roleDetail = null,
  messageError = null,
  isAdmin = false,
  isEditingRole = false,
  isInputChanged = false,
  setIsInputChanged,
  handleInputChange,
  setMessageError,
}) => {
  const { actions } = useRoleSlice()

  const dispatch = useDispatch()

  const initialRole = {
    role_name: roleName || '',
    role_setting: {}
  }

  const [roleSetting, setRoleSetting] = useState(initialRole?.role_setting);

  const permissionList = useMemo(() => {
    const permissionsByCategory = {
      [ROLES.CATEGORY.SALE]: [],
      [ROLES.CATEGORY.PROCUREMENT]: [],
      [ROLES.CATEGORY.ORGANIZATION]: [],
    };

    ROLES.PERMISSION.forEach((permission) => {
      const permissionWithSend = { ...permission };
      if (ROLES.CODE_HAVE_SEND_FEATURE.includes(permission.key)) {
        permissionWithSend.send = ROLES.NOT_ACCEPT;
      }
      permissionsByCategory[permission.category]?.push(permissionWithSend);
    });

    return permissionsByCategory;
  }, []);

  useEffect(() => {
    if (!isEmptyObject(roleSetting)) {
      dispatch(actions.setCurrentRoleSetting(roleSetting));
    }
  }, [roleSetting]);

  useEffect(() => {
    if (!isEmptyObject(roleDetail)) {
      const tempObject = {};
      roleDetail.forEach(item => {
        const key = Object.keys(item)[0];
        const code = key.toLowerCase();
        const roleData = { code, ...item[key] };
        if (!ROLES.CODE_HAVE_SEND_FEATURE.includes(key)) {
          roleData.send = ROLES.NOT_ACCEPT;
        }
        tempObject[key] = roleData;
      });
      setRoleSetting(tempObject);
    }
  }, [roleDetail])

  const toggleSetAllFeature = useCallback((keyCode, value) => {
    if (normalizeString(roleName) === ROLES.ADMIN) {
      setMessageError({
        role_setting: 'Cannot change permissions of Admin.'
      })
    } else if (ROLES.CODE_HAVE_SEND_FEATURE.includes(keyCode)) {
      const roleCode = { ...roleSetting };
      roleCode[keyCode] = {
        ...roleCode[keyCode],
        code: keyCode,
        create: value,
        update: value,
        delete: value,
        send: value,
      };
      setRoleSetting(roleCode);
      setIsInputChanged(!isInputChanged);
    } else {
      const roleCode = { ...roleSetting };
      roleCode[keyCode] = {
        ...roleCode[keyCode],
        code: keyCode,
        create: value,
        update: value,
        delete: value,
      };
      setRoleSetting(roleCode);
      setIsInputChanged(!isInputChanged);
    }
  }, [roleSetting, isInputChanged, roleName]);

  const toggleChangePermission = useCallback((category, field, value) => {
    if (normalizeString(roleName) === ROLES.ADMIN) {
      setMessageError({
        role_setting: 'Cannot change permissions of Admin.'
      })
    } else {
      setRoleSetting((prevRoleSetting) => ({
        ...prevRoleSetting,
        [category]: {
          ...prevRoleSetting[category],
          [field]: value,
        },
      }));
      setIsInputChanged(!isInputChanged);
    }
  }, [roleSetting]);

  const renderPermissions = () => {
    return (
      <div>
        {Object.entries(permissionList).map(([category, roles], index) => (
          <div key={index} className="box">
            <div className="box__title">{category}</div>
            <div className="box__list">
              {roles.map(role => (
                <div key={`${category}-${role.id}`} className="roleForm">
                  <div className="roleForm__header">
                    <div className="roleForm__title">
                      <div className="roleForm__icon">
                        <img src={role.icon} alt={role.title} />
                      </div>
                      <div className="roleForm__group">{role.title}</div>
                    </div>
                    <div className="roleForm__toggle">
                      <ToggleSwitch
                        index={index}
                        keyCode={role.code}
                        keyId="0"
                        isChecked={
                          roleSetting[role.code]?.create === ROLES.ACCEPTED ||
                          roleSetting[role.code]?.update === ROLES.ACCEPTED ||
                          roleSetting[role.code]?.delete === ROLES.ACCEPTED ||
                          roleSetting[role.code]?.send === ROLES.ACCEPTED
                        }
                        onChange={(e) => toggleSetAllFeature(role.code, e.target.checked ? ROLES.ACCEPTED : ROLES.NOT_ACCEPT)}
                      />
                    </div>
                  </div>
                  <div className="roleForm__body">
                    <div className="roleForm__item">
                      <div className="roleForm__feature">Create new {normalizeString(role.label)}</div>
                      <ToggleSwitch
                        index={index}
                        keyCode={ACTIONS.NAME.CREATE}
                        keyId={role.id}
                        isChecked={roleSetting[role.code]?.create === ROLES.ACCEPTED}
                        onChange={(e) => toggleChangePermission(role.code, ACTIONS.NAME.CREATE, e.target.checked ? ROLES.ACCEPTED : ROLES.NOT_ACCEPT)}
                      />
                    </div>
                    <div className="roleForm__item">
                      <div className="roleForm__feature">Edit {normalizeString(role.label)}</div>
                      <ToggleSwitch
                        index={index}
                        keyCode={ACTIONS.NAME.UPDATE}
                        keyId={role.id}
                        isChecked={roleSetting[role.code]?.update === ROLES.ACCEPTED}
                        onChange={(e) => toggleChangePermission(role.code, ACTIONS.NAME.UPDATE, e.target.checked ? ROLES.ACCEPTED : ROLES.NOT_ACCEPT)}
                      />
                    </div>
                    <div className="roleForm__item">
                      <div className="roleForm__feature">Delete {normalizeString(role.label)}</div>
                      <ToggleSwitch
                        index={index}
                        keyCode={ACTIONS.NAME.DELETE}
                        keyId={role.id}
                        isChecked={roleSetting[role.code]?.delete === ROLES.ACCEPTED}
                        onChange={(e) => toggleChangePermission(role.code, ACTIONS.NAME.DELETE, e.target.checked ? ROLES.ACCEPTED : ROLES.NOT_ACCEPT)}
                      />
                    </div>
                    {ROLES.CODE_HAVE_SEND_FEATURE.includes(role.code) && (
                      <div className="roleForm__item">
                        <div className="roleForm__feature">{role.title === 'customers' ? 'WhatsApp' : 'Send'} {normalizeString(role.label)}</div>
                        <ToggleSwitch
                          index={index}
                          keyCode={ACTIONS.NAME.SEND}
                          keyId={role.id}
                          isChecked={roleSetting[role.code]?.send === ROLES.ACCEPTED}
                          onChange={(e) => toggleChangePermission(role.code, ACTIONS.NAME.SEND, e.target.checked ? ROLES.ACCEPTED : ROLES.NOT_ACCEPT)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="permissionForm">
      <div className="permissionForm__header">
        <div className="permissionForm__title">Role Name</div>
        <input
          value={roleName || ''}
          type="text"
          className={`permissionForm__input${messageError?.role_name ? ' permissionForm__input--error' : ''}`}
          placeholder="Role Name"
          autoFocus
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={(isAdmin && isEditingRole)}
        />
        {messageError?.role_name && (
          <div className="permissionForm__message">{messageError?.role_name}</div>
        )}
      </div>
      <div className="permissionForm__content">
        <div className="permissionForm__headline">Role Permissions</div>
        {messageError?.role_setting && (
          <div className="permissionForm__message--role">{messageError?.role_setting}</div>
        )}
        {renderPermissions()}
      </div>
    </div>
  )
}

export default PermissionForm
