// Trợ thủ xử lý URL ảnh tương thích cả Localhost và Production trên Vercel/Cloud
export const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
};

export const getBackendHost = () => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/\/api\/?$/, '');
};

export const resolveImageUrl = (imgPath) => {
  if (!imgPath) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
  if (typeof imgPath === 'string' && (imgPath.startsWith('http://') || imgPath.startsWith('https://'))) {
    return imgPath;
  }
  
  const host = getBackendHost();
  if (typeof imgPath === 'string' && imgPath.startsWith('/storage/')) {
    return `${host}${imgPath}`;
  }
  return `${host}/api/get-image?path=${encodeURIComponent(imgPath)}`;
};

export default resolveImageUrl;
