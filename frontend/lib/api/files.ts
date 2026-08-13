import { apiClient } from "@/lib/api/client"

/** Uploads a file and returns the storage key to persist on an entity (e.g. an attachment's fileUrl). */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const response = await apiClient.post<{ url: string }>("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data.url
}

/** Downloads a stored file key as an authenticated blob and saves it under the given file name. */
export async function downloadFile(key: string, fileName: string): Promise<void> {
  const response = await apiClient.get<Blob>(`/files/${encodeURIComponent(key)}`, { responseType: "blob" })
  const objectUrl = URL.createObjectURL(response.data)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
