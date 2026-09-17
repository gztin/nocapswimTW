import { useState } from 'react'

export const PLACEHOLDER_IMAGE = '/images/pool-placeholder.webp'

interface LocationImageProps {
  imageUrl?: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
}

export function LocationImage({ imageUrl, alt, className, loading = 'lazy' }: LocationImageProps) {
  const trimmedImageUrl = imageUrl?.trim() || undefined
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const imageSource = trimmedImageUrl && failedImageUrl !== trimmedImageUrl
    ? trimmedImageUrl
    : PLACEHOLDER_IMAGE

  return (
    <img
      className={className}
      src={imageSource}
      alt={alt}
      loading={loading}
      onError={() => {
        if (trimmedImageUrl && failedImageUrl !== trimmedImageUrl) {
          setFailedImageUrl(trimmedImageUrl)
        }
      }}
    />
  )
}
