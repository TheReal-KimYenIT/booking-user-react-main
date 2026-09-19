import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
    MapPin, Star, Users, Info, BedDouble, CheckCircle2, Ban,
    Image as ImageIcon, Heart, ChevronRight, MessageCircle, X, Minus, Plus,
    Wifi, Coffee, Car, Clock, Utensils, Dumbbell, Sparkles, Waves, Check
} from 'lucide-react';
import Swal from 'sweetalert2';

import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import SearchWidget from '../../components/search/SearchWidget';
import { todayISODate, addDaysISODate } from '../../utils/booking';

import RoomDetailPopup from '../../components/hotel/RoomDetailPopup';
import ContactOrderModal from '../../components/common/ContactOrderModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { resolveImageUrl } from '../../utils/imageUrl';

import '../css/HotelDetailPage.css';

const HotelDetailPage = () => {
    // Trang chi tiết khách sạn, hiển thị hình ảnh, thông tin và các loại phòng
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. QUẢN LÝ CÁC BIẾN TRẠNG THÁI (STATE)
    const [urlCheckIn, setUrlCheckIn] = useState(searchParams.get('checkIn') || todayISODate());
    const [urlCheckOut, setUrlCheckOut] = useState(searchParams.get('checkOut') || addDaysISODate(todayISODate(), 1));
    const [urlAdults, setUrlAdults] = useState(Number(searchParams.get('adults')) || 2);
    const [urlChildren, setUrlChildren] = useState(Number(searchParams.get('children')) || 0);
    const [urlRooms, setUrlRooms] = useState(Number(searchParams.get('rooms')) || 1);

    // Quản lý việc đóng/mở các cửa sổ Popup
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false); // Biến này giờ đã được sử dụng
    const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false);
    const [isRoomPopupOpen, setIsRoomPopupOpen] = useState(false);

    // Lưu trữ dữ liệu
    const [selectedRoomCounts, setSelectedRoomCounts] = useState({});
    const { user } = useContext(AuthContext);
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [selectedRoomData, setSelectedRoomData] = useState(null);

    const [toastMessage, setToastMessage] = useState('');
    const toastTimeoutRef = useRef(null);

    // 2. LẮNG NGHE SỰ THAY ĐỔI TỪ URL
    useEffect(() => {
        setUrlCheckIn(searchParams.get('checkIn') || todayISODate());
        setUrlCheckOut(searchParams.get('checkOut') || addDaysISODate(todayISODate(), 1));
        setUrlAdults(Number(searchParams.get('adults')) || 2);
        setUrlChildren(Number(searchParams.get('children')) || 0);
        setUrlRooms(Number(searchParams.get('rooms')) || 1);
    }, [searchParams]);

    // 3. TẢI DỮ LIỆU TỪ BACKEND
    useEffect(() => {
        const fetchHotelDetail = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/hotels/${id}?checkIn=${urlCheckIn}&checkOut=${urlCheckOut}&rooms=${urlRooms}`);
                setHotel(response.data.data);
                const initialCounts = {};
                response.data.data.room_types.forEach(rt => {
                    initialCounts[rt.id] = urlRooms;
                });
                setSelectedRoomCounts(initialCounts);
            } catch (err) {
                console.error(err);
                setError('Không tìm thấy khách sạn hoặc có lỗi xảy ra.');
            } finally {
                setLoading(false);
            }
        };
        fetchHotelDetail();
    }, [id, urlCheckIn, urlCheckOut, urlRooms]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axiosClient.get(`/hotels/${id}/reviews`);
                if (res.data && res.data.data) {
                    setReviews(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi lấy danh sách đánh giá:", err);
            }
        };
        if (id) fetchReviews();
    }, [id]);

    useEffect(() => {
        if (user && hotel) {
            axiosClient.get('/customer/favorites')
                .then(res => {
                    const ids = res.data.data.map(h => h.id);
                    setIsFavorite(ids.includes(hotel.id));
                })
                .catch(err => console.error("Lỗi lấy danh sách yêu thích:", err));
        }
    }, [user, hotel]);

    // 4. CÁC HÀM XỬ LÝ SỰ KIỆN (ACTIONS)
    const handleSearchUpdate = (searchData) => {
        setSearchParams({
            checkIn: searchData.checkIn,
            checkOut: searchData.checkOut,
            adults: searchData.adults,
            children: searchData.children,
            rooms: searchData.rooms
        });
    };

    const updateRoomCount = (roomId, newCount, maxAvailable) => {
        if (newCount >= 1 && newCount <= maxAvailable) {
            setSelectedRoomCounts(prev => ({
                ...prev,
                [roomId]: newCount
            }));
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getImage = (imgObj, fallbackUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80') => {
        if (imgObj && imgObj.file_url) {
            return resolveImageUrl(imgObj.file_url);
        }
        return fallbackUrl;
    };

    const showToast = (message) => {
        setToastMessage(message);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Vui lòng đăng nhập để lưu khách sạn yêu thích!");
            navigate('/login');
            return;
        }

        try {
            await axiosClient.post(`/customer/favorites/${hotel.id}`);
            if (isFavorite) {
                setIsFavorite(false);
                showToast("Đã xóa khỏi danh sách yêu thích");
            } else {
                setIsFavorite(true);
                showToast("Đã thêm vào danh sách yêu thích ❤️");
            }
        } catch (err) {
            alert("Có lỗi xảy ra khi lưu khách sạn, vui lòng thử lại!");
        }
    };

    const openRoomDetailPopup = (room) => {
        setSelectedRoomData(room);
        setIsRoomPopupOpen(true);
    };

    const handleBookNow = (roomId, currentRoomCount) => {
        if (!user) {
            Swal.fire({ icon: 'info', title: 'Yêu cầu đăng nhập', text: 'Vui lòng đăng nhập để thực hiện đặt phòng!' });
            navigate('/login');
            return;
        }

        if (hotel.is_blocked) {
            Swal.fire({
                icon: 'error',
                title: 'Từ Chối Dịch Vụ',
                text: `Rất tiếc, bạn không thể đặt phòng tại khách sạn này do vi phạm quy định trước đó (Lý do: ${hotel.block_reason || 'Không rõ'}). Vui lòng liên hệ trực tiếp khách sạn để biết thêm chi tiết.`,
                confirmButtonText: 'Đã hiểu'
            });
            return;
        }

        navigate(`/checkout?room_id=${roomId}&hotel_id=${hotel.id}&checkIn=${urlCheckIn}&checkOut=${urlCheckOut}&rooms=${currentRoomCount}&adults=${urlAdults}&children=${urlChildren}`);
    };

    // 5. GIAO DIỆN HIỂN THỊ
    if (loading) {
        return <LoadingSpinner text="Đang tải thông tin khách sạn..." />;
    }

    if (error || !hotel) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '20px' }}>{error || 'Không tìm thấy khách sạn.'}</h3>
                <button onClick={() => navigate('/')} className="primary-btn border-0">Về trang chủ</button>
            </div>
        );
    }

    // 4. Các biến hỗ trợ giao diện
    const hotelImages = hotel.images || [];
    const displayImages = hotelImages.slice(-5).reverse();

    // LẤY ĐIỂM SỐ VÀ LƯỢT ĐÁNH GIÁ TRỰC TIẾP TỪ DATABASE (Đã được Backend tối ưu)
    const totalReviews = hotel.review_count || 0;
    const averageRating = totalReviews > 0 
        ? Number(hotel.average_rating || 0).toFixed(1)
        : 0;

    const getRatingLabel = (rating) => {
        const num = Number(rating);
        if (num >= 4.5) return 'Xuất sắc';
        if (num >= 4.0) return 'Rất tốt';
        if (num >= 3.5) return 'Hài lòng';
        if (num >= 3.0) return 'Tương đối';
        return 'Đánh giá tốt';
    };

    const getAmenityIcon = (name) => {
        const n = (name || '').toLowerCase();
        if (n.includes('wifi')) return <Wifi size={16} color="#0284c7" />;
        if (n.includes('hồ bơi') || n.includes('bể bơi')) return <Waves size={16} color="#0284c7" />;
        if (n.includes('bãi đậu xe') || n.includes('đậu xe') || n.includes('xe')) return <Car size={16} color="#0284c7" />;
        if (n.includes('lễ tân') || n.includes('24/7')) return <Clock size={16} color="#0284c7" />;
        if (n.includes('nhà hàng') || n.includes('bar') || n.includes('ăn')) return <Utensils size={16} color="#0284c7" />;
        if (n.includes('gym') || n.includes('thể hình')) return <Dumbbell size={16} color="#0284c7" />;
        if (n.includes('bữa sáng') || n.includes('cà phê') || n.includes('cafe')) return <Coffee size={16} color="#0284c7" />;
        if (n.includes('spa') || n.includes('massage')) return <Sparkles size={16} color="#0284c7" />;
        return <Check size={16} color="#0284c7" />;
    };

    // TÍNH TOÁN GIÁ KHỞI ĐIỂM ĐỘNG THEO NGÀY (Ưu tiên daily_price linh động từ room_inventory)
    const availableRooms = hotel.room_types || [];
    const validPrices = availableRooms
        .map(r => Number(r.daily_price || r.base_price || 0))
        .filter(p => p > 0);
    const startingPrice = validPrices.length > 0 
        ? Math.min(...validPrices) 
        : (hotel.min_price ? Number(hotel.min_price) : null);

    return (
        <div style={{ backgroundColor: '#f5f5f5', paddingBottom: '60px', position: 'relative' }}>
            <div className="container" style={{ paddingTop: '25px' }}>

                {/* 1. Breadcrumbs - Đường dẫn điều hướng */}
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
                    <Link to="/" style={{ color: '#dfa974', textDecoration: 'none' }}>Trang chủ</Link> <span> / </span>
                    <Link to="/hotels" style={{ color: '#dfa974', textDecoration: 'none' }}>Khách sạn</Link> <span> / </span>
                    <span style={{ color: '#1e293b', fontWeight: '500' }}>{hotel.name}</span>
                </div>

                {/* 2. Khu vực Tiêu Đề, Địa chỉ, Xếp Hạng & Giá Khởi Điểm */}
                <div style={{ background: '#fff', padding: '24px 28px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: '1 1 500px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Khách Sạn</span>
                            <div style={{ color: '#ca8a04', display: 'flex', gap: '2px' }}>
                                {[...Array(hotel.star_rating || 1)].map((_, i) => <Star key={i} size={16} fill="#ca8a04" color="#ca8a04" />)}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                            <h1 style={{ fontSize: '26px', color: '#0f172a', fontWeight: 'bold', margin: 0 }}>{hotel.name}</h1>
                            <div
                                className="hc-fav-btn-detail"
                                data-tooltip={isFavorite ? "Bỏ khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                                onClick={handleToggleFavorite}
                                style={{ cursor: 'pointer' }}
                            >
                                <Heart size={20} color={isFavorite ? "#ef4444" : "#64748b"} fill={isFavorite ? "#ef4444" : "transparent"} style={{ pointerEvents: 'none', transition: 'all 0.3s' }} />
                            </div>

                            <button
                                onClick={() => {
                                    if (!user) {
                                        alert("Vui lòng đăng nhập để trò chuyện với khách sạn!");
                                        navigate('/login');
                                        return;
                                    }
                                    setIsChatOpen(true);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                            >
                                <MessageCircle size={16} /> Tư vấn ngay
                            </button>
                        </div>

                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <MapPin size={16} style={{ marginRight: '6px', color: '#dfa974', flexShrink: 0 }} /> {hotel.address}, {hotel.city}
                        </div>

                        {totalReviews > 0 ? (
                            <div
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef3c7', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => setIsAllReviewsOpen(true)}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fde68a'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fef3c7'}
                            >
                                <span style={{ background: '#d97706', color: '#fff', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>{averageRating}</span>
                                <span style={{ color: '#b45309', fontSize: '14px', fontWeight: '600' }}>
                                    {getRatingLabel(averageRating)} ({totalReviews} đánh giá) - Đọc nhận xét
                                </span>
                            </div>
                        ) : (
                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa có đánh giá nào</div>
                        )}
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Giá phòng mỗi đêm từ</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ea580c', marginBottom: '10px' }}>
                            {startingPrice ? formatPrice(startingPrice) : 'Đang cập nhật'}
                        </div>
                        <button
                            onClick={() => {
                                const el = document.getElementById('room-list');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="primary-btn border-0"
                            style={{ padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}
                        >
                            Chọn phòng
                        </button>
                    </div>
                </div>

                {/* 3. Khu vực Lưới Hình Ảnh (Photo Grid - Hiển thị đẹp, trọn vẹn, không bị che khuất) */}
                {displayImages.length >= 4 ? (
                    <div className="photo-grid" style={{ marginBottom: '25px', marginTop: '0' }}>
                        <div className="photo-item main-photo" style={{ backgroundImage: `url("${getImage(displayImages[0])}")` }}></div>
                        <div className="photo-item" style={{ backgroundImage: `url("${getImage(displayImages[1])}")` }}></div>
                        <div className="photo-item" style={{ backgroundImage: `url("${getImage(displayImages[2])}")` }}></div>
                        <div className="photo-item hidden-mobile" style={{ backgroundImage: `url("${getImage(displayImages[3])}")` }}></div>
                        <div
                            className="photo-item hidden-mobile"
                            style={{ backgroundImage: `url("${getImage(displayImages[4] || displayImages[0])}")`, position: 'relative', cursor: 'pointer' }}
                            onClick={() => setIsGalleryOpen(true)}
                        >
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '16px', borderRadius: '8px' }}>
                                <ImageIcon style={{ marginRight: '8px' }} size={20} /> Xem tất cả ({hotelImages.length} ảnh)
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '380px', borderRadius: '12px', overflow: 'hidden', backgroundImage: `url("${getImage(displayImages[0])}")`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '25px' }}></div>
                )}

                {/* 4. Khu vực Giới Thiệu Khách Sạn & Tiện nghi chỗ nghỉ */}
                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {hotel.description && (
                        <div style={{ marginBottom: hotel.amenities && hotel.amenities.length > 0 ? '25px' : '0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#0f172a' }}>Giới thiệu chỗ nghỉ</h3>
                            <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-line', margin: 0 }}>
                                {hotel.description}
                            </p>
                        </div>
                    )}

                    {hotel.amenities && hotel.amenities.length > 0 && (
                        <div style={{ borderTop: hotel.description ? '1px solid #f1f5f9' : 'none', paddingTop: hotel.description ? '20px' : '0' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#0f172a' }}>Tiện nghi chỗ nghỉ nổi bật</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {hotel.amenities.map(amenity => (
                                    <div
                                        key={amenity.id}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px', color: '#334155', fontWeight: '500' }}
                                    >
                                        {getAmenityIcon(amenity.name)}
                                        {amenity.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 5. Khu vực Danh Sách Các Loại Phòng Trống & Widget Đổi Ngày */}
                <div id="room-list" style={{ marginTop: '30px', scrollMarginTop: '100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                        <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
                            Những phòng còn trống từ {urlCheckIn} đến {urlCheckOut}
                        </h2>
                        <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px 16px', borderRadius: '20px', fontSize: '13.5px', fontWeight: 'bold' }}>
                            Yêu cầu: {urlAdults} Người lớn {urlChildren > 0 ? `, ${urlChildren} Trẻ em` : ''} - {urlRooms} Phòng
                        </div>
                    </div>

                    {/* Widget Tìm Kiếm / Thay đổi ngày & số khách ngay trên bảng phòng */}
                    <div style={{ marginBottom: '20px' }}>
                        <SearchWidget
                            variant="mini"
                            hideDestination={true}
                            onSearch={handleSearchUpdate}
                        />
                    </div>

                    {hotel.room_types && hotel.room_types.length > 0 ? (
                        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                            {/* Header bảng loại phòng */}
                            <div className="room-table-header" style={{ display: 'grid', gridTemplateColumns: '28% 28% 12% 18% 14%', background: '#f8fafc', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <div>Loại phòng</div>
                                <div>Tiện ích & Quy định</div>
                                <div style={{ textAlign: 'center' }}>Số khách</div>
                                <div style={{ textAlign: 'right' }}>Giá phòng</div>
                                <div style={{ textAlign: 'center' }}>Đặt phòng</div>
                            </div>

                            <div style={{ width: '100%', overflowX: 'auto' }}>
                                <div style={{ minWidth: '850px' }}>
                                    {hotel.room_types.map((room, index) => {
                                        const roomImg = room.media && room.media.length > 0 ? getImage(room.media[room.media.length - 1]) : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80';
                                        const isLast = index === hotel.room_types.length - 1;
                                        const currentRoomCount = selectedRoomCounts[room.id] || urlRooms;
                                        const unitDailyPrice = room.daily_price || room.base_price;
                                        const totalPrice = unitDailyPrice * currentRoomCount;
                                        const nights = Math.max(1, Math.round((new Date(urlCheckOut) - new Date(urlCheckIn)) / 86400000));
                                        const totalStayPrice = (room.stay_total ? Number(room.stay_total) : (Number(unitDailyPrice) * nights)) * currentRoomCount;

                                        return (
                                            <div key={room.id} style={{ display: 'grid', gridTemplateColumns: '28% 28% 12% 18% 14%', borderBottom: isLast ? 'none' : '1px solid #e2e8f0', background: '#fff' }}>
                                                <div style={{ padding: '20px', borderRight: '1px solid #e2e8f0' }}>
                                                    <div style={{ backgroundImage: `url("${roomImg}")`, height: '150px', borderRadius: '8px', backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '15px' }}></div>
                                                    <h4 style={{ fontSize: '16.5px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px', lineHeight: '1.4' }}>{room.name}</h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                                                        {room.room_size && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Info size={15} color="#94a3b8" /> {room.room_size} m²
                                                            </div>
                                                        )}
                                                        {(room.bed_type_detail || room.bed_type) && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <BedDouble size={15} color="#94a3b8" /> {room.bed_type_detail ? room.bed_type_detail.name : room.bed_type}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span
                                                        onClick={() => openRoomDetailPopup(room)}
                                                        style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '15px', cursor: 'pointer' }}
                                                    >
                                                        Xem chi tiết phòng <ChevronRight size={14} />
                                                    </span>
                                                </div>

                                                <div style={{ padding: '20px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <strong style={{ fontSize: '14.5px', color: '#1e293b', marginBottom: '12px', display: 'block' }}>Chỉ thanh toán phòng</strong>
                                                    {room.has_breakfast ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', marginBottom: '10px' }}>
                                                            <CheckCircle2 size={15} /> Đã bao gồm bữa sáng
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '10px' }}>
                                                            <Ban size={15} /> Không gồm bữa sáng
                                                        </div>
                                                    )}
                                                    {room.smoking_policy ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', marginBottom: '10px' }}>
                                                            <CheckCircle2 size={15} /> Cho phép hút thuốc
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '10px' }}>
                                                            <Ban size={15} /> Không hút thuốc
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
                                                        <CheckCircle2 size={15} /> Thanh toán tại khách sạn
                                                    </div>
                                                </div>

                                                <div style={{ padding: '20px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748b', fontSize: '14px', gap: '6px' }}>
                                                    <Users size={24} color="#94a3b8" />
                                                    <div style={{ textAlign: 'center', lineHeight: '1.5' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#334155', display: 'block' }}>{room.max_adults} Người lớn</span>
                                                        {room.max_children > 0 && (
                                                            <span style={{ fontSize: '13px' }}>{room.max_children} Trẻ em</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ padding: '20px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', height: '32px' }}>
                                                        <button
                                                            onClick={() => updateRoomCount(room.id, currentRoomCount - 1, room.available_rooms)}
                                                            disabled={currentRoomCount <= 1}
                                                            style={{ background: currentRoomCount <= 1 ? '#f1f5f9' : '#fff', border: 'none', padding: '0 10px', height: '100%', cursor: currentRoomCount <= 1 ? 'not-allowed' : 'pointer', color: '#475569', borderRight: '1px solid #cbd5e1' }}
                                                        ><Minus size={14} /></button>
                                                        <span style={{ padding: '0 10px', fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}>{currentRoomCount} Phòng</span>
                                                        <button
                                                            onClick={() => updateRoomCount(room.id, currentRoomCount + 1, room.available_rooms)}
                                                            disabled={currentRoomCount >= room.available_rooms}
                                                            style={{ background: currentRoomCount >= room.available_rooms ? '#f1f5f9' : '#fff', border: 'none', padding: '0 10px', height: '100%', cursor: currentRoomCount >= room.available_rooms ? 'not-allowed' : 'pointer', color: '#475569', borderLeft: '1px solid #cbd5e1' }}
                                                        ><Plus size={14} /></button>
                                                    </div>
                                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ea580c' }}>{formatPrice(totalPrice)}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                                                        {nights > 1 ? `TB / đêm cho ${currentRoomCount} phòng` : `Giá cho ${currentRoomCount} phòng / đêm`}
                                                    </div>
                                                    {nights > 1 && (
                                                        <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600', marginTop: '2px', textAlign: 'right' }}>
                                                            Tổng {nights} đêm: {formatPrice(totalStayPrice)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => handleBookNow(room.id, currentRoomCount)}
                                                        style={{
                                                            background: '#0ea5e9', color: '#fff', border: 'none',
                                                            padding: '12px 0', borderRadius: '6px', fontWeight: 'bold',
                                                            cursor: 'pointer', width: '100%', transition: 'background 0.2s',
                                                            fontSize: '15px'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                                                    >
                                                        Đặt ngay
                                                    </button>
                                                    {room.available_rooms !== undefined && room.available_rooms <= 5 && (
                                                        <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', marginTop: '8px', textAlign: 'center' }}>
                                                            Chỉ còn {room.available_rooms} phòng
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '40px', backgroundColor: '#fff', textAlign: 'center', borderRadius: '12px', color: '#666', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>Rất tiếc, khách sạn đã hết phòng trong giai đoạn này.</h4>
                            <p>Vui lòng chọn ngày khác hoặc thay đổi yêu cầu tìm kiếm phía trên.</p>
                        </div>
                    )}
                </div>
            </div>

            {toastMessage && (
                <div className="toast-popup">
                    {toastMessage}
                </div>
            )}

            {/* 6. MODAL: HIỂN THỊ TẤT CẢ HÌNH ẢNH (Bổ sung mới để sửa lỗi) */}
            {isGalleryOpen && (
                <div className="custom-modal-overlay" onClick={() => setIsGalleryOpen(false)} style={{ zIndex: 99999 }}>
                    <div className="custom-modal-content" style={{ maxWidth: '900px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>
                                <ImageIcon size={20} style={{ marginRight: '8px' }} />
                                Bộ sưu tập ảnh - {hotel.name}
                            </h3>
                            <button className="close-btn" onClick={() => setIsGalleryOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', overflowY: 'auto', maxHeight: '70vh', paddingRight: '10px' }}>
                            {hotelImages.length > 0 ? (
                                hotelImages.map((img, idx) => (
                                    <img key={idx} src={getImage(img)} alt={`hotel-img-${idx}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                ))
                            ) : (
                                <p style={{ color: '#64748b' }}>Chưa có hình ảnh nào được cập nhật.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 7. MODAL: HIỂN THỊ DANH SÁCH ĐÁNH GIÁ KHÁCH SẠN */}
            {isAllReviewsOpen && (
                <div className="custom-modal-overlay" onClick={() => setIsAllReviewsOpen(false)} style={{ zIndex: 99999 }}>
                    <div className="custom-modal-content" style={{ maxWidth: '800px', backgroundColor: '#f8fafc', height: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ backgroundColor: '#ffffff', padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MessageCircle size={24} color="#3b82f6" /> Đánh giá từ khách hàng
                            </h3>
                            <button className="close-btn" onClick={() => setIsAllReviewsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div className="modal-body" style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ background: '#fbbf24', color: '#fff', fontSize: '36px', fontWeight: 'bold', padding: '15px 25px', borderRadius: '10px' }}>
                                    {totalReviews > 0 ? averageRating : '--'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>
                                        {totalReviews > 0 
                                            ? (Number(averageRating) >= 4.5 ? 'Xuất sắc' : Number(averageRating) >= 4.0 ? 'Rất tốt' : Number(averageRating) >= 3.5 ? 'Hài lòng' : 'Đánh giá tốt')
                                            : 'Chưa có đánh giá'}
                                    </div>
                                    <div style={{ fontSize: '15px', color: '#64748b' }}>
                                        {totalReviews > 0 
                                            ? <>Dựa trên <strong>{totalReviews}</strong> đánh giá thực tế từ khách hàng</>
                                            : 'Chưa có đánh giá nào từ khách hàng.'}
                                    </div>
                                </div>
                            </div>

                            {/* ĐÃ THÊM: Phần hiển thị danh sách các bài đánh giá */}
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {reviews.length > 0 ? (
                                    reviews.map((review, index) => (
                                        <div key={index} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    {/* Khung avatar mặc định lấy chữ cái đầu của tên */}
                                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                                                        {review.customer_name ? review.customer_name.charAt(0).toUpperCase() : 'K'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>{review.customer_name || 'Khách hàng ẩn danh'}</div>
                                                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                                                            {review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#d97706', fontSize: '14px' }}>{review.rating}</span>
                                                    <Star size={14} fill="#d97706" color="#d97706" />
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                                {review.comment || 'Khách hàng không để lại nội dung bằng chữ.'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                        Chưa có bài đánh giá nào.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. MODAL: CHI TIẾT PHÒNG */}
            {isRoomPopupOpen && selectedRoomData && (
                <RoomDetailPopup
                    isOpen={isRoomPopupOpen}
                    room={selectedRoomData}
                    // ĐÃ KHÔI PHỤC: Các biến bắt buộc truyền vào để nút "Đặt ngay" hoạt động
                    hotel={hotel}
                    checkIn={urlCheckIn}
                    checkOut={urlCheckOut}
                    adults={urlAdults}
                    children={urlChildren}
                    selectedRoomCount={selectedRoomCounts[selectedRoomData.id] || urlRooms}
                    onClose={() => setIsRoomPopupOpen(false)}
                />
            )}

            {/* 9. MODAL: KHUNG CHAT VỚI KHÁCH SẠN */}
            {isChatOpen && (
                <ContactOrderModal
                    isOpen={isChatOpen}
                    hotelId={hotel.id}
                    hotelName={hotel.name}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
};

export default HotelDetailPage;