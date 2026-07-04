import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Check, Heart } from 'lucide-react';
import { formatVnd } from '../../utils/booking';

export default function HotelCard({ hotel, isFavorite, onToggleFavorite, querySuffix }) {
    const navigate = useNavigate();

    // Xử lý giá
    const realPrice = hotel.min_price;

    // Xử lý an toàn số sao (Tránh bug nếu Backend trả về chuỗi string thay vì số)
    const starCount = Number(hotel.star_rating) || 1;

    // Tự động lấy ảnh
    const getHotelImage = (hotelData) => {
        if (hotelData.images && hotelData.images.length > 0) {
            const lastIndex = hotelData.images.length - 1;
            const imgPath = hotelData.images[lastIndex].file_url;
            return `http://localhost:8000/api/get-image?path=${encodeURIComponent(imgPath)}`;
        }
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80';
    };

    return (
        <div className="hotel-card-tvl">
            <div className="hc-col-img">
                <img src={getHotelImage(hotel)} alt={hotel.name} className="hc-img-main" />
                <div className="hc-promo-badge">Đang bán chạy</div>

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

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="hc-type-badge"><Check size={12} style={{ marginRight: '2px' }} /> Khách sạn</span>
                        <div style={{ display: 'flex', color: '#ca8a04' }}>
                            {[...Array(starCount)].map((_, i) => <Star key={i} size={12} fill="#ca8a04" />)}
                        </div>
                    </div>

                    <div className="hc-address">
                        <MapPin size={14} color="#666" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{hotel.address}, {hotel.city}</span>
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
                <div className="hc-price-wrap">
                    <div className="hc-price-label">Giá mỗi đêm từ</div>

                    <div className="hc-price-value">
                        {realPrice ? formatVnd(realPrice) : 'Hết phòng'}
                    </div>

                    {realPrice && <div className="hc-price-sub">Chưa bao gồm thuế và phí</div>}

                    <Link to={`/hotels/${hotel.id}${querySuffix}`} className="hc-btn">
                        Chọn phòng
                    </Link>
                </div>
            </div>
        </div>
    );
}