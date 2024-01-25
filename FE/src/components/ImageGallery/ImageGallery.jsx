import React, { useEffect } from 'react';

const ImageGallery = ({
  type = '',
  fileList = [],
  setFileList,
  message,
  setMessage,
  currentFile,
  setCurrentFile
}) => {
  useEffect(() => {
    if (fileList?.length !== 0) {
      fileList[0].caption = message;
    }
  }, [])
  useEffect(() => {
    setMessage(fileList[currentFile]?.caption || '')
  }, [currentFile, fileList])
  useEffect(() => {
    if (fileList[currentFile]) {
      fileList[currentFile].caption = message;
    }
    setFileList(fileList);
  }, [message, fileList, currentFile])

  const handleRemoveMedia = (index, e) => {
    e.stopPropagation();
    setFileList(prev => prev.filter((_, fileListIndex) => fileListIndex !== index))
  }
  const handleSelectMedia = (e) => {
    const { files } = e.target;
    setFileList(prev => [...prev, ...Array.from(files)])
  }

  return (
    <div className="gallery">
      <div className="gallery__count">
        <p>{fileList?.length}</p>
      </div>
      {fileList?.map((item, index) => (
        <div
          key={index}
          className={`gallery__thumbnail ${currentFile === index ? 'gallery__thumbnail--select' : ''}`}
          onClick={() => setCurrentFile(index)}
        >
          <img
            className="gallery__close"
            src="/icons/close-mark.svg"
            alt="close"
            onClick={(e) => { handleRemoveMedia(index, e) }}
          />
          {!(item?.type?.startsWith('image/') || item.type.startsWith('video/')) &&
            <img className={`gallery__image ${currentFile === index ? 'gallery__image--select' : ''}`} src="/images/file.webp" alt={item?.name || ''} />
          }
          {item?.type?.startsWith('image/') &&
            <img className={`gallery__image ${currentFile === index ? 'gallery__image--select' : ''}`} src={URL.createObjectURL(item) || ''} alt={item?.name || ''} />
          }
          {item.type.startsWith('video/') &&
            <video className={`gallery__image ${currentFile === index ? 'gallery__image--select' : ''}`} alt={item?.name || ''} >
              <source src={URL.createObjectURL(item) || ''} type="video/mp4" />
            </video>
          }
        </div>))
      }
      <label className="gallery__thumbnail gallery__thumbnail--plus" htmlFor="file">
        <img className="gallery__image gallery__image--plus" src="/icons/input-plus.svg" alt="add file" />
      </label>
      {type === 'image_video'}
      <input
        className="gallery__selectImage"
        type="file"
        id="file"
        accept={`${type === 'image_video' ?
          '.jpeg,.png,.jpg,.mp4,.3gp' :
          '.pdf,.doc,.docx,.txt,.ppt,.xls,.pptx,.xlsx'}`}
        onChange={handleSelectMedia}
        multiple
      />
    </div>
  )
}

export default ImageGallery
