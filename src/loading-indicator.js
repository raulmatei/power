import React from 'react'

export default function LoadingIndicator() {
  return (
    <div className="graph-loader-bg">
      <div className="graph-loader-wrapper">
        <div className="loaders">
          <div className="loader1"></div>
        </div>
        <div className="loaders">
          <div className="loader2"></div>
        </div>
        <div className="loaders">
          <div className="loader3"></div>
        </div>
        <div className="loaders">
          <div className="loader4"></div>
        </div>
      </div>
    </div>
  )
}