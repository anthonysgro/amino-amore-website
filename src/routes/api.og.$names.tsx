import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/og/$names')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { names } = params

        // Check if a cached protein image exists in Cloudinary
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME
        if (cloudName) {
          const publicId = `og-images/${names.toLowerCase()}`
          const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_630,c_fill/${publicId}.png`

          try {
            // Fetch and proxy the image directly (crawlers don't always follow redirects)
            const imageResponse = await fetch(cloudinaryUrl)
            if (imageResponse.ok) {
              const imageBuffer = await imageResponse.arrayBuffer()
              return new Response(imageBuffer, {
                headers: {
                  'Content-Type': 'image/png',
                  'Cache-Control': 'public, max-age=31536000, immutable',
                },
              })
            }
          } catch {
            // Cloudinary fetch failed, fall through to fallback
          }
        }

        // Fall back to static preview image
        // This handles cases where the protein hasn't been viewed yet
        return new Response(null, {
          status: 302,
          headers: {
            Location: 'https://folded.love/preview.png',
            'Cache-Control': 'public, max-age=60',
          },
        })
      },
    },
  },
})
