import { ImageResponse } from '@vercel/og'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/og/$names')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { names } = params
        const [name1 = '', name2 = ''] = names.split('-')

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
            // Cloudinary fetch failed, fall through to generated image
          }
        }

        // Fall back to generated text-based image

        const formatName = (n: string) =>
          n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : ''

        const formattedName1 = formatName(name1)
        const formattedName2 = formatName(name2)

        return new ImageResponse(
          (
            <div
              style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {/* Decorative blobs */}
              <div
                style={{
                  position: 'absolute',
                  top: 40,
                  left: 40,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  opacity: 0.3,
                  display: 'flex',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 60,
                  right: 60,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)',
                  opacity: 0.2,
                  display: 'flex',
                }}
              />

              {/* Main content */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                {/* Names with heart */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                  }}
                >
                  <span
                    style={{
                      fontSize: 72,
                      fontWeight: 700,
                      background:
                        'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {formattedName1}
                  </span>
                  <span style={{ fontSize: 64 }}>💕</span>
                  <span
                    style={{
                      fontSize: 72,
                      fontWeight: 700,
                      background:
                        'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {formattedName2}
                  </span>
                </div>

                {/* Tagline */}
                <p
                  style={{
                    fontSize: 28,
                    color: '#94a3b8',
                    margin: 0,
                    marginTop: 8,
                  }}
                >
                  Our love, folded at the molecular level
                </p>

                {/* DNA decoration */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 24,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 2,
                      background:
                        'linear-gradient(90deg, transparent, #ec4899)',
                      display: 'flex',
                    }}
                  />
                  <span style={{ fontSize: 24 }}>🧬</span>
                  <div
                    style={{
                      width: 60,
                      height: 2,
                      background:
                        'linear-gradient(90deg, #8b5cf6, transparent)',
                      display: 'flex',
                    }}
                  />
                </div>

                {/* Brand */}
                <p
                  style={{
                    fontSize: 22,
                    color: '#64748b',
                    margin: 0,
                    marginTop: 32,
                  }}
                >
                  folded.love
                </p>
              </div>
            </div>
          ),
          {
            width: 1200,
            height: 630,
          },
        )
      },
    },
  },
})
