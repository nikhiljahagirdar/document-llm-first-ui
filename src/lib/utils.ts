import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanS3URL(url: string | undefined | null): string {
  if (!url) return ""
  try {
    const urlObj = new URL(url)
    const paramsToRemove = [
      "X-Amz-Algorithm",
      "X-Amz-Content-Sha256",
      "X-Amz-Credential",
      "X-Amz-Date",
      "X-Amz-Expires",
      "X-Amz-Signature",
      "X-Amz-SignedHeaders",
      "x-amz-checksum-mode",
      "x-id"
    ]
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param))
    return urlObj.toString()
  } catch (e) {
    return url || ""
  }
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A"
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return "N/A"
    
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (e) {
    return "N/A"
  }
}
