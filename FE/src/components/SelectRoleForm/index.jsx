import React, { useState } from 'react'

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper'

const SelectRoleForm = ({
  role,
  setRole,
  submitting,
  messageError,
  roleList = [],
  setIsDisableSubmit,
  isDisabled = false,
}) => {
  const [isShowItemList, setIsShowItemList] = useState(false)

  const handleShowRoleList = () => {
    if (submitting) return
    setIsShowItemList(!isShowItemList);
  }

  const handleSelectItem = (item) => {
    if (submitting) {
      return
    }

    if (item && Object.keys(item).length > 0) {
      setRole(item)
      setIsShowItemList(false)
      setIsDisableSubmit(false)
    }
  }

  return (
    <div className={`selectRoleForm${isShowItemList ? ' selectRoleForm--active' : ''}${messageError ? ' selectRoleForm--error' : ''}${isDisabled ? ' selectRoleForm--disabled' : ''}`}>
      <div className="selectRoleForm__label" onClick={handleShowRoleList}>
        {role && Object.keys(role).length > 0 ? (
          <div className="selectRoleForm__action selectRoleForm__action--selected">{role?.role_name}</div>
        ) : (
          <div className="selectRoleForm__action">Select Role</div>
        )}
        <img
          className={`selectRoleForm__arrowDown${isShowItemList ? ' selectRoleForm__arrowDown--rotate' : ''}`}
          src="/icons/arrow_down.svg"
          alt="arrow_down.svg"
        />
      </div>
      {(isShowItemList) &&
        <ClickOutSideWrapper onClickOutside={() => setIsShowItemList(false)}>
          <div className={`selectRoleForm__list${roleList?.length > 6 ? ' selectRoleForm__list--scroll' : ''}`}>
            {roleList?.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectItem(item)}
                className={`selectRoleForm__option${item?.id === role?.id ? ' selectRoleForm__option--selected' : ''}`}
              >
                {item?.role_name}
              </div>
            ))}
          </div>
        </ClickOutSideWrapper>
      }
    </div>
  )
}

export default SelectRoleForm
