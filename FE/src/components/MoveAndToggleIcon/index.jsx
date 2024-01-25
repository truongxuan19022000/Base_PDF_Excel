import React from 'react'

const MoveAndToggleIcon = ({
  isOpen = false,
  isShowMoveIcon = false,
  isShowToggleIcon = true,
  handleMouseEnterIcon,
  handleMouseLeaveIcon,
}) => {
  return (
    <div className="moveToggleIcon">
      {isShowMoveIcon && (
        <div
          onMouseEnter={handleMouseEnterIcon}
          onMouseLeave={handleMouseLeaveIcon}
          className={`moveToggleIcon__icon moveToggleIcon__icon--moveIcon${isShowToggleIcon ? '' : ' moveToggleIcon__icon--position'}`}
        >
          <img src="/icons/move-icon.svg" alt="move icon" />
        </div>
      )}
      {isShowToggleIcon &&
        <div className="moveToggleIcon__icon">
          <img
            className={`moveToggleIcon__arrowDown
          ${!isOpen ? ' moveToggleIcon__arrowDownRotate' : ''}`}
            src="/icons/arrow_down.svg"
            alt="arrow down"
          />
        </div>
      }
    </div>
  )
}

export default MoveAndToggleIcon
