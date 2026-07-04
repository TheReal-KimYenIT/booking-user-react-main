import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
    MapPin, Star, Users, Info, BedDouble, CheckCircle2, Ban,
    Image as ImageIcon, Heart, ChevronRight, MessageCircle, Calendar, Building, X, Minus, Plus
} from 'lucide-react';

import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import SearchWidget from '../../components/search/SearchWidget';
import { todayISODate, addDaysISODate } from '../../utils/booking';

// 👇 IMPORT COMPONENT POPUP
import RoomDetailPopup from '../../components/hotel/RoomDetailPopup';
import ContactOrderModal from '../../components/common/ContactOrderModal';

import '../css/HotelDetailPage.css';

const HotelDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [urlCheckIn, setUrlCheckIn] = useState(searchParams.get('checkIn') || todayISODate());
    const [urlCheckOut, setUrlCheckOut] = useState(searchParams.get('checkOut') || addDaysISODate(todayISODate(), 1));
    const [urlAdults, setUrlAdults] = useState(Number(searchParams.get('adults')) || 2);
    const [urlChildren, setUrlChildren] = useState(Number(searchParams.get('children')) || 0);
    const [urlRooms, setUrlRooms] = useState(Number(searchParams.get('rooms')) || 1);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        setUrlCheckIn(searchParams.get('checkIn') || todayISODate());
        setUrlCheckOut(searchParams.get('checkOut') || addDaysISODate(todayISODate(), 1));
        setUrlAdults(Number(searchParams.get('adults')) || 2);
        setUrlChildren(Number(searchParams.get('children')) || 0);
        setUrlRooms(Number(searchParams.get('rooms')) || 1);
    }, [searchParams]);

    const [selectedRoomCounts, setSelectedRoomCounts] = useState({});
    const { user } = useContext(AuthContext);

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isFavorite, setIsFavorite] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const toastTimeoutRef = useRef(null);

    const [reviews, setReviews] = useState([]);
    const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false);

    const [isRoomPopupOpen, setIsRoomPopupOpen] = useState(false);
    const [selectedRoomData, setSelectedRoomData] = useState(null);

    const BACKEND_URL = 'http://localhost:8000';

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

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.toLocaleDateString('vi-VN')}`;
    };

    const anonymizeName = (name) => {
        if (!name) return 'Khách ẩn danh';
        const parts = name.split(' ');
        if (parts.length === 1) return name.charAt(0) + '***';
        const lastPart = parts.pop();
        return parts.join(' ') + ' ' + lastPart.charAt(0) + '***';
    };

    const getImage = (imgObj, fallbackUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80') => {
        if (imgObj && imgObj.file_url) {
            return `http://localhost:8000/api/get-image?path=${encodeURIComponent(imgObj.file_url)}`;
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <h3>Đang tải thông tin phòng...</h3>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '20px' }}>{error || 'Không tìm thấy khách sạn.'}</h3>
                <button onClick={() => navigate('/')} className="primary-btn border-0">Về trang chủ</button>
            </div>
        );
    }

    const hotelImages = hotel.images || [];
    const displayImages = hotelImages.slice(-5).reverse();

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews).toFixed(1)
        : 0;

    return (
        <div style={{ backgroundColor: '#f5f5f5', paddingBottom: '60px', position: 'relative' }}>
            <div className="container" style={{ paddingTop: '30px' }}>

                <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                    <Link to="/" style={{ color: '#dfa974', textDecoration: 'none' }}>Trang chủ</Link> <span> / </span>
                    <Link to="/hotels" style={{ color: '#dfa974', textDecoration: 'none' }}>Khách sạn</Link> <span> / </span>
                    <span style={{ color: '#333' }}>{hotel.name}</span>
                </div>

                {displayImages.length >= 4 ? (
                    <div className="photo-grid">
                        <div className="photo-item main-photo" style={{ backgroundImage: `url("${getImage(displayImages[0])}")` }}></div>
                        <div className="photo-item" style={{ backgroundImage: `url("${getImage(displayImages[1])}")` }}></div>
                        <div className="photo-item" style={{ backgroundImage: `url("${getImage(displayImages[2])}")` }}></div>
                        <div className="photo-item hidden-mobile" style={{ backgroundImage: `url("${getImage(displayImages[3])}")` }}></div>
                        <div className="photo-item hidden-mobile" style={{ backgroundImage: `url("${getImage(displayImages[4] || displayImages[0])}")`, position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
                                <ImageIcon style={{ marginRight: '8px' }} /> Xem tất cả
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', backgroundImage: `url("${getImage(displayImages[0])}")`, backgroundSize: 'cover', backgroundPosition: 'center', marginTop: '20px' }}></div>
                )}

                <SearchWidget
                    variant="mini"
                    hideDestination={true}
                    onSearch={handleSearchUpdate}
                />

                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ background: '#e0f2fe', color: '#2563eb', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Khách Sạn</span>
                            <div style={{ color: '#ca8a04', display: 'flex' }}>
                                {[...Array(hotel.star_rating || 1)].map((_, i) => <Star key={i} size={16} fill="#ca8a04" color="#ca8a04" />)}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                            <h1 style={{ fontSize: '28px', color: '#111', fontWeight: 'bold', margin: 0 }}>{hotel.name}</h1>
                            <div
                                className="hc-fav-btn-detail"
                                data-tooltip={isFavorite ? "Bỏ khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                                onClick={handleToggleFavorite}
                                style={{ cursor: 'pointer' }}
                            >
                                <Heart size={22} color={isFavorite ? "#ef4444" : "#666"} fill={isFavorite ? "#ef4444" : "transparent"} style={{ pointerEvents: 'none', transition: 'all 0.3s' }} />
                            </div>

                            {/* 👉 NÚT CHAT BẮT ĐẦU TƯ VẤN VÃNG LAI */}
                            <button
                                onClick={() => {
                                    if (!user) {
                                        alert("Vui lòng đăng nhập để trò chuyện với khách sạn!");
                                        navigate('/login');
                                        return;
                                    }
                                    setIsChatOpen(true);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                            >
                                <MessageCircle size={18} /> Tư vấn ngay
                            </button>
                        </div>

                        <div style={{ color: '#666', fontSize: '15px', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <MapPin size={16} style={{ marginRight: '5px', color: '#dfa974' }} /> {hotel.address}, {hotel.city}
                        </div>

                        {totalReviews > 0 && (
                            <div
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fef3c7', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => setIsAllReviewsOpen(true)}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fde68a'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fef3c7'}
                            >
                                <span style={{ background: '#d97706', color: '#fff', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', fontSize: '14px' }}>{averageRating}</span>
                                <span style={{ color: '#b45309', fontSize: '14px', fontWeight: '500' }}>Tuyệt vời ({totalReviews} đánh giá) - Đọc nhận xét</span>
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                        <div style={{ fontSize: '14px', color: '#888' }}>Giá phòng mỗi đêm từ</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dfa974', marginBottom: '10px' }}>
                            {hotel.room_types && hotel.room_types.length > 0 ? formatPrice(Math.min(...hotel.room_types.map(r => r.base_price))) : 'Đang cập nhật'}
                        </div>
                        <a href="#room-list" className="primary-btn border-0" style={{ padding: '10px 25px', display: 'inline-block' }}>Chọn phòng</a>
                    </div>
                </div>

                {hotel.description && (
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#111' }}>Giới thiệu chỗ nghỉ</h3>
                        <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>
                            {hotel.description}
                        </p>
                    </div>
                )}

                <div id="room-list" style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: '#1e293b', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
                            Những phòng còn trống từ {urlCheckIn} đến {urlCheckOut}
                        </h3>
                        <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                            Yêu cầu: {urlAdults} Người lớn {urlChildren > 0 ? `, ${urlChildren} Trẻ em` : ''} - {urlRooms} Phòng
                        </div>
                    </div>

                    {hotel.room_types && hotel.room_types.length > 0 ? (
                        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                            <div style={{ width: '100%', overflowX: 'auto' }}>
                                <div style={{ minWidth: '850px' }}>
                                    {hotel.room_types.map((room, index) => {
                                        const roomImg = room.media && room.media.length > 0 ? getImage(room.media[room.media.length - 1]) : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80';
                                        const isLast = index === hotel.room_types.length - 1;
                                        const currentRoomCount = selectedRoomCounts[room.id] || urlRooms;
                                        const totalPrice = room.base_price * currentRoomCount;

                                        return (
                                            <div key={room.id} style={{ display: 'grid', gridTemplateColumns: '28% 30% 12% 16% 14%', borderBottom: isLast ? 'none' : '1px solid #e2e8f0', background: '#fff' }}>
                                                <div style={{ padding: '20px', borderRight: '1px solid #e2e8f0' }}>
                                                    <div style={{ backgroundImage: `url("${roomImg}")`, height: '150px', borderRadius: '8px', backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '15px' }}></div>
                                                    <h4 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px', lineHeight: '1.4' }}>{room.name}</h4>
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

                                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <strong style={{ fontSize: '15px', color: '#1e293b', marginBottom: '12px', display: 'block' }}>Chỉ thanh toán phòng</strong>
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

                                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748b', fontSize: '14px', gap: '6px' }}>
                                                    <Users size={24} color="#94a3b8" />
                                                    <div style={{ textAlign: 'center', lineHeight: '1.5' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#334155', display: 'block' }}>{room.max_adults} Người lớn</span>
                                                        {room.max_children > 0 && (
                                                            <span style={{ fontSize: '13px' }}>{room.max_children} Trẻ em</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
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
                                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>Giá cho {currentRoomCount} phòng / đêm</div>
                                                </div>

                                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => navigate(`/checkout?room_id=${room.id}&hotel_id=${hotel.id}&checkIn=${urlCheckIn}&checkOut=${urlCheckOut}&rooms=${currentRoomCount}&adults=${urlAdults}&children=${urlChildren}`)}
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
                            <p>Vui lòng chọn ngày khác hoặc thay đổi yêu cầu tìm kiếm.</p>
                        </div>
                    )}
                </div>
            </div>

            {toastMessage && (
                <div className="toast-popup">
                    {toastMessage}
                </div>
            )}

            {isAllReviewsOpen && (
                <div className="custom-modal-overlay" onClick={() => setIsAllReviewsOpen(false)} style={{ zIndex: 99999 }}>
                    <div className="custom-modal-content" style={{ maxWidth: '800px', backgroundColor: '#f8fafc', height: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ backgroundColor: '#ffffff', padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MessageCircle size={24} color="#3b82f6" /> Đánh giá từ khách hàng
                            </h3>
                            <button className="close-btn" onClick={() => setIsAllReviewsOpen(false)}><X size={24} /></button>
                        </div>

                        <div className="modal-body" style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ background: '#fbbf24', color: '#fff', fontSize: '36px', fontWeight: 'bold', padding: '15px 25px', borderRadius: '10px' }}>{averageRating}</div>
                                <div>
                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>Tuyệt vời</div>
                                    <div style={{ fontSize: '15px', color: '#64748b' }}>Dựa trên <strong>{totalReviews}</strong> đánh giá thực tế từ khách hàng</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '20px' }}>
                                {reviews.map((review) => (
                                    <div key={review.id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '45px', height: '45px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                                                    {review.customer?.name ? review.customer.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>{anonymizeName(review.customer?.name)}</div>
                                                    <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}><Calendar size={12} /> {formatDateTime(review.created_at)}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={16} fill={review.rating >= star ? '#fbbf24' : 'transparent'} color={review.rating >= star ? '#fbbf24' : '#cbd5e1'} />))}
                                            </div>
                                        </div>

                                        <div style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' }}>
                                            {review.comment || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>(Khách hàng đánh giá không kèm nhận xét)</span>}
                                        </div>

                                        {review.images && review.images.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                                                {review.images.map((img, idx) => (
                                                    <div key={idx} style={{ width: '70px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                        <img src={`${BACKEND_URL}${img.image_url}`} alt="review pic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {review.partner_reply && (
                                            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><Building size={16} color="#1d4ed8" /><strong style={{ color: '#1d4ed8', fontSize: '13px' }}>Phản hồi từ Khách sạn</strong></div>
                                                <p style={{ margin: 0, color: '#475569', fontSize: '13px', lineHeight: '1.5' }}>{review.partner_reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isRoomPopupOpen && selectedRoomData && (
                <RoomDetailPopup
                    show={isRoomPopupOpen}
                    room={selectedRoomData}
                    hotel={hotel}
                    checkIn={urlCheckIn}
                    checkOut={urlCheckOut}
                    adults={urlAdults}
                    children={urlChildren}
                    selectedRoomCount={selectedRoomCounts[selectedRoomData.id] || urlRooms}
                    onClose={() => setIsRoomPopupOpen(false)}
                />
            )}

            {/* 👉 MODAL CHAT SẼ LUÔN ĐƯỢC RENDER AN TOÀN TẠI ĐÂY */}
            {isChatOpen && (
                <ContactOrderModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    hotelId={hotel.id}
                    hotelName={hotel.name}
                    order={null}
                />
            )}
        </div>
    );
};

export default HotelDetailPage;