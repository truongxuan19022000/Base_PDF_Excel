import React from 'react'

import ThumbnailForm from '../ThumbnailForm'
import SelectRoleForm from '../SelectRoleForm'

const UserForm = ({
  setRole,
  password,
  name = '',
  email = '',
  username = '',
  role = {},
  thumb = null,
  roleList = [],
  submitting = false,
  messageError = '',
  handleInputChange,
  handleRemoveThumb,
  setIsDisableSubmit,
  handlePreviewThumb,
  handleGeneratePassword,
  isEditAllowed = false,
  isOwnerProfile = false,
  confirmedPassword = '',
}) => {

  return (
    <div className="userForm">
      <div className={`box${(isEditAllowed || isOwnerProfile) ? '' : ' box--disabled'}`}>
        <div className="box__innerBox">
          <div className="box__title">Name</div>
          <input
            value={name || ''}
            type="text"
            className={`box__input${messageError?.name ? ' box__input--error' : ''}`}
            placeholder="Name"
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={submitting}
          />
          {messageError?.name && (
            <div className="box__message">{messageError?.name}</div>
          )}
        </div>
        <div className="box__innerBox">
          <div className="box__title">Role</div>
          <div className={`box__role${messageError?.role_id ? ' box__role--error' : ''}${(!isEditAllowed && isOwnerProfile) ? ' box__role--disabled' : ''}`}>
            <SelectRoleForm
              role={role}
              setRole={setRole}
              roleList={roleList}
              submitting={submitting}
              messageError={messageError?.role_id}
              setIsDisableSubmit={setIsDisableSubmit}
              isDisabled={!isEditAllowed && isOwnerProfile}
            />
          </div>
          {messageError?.role_id && (
            <div className="box__message">{messageError.role_id}</div>
          )}
        </div>
      </div>
      <div className={`box${(isEditAllowed || isOwnerProfile) ? '' : ' box--disabled'}`}>
        <div className="box__innerBox">
          <div className="box__title">Username</div>
          <input
            value={username || ''}
            type="text"
            className={`box__input${messageError?.username ? ' box__input--error' : ''}${(!isEditAllowed && isOwnerProfile) ? ' box__input--disabled' : ''}`}
            placeholder="Username"
            onChange={(e) => handleInputChange('username', e.target.value)}
            disabled={submitting}
            readOnly={!isEditAllowed && isOwnerProfile}
          />
          {messageError?.username && (
            <div className="box__message">{messageError.username}</div>
          )}
        </div>
        <div className="box__innerBox">
          <div className="box__title">Email</div>
          <input
            value={email || ''}
            type="text"
            className={`box__input${messageError?.email ? ' box__input--error' : ''}`}
            placeholder="Email"
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={submitting}
          />
          {messageError?.email && (
            <div className="box__message">{messageError.email}</div>
          )}
        </div>
      </div>
      <div className={`box${(isEditAllowed || isOwnerProfile) ? '' : ' box--disabled'}`}>
        <div className="box__innerBox">
          <div className="box__title">Set new password</div>
          <div className={`box__inputBox${messageError?.password ? ' box__inputBox--error' : ''}`}>
            <input
              value={password || ''}
              type="text"
              placeholder="Password"
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={submitting}
            />
            <div className="box__generator" onClick={handleGeneratePassword}>Generate</div>
          </div>
          {messageError?.password && (
            <div className="box__message">{messageError.password}</div>
          )}
        </div>
        <div className="box__innerBox">
          <div className="box__title">Confirm new password</div>
          <input
            value={confirmedPassword || ''}
            type="text"
            className={`box__input${messageError?.confirm_new_password ? ' box__input--error' : ''}`}
            placeholder="Password"
            onChange={(e) => handleInputChange('confirm_new_password', e.target.value)}
            disabled={submitting}
          />
          {messageError?.confirm_new_password && (
            <div className="box__message">{messageError.confirm_new_password}</div>
          )}
        </div>
      </div>
      <div className="thumb">
        <div className="thumb__title">Profile Picture (optional)</div>
        <div className={`thumb__box${(isEditAllowed || isOwnerProfile) ? '' : ' thumb__box--disabled'}`}>
          <ThumbnailForm
            submitting={submitting}
            thumb={thumb || null}
            handleRemoveThumb={handleRemoveThumb}
            handlePreviewThumb={handlePreviewThumb}
          />
        </div>
        {messageError?.profile_picture && (
          <div className="thumb__message">
            {messageError.profile_picture}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserForm
