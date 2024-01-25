import React from 'react';

import { DEFAULT_IMAGE_SRC, USER } from 'src/constants/config';

const ThumbnailUploader = ({
  thumb = null,
  submitting = false,
  handleRemoveThumb,
  handlePreviewThumb,
}) => {

  const renderUploader = (imageSrc, onClickHandler) => (
    <>
      <div className="thumb__img">
        {imageSrc === DEFAULT_IMAGE_SRC ? (
          <img className="thumb__img--default" src={imageSrc} alt="Profile_picture" width={28} height={28} />
        ) : (
          <img className="thumb__img--avatar" src={imageSrc} alt="Profile_picture" />
        )}
      </div>
      <div className="thumb__action">
        {!submitting && (
          <>
            <label className="thumb__label">
              Upload
              <input className="thumb__input" type="file" accept="image/*" onChange={handlePreviewThumb} disabled={submitting} />
            </label>
            {onClickHandler && (
              <>
                <div className="thumb__circle"></div>
                <label className="thumb__label" onClick={onClickHandler}>Remove</label>
              </>
            )}
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      {thumb ? (
        <>
          {(thumb === USER.AVATAR.NO_PICTURE_URL) ? (
            <>
              {renderUploader(DEFAULT_IMAGE_SRC)}
            </>
          ) : (
            <>
              {renderUploader(thumb.preview || thumb, handleRemoveThumb)}
            </>
          )}
        </>
      ) : (
        <>
          {renderUploader(DEFAULT_IMAGE_SRC)}
        </>
      )}
    </>
  )
}

export default ThumbnailUploader;
