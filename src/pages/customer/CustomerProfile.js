import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    List, Settings, LogOut, Phone, Mail, Shield, ChevronRight, Heart, MapPin, Star, AlertTriangle
} from 'lucide-react';

// Đã lùi đường dẫn 2 cấp để khớp với thư mục customer/
import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';

// Nhúng file CSS vừa tạo
import '../css/CustomerProfile.css';

const CustomerProfile = () => {
    const { user, setUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Các view: 'account' (Thông tin), 'security' (Bảo mật), 'favorites' (Yêu thích)
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // State cho Tab Thông tin tài khoản
    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        phone: '',
        email: '',
        gender: '',
        dob: '',
        address: ''
    });

    // State cho Tab Mật khẩu
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    // State cho Tab Yêu thích
    const [favoriteHotels, setFavoriteHotels] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    // THÊM MỚI: State cho Thông báo Popup (Toast)
    const [toastMessage, setToastMessage] = useState('');
    const toastTimeoutRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    // Lắng nghe sự kiện chuyển sang Tab Yêu thích để gọi API
    useEffect(() => {
        if (activeTab === 'favorites' && favoriteHotels.length === 0) {
            fetchFavorites();
        }
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const response = await axiosClient.get('/customer/profile');
            const userData = response.data.user;

            setFormData({
                last_name: userData.last_name || '',
                first_name: userData.first_name || '',
                phone: userData.phone || '',
                email: userData.email || '',
                gender: userData.gender || '',
                dob: userData.dob || '',
                address: userData.address || ''
            });
            setLoading(false);
        } catch (error) {
            console.error("Lỗi lấy thông tin:", error);
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        setLoadingFavorites(true);
        try {
            const response = await axiosClient.get('/customer/favorites');
            setFavoriteHotels(response.data.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách yêu thích:", error);
        } finally {
            setLoadingFavorites(false);
        }
    };

    // THÊM MỚI: Hàm xử lý ảnh xuyên tường lửa (giống các trang khác)
    const getHotelImage = (hotel) => {
        if (hotel.images && hotel.images.length > 0) {
            const lastIndex = hotel.images.length - 1;
            const imgPath = hotel.images[lastIndex].file_url;
            return `http://localhost:8000/api/get-image?path=${encodeURIComponent(imgPath)}`;
        }
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
    };

    // THÊM MỚI: Hàm hiển thị thông báo popup
    const showToast = (msg) => {
        setToastMessage(msg);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Cập nhật Profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const response = await axiosClient.put('/customer/profile', formData);
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('customer_info', JSON.stringify(updatedUser));
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Cập nhật thất bại!' });
        }
    };

    // Đổi mật khẩu
    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }
        try {
            await axiosClient.post('/customer/change-password', passwordData);
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Lỗi đổi mật khẩu!' });
        }
    };

    // Xóa tài khoản
    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa tài khoản? Dữ liệu không thể khôi phục sau khi xóa.");
        if (confirmDelete) {
            try {
                await axiosClient.delete('/customer/account');
                alert("Tài khoản của bạn đã được xóa.");
                logout();
                navigate('/login');
            } catch (error) {
                alert("Xóa tài khoản thất bại, vui lòng thử lại.");
            }
        }
    };

    // Bỏ thích khách sạn
    const handleToggleFavorite = async (hotelId) => {
        try {
            await axiosClient.post(`/customer/favorites/${hotelId}`);
            // Xóa ngay lập tức khỏi giao diện
            setFavoriteHotels(favoriteHotels.filter(hotel => hotel.id !== hotelId));
            showToast("Đã xóa khỏi danh sách yêu thích"); // GỌI THÔNG BÁO TOAST
        } catch (error) {
            alert("Có lỗi xảy ra khi xóa khỏi danh sách yêu thích!");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu...</div>;

    const getInitials = () => {
        if (formData.first_name) return formData.first_name.charAt(0).toUpperCase();
        return 'U';
    };

    return (
        <div style={{ backgroundColor: '#f2f3f5', minHeight: '100vh', padding: '30px 0', position: 'relative' }}>

            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '20px', padding: '0 20px' }}>
                {/* ================= SIDEBAR TRÁI ================= */}
                <div style={{ width: '280px', flexShrink: 0 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', marginBottom: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ width: '50px', height: '50px', backgroundColor: '#f2f3f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
                                {getInitials()}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>{formData.last_name} {formData.first_name}</h3>
                                <span style={{ fontSize: '12px', color: '#888' }}>Thành viên StayBook</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div onClick={() => navigate('/my-bookings')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#333' }}>
                            <List size={20} color="#0194f3" /> <span style={{ fontSize: '14px' }}>Đặt chỗ của tôi</span>
                        </div>

                        <div onClick={() => { setActiveTab('favorites'); setMessage({ type: '', text: '' }); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: activeTab === 'favorites' ? '#f0f8ff' : 'transparent', color: '#333' }}>
                            <Heart size={20} color="#ef4444" /> <span style={{ fontSize: '14px', fontWeight: activeTab === 'favorites' ? 'bold' : 'normal' }}>Khách sạn yêu thích</span>
                        </div>

                        <div onClick={() => { setActiveTab('account'); setMessage({ type: '', text: '' }); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: (activeTab === 'account' || activeTab === 'security') ? '#0194f3' : 'transparent', color: (activeTab === 'account' || activeTab === 'security') ? 'white' : '#333' }}>
                            <Settings size={20} color={(activeTab === 'account' || activeTab === 'security') ? 'white' : '#0194f3'} /> <span style={{ fontSize: '14px', fontWeight: (activeTab === 'account' || activeTab === 'security') ? 'bold' : 'normal' }}>Cài đặt tài khoản</span>
                        </div>

                        <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', cursor: 'pointer', color: '#333' }}>
                            <LogOut size={20} color="#666" /> <span style={{ fontSize: '14px' }}>Đăng xuất</span>
                        </div>
                    </div>
                </div>

                {/* ================= NỘI DUNG CHÍNH ================= */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '24px' }}>
                        {activeTab === 'favorites' ? 'Khách sạn yêu thích của tôi' : 'Cài đặt'}
                    </h2>

                    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

                        {/* Tabs Header */}
                        {(activeTab === 'account' || activeTab === 'security') && (
                            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', padding: '0 20px' }}>
                                <div onClick={() => { setActiveTab('account'); setMessage({ type: '', text: '' }); }} style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: activeTab === 'account' ? '3px solid #0194f3' : '3px solid transparent', color: activeTab === 'account' ? '#0194f3' : '#666', fontWeight: activeTab === 'account' ? 'bold' : 'normal', fontSize: '14px' }}>
                                    Thông tin tài khoản
                                </div>
                                <div onClick={() => { setActiveTab('security'); setMessage({ type: '', text: '' }); }} style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: activeTab === 'security' ? '3px solid #0194f3' : '3px solid transparent', color: activeTab === 'security' ? '#0194f3' : '#666', fontWeight: activeTab === 'security' ? 'bold' : 'normal', fontSize: '14px' }}>
                                    Mật khẩu & Bảo mật
                                </div>
                            </div>
                        )}

                        {message.text && (
                            <div style={{ margin: '20px 20px 0 20px', padding: '10px 15px', borderRadius: '6px', fontSize: '14px', color: message.type === 'success' ? '#155724' : '#721c24', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}` }}>
                                {message.text}
                            </div>
                        )}

                        {/* TAB 1: THÔNG TIN TÀI KHOẢN */}
                        {activeTab === 'account' && (
                            <div style={{ padding: '20px' }}>
                                <form onSubmit={handleUpdateProfile}>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Họ</label>
                                            <input type="text" name="last_name" value={formData.last_name} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Tên</label>
                                            <input type="text" name="first_name" value={formData.first_name} onChange={handleFormChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Giới tính</label>
                                            <select name="gender" value={formData.gender} onChange={handleFormChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: 'white' }}>
                                                <option value="">Chọn giới tính</option>
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Ngày sinh</label>
                                            <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Thành phố cư trú / Nơi ở</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleFormChange} placeholder="Vd: Hà Nội, Hồ Chí Minh" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                        <button type="submit" style={{ backgroundColor: '#0194f3', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu thay đổi</button>
                                    </div>
                                </form>

                                <div style={{ marginTop: '30px' }}>
                                    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> Email</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: 'bold' }}>{formData.email} <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'normal', marginLeft: '10px' }}>Đã xác thực</span></p>
                                        </div>
                                    </div>

                                    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ width: '100%' }}>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> Số di động</h4>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} style={{ width: '50%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: MẬT KHẨU VÀ BẢO MẬT */}
                        {activeTab === 'security' && (
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Shield size={18} color="#0194f3" /> Đổi mật khẩu
                                </h3>
                                <form onSubmit={handleUpdatePassword} style={{ maxWidth: '400px', marginBottom: '40px' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Mật khẩu hiện tại</label>
                                        <input type="password" name="current_password" value={passwordData.current_password} onChange={handlePasswordChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Mật khẩu mới</label>
                                        <input type="password" name="new_password" value={passwordData.new_password} onChange={handlePasswordChange} required minLength={6} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Xác nhận mật khẩu mới</label>
                                        <input type="password" name="new_password_confirmation" value={passwordData.new_password_confirmation} onChange={handlePasswordChange} required minLength={6} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
                                    </div>
                                    <button type="submit" style={{ backgroundColor: '#0194f3', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>Lưu mật khẩu mới</button>
                                </form>

                                <div style={{ border: '1px solid #f5c6cb', backgroundColor: '#fff', borderRadius: '8px', padding: '20px' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#721c24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertTriangle size={18} /> Xóa tài khoản
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#666', margin: '0 0 15px 0' }}>Sau khi tài khoản của bạn bị xóa, bạn sẽ không thể phục hồi tài khoản hoặc dữ liệu của mình.</p>
                                    <button onClick={handleDeleteAccount} style={{ backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Xóa tài khoản</button>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: KHÁCH SẠN YÊU THÍCH */}
                        {activeTab === 'favorites' && (
                            <div style={{ padding: '20px' }}>
                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Danh sách các khách sạn bạn đã lưu lại để tham khảo.</p>

                                {loadingFavorites ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Đang tải danh sách...</div>
                                ) : favoriteHotels.length > 0 ? (
                                    favoriteHotels.map((hotel) => (
                                        <div key={hotel.id} style={{ display: 'flex', gap: '20px', border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px', transition: 'box-shadow 0.3s' }}>

                                            {/* SỬA LỖI: Dùng hàm getHotelImage để không bị lỗi tường lửa, bọc bằng thẻ div để căn khung */}
                                            <div style={{ width: '160px', height: '120px', flexShrink: 0, overflow: 'hidden', borderRadius: '6px', cursor: 'pointer' }} onClick={() => navigate(`/hotels/${hotel.id}`)}>
                                                <img
                                                    src={getHotelImage(hotel)}
                                                    alt={hotel.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>

                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

                                                        {/* SỬA LỖI: Link tiêu đề phải là /hotels/ thay vì /hotel/ */}
                                                        <h3
                                                            style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#333', cursor: 'pointer' }}
                                                            onClick={() => navigate(`/hotels/${hotel.id}`)}
                                                        >
                                                            {hotel.name}
                                                        </h3>

                                                        {/* SỬA LỖI: Thêm nút trái tim có vòng tròn và Tooltip */}
                                                        <div
                                                            className="hc-fav-btn"
                                                            data-tooltip="Bỏ khỏi danh sách yêu thích"
                                                            onClick={() => handleToggleFavorite(hotel.id)}
                                                        >
                                                            <Heart size={18} color="#ef4444" fill="#ef4444" style={{ pointerEvents: 'none' }} />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontSize: '13px', marginBottom: '5px' }}>
                                                        {[...Array(hotel.star_rating || 5)].map((_, index) => (
                                                            <Star key={index} size={14} fill="#f59e0b" />
                                                        ))}
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <MapPin size={14} /> {hotel.address}, {hotel.city}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    {/* SỬA LỖI: Link nút xem chi tiết */}
                                                    <button onClick={() => navigate(`/hotels/${hotel.id}`)} style={{ backgroundColor: '#0194f3', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', marginTop: '30px', color: '#888', fontSize: '14px' }}>
                                        <p>Bạn chưa lưu khách sạn nào.</p>
                                        <button onClick={() => navigate('/hotels')} style={{ marginTop: '10px', padding: '8px 20px', backgroundColor: 'transparent', border: '1px solid #0194f3', color: '#0194f3', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Khám phá ngay
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* HIỂN THỊ THÔNG BÁO (TOAST) */}
            {toastMessage && (
                <div className="toast-popup">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default CustomerProfile;