/**
 * Supabase Storage utilities for wedding app images
 */
import { supabase } from './supabase'

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PRODUCTOS: 'productos'
} as const

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket ('avatars' or 'productos')
 * @param path - The file path within the bucket
 * @returns Promise with the public URL or error
 */
export async function uploadImage(
  file: File,
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): Promise<{ url?: string; error?: string }> {
  try {
    const bucketName = STORAGE_BUCKETS[bucket]
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true // Replace if exists
      })

    if (error) {
      return { error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path)

    return { url: publicUrl }
  } catch {
    return { error: 'Error uploading image' }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket
 * @param path - The file path to delete
 * @returns Promise with success/error status
 */
export async function deleteImage(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const bucketName = STORAGE_BUCKETS[bucket]
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Error deleting image' }
  }
}

/**
 * Generate a unique file path for storage
 * @param originalName - Original file name
 * @param prefix - Optional prefix for the path
 * @returns Unique file path
 */
export function generateFilePath(originalName: string, prefix?: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  
  const fileName = `${timestamp}-${randomString}.${extension}`
  
  return prefix ? `${prefix}/${fileName}` : fileName
}
