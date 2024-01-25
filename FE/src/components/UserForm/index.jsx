import React from 'react'

import ThumbnailForm from '../ThumbnailForm'
import SelectRoleForm from '../SelectRoleForm'

const UserForm = ({
  setRole,
  password,
  name = 'NA',
  email = 'NA',
  username = 'NA',
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
}) => {

  return (
    <div className="userForm">
      <div className="box">
        <div className="box__left">
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
        <div className="box__right">
          <div className="box__title">Role</div>
          <div className={`box__role${messageError?.role_id ? ' box__role--error' : ''}`}>
            <SelectRoleForm
              role={role}
              setRole={setRole}
              roleList={roleList}
              submitting={submitting}
              messageError={messageError?.role_id}
              setIsDisableSubmit={setIsDisableSubmit}
            />
          </div>
          {messageError?.role_id && (
            <div className="box__message">{messageError?.role_id}</div>
          )}
        </div>
      </div>
      <div className="box">
        <div className="box__left">
          <div className="box__title">Username</div>
          <input
            value={username || ''}
            type="text"
            className={`box__input${messageError?.username ? ' box__input--error' : ''}`}
            placeholder="Username"
            onChange={(e) => handleInputChange('username', e.target.value)}
            disabled={submitting}
          />
          {messageError?.username && (
            <div className="box__message">{messageError?.username}</div>
          )}
        </div>
        <div className="box__right">
          <div className="box__title">Password</div>
          <input
            value={password || ''}
            type="text"
            className={`box__input${messageError?.password ? ' box__input--error' : ''}`}
            placeholder="Password"
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={submitting}
          />
          <div className="box__generator" onClick={handleGeneratePassword}>Generate</div>
          {messageError?.password && (
            <div className="box__message">{messageError?.password}</div>
          )}
        </div>
      </div>
      <div className="box">
        <div className="box__left">
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
            <div className="box__message">{messageError?.email}</div>
          )}
        </div>
      </div>
      <div className="thumb">
        <div className="thumb__title">Profile Picture (optional)</div>
        <div className="thumb__box">
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
