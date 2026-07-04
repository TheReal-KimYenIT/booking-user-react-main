import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

// Tạo hộp chứa dữ liệu Auth
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi tải lại trang web, tự động kiểm tra xem có token cũ không
  useEffect(() => {
    const checkUserLoggedIn = () => {
      const storedToken = localStorage.getItem('customer_token');
      const storedUser = localStorage.getItem('customer_info');

      // Bổ sung chặn token rác (undefined/null) ngay từ lúc mở web
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Dọn dẹp nếu có rác
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  // Hàm Đăng nhập
  // Hàm Đăng nhập
  const login = async (email, password) => {
    try {
      // SỬA LỖI: 
      // 1. URL phải là /login (như đã khai báo trong api.php)
      // 2. Phải truyền thêm type: 'customer' để Laravel biết tìm ở bảng nào
      const response = await axiosClient.post('/login', {
        email,
        password,
        type: 'customer'
      });

      const token = response.data.token;
      const userData = response.data.user;

      if (!token) {
        return { success: false, message: 'Lỗi hệ thống: Backend không cấp token!' };
      }

      // Cất Token và Thông tin vào Local Storage
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_info', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        // Bắt thông báo lỗi chi tiết từ Laravel trả về
        message: error.response?.data?.message || 'Email hoặc mật khẩu không chính xác!'
      };
    }
  };

  // Hàm Đăng xuất
  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_info');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};