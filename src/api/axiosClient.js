import axios from 'axios';

const axiosClient = axios.create({
  // Sử dụng biến môi trường, nhớ tạo file .env và thêm: REACT_APP_API_BASE_URL=http://localhost:8000/api
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// CHIỀU ĐI: Gắn Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_token');
  // Chặn thêm các chuỗi 'null' / 'undefined' rác
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// CHIỀU VỀ: Xử lý lỗi Token hết hạn (BỔ SUNG)
axiosClient.interceptors.response.use(
  (response) => {
    return response; // Giữ nguyên để khớp với các file API hiện tại của bạn
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Token đã hết hạn hoặc không hợp lệ. Đăng xuất...');
      // Xóa rác trong kho
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_info');

      // Đá về trang đăng nhập (Nếu đang không ở trang login)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;