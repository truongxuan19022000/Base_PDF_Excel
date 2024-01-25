import React from 'react'

import { CHAT_FILE_MAX_SIZE } from 'src/constants/config';

const InputDialog = ({
  setType,
  setFileList,
  setMessageError,
  closeInputDialog,
}) => {
  const handleSelectMedia = (e) => {
    setFileList([]);
    setType('image_video');
    const { files } = e.target;
    const filterMedia = Array.from(files).filter((item) => {
      const extensions = ['.jpeg', '.png', '.jpg', '.mp4', '.3gp'];
      const fileExtension = item.name.split('.').pop().toLowerCase();
      const isValidExtension = extensions.includes(`.${fileExtension}`);
      const isSizeValid = item.size <= CHAT_FILE_MAX_SIZE;
      if (!isValidExtension) {
        setMessageError({
          message: 'The document must be a media file of type: jpeg, png, jpg, mp4, 3gp.'
        });
      }
      if (!isSizeValid) {
        setMessageError({
          message: 'File size must be 64MB or smaller.'
        });
      }
      return isValidExtension && isSizeValid;
    });
    setFileList((prev) => [...prev, ...filterMedia]);
    closeInputDialog();
  };

  const handleSelectDocument = (e) => {
    setFileList([]);
    setType('document');
    const { files } = e.target;
    const filterDocument = Array.from(files).filter((item) => {
      const extensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.ppt', '.xls', '.pptx', '.xlsx'];
      const fileExtension = item.name.split('.').pop().toLowerCase();
      const isValidExtension = extensions.includes(`.${fileExtension}`);
      const isSizeValid = item.size <= CHAT_FILE_MAX_SIZE;
      if (!isValidExtension) {
        setMessageError({
          message: 'The document must be a file of type: txt, pdf, ppt, doc, xls, docx, pptx, xlsx.'
        });
      }
      if (!isSizeValid) {
        setMessageError({
          message: 'File size must be 64MB or smaller.'
        });
      }
      return isValidExtension && isSizeValid;
    });
    setFileList((prev) => [...prev, ...filterDocument]);
    closeInputDialog();
  };

  return (
    <div className="inputDialog">
      <label className="inputDialog__act" htmlFor="document">
        <img src="/icons/document.svg" alt="document" />
        <span>Document</span>
      </label>
      <label className="inputDialog__act" htmlFor="media">
        <img src="/icons/media.svg" alt="media" />
        <span>Photos & Video</span>
      </label>
      <input
        className="inputDialog__selectFile"
        type="file"
        id="document"
        accept=".pdf,.doc,.docx,.txt,.ppt,.xls,.pptx,.xlsx"
        onChange={handleSelectDocument}
        multiple
      />
      <input
        className="inputDialog__selectFile"
        type="file"
        id="media"
        accept=".jpeg,.png,.jpg,.mp4,.3gp"
        onChange={handleSelectMedia}
        multiple
      />
    </div>
  )
}

export default InputDialog
