import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LogOut, Phone, Mail, Shield, Heart, MapPin, Star,
    AlertTriangle, User, Lock, Eye, EyeOff, Save, CheckCircle2,
    Calendar, Check, ChevronRight, FileText, MessageSquare, Sparkles
} from 'lucide-react';

import axiosClient from '../../api/axiosClient';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import '../css/CustomerProfile.css';

const CustomerProfile = () => {
    // Trang hồ sơ cá nhân, đổi mật khẩu và quản lý khách sạn yêu thích
    const { setUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        phone: '',
        email: '',
        gender: '',
        dob: '',
        address: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [favoriteHotels, setFavoriteHotels] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    const [toastMessage, setToastMessage] = useState('');
    const toastTimeoutRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'favorites' && favoriteHotels.length === 0) {
            fetchFavorites();
        }
    }, [activeTab, favoriteHotels.length]);

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
            setFavoriteHotels(response.data.data || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách yêu thích:", error);
        } finally {
            setLoadingFavorites(false);
        }
    };

    const getHotelImage = (hotel) => {
        if (hotel?.images && hotel.images.length > 0) {
            const primary = hotel.images.find(img => img.is_primary === 1 || img.is_primary === true);
            const targetImg = primary || hotel.images[0];
            const imgPath = targetImg.file_url || targetImg.file_path;
            if (imgPath) {
                return resolveImageUrl(imgPath);
            }
        }
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);

        // Chuyển chuỗi rỗng thành null để không bị lỗi validate "nullable|date" ở backend
        const payload = { ...formData };
        if (payload.dob === '') payload.dob = null;
        if (payload.gender === '') payload.gender = null;
        if (payload.address === '') payload.address = null;
        if (payload.phone === '') payload.phone = null;

        try {
            const response = await axiosClient.put('/customer/profile', payload);
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('customer_info', JSON.stringify(updatedUser));
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Hồ sơ tài khoản của bạn đã được cập nhật.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Lỗi chi tiết khi cập nhật:", error);
            let errorMsg = error.message || 'Cập nhật thất bại!';
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            if (error.response?.data?.errors) {
                const firstError = Object.values(error.response.data.errors)[0][0];
                errorMsg = firstError;
            }
            Swal.fire({
                icon: 'error',
                title: 'Có lỗi xảy ra',
                text: errorMsg
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (passwordData.new_password.length < 8) {
            Swal.fire({
                icon: 'warning',
                title: 'Mật khẩu chưa đủ độ dài',
                text: 'Mật khẩu mới phải có tối thiểu 8 ký tự.'
            });
            return;
        }

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        if (!regex.test(passwordData.new_password)) {
            Swal.fire({
                icon: 'warning',
                title: 'Mật khẩu chưa đủ mạnh',
                text: 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số.'
            });
            return;
        }

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            Swal.fire({
                icon: 'warning',
                title: 'Xác nhận mật khẩu không khớp',
                text: 'Mật khẩu mới và mật khẩu xác nhận không giống nhau.'
            });
            return;
        }

        setSavingPassword(true);
        try {
            await axiosClient.post('/customer/change-password', passwordData);
            Swal.fire({
                icon: 'success',
                title: 'Đổi mật khẩu thành công!',
                text: 'Mật khẩu đăng nhập mới của bạn đã được lưu.',
                timer: 2000,
                showConfirmButton: false
            });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Đổi mật khẩu thất bại',
                text: error.response?.data?.message || 'Mật khẩu hiện tại không chính xác!'
            });
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa tài khoản?',
            text: 'Mọi dữ liệu đặt phòng, lịch sử thanh toán và ưu đãi thành viên sẽ bị vô hiệu hóa vĩnh viễn.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Vâng, xóa tài khoản',
            cancelButtonText: 'Hủy bỏ'
        });

        if (result.isConfirmed) {
            try {
                await axiosClient.delete('/customer/account');
                Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa tài khoản',
                    text: 'Tài khoản của bạn đã được vô hiệu hóa thành công.',
                    timer: 2000,
                    showConfirmButton: false
                });
                logout();
                navigate('/login');
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể xóa tài khoản lúc này, vui lòng thử lại sau.', 'error');
            }
        }
    };

    const handleToggleFavorite = async (hotelId) => {
        try {
            await axiosClient.post(`/customer/favorites/${hotelId}`);
            setFavoriteHotels(favoriteHotels.filter(hotel => hotel.id !== hotelId));
            showToast("Đã xóa khách sạn khỏi danh sách yêu thích");
        } catch (error) {
            showToast("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Đăng xuất?',
            text: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản StayHub?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Ở lại'
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate('/login');
            }
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '120px 0', background: '#f8fafc', minHeight: '80vh' }}>
                <div className="spinner-border" style={{ color: '#d97706', width: '3rem', height: '3rem' }} role="status"></div>
                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Đang tải thông tin tài khoản của bạn...</p>
            </div>
        );
    }

    const getInitials = () => {
        if (formData.first_name) return formData.first_name.charAt(0).toUpperCase();
        return 'U';
    };

    const fullName = `${formData.last_name} ${formData.first_name}`.trim() || 'Thành viên StayHub';

    return (
        <div className="profile-page-container">
            <div className="profile-wrapper">
                {/* 1. Breadcrumb */}
                <div className="profile-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>/</span>
                    <span className="profile-breadcrumb-current">Cài đặt tài khoản</span>
                </div>

                {/* 2. Layout 2 cột: Sidebar & Nội dung */}
                <div className="profile-layout-grid">
                    {/* Cột trái: Sidebar */}
                    <div className="profile-sidebar">
                        {/* Thẻ User Card */}
                        <div className="profile-user-card">
                            <div className="profile-avatar-wrapper">
                                <div className="profile-avatar-circle">
                                    {getInitials()}
                                </div>
                                <span className="profile-verified-badge" title="Tài khoản đã xác thực">
                                    <Check size={13} strokeWidth={3} />
                                </span>
                            </div>

                            <h3 className="profile-user-fullname">{fullName}</h3>
                            <div className="profile-tier-badge">
                                <Sparkles size={13} />
                                <span>Thành viên Thân Thiết StayHub</span>
                            </div>

                            <div className="profile-sidebar-stats">
                                <div className="sidebar-stat-item">
                                    <div className="sidebar-stat-val">{favoriteHotels.length}</div>
                                    <div className="sidebar-stat-lbl">Yêu thích</div>
                                </div>
                                <div className="sidebar-stat-item">
                                    <div className="sidebar-stat-val">VIP</div>
                                    <div className="sidebar-stat-lbl">Hạng thẻ</div>
                                </div>
                            </div>
                        </div>

                        {/* Menu điều hướng */}
                        <div className="profile-nav-card">
                            <button
                                className={`profile-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                                onClick={() => setActiveTab('account')}
                            >
                                <div className="profile-nav-item-left">
                                    <User size={18} className="profile-nav-icon" />
                                    <span>Thông tin tài khoản</span>
                                </div>
                                <ChevronRight size={16} color="#94a3b8" />
                            </button>

                            <button
                                className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <div className="profile-nav-item-left">
                                    <Shield size={18} className="profile-nav-icon" />
                                    <span>Mật khẩu & Bảo mật</span>
                                </div>
                                <ChevronRight size={16} color="#94a3b8" />
                            </button>

                            <button
                                className={`profile-nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                                onClick={() => setActiveTab('favorites')}
                            >
                                <div className="profile-nav-item-left">
                                    <Heart size={18} className="profile-nav-icon" color="#ef4444" />
                                    <span>Khách sạn yêu thích</span>
                                </div>
                                {favoriteHotels.length > 0 && (
                                    <span className="profile-nav-count-badge">{favoriteHotels.length}</span>
                                )}
                            </button>

                            <div className="profile-nav-divider"></div>

                            <Link to="/orders" className="profile-nav-item">
                                <div className="profile-nav-item-left">
                                    <FileText size={18} className="profile-nav-icon" color="#0284c7" />
                                    <span>Đơn đặt phòng của tôi</span>
                                </div>
                                <ChevronRight size={16} color="#94a3b8" />
                            </Link>

                            <Link to="/messages" className="profile-nav-item">
                                <div className="profile-nav-item-left">
                                    <MessageSquare size={18} className="profile-nav-icon" color="#d97706" />
                                    <span>Tin nhắn của tôi</span>
                                </div>
                                <ChevronRight size={16} color="#94a3b8" />
                            </Link>

                            <div className="profile-nav-divider"></div>

                            <button className="profile-nav-item logout" onClick={handleLogout}>
                                <div className="profile-nav-item-left">
                                    <LogOut size={18} />
                                    <span>Đăng xuất</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Cột phải: Khối nội dung chính */}
                    <div className="profile-content-area">
                        <div className="profile-main-card">
                            {/* Header Thẻ chính */}
                            <div className="profile-card-header">
                                <div>
                                    <h2 className="profile-card-header-title">
                                        {activeTab === 'account' && 'Cài Đặt Tài Khoản'}
                                        {activeTab === 'security' && 'Mật Khẩu & Bảo Mật'}
                                        {activeTab === 'favorites' && 'Khách Sạn Yêu Thích Của Tôi'}
                                    </h2>
                                    <p className="profile-card-header-sub">
                                        {activeTab === 'account' && 'Cập nhật thông tin cá nhân và thông tin liên hệ của bạn'}
                                        {activeTab === 'security' && 'Quản lý mật khẩu đăng nhập và cài đặt an toàn tài khoản'}
                                        {activeTab === 'favorites' && 'Danh sách các khách sạn và resort bạn đã lưu để tham khảo'}
                                    </p>
                                </div>
                            </div>

                            {/* Thanh tab phụ khi ở chế độ cài đặt */}
                            {(activeTab === 'account' || activeTab === 'security') && (
                                <div className="profile-subtabs-bar">
                                    <button
                                        className={`profile-subtab-btn ${activeTab === 'account' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('account')}
                                    >
                                        <User size={16} className="subtab-indicator" />
                                        <span>Thông tin tài khoản</span>
                                    </button>
                                    <button
                                        className={`profile-subtab-btn ${activeTab === 'security' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('security')}
                                    >
                                        <Shield size={16} className="subtab-indicator" />
                                        <span>Mật khẩu & Bảo mật</span>
                                    </button>
                                </div>
                            )}

                            {/* Body Tab 1: Thông tin tài khoản */}
                            {activeTab === 'account' && (
                                <div className="profile-card-body">
                                    <form onSubmit={handleUpdateProfile}>
                                        {/* Phần 1: Thông tin cá nhân */}
                                        <div className="profile-form-section">
                                            <h4 className="profile-section-title">
                                                <User size={17} color="#d97706" />
                                                Thông Tin Cá Nhân
                                            </h4>

                                            <div className="profile-form-row">
                                                <div className="profile-form-group">
                                                    <label htmlFor="last_name" className="profile-form-label">
                                                        Họ và tên đệm <span className="required-mark">*</span>
                                                    </label>
                                                    <input
                                                        id="last_name"
                                                        type="text"
                                                        name="last_name"
                                                        className="profile-input no-icon"
                                                        autoComplete="family-name"
                                                        value={formData.last_name}
                                                        onChange={handleFormChange}
                                                        required
                                                        placeholder="Vd: Nguyễn Văn"
                                                    />
                                                </div>

                                                <div className="profile-form-group">
                                                    <label htmlFor="first_name" className="profile-form-label">
                                                        Tên <span className="required-mark">*</span>
                                                    </label>
                                                    <input
                                                        id="first_name"
                                                        type="text"
                                                        name="first_name"
                                                        className="profile-input no-icon"
                                                        autoComplete="given-name"
                                                        value={formData.first_name}
                                                        onChange={handleFormChange}
                                                        required
                                                        placeholder="Vd: An"
                                                    />
                                                </div>
                                            </div>

                                            <div className="profile-form-row">
                                                <div className="profile-form-group">
                                                    <label htmlFor="gender" className="profile-form-label">
                                                        Giới tính
                                                    </label>
                                                    <div className="profile-input-wrapper">
                                                        <User size={16} className="profile-input-icon" />
                                                        <select
                                                            id="gender"
                                                            name="gender"
                                                            className="profile-select"
                                                            autoComplete="sex"
                                                            value={formData.gender || ''}
                                                            onChange={handleFormChange}
                                                        >
                                                            <option value="">Chọn giới tính</option>
                                                            <option value="Nam">Nam</option>
                                                            <option value="Nữ">Nữ</option>
                                                            <option value="Khác">Khác</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="profile-form-group">
                                                    <label htmlFor="dob" className="profile-form-label">
                                                        Ngày sinh
                                                    </label>
                                                    <div className="profile-input-wrapper">
                                                        <Calendar size={16} className="profile-input-icon" />
                                                        <input
                                                            id="dob"
                                                            type="date"
                                                            name="dob"
                                                            className="profile-input"
                                                            autoComplete="bday"
                                                            value={formData.dob || ''}
                                                            onChange={handleFormChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phần 2: Thông tin liên lạc & Cư trú */}
                                        <div className="profile-form-section">
                                            <h4 className="profile-section-title">
                                                <Mail size={17} color="#d97706" />
                                                Liên Lạc & Địa Chỉ Cư Trú
                                            </h4>

                                            <div className="profile-form-row">
                                                <div className="profile-form-group">
                                                    <label htmlFor="email" className="profile-form-label">
                                                        Địa chỉ Email
                                                        <span className="profile-verified-tag">Đã xác thực</span>
                                                    </label>
                                                    <div className="profile-input-wrapper">
                                                        <Mail size={16} className="profile-input-icon" />
                                                        <input
                                                            id="email"
                                                            type="email"
                                                            name="email"
                                                            className="profile-input"
                                                            value={formData.email}
                                                            disabled
                                                        />
                                                    </div>
                                                    <span className="profile-input-helper">
                                                        Email dùng để đăng nhập và nhận thông tin xác nhận đặt phòng
                                                    </span>
                                                </div>

                                                <div className="profile-form-group">
                                                    <label htmlFor="phone" className="profile-form-label">
                                                        Số điện thoại di động
                                                    </label>
                                                    <div className="profile-input-wrapper">
                                                        <Phone size={16} className="profile-input-icon" />
                                                        <input
                                                            id="phone"
                                                            type="text"
                                                            name="phone"
                                                            className="profile-input"
                                                            autoComplete="tel"
                                                            value={formData.phone || ''}
                                                            onChange={handleFormChange}
                                                            placeholder="Vd: 0912 345 678"
                                                        />
                                                    </div>
                                                    <span className="profile-input-helper">
                                                        Số điện thoại để lễ tân khách sạn liên hệ khi check-in
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="profile-form-group">
                                                <label htmlFor="address" className="profile-form-label">
                                                    Thành phố cư trú / Nơi ở
                                                </label>
                                                <div className="profile-input-wrapper">
                                                    <MapPin size={16} className="profile-input-icon" />
                                                    <input
                                                        id="address"
                                                        type="text"
                                                        name="address"
                                                        className="profile-input"
                                                        autoComplete="street-address"
                                                        value={formData.address || ''}
                                                        onChange={handleFormChange}
                                                        placeholder="Vd: TP. Hồ Chí Minh, Hà Nội, Cần Thơ..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nút Lưu ở cuối toàn bộ form */}
                                        <div className="profile-form-actions">
                                            <button
                                                type="submit"
                                                className="btn-profile-save"
                                                disabled={savingProfile}
                                            >
                                                <Save size={16} />
                                                <span>{savingProfile ? 'Đang lưu thay đổi...' : 'Lưu thay đổi'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Body Tab 2: Mật khẩu & Bảo mật */}
                            {activeTab === 'security' && (
                                <div className="profile-card-body">
                                    <form onSubmit={handleUpdatePassword} style={{ maxWidth: '520px' }}>
                                        <div className="profile-form-section">
                                            <h4 className="profile-section-title">
                                                <Lock size={17} color="#d97706" />
                                                Đổi Mật Khẩu Đăng Nhập
                                            </h4>

                                            <div className="profile-form-group" style={{ marginBottom: '18px' }}>
                                                <label htmlFor="current_password" className="profile-form-label">
                                                    Mật khẩu hiện tại <span className="required-mark">*</span>
                                                </label>
                                                <div className="profile-input-wrapper">
                                                    <Lock size={16} className="profile-input-icon" />
                                                    <input
                                                        id="current_password"
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        name="current_password"
                                                        className="profile-input"
                                                        autoComplete="current-password"
                                                        value={passwordData.current_password}
                                                        onChange={handlePasswordChange}
                                                        required
                                                        placeholder="Nhập mật khẩu hiện tại"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle-btn"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    >
                                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="profile-form-group" style={{ marginBottom: '18px' }}>
                                                <label htmlFor="new_password" className="profile-form-label">
                                                    Mật khẩu mới <span className="required-mark">*</span>
                                                </label>
                                                <div className="profile-input-wrapper">
                                                    <Lock size={16} className="profile-input-icon" />
                                                    <input
                                                        id="new_password"
                                                        type={showNewPassword ? "text" : "password"}
                                                        name="new_password"
                                                        className="profile-input"
                                                        autoComplete="new-password"
                                                        value={passwordData.new_password}
                                                        onChange={handlePasswordChange}
                                                        required
                                                        placeholder="Tối thiểu 8 ký tự"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle-btn"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="profile-form-group" style={{ marginBottom: '20px' }}>
                                                <label htmlFor="new_password_confirmation" className="profile-form-label">
                                                    Xác nhận mật khẩu mới <span className="required-mark">*</span>
                                                </label>
                                                <div className="profile-input-wrapper">
                                                    <Lock size={16} className="profile-input-icon" />
                                                    <input
                                                        id="new_password_confirmation"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="new_password_confirmation"
                                                        className="profile-input"
                                                        autoComplete="new-password"
                                                        value={passwordData.new_password_confirmation}
                                                        onChange={handlePasswordChange}
                                                        required
                                                        placeholder="Nhập lại mật khẩu mới"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle-btn"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tiêu chí mật khẩu */}
                                            <div className="password-criteria-box">
                                                <div className="password-criteria-title">Yêu cầu bảo mật mật khẩu:</div>
                                                <ul className="password-criteria-list">
                                                    <li className={`password-criteria-item ${passwordData.new_password.length >= 8 ? 'valid' : ''}`}>
                                                        <CheckCircle2 size={14} color={passwordData.new_password.length >= 8 ? '#059669' : '#94a3b8'} />
                                                        <span>Tối thiểu 8 ký tự</span>
                                                    </li>
                                                    <li className={`password-criteria-item ${/[A-Z]/.test(passwordData.new_password) ? 'valid' : ''}`}>
                                                        <CheckCircle2 size={14} color={/[A-Z]/.test(passwordData.new_password) ? '#059669' : '#94a3b8'} />
                                                        <span>Ít nhất 1 chữ hoa (A-Z)</span>
                                                    </li>
                                                    <li className={`password-criteria-item ${/[a-z]/.test(passwordData.new_password) ? 'valid' : ''}`}>
                                                        <CheckCircle2 size={14} color={/[a-z]/.test(passwordData.new_password) ? '#059669' : '#94a3b8'} />
                                                        <span>Ít nhất 1 chữ thường (a-z)</span>
                                                    </li>
                                                    <li className={`password-criteria-item ${/\d/.test(passwordData.new_password) ? 'valid' : ''}`}>
                                                        <CheckCircle2 size={14} color={/\d/.test(passwordData.new_password) ? '#059669' : '#94a3b8'} />
                                                        <span>Ít nhất 1 chữ số (0-9)</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn-profile-save"
                                                disabled={savingPassword}
                                            >
                                                <Shield size={16} />
                                                <span>{savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
                                            </button>
                                        </div>
                                    </form>

                                    {/* Khu vực xóa tài khoản */}
                                    <div className="danger-zone-card">
                                        <h4 className="danger-zone-title">
                                            <AlertTriangle size={18} />
                                            Vùng Nguy Hiểm: Xóa Tài Khoản
                                        </h4>
                                        <p className="danger-zone-desc">
                                            Sau khi tài khoản của bạn bị xóa, bạn sẽ không thể phục hồi tài khoản hoặc truy cập lại lịch sử đặt phòng của mình.
                                        </p>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="btn-danger-outline"
                                        >
                                            Xóa tài khoản vĩnh viễn
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Body Tab 3: Khách sạn yêu thích */}
                            {activeTab === 'favorites' && (
                                <div className="profile-card-body">
                                    {loadingFavorites ? (
                                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                            <div className="spinner-border" style={{ color: '#d97706' }} role="status"></div>
                                            <p style={{ marginTop: '14px', color: '#64748b' }}>Đang tải danh sách yêu thích...</p>
                                        </div>
                                    ) : favoriteHotels.length > 0 ? (
                                        <div className="favorites-list-wrapper">
                                            {favoriteHotels.map((hotel) => (
                                                <div key={hotel.id} className="fav-hotel-card">
                                                    <div
                                                        className="fav-hotel-thumb-box"
                                                        onClick={() => navigate(`/hotels/${hotel.id}`)}
                                                    >
                                                        <img
                                                            src={getHotelImage(hotel)}
                                                            alt={hotel.name}
                                                            className="fav-hotel-thumb"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="fav-hotel-details">
                                                        <div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                                                <h3
                                                                    className="fav-hotel-name"
                                                                    onClick={() => navigate(`/hotels/${hotel.id}`)}
                                                                >
                                                                    {hotel.name}
                                                                </h3>

                                                                <div
                                                                    className="hc-fav-btn"
                                                                    data-tooltip="Bỏ khỏi yêu thích"
                                                                    onClick={() => handleToggleFavorite(hotel.id)}
                                                                >
                                                                    <Heart size={18} color="#ef4444" fill="#ef4444" />
                                                                </div>
                                                            </div>

                                                            <div className="fav-stars-row">
                                                                {[...Array(hotel.star_rating || 5)].map((_, index) => (
                                                                    <Star key={index} size={13} fill="#f59e0b" />
                                                                ))}
                                                            </div>

                                                            <p className="fav-location-text">
                                                                <MapPin size={13} color="#94a3b8" />
                                                                <span>{hotel.address}, {hotel.city}</span>
                                                            </p>
                                                        </div>

                                                        <div className="fav-actions-bottom">
                                                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                                Đã lưu vào danh sách
                                                            </span>
                                                            <button
                                                                className="fav-btn-view"
                                                                onClick={() => navigate(`/hotels/${hotel.id}`)}
                                                            >
                                                                <span>Xem chi tiết phòng</span>
                                                                <ChevronRight size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                            <Heart size={48} color="#cbd5e1" style={{ marginBottom: '14px' }} />
                                            <h4 style={{ color: '#0f172a', fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                                                Bạn chưa lưu khách sạn nào
                                            </h4>
                                            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                                                Hãy bấm vào biểu tượng trái tim ở các khách sạn bạn quan tâm để lưu lại và dễ dàng tìm kiếm sau này.
                                            </p>
                                            <button
                                                onClick={() => navigate('/hotels')}
                                                className="btn-profile-save"
                                            >
                                                Khám phá khách sạn ngay
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {toastMessage && (
                <div className="toast-popup">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default CustomerProfile;
