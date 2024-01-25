import React from 'react'
const PulsedLoading = () => {
  return (
    <div className="spinner-box">
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default PulsedLoading
