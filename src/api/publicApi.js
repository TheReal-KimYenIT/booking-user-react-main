import axiosClient from './axiosClient';

// Các API không cần đăng nhập, dùng cho trang khách và tìm kiếm
const publicApi = {
    // Lấy dữ liệu bộ lọc (tiện ích khách sạn, tiện ích phòng)
    getFiltersData: () => {
        return axiosClient.get('/hotels/filters-data');
    },

    // Lấy dữ liệu Master Data (Hướng phòng, Loại giường)
    getRoomMasterData: () => {
        return axiosClient.get('/rooms/master-data');
    },

    // Tìm kiếm khách sạn kèm tham số truyền vào (destination, check_in, check_out, stars...)
    searchHotels: (params) => {
        return axiosClient.get('/hotels/search', { params });
    },

    // Lấy chi tiết 1 khách sạn (kèm params checkIn, checkOut để tính phòng trống nếu có)
    getHotelDetail: (id, params = {}) => {
        return axiosClient.get(`/hotels/${id}`, { params });
    },

    // Lấy chi tiết 1 loại phòng
    getRoomDetail: (id) => {
        return axiosClient.get(`/rooms/${id}`);
    }
};

export default publicApi;