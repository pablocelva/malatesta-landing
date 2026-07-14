const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export class CloudinaryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CloudinaryError'
  }
}

export function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new CloudinaryError('El archivo debe ser una imagen (JPG, PNG, WEBP).')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new CloudinaryError(`La imagen no puede superar ${formatFileSize(MAX_FILE_SIZE)}.`)
  }
}

export async function uploadToCloudinary(file: File): Promise<string> {
  validateImageFile(file)

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new CloudinaryError(body?.error?.message ?? 'Error al subir la imagen.')
  }

  const data = await res.json()
  return data.secure_url as string
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
