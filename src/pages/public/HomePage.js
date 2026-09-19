import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Star, MapPin, ChevronRight, ShieldCheck, Zap, CreditCard, Headphones, 
    Ticket, Copy, Check, Sparkles, Award, Compass, ArrowRight, Users 
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import SearchWidget from '../../components/search/SearchWidget';
import { formatVnd } from '../../utils/booking';
import Swal from 'sweetalert2';
import bannerVideo from '../../assets/video/banner.mp4';
import { resolveImageUrl } from '../../utils/imageUrl';
import '../css/HomePage.css';

export default function HomePage() {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [destinationCounts, setDestinationCounts] = useState({});
    const [hotelFilterTab, setHotelFilterTab] = useState('all');
    const [copiedCode, setCopiedCode] = useState(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');

    const popularDestinations = [
        { id: 1, name: 'Đà Nẵng', image: '/img/home/da_nang.jpg', isLarge: true, priceFrom: '450.000' },
        { id: 2, name: 'Hồ Chí Minh', image: '/img/home/ho_chi_minh.jpg', isLarge: true, priceFrom: '550.000' },
        { id: 3, name: 'Hà Nội', image: '/img/home/ha_noi.jpg', isLarge: false, priceFrom: '500.000' },
        { id: 4, name: 'Đà Lạt', image: '/img/home/dalat.jpg', isLarge: false, priceFrom: '380.000' },
        { id: 5, name: 'Nha Trang', image: '/img/home/nha_trang.jpg', isLarge: false, priceFrom: '420.000' },
        { id: 6, name: 'Vũng Tàu', image: '/img/home/vung_tau.jpg', isLarge: false, priceFrom: '390.000' },
    ];

    const curatedVouchers = [
        {
            code: 'STAYHUB26',
            discount: '15%',
            title: 'Ưu đãi chào năm 2026',
            desc: 'Giảm tối đa 300.000 đ cho toàn bộ khách sạn và resort.',
            badge: 'HOT NHẤT',
            minBooking: 'Đơn từ 1.000.000 đ'
        },
        {
            code: 'EARLYBIRD',
            discount: '20%',
            title: 'Đặt sớm giá hời',
            desc: 'Giảm đến 500.000 đ khi đặt trước ngày nhận phòng 7 ngày.',
            badge: 'TIẾT KIỆM',
            minBooking: 'Đơn từ 1.500.000 đ'
        },
        {
            code: 'LONGSTAY3N',
            discount: '300K',
            title: 'Kỳ nghỉ dài ngày',
            desc: 'Giảm ngay 300.000 đ khi lưu trú từ 3 đêm trở lên.',
            badge: 'RESORT VIP',
            minBooking: 'Kỳ nghỉ từ 3 đêm'
        },
        {
            code: 'WELCOMEGUEST',
            discount: '100K',
            title: 'Chào đón bạn mới',
            desc: 'Tặng ngay 100.000 đ cho chuyến đi đầu tiên cùng StayHub.',
            badge: 'BẠN MỚI',
            minBooking: 'Không giới hạn'
        }
    ];

    const testimonials = [
        {
            id: 1,
            name: 'Trần Hoàng Nam',
            location: 'Hà Nội',
            hotel: 'Sunrise Resort Đà Nẵng',
            rating: 5,
            comment: '“Đặt phòng trên StayHub rất nhanh chóng và an tâm. Chỉ cần cọc 50%, thông tin nhận phòng cực kỳ minh bạch và hình ảnh thực tế 100% như trên website.”'
        },
        {
            id: 2,
            name: 'Nguyễn Thị Thu Hà',
            location: 'TP. Hồ Chí Minh',
            hotel: 'City Central Hotel TP.HCM',
            rating: 5,
            comment: '“Giao diện hiện đại, tính năng lọc theo tiện ích và ngày nhận phòng rất chuẩn. Khi cần thay đổi lịch, đội ngũ hỗ trợ trực tuyến giải quyết ngay lập tức!”'
        },
        {
            id: 3,
            name: 'Lê Minh Trí',
            location: 'Đà Nẵng',
            hotel: 'Mountain Retreat Đà Lạt',
            rating: 5,
            comment: '“Chính sách hoàn cọc rõ ràng giúp mình rất yên tâm khi lên kế hoạch đi chơi cùng gia đình. Voucher giảm giá áp dụng trực tiếp không có điều khoản mập mờ.”'
        }
    ];

    const getHotelImage = (hotel) => {
        if (hotel.images && hotel.images.length > 0) {
            const primary = hotel.images.find(img => img.is_primary === 1 || img.is_primary === true);
            const targetImg = primary || hotel.images[0];
            const imgPath = targetImg.file_url;
            return resolveImageUrl(imgPath);
        }
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Tải danh sách khách sạn
                const response = await axiosClient.get('/hotels/search');
                let hotelData = response.data?.data || response.data || [];
                setHotels(hotelData);

                // Tải số lượng đếm khách sạn cho các điểm đến
                const countsResponse = await axiosClient.get('/hotels/destinations-count');
                if (countsResponse.data && countsResponse.data.data) {
                    setDestinationCounts(countsResponse.data.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu trang chủ:', error);
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCopyVoucher = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Đã sao chép mã: ${code}`,
            showConfirmButton: false,
            timer: 2000
        });
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!newsletterEmail || !newsletterEmail.includes('@')) {
            Swal.fire('Thông báo', 'Vui lòng nhập địa chỉ email hợp lệ.', 'warning');
            return;
        }
        Swal.fire('Thành công!', 'Cảm ơn bạn đã đăng ký! Mã giảm giá 15% đã được gửi vào hộp thư của bạn.', 'success');
        setNewsletterEmail('');
    };

    const getFilteredHotels = () => {
        if (hotelFilterTab === '5star') {
            return hotels.filter(h => Number(h.star_rating) === 5);
        }
        if (hotelFilterTab === 'resort') {
            return hotels.filter(h => {
                const name = (h.name || '').toLowerCase();
                return name.includes('resort') || name.includes('retreat') || name.includes('spa') || name.includes('villa');
            });
        }
        if (hotelFilterTab === 'city') {
            return hotels.filter(h => {
                const city = (h.city || '').toLowerCase();
                return city.includes('hồ chí minh') || city.includes('hà nội') || city.includes('đà nẵng');
            });
        }
        return hotels;
    };

    const filteredHotels = getFilteredHotels();

    return (
        <div className="stayhub-homepage">
            {/* ========================================== */}
            {/* 1. KHỐI HERO BANNER HIỆN ĐẠI CÓ VIDEO NỀN  */}
            {/* ========================================== */}
            <section className="home-hero-section">
                <div className="home-hero-video-bg">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        src={bannerVideo}
                    ></video>
                    <div className="home-hero-overlay"></div>
                </div>

                <div className="home-hero-content">
                    <div className="hero-pill-badge">
                        <Sparkles size={15} color="#fbbf24" />
                        <span>Nền tảng đặt phòng khách sạn & resort hàng đầu</span>
                    </div>

                    <h1 className="hero-main-title">
                        <span className="hero-title-white">Kỳ Nghỉ Thượng Lưu,</span> <br />
                        <span className="text-gradient-gold">Trọn Vẹn Từng Khoảnh Khắc</span>
                    </h1>

                    <p className="hero-sub-title">
                        Hơn 500+ khách sạn, resort & villa cao cấp tại Việt Nam với cam kết giá tốt nhất, 
                        hoàn cọc linh hoạt và hỗ trợ 24/7 đồng hành cùng bạn.
                    </p>

                    {/* Widget Tìm kiếm đã được nâng cấp */}
                    <SearchWidget variant="home" />
                </div>
            </section>

            {/* ========================================== */}
            {/* 2. THANH CAM KẾT GIÁ TRỊ (4 GIÁ TRỊ VÀNG)  */}
            {/* ========================================== */}
            <div className="home-trust-bar-wrapper">
                <div className="home-trust-bar">
                    <div className="trust-item">
                        <div className="trust-icon-box bg-amber-soft">
                            <ShieldCheck size={24} color="#d97706" />
                        </div>
                        <div className="trust-text">
                            <h4>Cam kết giá tốt nhất</h4>
                            <p>Cập nhật giá thực tế trực tiếp từ khách sạn, không phụ phí ẩn</p>
                        </div>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon-box bg-blue-soft">
                            <Zap size={24} color="#2563eb" />
                        </div>
                        <div className="trust-text">
                            <h4>Xác nhận tức thì</h4>
                            <p>Khóa phòng an toàn 15 phút và nhận mã đặt phòng ngay</p>
                        </div>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon-box bg-emerald-soft">
                            <CreditCard size={24} color="#059669" />
                        </div>
                        <div className="trust-text">
                            <h4>Hoàn cọc linh hoạt</h4>
                            <p>Hủy phòng trực tuyến dễ dàng, hoàn tiền nhanh trong 3 ngày</p>
                        </div>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon-box bg-purple-soft">
                            <Headphones size={24} color="#7c3aed" />
                        </div>
                        <div className="trust-text">
                            <h4>Hỗ trợ 24/7 tận tâm</h4>
                            <p>Đội ngũ lễ tân & CSKH StayHub luôn sẵn sàng đồng hành</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 3. KHỐI FLASH DEALS & VOUCHER ĐỘC QUYỀN    */}
            {/* ========================================== */}
            <section id="flash-deals-section" className="home-deals-section">
                <div className="section-header-block">
                    <div className="section-pill-tag">
                        <Ticket size={14} /> ƯU ĐÃI ĐẶC QUYỀN
                    </div>
                    <h2 className="section-title">Mã Giảm Giá Dành Riêng Cho Bạn</h2>
                    <p className="section-desc">
                        Thu thập ngay các voucher độc quyền từ StayHub để tận hưởng kỳ nghỉ mơ ước với mức giá siêu ưu đãi
                    </p>
                </div>

                <div className="deals-grid">
                    {curatedVouchers.map((v, index) => (
                        <div key={index} className="voucher-ticket-card">
                            <div className="voucher-badge-top">{v.badge}</div>

                            <div className="voucher-card-top">
                                <div className="voucher-discount-val">
                                    GIẢM <span>{v.discount}</span>
                                </div>
                                <h4 className="voucher-title">{v.title}</h4>
                                <p className="voucher-desc">{v.desc}</p>
                            </div>

                            <div className="ticket-divider-line"></div>

                            <div className="voucher-card-bottom">
                                <div className="voucher-code-copy-row">
                                    <span className="voucher-code-text">{v.code}</span>
                                    <button 
                                        type="button" 
                                        className="btn-copy-code"
                                        onClick={() => handleCopyVoucher(v.code)}
                                    >
                                        {copiedCode === v.code ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                                        {copiedCode === v.code ? 'Đã chép' : 'Sao chép'}
                                    </button>
                                </div>
                                <Link to="/hotels" className="btn-use-voucher">
                                    Dùng ngay
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================== */}
            {/* 4. KHỐI ĐIỂM ĐẾN PHỔ BIẾN (BENTO-GRID)     */}
            {/* ========================================== */}
            <section className="home-destinations-section">
                <div className="section-header-block">
                    <div className="section-pill-tag">
                        <Compass size={14} /> KHÁM PHÁ VIỆT NAM
                    </div>
                    <h2 className="section-title">Điểm Đến Thịnh Hành Nhất</h2>
                    <p className="section-desc">
                        Những thiên đường du lịch và nghỉ dưỡng được hàng ngàn du khách yêu thích và lựa chọn nhiều nhất
                    </p>
                </div>

                <div className="destinations-bento-grid">
                    {popularDestinations.map((dest) => (
                        <div
                            key={dest.id}
                            className={`bento-dest-card ${dest.isLarge ? 'bento-card-large' : 'bento-card-medium'}`}
                            onClick={() => navigate(`/hotels?destination=${encodeURIComponent(dest.name)}`)}
                        >
                            <img
                                src={dest.image}
                                alt={dest.name}
                                className="bento-dest-img"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80';
                                }}
                            />
                            <div className="bento-dest-gradient"></div>

                            <div className="bento-dest-content">
                                <div>
                                    <h3 className="dest-name-title">{dest.name}</h3>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="dest-count-badge">
                                            {destinationCounts[dest.name] || 0} chỗ nghỉ
                                        </span>
                                        <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: '#fef08a', fontSize: '11px', padding: '4px 8px', borderRadius: '20px' }}>
                                            Từ {dest.priceFrom} đ
                                        </span>
                                    </div>
                                </div>
                                <div className="dest-explore-btn">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================== */}
            {/* 5. KHỐI KHÁCH SẠN NỔI BẬT ĐỀ XUẤT           */}
            {/* ========================================== */}
            <section className="home-hotels-section">
                <div className="section-header-block">
                    <div className="section-pill-tag">
                        <Award size={14} /> ĐỀ XUẤT ĐẶC BIỆT
                    </div>
                    <h2 className="section-title">Khách Sạn & Resort Được Đánh Giá Cao</h2>
                    <p className="section-desc">
                        Trải nghiệm không gian nghỉ dưỡng chuẩn mực với chất lượng phục vụ hàng đầu
                    </p>
                </div>

                {/* Tabs phân loại khách sạn */}
                <div className="hotels-category-tabs">
                    <button
                        className={`hotel-tab-btn ${hotelFilterTab === 'all' ? 'active' : ''}`}
                        onClick={() => setHotelFilterTab('all')}
                    >
                        Tất cả ({hotels.length})
                    </button>
                    <button
                        className={`hotel-tab-btn ${hotelFilterTab === '5star' ? 'active' : ''}`}
                        onClick={() => setHotelFilterTab('5star')}
                    >
                        ⭐ 5 Sao Sang Trọng
                    </button>
                    <button
                        className={`hotel-tab-btn ${hotelFilterTab === 'resort' ? 'active' : ''}`}
                        onClick={() => setHotelFilterTab('resort')}
                    >
                        🏖️ Resort Nghỉ Dưỡng
                    </button>
                    <button
                        className={`hotel-tab-btn ${hotelFilterTab === 'city' ? 'active' : ''}`}
                        onClick={() => setHotelFilterTab('city')}
                    >
                        🌆 Khách Sạn Trung Tâm
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div className="spinner-border" style={{ color: '#d97706' }} role="status"></div>
                        <p style={{ marginTop: '15px', color: '#64748b' }}>Đang tải danh sách chỗ nghỉ tốt nhất...</p>
                    </div>
                ) : filteredHotels.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-muted">Không tìm thấy khách sạn nào trong danh mục này.</h4>
                    </div>
                ) : (
                    <div className="hotels-grid">
                        {filteredHotels.slice(0, 8).map((hotel) => {
                            const starCount = Math.min(5, Math.max(1, Number(hotel.star_rating) || 3));
                            const minPrice = hotel.min_price;

                            return (
                                <div
                                    key={hotel.id}
                                    className="hotel-card-v3"
                                    onClick={() => navigate(`/hotels/${hotel.id}`)}
                                >
                                    <div className="hotel-img-frame">
                                        <img
                                            src={getHotelImage(hotel)}
                                            alt={hotel.name}
                                            className="hotel-main-img"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
                                            }}
                                        />
                                        <span className="hotel-type-tag">
                                            {hotel.name.toLowerCase().includes('resort') ? 'Resort' : 'Khách sạn'}
                                        </span>
                                        <span className="hotel-star-badge">
                                            <Star size={13} fill="#f59e0b" color="#f59e0b" /> {starCount} Sao
                                        </span>
                                    </div>

                                    <div className="hotel-card-body">
                                        <div className="hotel-rating-row">
                                            <div className="hotel-stars-group">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={13}
                                                        fill={i < starCount ? '#f59e0b' : '#e2e8f0'}
                                                        color={i < starCount ? '#f59e0b' : '#e2e8f0'}
                                                    />
                                                ))}
                                            </div>
                                            {Number(hotel.average_rating) > 0 ? (
                                                <span className="hotel-score-pill">
                                                    ★ {Number(hotel.average_rating).toFixed(1)} {hotel.review_count > 0 && `(${hotel.review_count})`}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Mới</span>
                                            )}
                                        </div>

                                        <h3 className="hotel-name-h3" title={hotel.name}>
                                            {hotel.name}
                                        </h3>

                                        <div className="hotel-loc-row">
                                            <MapPin size={14} color="#d97706" className="flex-shrink-0" />
                                            <span className="text-truncate">{hotel.city || hotel.address}</span>
                                        </div>

                                        <div className="hotel-amenities-pills">
                                            {hotel.amenities && hotel.amenities.length > 0 ? (
                                                hotel.amenities.slice(0, 3).map((a) => (
                                                    <span key={a.id} className="amenity-pill-sm">
                                                        {a.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <>
                                                    <span className="amenity-pill-sm">Bữa sáng miễn phí</span>
                                                    <span className="amenity-pill-sm">Wi-Fi tốc độ cao</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="hotel-card-footer">
                                            <div>
                                                <span className="hotel-price-label">Giá mỗi đêm từ</span>
                                                <div className="hotel-price-num">
                                                    {minPrice ? formatVnd(minPrice) : 'Liên hệ'}
                                                    {minPrice && <span className="hotel-price-unit"> /đêm</span>}
                                                </div>
                                            </div>

                                            <button className="btn-hotel-detail-mini">
                                                <span>Xem phòng</span>
                                                <ChevronRight size={14} />
                                            </button>
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
                            className="btn-view-all-hotels"
                            onClick={() => navigate('/hotels')}
                        >
                            <span>Xem tất cả {hotels.length} khách sạn & khu nghỉ dưỡng</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </section>

            {/* ========================================== */}
            {/* 6. KHỐI VÌ SAO CHỌN STAYHUB (GIÁ TRỊ CỐT LÕI)*/}
            {/* ========================================== */}
            <section className="home-why-section">
                <div className="section-header-block">
                    <div className="section-pill-tag">
                        <Sparkles size={14} /> GIÁ TRỊ VƯỢT TRỘI
                    </div>
                    <h2 className="section-title">Vì Sao Hàng Triệu Du Khách Chọn StayHub?</h2>
                    <p className="section-desc">
                        Chúng tôi cam kết mang đến sự an tâm tuyệt đối và trải nghiệm đặt phòng thuận tiện nhất cho bạn
                    </p>
                </div>

                <div className="why-cards-grid">
                    <div className="why-feature-card">
                        <div className="why-icon-box bg-amber-soft">
                            <Award size={26} color="#d97706" />
                        </div>
                        <h3>Khách sạn kiểm định 100%</h3>
                        <p>Tất cả cơ sở lưu trú đều được thẩm định trực tiếp về tiêu chuẩn phòng ốc, vệ sinh và chất lượng phục vụ.</p>
                    </div>

                    <div className="why-feature-card">
                        <div className="why-icon-box bg-emerald-soft">
                            <ShieldCheck size={26} color="#059669" />
                        </div>
                        <h3>Giá minh bạch, không phí ẩn</h3>
                        <p>Mọi khoản chi phí, thuế VAT và tiền đặt cọc đều được giải trình chi tiết trước khi bạn tiến hành thanh toán.</p>
                    </div>

                    <div className="why-feature-card">
                        <div className="why-icon-box bg-blue-soft">
                            <CreditCard size={26} color="#2563eb" />
                        </div>
                        <h3>Hoàn cọc an toàn & Nhanh chóng</h3>
                        <p>Quy trình hủy phòng trực tuyến tiện lợi, tiền hoàn được chuyển khoản ngân hàng trong 3-5 ngày làm việc.</p>
                    </div>

                    <div className="why-feature-card">
                        <div className="why-icon-box bg-purple-soft">
                            <Zap size={26} color="#7c3aed" />
                        </div>
                        <h3>Đặt phòng trong 60 giây</h3>
                        <p>Hệ thống tự động đồng bộ kho phòng theo thời gian thực, tích hợp cổng thanh toán VNPay chuẩn quốc gia.</p>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 7. KHỐI ĐÁNH GIÁ KHÁCH HÀNG THỰC TẾ        */}
            {/* ========================================== */}
            <section className="home-testimonials-section">
                <div className="section-header-block">
                    <div className="section-pill-tag">
                        <Users size={14} /> TRẢI NGHIỆM THỰC TẾ
                    </div>
                    <h2 className="section-title">Khách Hàng Nói Gì Về StayHub?</h2>
                    <p className="section-desc">
                        Lắng nghe những chia sẻ chân thực từ các du khách đã đồng hành cùng StayHub trong những chuyến đi tuyệt vời
                    </p>
                </div>

                <div className="testimonials-grid">
                    {testimonials.map((t) => (
                        <div key={t.id} className="testi-card">
                            <div className="testi-stars-row">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                                ))}
                            </div>

                            <p className="testi-comment-text">{t.comment}</p>

                            <div className="testi-author-info">
                                <div className="testi-avatar-circle">
                                    {t.name.charAt(0)}
                                </div>
                                <div className="testi-author-meta">
                                    <h5>{t.name}</h5>
                                    <span>{t.location} • {t.hotel}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================== */}
            {/* 8. KHỐI NEWSLETTER / ĐĂNG KÝ NHẬN ƯU ĐÃI   */}
            {/* ========================================== */}
            <section className="home-newsletter-section">
                <div className="newsletter-luxury-card">
                    <div className="newsletter-deco-circle"></div>

                    <div className="newsletter-content">
                        <div className="newsletter-badge">
                            <Sparkles size={13} /> THÀNH VIÊN ĐỘC QUYỀN
                        </div>
                        <h2 className="newsletter-title">
                            Tiết Kiệm Đến 20% Cho Chuyến Đi Kế Tiếp!
                        </h2>
                        <p className="newsletter-desc">
                            Đăng ký nhận bản tin StayHub để cập nhật sớm nhất các đợt Flash Sale bí mật, 
                            mã giảm giá định kỳ và cẩm nang du lịch độc quyền.
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="newsletter-form-row">
                            <input
                                type="email"
                                placeholder="Nhập địa chỉ email của bạn..."
                                className="newsletter-input"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="newsletter-btn">
                                Nhận ưu đãi
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}