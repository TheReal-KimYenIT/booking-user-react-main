import axiosClient from './axiosClient';

// Các hàm gọi API liên quan đến đăng nhập và đăng ký khách hàng
const authApi = {
    // Đăng nhập cho Khách hàng
    login: (data) => {
        // data bao gồm: email, password, type: 'customer'
        return axiosClient.post('/login', data);
    },

    // Đăng ký Khách hàng (User Web React)
    register: (data) => {
        return axiosClient.post('/auth/register', data);
    },

    // (Tùy chọn) Đăng ký tài khoản Đối tác nếu bạn để form đăng ký đối tác ở React
    registerPartner: (data) => {
        return axiosClient.post('/partner/register', data);
    }
};

export default authApi;