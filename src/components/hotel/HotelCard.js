import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Check, Heart, Coffee, ShieldCheck } from 'lucide-react';
import { formatVnd } from '../../utils/booking';
import { resolveImageUrl } from '../../utils/imageUrl';
import './HotelCard.css';

export default function HotelCard({ hotel, isFavorite, onToggleFavorite, querySuffix }) {
    const navigate = useNavigate();

    // Card hiển thị thông tin khách sạn chi tiết và minh bạch ở trang danh sách
    const realPrice = hotel.min_price;
    const starCount = Number(hotel.star_rating) || 1;
    const ratingNum = Number(hotel.average_rating) || 0;
    const reviewCount = Number(hotel.review_count) || 0;

    const getRatingLabel = (score) => {
        if (score >= 4.5) return 'Xuất sắc';
        if (score >= 4.0) return 'Rất tốt';
        if (score >= 3.5) return 'Hài lòng';
        return 'Đánh giá tốt';
    };

    // Tự động lấy ảnh (ưu tiên ảnh đại diện is_primary = 1)
    const getHotelImage = (hotelData) => {
        if (hotelData.images && hotelData.images.length > 0) {
            const primaryImg = hotelData.images.find(img => img.is_primary === 1) || hotelData.images[0];
            const imgPath = primaryImg.file_url;
            return resolveImageUrl(imgPath);
        }
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
    };

    return (
        <div className="hotel-card-tvl">
            <div className="hc-col-img">
                <img src={getHotelImage(hotel)} alt={hotel.name} className="hc-img-main" />
                {reviewCount > 50 && (
                    <div className="hc-promo-badge">Đang bán chạy</div>
                )}

                <div
                    className="hc-fav-btn"
                    data-tooltip={isFavorite ? "Bỏ khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                    onClick={onToggleFavorite}
                >
                    <Heart
                        size={18}
                        color={isFavorite ? "#ef4444" : "#666"}
                        fill={isFavorite ? "#ef4444" : "transparent"}
                        style={{ pointerEvents: 'none', transition: 'all 0.3s' }}
                    />
                </div>
            </div>

            <div className="hc-col-info">
                <div>
                    <h3 className="hc-title" onClick={() => navigate(`/hotels/${hotel.id}${querySuffix}`)}>
                        {hotel.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <span className="hc-type-badge"><Check size={12} style={{ marginRight: '2px' }} /> Khách sạn</span>
                        <div style={{ display: 'flex', color: '#ca8a04' }}>
                            {[...Array(starCount)].map((_, i) => <Star key={i} size={12} fill="#ca8a04" />)}
                        </div>
                    </div>

                    <div className="hc-address">
                        <MapPin size={14} color="#666" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{hotel.address}, {hotel.city}</span>
                    </div>

                    {/* Huy hiệu chính sách nổi bật */}
                    <div className="d-flex flex-wrap gap-1 mb-2">
                        {hotel.has_breakfast && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '11px', padding: '4px 8px', fontWeight: '600' }}>
                                <Coffee size={12} /> Bữa sáng miễn phí
                            </span>
                        )}
                        {hotel.free_cancellation && (
                            <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle d-inline-flex align-items-center gap-1" style={{ fontSize: '11px', padding: '4px 8px', fontWeight: '600' }}>
                                <ShieldCheck size={12} /> Hủy miễn phí
                            </span>
                        )}
                    </div>

                    <div className="hc-amenity-tags">
                        {hotel.amenities && hotel.amenities.length > 0 ? (
                            hotel.amenities.slice(0, 4).map(amenity => (
                                <span key={amenity.id} className="hc-tag">{amenity.name}</span>
                            ))
                        ) : (
                            <span className="hc-tag" style={{ background: 'transparent', padding: 0 }}>Chưa cập nhật tiện ích</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="hc-col-price">
                {/* Khối hiển thị đánh giá */}
                <div className="d-flex justify-content-end align-items-center gap-2 mb-2 w-100">
                    {reviewCount > 0 ? (
                        <div className="text-end">
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', lineHeight: '1.2' }}>
                                {getRatingLabel(ratingNum)}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {reviewCount} đánh giá
                            </div>
                        </div>
                    ) : (
                        <div className="text-end">
                            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Chưa có đánh giá</div>
                        </div>
                    )}
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px 8px 8px 0',
                        backgroundColor: ratingNum >= 4.0 ? '#0284c7' : '#f59e0b',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {ratingNum > 0 ? ratingNum.toFixed(1) : '--'}
                    </div>
                </div>

                <div className="hc-price-wrap">
                    <div className="hc-price-label">Giá mỗi đêm từ</div>

                    <div className="hc-price-value">
                        {realPrice ? formatVnd(realPrice) : 'Hết phòng'}
                    </div>

                    {realPrice ? (
                        <div className="hc-price-sub">Chưa bao gồm thuế và phí</div>
                    ) : (
                        <div className="hc-price-sub text-danger">Tạm hết phòng ngày này</div>
                    )}

                    <Link to={`/hotels/${hotel.id}${querySuffix}`} className="hc-btn">
                        Chọn phòng
                    </Link>
                </div>
            </div>
        </div>
    );
}