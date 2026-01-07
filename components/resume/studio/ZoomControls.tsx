// components/resume/studio/ZoomControls.tsx
// Zoom controls for resume canvas

'use client'

import React from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface ZoomControlsProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  min?: number
  max?: number
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  min = 50,
  max = 200,
}) => {
  const handleZoomIn = () => {
    const newZoom = Math.min(max, zoom + 10)
    onZoomChange(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(min, zoom - 10)
    onZoomChange(newZoom)
  }

  const handleReset = () => {
    onZoomChange(100)
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl">
        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= min}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Zoom Out (Ctrl + -)"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>

        {/* Zoom Level Display */}
        <button
          onClick={handleReset}
          className="px-3 py-1 min-w-[60px] text-sm font-semibold text-white hover:bg-white/10 rounded-full transition-all"
          title="Reset Zoom (Ctrl + 0)"
        >
          {zoom}%
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          disabled={zoom >= max}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Zoom In (Ctrl + +)"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Fit to Screen */}
        <button
          onClick={handleReset}
          className="p-2 rounded-full hover:bg-white/10 transition-all"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
