import axios from 'axios';

// Cấu hình Axios dùng chung cho toàn bộ API của frontend
const axiosClient = axios.create({
  // Sử dụng biến môi trường, nhớ tạo file .env và thêm: REACT_APP_API_BASE_URL=http://localhost:8000/api
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Gắn token vào mỗi request đi ra nếu người dùng đã đăng nhập
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_token');
  // Chặn thêm các chuỗi 'null' / 'undefined' rác
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Nếu token hết hạn thì tự xóa dữ liệu cũ và đưa người dùng về trang đăng nhập
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