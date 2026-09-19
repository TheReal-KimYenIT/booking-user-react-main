import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerApi from '../../api/customerApi';
import {
    MessageSquare, Clock, ChevronRight,
    Search, X, Star, MapPin, PhoneCall, Headphones, Sparkles,
    ExternalLink, RotateCcw, ArrowRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import ContactOrderModal from '../../components/common/ContactOrderModal';
import { resolveImageUrl } from '../../utils/imageUrl';
import '../css/MyChatsPage.css';

const MyChatsPage = () => {
    // Trang quản lý các cuộc trò chuyện giữa khách hàng và các khách sạn trên StayHub
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState('all');
    const [selectedChat, setSelectedChat] = useState(null);
    const navigate = useNavigate();

    // Tải danh sách cuộc trò chuyện
    const fetchChats = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        else setIsRefreshing(true);
        setErrorMsg('');

        try {
            const res = await customerApi.getAllChats();
            if (res && res.data) {
                const finalData = res.data.data ? res.data.data : res.data;
                setChats(Array.isArray(finalData) ? finalData : []);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách chat:", error);
            setErrorMsg('Không thể kết nối dữ liệu tin nhắn. Vui lòng thử lại sau.');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    // Trợ thủ lấy ảnh đại diện khách sạn
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

    // Định dạng thời gian thân thiện (Hôm nay, Hôm qua, hoặc ngày tháng)
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const msgDate = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));

        const hours = msgDate.getHours().toString().padStart(2, '0');
        const minutes = msgDate.getMinutes().toString().padStart(2, '0');
        const day = msgDate.getDate().toString().padStart(2, '0');
        const month = (msgDate.getMonth() + 1).toString().padStart(2, '0');
        const year = msgDate.getFullYear();

        if (diffDays === 0 && now.getDate() === msgDate.getDate()) {
            return `Hôm nay, ${hours}:${minutes}`;
        }
        if (diffDays === 1 || (diffDays === 0 && now.getDate() !== msgDate.getDate())) {
            return `Hôm qua, ${hours}:${minutes}`;
        }
        if (now.getFullYear() === year) {
            return `${hours}:${minutes} - ${day}/${month}`;
        }
        return `${day}/${month}/${year}`;
    };

    // Lọc danh sách theo từ khóa tìm kiếm & tab
    const filteredChats = useMemo(() => {
        return chats.filter(chat => {
            const hotelName = (chat.hotel?.name || '').toLowerCase();
            const latestMsg = (chat.latest_message?.message || chat.latestMessage?.message || '').toLowerCase();
            const city = (chat.hotel?.city || chat.hotel?.address || '').toLowerCase();
            const search = searchTerm.trim().toLowerCase();

            const matchSearch = !search || hotelName.includes(search) || latestMsg.includes(search) || city.includes(search);
            if (!matchSearch) return false;

            if (filterTab === '5star') {
                return Number(chat.hotel?.star_rating) === 5;
            }
            if (filterTab === 'recent') {
                const latest = chat.latest_message || chat.latestMessage;
                if (!latest?.created_at) return false;
                const diffDays = (new Date() - new Date(latest.created_at)) / (1000 * 60 * 60 * 24);
                return diffDays <= 7;
            }

            return true;
        });
    }, [chats, searchTerm, filterTab]);

    return (
        <div className="chats-container">
            <div className="chats-wrapper">
                {/* 1. Breadcrumb điều hướng */}
                <div className="chats-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>/</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>Tin nhắn của tôi</span>
                </div>

                {/* 2. Hero Header hiện đại */}
                <div className="chats-hero-header">
                    <div className="chats-hero-top">
                        <div>
                            <div className="chats-badge-pill">
                                <Sparkles size={13} />
                                <span>Kênh Liên Lạc Trực Tuyến StayHub</span>
                            </div>
                            <h1 className="chats-hero-title">Tin Nhắn Của Tôi</h1>
                            <p className="chats-hero-desc">
                                Trao đổi trực tiếp 24/7 với bộ phận lễ tân khách sạn để xác nhận giờ nhận phòng, hỗ trợ xe đưa đón hoặc các yêu cầu dịch vụ đặc biệt.
                            </p>
                        </div>
                    </div>

                    <div className="chats-stats-row">
                        <div className="chat-stat-box">
                            <div className="chat-stat-icon">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <div className="chat-stat-num">{chats.length}</div>
                                <div className="chat-stat-label">Cuộc trò chuyện</div>
                            </div>
                        </div>

                        <div className="chat-stat-box">
                            <div className="chat-stat-icon">
                                <Headphones size={20} />
                            </div>
                            <div>
                                <div className="chat-stat-num">24/7</div>
                                <div className="chat-stat-label">Lễ tân hỗ trợ</div>
                            </div>
                        </div>

                        <div className="chat-stat-box">
                            <div className="chat-stat-icon">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <div className="chat-stat-num">100%</div>
                                <div className="chat-stat-label">Bảo mật thông tin</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Toolbar: Tìm kiếm & Lọc */}
                <div className="chats-toolbar">
                    <div className="chats-search-box">
                        <Search size={18} className="chats-search-icon" />
                        <input
                            type="text"
                            className="chats-search-input"
                            placeholder="Tìm theo tên khách sạn, địa điểm hoặc tin nhắn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="chats-search-clear"
                                onClick={() => setSearchTerm('')}
                                title="Xóa tìm kiếm"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="chats-filter-tabs">
                        <button
                            className={`chat-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterTab('all')}
                        >
                            Tất cả ({chats.length})
                        </button>
                        <button
                            className={`chat-tab-btn ${filterTab === 'recent' ? 'active' : ''}`}
                            onClick={() => setFilterTab('recent')}
                        >
                            Gần đây (7 ngày)
                        </button>
                        <button
                            className={`chat-tab-btn ${filterTab === '5star' ? 'active' : ''}`}
                            onClick={() => setFilterTab('5star')}
                        >
                            ⭐ 5 Sao
                        </button>
                        <button
                            className="chat-btn-refresh"
                            onClick={() => fetchChats(true)}
                            title="Làm mới tin nhắn"
                            disabled={isRefreshing}
                        >
                            <RotateCcw size={15} className={isRefreshing ? 'spin' : ''} />
                            <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
                        </button>
                    </div>
                </div>

                {/* 4. Nội dung chính: 2 Cột */}
                <div className="chats-main-grid">
                    {/* Cột trái: Danh sách các cuộc trò chuyện */}
                    <div className="chats-list-column">
                        {isLoading ? (
                            <div className="chats-loading-box">
                                <div className="spinner-border" style={{ color: '#d97706', width: '3rem', height: '3rem' }} role="status"></div>
                                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Đang tải danh sách tin nhắn của bạn...</p>
                            </div>
                        ) : errorMsg ? (
                            <div className="chats-error-box">
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{errorMsg}</p>
                                <button
                                    onClick={() => fetchChats()}
                                    className="chats-btn-primary"
                                    style={{ marginTop: '14px' }}
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : chats.length === 0 ? (
                            <div className="chats-empty-box">
                                <div className="chats-empty-icon-circle">
                                    <MessageSquare size={34} />
                                </div>
                                <h3 className="chats-empty-title">Bạn chưa có cuộc trò chuyện nào</h3>
                                <p className="chats-empty-desc">
                                    Bạn có thể liên hệ trực tiếp với lễ tân bất kỳ khách sạn nào từ trang chi tiết phòng hoặc từ đơn đặt phòng của bạn.
                                </p>
                                <Link to="/hotels" className="chats-btn-primary">
                                    Khám phá khách sạn ngay <ArrowRight size={16} />
                                </Link>
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="chats-empty-box">
                                <div className="chats-empty-icon-circle">
                                    <Search size={32} />
                                </div>
                                <h3 className="chats-empty-title">Không tìm thấy kết quả phù hợp</h3>
                                <p className="chats-empty-desc">
                                    Không có cuộc trò chuyện nào khớp với từ khóa "{searchTerm}". Vui lòng thử tìm kiếm với từ khóa khác.
                                </p>
                                <button
                                    onClick={() => { setSearchTerm(''); setFilterTab('all'); }}
                                    className="chats-btn-primary"
                                >
                                    Xem tất cả tin nhắn
                                </button>
                            </div>
                        ) : (
                            <div className="chats-list">
                                {filteredChats.map(chat => {
                                    const hotel = chat.hotel;
                                    const hotelName = hotel?.name || 'Khách sạn đối tác StayHub';
                                    const latestMsg = chat.latest_message || chat.latestMessage;
                                    const starRating = hotel?.star_rating ? Math.min(5, Math.max(1, Number(hotel.star_rating))) : null;
                                    const location = hotel?.city || hotel?.address;

                                    return (
                                        <div
                                            key={chat.id}
                                            className="chat-card"
                                            onClick={() => setSelectedChat(chat)}
                                        >
                                            {/* Ảnh đại diện khách sạn */}
                                            <div className="chat-hotel-thumb-wrapper">
                                                <img
                                                    src={getHotelImage(hotel)}
                                                    alt={hotelName}
                                                    className="chat-hotel-thumb"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
                                                    }}
                                                />
                                                <span className="chat-online-dot" title="Lễ tân đang trực tuyến" />
                                            </div>

                                            {/* Nội dung tin nhắn & Thông tin khách sạn */}
                                            <div className="chat-card-content">
                                                <div className="chat-card-header">
                                                    <h3 className="chat-hotel-name" title={hotelName}>
                                                        {hotelName}
                                                    </h3>
                                                    {latestMsg && (
                                                        <span className="chat-time-tag">
                                                            <Clock size={12} /> {formatTime(latestMsg.created_at)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="chat-tags-row">
                                                    {starRating && (
                                                        <span className="chat-star-pill">
                                                            <Star size={11} fill="#b45309" color="#b45309" />
                                                            {starRating} Sao
                                                        </span>
                                                    )}
                                                    {location && (
                                                        <span className="chat-location-pill">
                                                            <MapPin size={11} />
                                                            {location}
                                                        </span>
                                                    )}
                                                    <span className="chat-support-tag">Phản hồi nhanh</span>
                                                </div>

                                                {/* Đoạn tin nhắn gần nhất - Đã fix không lặp lại tên khách sạn */}
                                                <div className="chat-preview-box">
                                                    {latestMsg ? (
                                                        <>
                                                            <span className={`chat-role-badge ${latestMsg.sender_type === 'customer' ? 'you' : 'hotel'}`}>
                                                                {latestMsg.sender_type === 'customer' ? 'Bạn' : 'Lễ tân'}
                                                            </span>
                                                            <span className="chat-snippet-text" title={latestMsg.message}>
                                                                {latestMsg.message}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="chat-snippet-empty">
                                                            Chưa có tin nhắn nào trong cuộc trò chuyện này...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Các nút hành động bên phải */}
                                            <div className="chat-card-actions">
                                                <button
                                                    className="chat-open-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedChat(chat);
                                                    }}
                                                >
                                                    <MessageSquare size={14} />
                                                    <span>Nhắn tin</span>
                                                    <ChevronRight size={14} />
                                                </button>

                                                {chat.hotel_id && (
                                                    <Link
                                                        to={`/hotels/${chat.hotel_id}`}
                                                        className="chat-hotel-link"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="Xem trang khách sạn"
                                                    >
                                                        <span>Xem khách sạn</span>
                                                        <ExternalLink size={12} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Cột phải: Hộp thông tin hỗ trợ & Mẹo liên hệ */}
                    <div className="chats-sidebar">
                        {/* Hộp Hotline Hỗ Trợ StayHub */}
                        <div className="chat-sidebar-card">
                            <h4 className="chat-sidebar-title">
                                <Headphones size={18} color="#d97706" />
                                Tổng Đài Hỗ Trợ StayHub
                            </h4>

                            <div className="support-hotline-box">
                                <div className="hotline-label">Hotline Chăm Sóc Khách Hàng 24/7</div>
                                <a href="tel:19001234" className="hotline-phone">
                                    <PhoneCall size={20} /> 1900 1234
                                </a>
                            </div>

                            <ul className="support-features-list">
                                <li>
                                    <ShieldCheck size={16} color="#10b981" />
                                    <span>Bảo đảm quyền lợi đặt phòng & chính sách hoàn cọc</span>
                                </li>
                                <li>
                                    <HelpCircle size={16} color="#0284c7" />
                                    <span>Hỗ trợ can thiệp khi khách sạn phản hồi chậm</span>
                                </li>
                                <li>
                                    <Clock size={16} color="#d97706" />
                                    <span>Phục vụ liên tục kể cả dịp Lễ & Tết</span>
                                </li>
                            </ul>
                        </div>

                        {/* Mẹo trao đổi nhanh với khách sạn */}
                        <div className="chat-sidebar-card">
                            <h4 className="chat-sidebar-title">
                                <Sparkles size={18} color="#d97706" />
                                Gợi Ý Trao Đổi Tiện Ích
                            </h4>

                            <div className="chat-tips-list">
                                <div className="chat-tip-item">
                                    <span className="chat-tip-dot" />
                                    <div>
                                        <strong>Nhận/Trả phòng:</strong> Thông báo trước giờ check-in nếu đến sớm trước 14:00 hoặc sau 21:00.
                                    </div>
                                </div>
                                <div className="chat-tip-item">
                                    <span className="chat-tip-dot" />
                                    <div>
                                        <strong>Yêu cầu phòng:</strong> Hỏi về tầng cao, phòng view đẹp, giường đôi hoặc phòng không hút thuốc.
                                    </div>
                                </div>
                                <div className="chat-tip-item">
                                    <span className="chat-tip-dot" />
                                    <div>
                                        <strong>Đưa đón & Đỗ xe:</strong> Đặt trước chỗ đỗ xe ô tô miễn phí hoặc dịch vụ đón tiễn sân bay.
                                    </div>
                                </div>
                                <div className="chat-tip-item">
                                    <span className="chat-tip-dot" />
                                    <div>
                                        <strong>Dịp kỷ niệm:</strong> Nhắn trước nếu bạn đi hưởng tuần trăng mật hoặc sinh nhật để nhận ưu đãi.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lối tắt nhanh */}
                        <div className="chat-sidebar-card">
                            <h4 className="chat-sidebar-title">
                                <ExternalLink size={18} color="#d97706" />
                                Lối Tắt Hữu Ích
                            </h4>

                            <div className="chat-quick-links">
                                <Link to="/orders" className="chat-quick-link-btn">
                                    <span>Đơn đặt phòng của tôi</span>
                                    <ChevronRight size={16} color="#94a3b8" />
                                </Link>
                                <Link to="/hotels" className="chat-quick-link-btn">
                                    <span>Khám phá thêm khách sạn</span>
                                    <ChevronRight size={16} color="#94a3b8" />
                                </Link>
                                <Link to="/promotions" className="chat-quick-link-btn">
                                    <span>Ưu đãi & Mã giảm giá</span>
                                    <ChevronRight size={16} color="#94a3b8" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal trò chuyện với khách sạn */}
            {selectedChat && (
                <ContactOrderModal
                    isOpen={!!selectedChat}
                    onClose={() => {
                        setSelectedChat(null);
                        fetchChats(true);
                    }}
                    order={null}
                    hotelId={selectedChat.hotel_id}
                    hotelName={selectedChat.hotel?.name}
                />
            )}
        </div>
    );
};

export default MyChatsPage;
