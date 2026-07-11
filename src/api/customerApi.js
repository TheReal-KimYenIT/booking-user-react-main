import axiosClient from './axiosClient';

const customerApi = {
    // --- QUẢN LÝ HỒ SƠ ---
    getProfile: () => {
        return axiosClient.get('/customer/profile');
    },

    updateProfile: (data) => {
        return axiosClient.put('/customer/profile', data);
    },

    changePassword: (data) => {
        return axiosClient.post('/customer/change-password', data);
    },

    deleteAccount: () => {
        return axiosClient.delete('/customer/account');
    },


    // --- QUẢN LÝ ĐẶT PHÒNG ---
    createVnpayPayment: (data) => {
        // data truyền vào sẽ có dạng: { booking_id: 15, bank_code: '' }
        return axiosClient.post('/customer/payment/vnpay', data);
    },
    createBooking: (data) => {
        return axiosClient.post('/customer/bookings', data);
    },

    getMyBookings: () => {
        return axiosClient.get('/customer/my-bookings');
    },

    cancelBooking: (id) => {
        return axiosClient.post(`/customer/bookings/${id}/cancel`);
    },




    // --- QUẢN LÝ YÊU THÍCH (FAVORITES) ---
    getFavorites: () => {
        return axiosClient.get('/customer/favorites');
    },

    toggleFavorite: (hotelId) => {
        return axiosClient.post(`/customer/favorites/${hotelId}`);
    },


    // Lấy lịch sử chat của đơn hàng (thực chất là lấy thread và các messages)
    getChatMessages: (bookingId) => {
        return axiosClient.get(`/customer/bookings/${bookingId}/chat`);
    },
    // 👉 THÊM MỚI: Lấy lịch sử chat vãng lai theo hotelId
    getPreBookingChatMessages: (hotelId) => {
        return axiosClient.get(`/customer/hotels/${hotelId}/chat`);
    },
    // Gửi tin nhắn vào một hội thoại cụ thể
    sendMessage: (threadId, data) => {
        return axiosClient.post(`/customer/chat/${threadId}/messages`, data);
    },

    // 👉 THÊM MỚI: Lấy danh sách tất cả các cuộc trò chuyện
    getAllChats: () => {
        return axiosClient.get('/customer/chats');
    },

};

export default customerApi;