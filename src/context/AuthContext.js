import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

// Tạo ngữ cảnh lưu thông tin đăng nhập để các component có thể dùng chung
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi mở lại trang, tự động kiểm tra token và thông tin user đã lưu trước đó
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

  // Gửi thông tin đăng nhập lên backend và lưu token nếu thành công
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

  // Đăng ký tài khoản khách hàng mới
  const register = async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return { success: true, message: response.data?.message || 'Đăng ký thành công!' };
    } catch (error) {
      // Bắt lỗi validation hoặc lỗi server
      let errorMessage = 'Đăng ký thất bại, vui lòng thử lại!';
      if (error.response?.data?.errors) {
        // Lấy lỗi đầu tiên từ mảng errors của Laravel
        const firstError = Object.values(error.response.data.errors)[0];
        errorMessage = firstError[0];
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      return { success: false, message: errorMessage };
    }
  };

  // Xóa token và thông tin người dùng khi đăng xuất
  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_info');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};