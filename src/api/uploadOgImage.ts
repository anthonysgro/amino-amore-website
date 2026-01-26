import { createServerFn } from '@tanstack/react-start'

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Server function to upload an OG image to Cloudinary.
 * Images are stored with a public_id based on the couple's names for easy retrieval.
 */
export const uploadOgImageFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { names: string; imageData: string }) => {
    if (!data.names || !data.imageData) {
      throw new Error('Names and image data are required')
    }
    // Validate it's a data URL
    if (!data.imageData.startsWith('data:image/')) {
      throw new Error('Invalid image data format')
    }
    return data
  })
  .handler(async ({ data }): Promise<UploadResult> => {
    const { names, imageData } = data

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials not configured')
      return { success: false, error: 'Upload service not configured' }
    }

    try {
      // Generate signature for upload
      const timestamp = Math.floor(Date.now() / 1000)
      // Sanitize names: trim whitespace and replace any remaining spaces with hyphens
      const sanitizedNames = names.trim().toLowerCase().replace(/\s+/g, '-')
      const publicId = `og-images/${sanitizedNames}`

      // Create signature string
      const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`

      // Generate SHA-1 signature
      const encoder = new TextEncoder()
      const data_buffer = encoder.encode(signatureString)
      const hashBuffer = await crypto.subtle.digest('SHA-1', data_buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', imageData)
      formData.append('public_id', publicId)
      formData.append('timestamp', timestamp.toString())
      formData.append('signature', signature)
      formData.append('api_key', apiKey)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Cloudinary upload failed:', errorText)
        return { success: false, error: 'Upload failed' }
      }

      const result = await response.json()
      return { success: true, url: result.secure_url }
    } catch (error) {
      console.error('Upload error:', error)
      return { success: false, error: 'Upload failed' }
    }
  })

/**
 * Check if an OG image exists in Cloudinary for the given names.
 */
export const checkOgImageFn = createServerFn({ method: 'GET' })
  .inputValidator((names: string) => {
    if (!names) {
      throw new Error('Names parameter is required')
    }
    return names
  })
  .handler(async ({ data: names }): Promise<{ exists: boolean; url?: string }> => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME

    if (!cloudName) {
      return { exists: false }
    }

    // Construct the Cloudinary URL for the image
    const sanitizedNames = names.trim().toLowerCase().replace(/\s+/g, '-')
    const publicId = `og-images/${sanitizedNames}`
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.png`

    try {
      // Check if image exists by making a HEAD request
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        return { exists: true, url }
      }
      return { exists: false }
    } catch {
      return { exists: false }
    }
  })
