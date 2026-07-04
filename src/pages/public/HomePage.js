import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import SearchWidget from '../../components/search/SearchWidget';
import { formatVnd } from '../../utils/booking';
import '../css/HomePage.css';
import bannerVideo from './video/baner.mp4';

export default function HomePage() {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const popularDestinations = [
        { id: 1, name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1559592413-7ce4f0a0279e?w=800&q=80' },
        { id: 2, name: 'Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1583417311756-c739b6e8346e?w=800&q=80' },
        { id: 3, name: 'Hà Nội', image: 'https://images.unsplash.com/photo-1599708153386-62b2dfba7562?w=800&q=80' },
        { id: 4, name: 'Đà Lạt', image: 'https://images.unsplash.com/photo-1628108422176-7bc092e078ba?w=800&q=80' },
        { id: 5, name: 'Nha Trang', image: 'https://images.unsplash.com/photo-1582294109405-b13c7bb6c4f0?w=800&q=80' },
        { id: 6, name: 'Vũng Tàu', image: 'https://images.unsplash.com/photo-1621245053621-e737c3580556?w=800&q=80' },
    ];

    const getHotelImage = (hotel) => {
        if (hotel.images && hotel.images.length > 0) {
            const lastIndex = hotel.images.length - 1;
            const imgPath = hotel.images[lastIndex].file_url;
            return `http://localhost:8000/api/get-image?path=${encodeURIComponent(imgPath)}`;
        }
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
    };

    const countHotelsInCity = (cityName) => {
        if (!hotels || hotels.length === 0) return 0;
        return hotels.filter(h => h.city && h.city.toLowerCase().includes(cityName.toLowerCase())).length;
    };

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await axiosClient.get('/hotels/search');
                let hotelData = response.data?.data || response.data || [];
                setHotels(hotelData);
            } catch (error) {
                console.error('Lỗi khi tải danh sách khách sạn:', error);
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    return (
        <>
            {/* ========================================== */}
            {/* 1. KHỐI HERO BANNER CÓ VIDEO NỀN */}
            {/* ========================================== */}
            <section
                className="position-relative d-flex align-items-center justify-content-center"
                // 👉 ĐÃ SỬA: Đổi overflow thành 'visible' và paddingBottom thành 150px
                style={{ minHeight: '85vh', overflow: 'visible', backgroundColor: '#0f172a', paddingBottom: '150px' }}
            >
                {/* 👉 ĐÃ SỬA: Thêm div bọc ngoài video để quản lý overflow 
                    giúp Video vẫn bị cắt gọn gàng, nhưng nội dung trang web thì không bị cắt 
                */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0 }}>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        poster="https://images.unsplash.com/photo-1542314831-c6a420325142?auto=format&fit=crop&w=1920&q=80"
                        src={bannerVideo}
                    ></video>
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}></div>
                </div>

                {/* Nội dung chính */}
                <div className="container position-relative text-center" style={{ zIndex: 2, paddingTop: '80px' }}>
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-3 text-uppercase fw-bold tracking-wider shadow">
                                Welcome to StayHub
                            </span>
                            <h1 className="display-3 fw-bold text-white mb-5" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.6)' }}>
                                Đặt phòng dễ dàng,<br />Trải nghiệm ngập tràn.
                            </h1>

                            {/* Widget Tìm kiếm */}
                            <SearchWidget variant="home" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 2. KHỐI VỀ CHÚNG TÔI */}
            {/* ========================================== */}
            <section className="py-5 bg-white">
                <div className="container py-4">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-4 mb-lg-0 pe-lg-5">
                            <h5 className="text-warning fw-bold mb-2">VỀ CHÚNG TÔI</h5>
                            <h2 className="fw-bold mb-4 text-dark display-6">Chào mừng đến với hệ thống StayHub</h2>
                            <p className="text-muted fs-5 mb-3">
                                StayHub tự hào mang đến những lựa chọn nghỉ dưỡng hàng đầu, giúp bạn dễ dàng tìm kiếm và đặt phòng với mức giá cực kỳ ưu đãi.
                            </p>
                            <p className="text-muted mb-4">
                                Dù là chuyến công tác ngắn ngày hay kỳ nghỉ gia đình, chất lượng dịch vụ và sự hài lòng của bạn luôn là kim chỉ nam trong mọi hoạt động của chúng tôi.
                            </p>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" alt="Signature" style={{ width: '150px', opacity: '0.6' }} />
                        </div>
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <img
                                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                                    alt="About Us"
                                    className="img-fluid rounded-4 shadow-lg w-100"
                                    style={{ height: '400px', objectFit: 'cover' }}
                                />
                                <div className="position-absolute bottom-0 start-0 bg-white p-4 rounded-end-4 shadow" style={{ transform: 'translateY(20px)' }}>
                                    <h3 className="fw-bold text-warning mb-0">10+ Năm</h3>
                                    <p className="text-muted mb-0 fw-bold">Kinh nghiệm dịch vụ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 3. KHỐI ĐIỂM ĐẾN PHỔ BIẾN */}
            {/* ========================================== */}
            <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
                <div className="container py-4">
                    <div className="row mb-5 text-center">
                        <div className="col-lg-12">
                            <h5 className="text-warning fw-bold mb-2">KHÁM PHÁ</h5>
                            <h2 className="fw-bold text-dark">Điểm đến thịnh hành nhất</h2>
                            <p className="text-muted">Các lựa chọn hàng đầu được khách hàng yêu thích</p>
                        </div>
                    </div>

                    <div className="row g-4">
                        {popularDestinations.map((dest) => (
                            <div className="col-lg-4 col-md-6" key={dest.id}>
                                <div
                                    onClick={() => navigate(`/hotels?destination=${encodeURIComponent(dest.name)}`)}
                                    className="position-relative rounded-4 overflow-hidden destination-card"
                                    style={{ height: '260px', cursor: 'pointer' }}
                                >
                                    <img
                                        src={dest.image}
                                        alt={dest.name}
                                        className="position-absolute top-0 start-0 w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                    />

                                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.85))' }}></div>

                                    <div className="position-absolute bottom-0 start-0 p-4 w-100">
                                        <h4 className="text-white fw-bold mb-1">{dest.name}</h4>
                                        <span className="badge bg-warning text-dark px-2 py-1">
                                            {countHotelsInCity(dest.name)} chỗ nghỉ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 4. KHỐI KHÁCH SẠN NỔI BẬT */}
            {/* ========================================== */}
            <section className="py-5 bg-white">
                <div className="container py-4">
                    <div className="row mb-5 text-center">
                        <div className="col-lg-12">
                            <h5 className="text-warning fw-bold mb-2">ĐỀ XUẤT CHO BẠN</h5>
                            <h2 className="fw-bold text-dark">Khám Phá Khách Sạn</h2>
                            <p className="text-muted">Trải nghiệm những dịch vụ đẳng cấp và không gian nghỉ dưỡng tuyệt vời</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="mt-3 text-muted">Đang tải dữ liệu từ hệ thống...</p>
                        </div>
                    ) : hotels.length === 0 ? (
                        <div className="text-center py-5">
                            <h4 className="text-muted">Hiện chưa có khách sạn nào trên hệ thống.</h4>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {hotels.slice(0, 4).map((hotel) => {
                                const starCount = Number(hotel.star_rating) || 1;
                                const minPrice = hotel.min_price;

                                return (
                                    <div className="col-lg-3 col-md-6" key={hotel.id}>
                                        <div
                                            className="card h-100 border-0 rounded-4 overflow-hidden hotel-card-custom"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/hotels/${hotel.id}`)}
                                        >
                                            <div className="position-relative" style={{ height: '220px' }}>
                                                <img
                                                    src={getHotelImage(hotel)}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: 'cover' }}
                                                    alt={hotel.name}
                                                />
                                                <div className="position-absolute top-0 end-0 m-3">
                                                    <span className="badge bg-white text-dark shadow-sm d-flex align-items-center gap-1 py-2 px-3 rounded-pill" style={{ fontSize: '13px' }}>
                                                        <Star size={14} fill="#fbbf24" color="#fbbf24" /> {starCount} Sao
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="card-body d-flex flex-column p-4">
                                                <h5 className="card-title fw-bold text-dark mb-2 text-truncate" title={hotel.name}>
                                                    {hotel.name}
                                                </h5>
                                                <div className="d-flex align-items-center text-muted mb-3" style={{ fontSize: '14px' }}>
                                                    <MapPin size={14} className="me-1 text-primary flex-shrink-0" />
                                                    <span className="text-truncate">{hotel.city}</span>
                                                </div>

                                                <hr className="mt-auto mb-3" style={{ borderColor: '#e2e8f0' }} />

                                                <div className="d-flex justify-content-between align-items-end">
                                                    <div>
                                                        <span className="text-muted d-block" style={{ fontSize: '12px' }}>Bắt đầu từ</span>
                                                        <span className="fw-bold fs-5 text-danger">
                                                            {minPrice ? formatVnd(minPrice) : 'Đang cập nhật'}
                                                        </span>
                                                        {minPrice && <span className="text-muted ms-1" style={{ fontSize: '12px' }}>/đêm</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {hotels.length > 0 && (
                        <div className="text-center mt-5">
                            <button
                                className="btn btn-outline-primary rounded-pill fw-bold btn-xem-tat-ca"
                                onClick={() => navigate('/hotels')}
                            >
                                Xem tất cả khách sạn
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}