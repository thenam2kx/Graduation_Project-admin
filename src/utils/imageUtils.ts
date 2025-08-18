export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  
  // Nếu đã là URL đầy đủ thì trả về luôn
  if (imagePath.startsWith('http')) return imagePath
  
  // Lấy base URL từ env
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'https://graduation-project-apis.onrender.com'
  
  // Xử lý đường dẫn
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${baseUrl}${cleanPath}`
}