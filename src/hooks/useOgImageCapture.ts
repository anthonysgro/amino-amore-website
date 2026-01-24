import { useCallback, useRef } from 'react'
import { uploadOgImageFn, checkOgImageFn } from '@/api/uploadOgImage'

interface UseOgImageCaptureOptions {
  names: string
  enabled?: boolean
}

/**
 * Hook to capture and upload OG images for social sharing.
 * Automatically checks if an image already exists before uploading.
 */
export function useOgImageCapture({ names, enabled = true }: UseOgImageCaptureOptions) {
  const hasCheckedRef = useRef(false)
  const isUploadingRef = useRef(false)

  const captureAndUpload = useCallback(
    async (getImageDataUrl: () => string | null) => {
      // Skip if disabled, already checked, or currently uploading
      if (!enabled || hasCheckedRef.current || isUploadingRef.current || !names) {
        return
      }

      hasCheckedRef.current = true

      try {
        // First check if image already exists
        const { exists } = await checkOgImageFn({ data: names })
        if (exists) {
          console.log('OG image already exists for', names)
          return
        }

        // Get the image data from the viewer
        const imageDataUrl = getImageDataUrl()
        if (!imageDataUrl) {
          console.warn('Could not capture image data')
          return
        }

        // Upload to Cloudinary
        isUploadingRef.current = true
        const result = await uploadOgImageFn({
          data: { names, imageData: imageDataUrl },
        })

        if (result.success) {
          console.log('OG image uploaded successfully:', result.url)
        } else {
          console.warn('OG image upload failed:', result.error)
        }
      } catch (error) {
        console.error('OG image capture error:', error)
      } finally {
        isUploadingRef.current = false
      }
    },
    [names, enabled],
  )

  return { captureAndUpload }
}
