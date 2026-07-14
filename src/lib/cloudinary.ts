import { supabase } from './supabase'

const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME
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

async function getUploadSignature(): Promise<{ signature: string; timestamp: number; api_key: string }> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new CloudinaryError('No hay sesión activa. Iniciá sesión para subir imágenes.')
  }

  const res = await fetch('/.netlify/functions/cloudinary-sign', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new CloudinaryError(body?.error ?? 'Error al obtener firma de upload.')
  }

  return res.json()
}

export async function uploadToCloudinary(file: File): Promise<string> {
  validateImageFile(file)

  const { signature, timestamp, api_key } = await getUploadSignature()

  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', api_key)
  fd.append('timestamp', String(timestamp))
  fd.append('signature', signature)
  fd.append('upload_preset', import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET)

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
