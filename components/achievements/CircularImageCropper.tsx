'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ZoomIn, ZoomOut, RotateCw, Check } from 'lucide-react'

interface CircularImageCropperProps {
  imageUrl: string
  onCrop: (croppedImageUrl: string) => void
  onCancel: () => void
}

export function CircularImageCropper({ imageUrl, onCrop, onCancel }: CircularImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const MIN_SCALE = 0.5
  const MAX_SCALE = 10 // Increased max zoom for better detail

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
      setImageLoaded(true)
      // Center the image initially
      setPosition({ x: 0, y: 0 })
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current && imageLoaded && imageSize.width > 0 && imageSize.height > 0) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
        
        // Set initial scale to fit image within crop area
        const cropRadius = Math.min(rect.width * 0.4, rect.height * 0.4)
        const cropSize = cropRadius * 2
        
        // Calculate how image fits in container (object-contain behavior)
        const containerAspect = rect.width / rect.height
        const imgAspect = imageSize.width / imageSize.height
        
        let displayedWidth: number
        let displayedHeight: number
        
        if (imgAspect > containerAspect) {
          // Image is wider - fit to height
          displayedHeight = rect.height
          displayedWidth = displayedHeight * imgAspect
        } else {
          // Image is taller - fit to width
          displayedWidth = rect.width
          displayedHeight = displayedWidth / imgAspect
        }
        
        // Scale to fill crop area nicely
        const scaleToFit = Math.max(cropSize / displayedWidth, cropSize / displayedHeight) * 1.1
        setScale(Math.max(Math.min(scaleToFit, MAX_SCALE), MIN_SCALE))
      }
    }

    updateContainerSize()
    window.addEventListener('resize', updateContainerSize)
    return () => window.removeEventListener('resize', updateContainerSize)
  }, [imageLoaded, imageSize])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Pinch to zoom support
  const lastPinchDistance = useRef<number | null>(null)
  const initialPinchScale = useRef<number>(1)

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default if touching buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    
    if (e.touches.length === 2) {
      // Pinch gesture
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      lastPinchDistance.current = distance
      initialPinchScale.current = scale
      setIsDragging(false)
    } else if (e.touches.length === 1) {
      // Single touch drag
      e.preventDefault()
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't prevent default if touching buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    
    if (e.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (lastPinchDistance.current !== null) {
        const scaleChange = distance / lastPinchDistance.current
        setScale((prev) => {
          const newScale = initialPinchScale.current * scaleChange
          return Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE)
        })
      }
    } else if (isDragging && e.touches.length === 1) {
      // Single touch drag
      e.preventDefault()
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Don't prevent default if touching buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    
    e.preventDefault()
    setIsDragging(false)
    lastPinchDistance.current = null
  }

  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const newScale = prev + delta
      return Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE)
    })
  }

  const handleZoomIn = () => {
    setScale((prev) => {
      const newScale = prev * 1.2 // More aggressive zoom
      return Math.min(newScale, MAX_SCALE)
    })
  }

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = prev / 1.2 // More aggressive zoom out
      return Math.max(newScale, MIN_SCALE)
    })
  }

  const handleRotate = () => {
    // For simplicity, we'll just reset position and scale
    // Full rotation would require canvas manipulation
    setPosition({ x: 0, y: 0 })
    setScale(1)
  }

  const handleCrop = () => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    const container = containerRef.current

    // Get actual screen positions
    const containerRect = container.getBoundingClientRect()
    const imgRect = img.getBoundingClientRect()
    
    // Crop circle center in screen coordinates (center of container)
    const cropCenterScreenX = containerRect.left + containerRect.width / 2
    const cropCenterScreenY = containerRect.top + containerRect.height / 2
    
    // Crop radius in screen pixels
    const cropRadiusScreen = Math.min(containerRect.width * 0.4, containerRect.height * 0.4)
    const cropSize = cropRadiusScreen * 2

    // Get image natural size
    const imgNaturalWidth = img.naturalWidth
    const imgNaturalHeight = img.naturalHeight
    
    // Get displayed image size (actual rendered size on screen)
    const imgDisplayedWidth = imgRect.width
    const imgDisplayedHeight = imgRect.height
    
    // Calculate crop center relative to image top-left corner (in screen coordinates)
    const cropCenterRelativeX = cropCenterScreenX - imgRect.left
    const cropCenterRelativeY = cropCenterScreenY - imgRect.top
    
    // Convert to natural image coordinates
    // The ratio of screen position to displayed size equals ratio of natural position to natural size
    const cropCenterNaturalX = (cropCenterRelativeX / imgDisplayedWidth) * imgNaturalWidth
    const cropCenterNaturalY = (cropCenterRelativeY / imgDisplayedHeight) * imgNaturalHeight
    
    // Calculate crop radius in natural image coordinates
    const cropRadiusNatural = (cropRadiusScreen / imgDisplayedWidth) * imgNaturalWidth
    
    // Calculate source rectangle bounds
    const sourceX = Math.max(0, cropCenterNaturalX - cropRadiusNatural)
    const sourceY = Math.max(0, cropCenterNaturalY - cropRadiusNatural)
    const sourceSize = Math.min(
      cropRadiusNatural * 2,
      imgNaturalWidth - sourceX,
      imgNaturalHeight - sourceY
    )

    // Set canvas size
    canvas.width = cropSize
    canvas.height = cropSize

    // Create circular clipping path
    ctx.beginPath()
    ctx.arc(cropSize / 2, cropSize / 2, cropRadiusScreen, 0, Math.PI * 2)
    ctx.clip()

    // Draw image to canvas - crop from natural image
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      cropSize,
      cropSize
    )

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedUrl = URL.createObjectURL(blob)
        onCrop(croppedUrl)
      }
    }, 'image/png')
  }

  if (!imageLoaded) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <div className="text-white/70">Loading image...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Top bar with close button */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="text-white min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          aria-label="Cancel"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-white font-semibold text-lg">Crop Image</h2>
        <div className="w-[44px]"></div> {/* Spacer for centering */}
      </div>

      {/* Crop area - full screen center */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative" style={{ touchAction: 'none' }}>
        <div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Circular crop overlay - simple dark mask */}
          {containerSize.width > 0 && (() => {
            const cropRadius = Math.min(containerSize.width * 0.4, containerSize.height * 0.4)
            return (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background: `radial-gradient(circle at center, transparent ${cropRadius}px, rgba(0, 0, 0, 1) ${cropRadius}px)`,
                }}
              >
                {/* Simple crop circle border */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full pointer-events-none"
                  style={{
                    width: `${cropRadius * 2}px`,
                    height: `${cropRadius * 2}px`,
                  }}
                />
              </div>
            )
          })()}

          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="absolute select-none touch-none"
            draggable={false}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
              transformOrigin: 'center center',
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>
      </div>

      {/* Bottom controls bar */}
      <div className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-4 p-4">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className="text-white disabled:text-white/30 min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation rounded-full hover:bg-white/10 transition-colors"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <ZoomOut className="h-6 w-6" />
          </button>
          
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className="text-white disabled:text-white/30 min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation rounded-full hover:bg-white/10 transition-colors"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <ZoomIn className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="text-white min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation rounded-full hover:bg-white/10 transition-colors"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <RotateCw className="h-6 w-6" />
          </button>
        </div>

        {/* Action button */}
        <div className="px-4 pb-4 sm:pb-6">
          <button
            type="button"
            onClick={handleCrop}
            className="w-full bg-white text-black font-semibold py-3 rounded-lg min-h-[48px] touch-manipulation hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Check className="h-5 w-5" />
            Done
          </button>
        </div>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
