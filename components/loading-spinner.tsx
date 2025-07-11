import type React from "react"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4" role="status" aria-label="Loading">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 border-solid rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
