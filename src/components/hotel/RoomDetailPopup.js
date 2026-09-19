import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, Info, BedDouble, X, Ban, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

import { resolveImageUrl } from '../../utils/imageUrl';
import RoomAmenities from '../../components/hotel/RoomAmenities';
import './RoomDetailPopup.css';

export default function RoomDetailPopup({ isOpen, room, hotel, checkIn, checkOut, adults, children, selectedRoomCount, onClose }) {
    // Popup mở chi tiết hạng phòng khi người dùng bấm xem trước
    const navigate = useNavigate();

    const hotelImages = room?.media || [];
    const [currentImage, setCurrentImage] = useState(hotelImages.slice(-1)[0]?.file_url || '');

    if (!isOpen) return null;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getImage = (imgPath, fallbackUrl = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=80') => {
        if (imgPath) return resolveImageUrl(imgPath);
        return fallbackUrl;
    };

    const getCancelPolicyText = (free, partial, percent) => {
        const f = free != null ? free : 48;
        const p = partial != null ? partial : 24;
        const pct = percent != null ? percent : 50;

        if (f === 0) return "Không hoàn tiền khi hủy phòng.";

        let text = `Miễn phí hủy trước ${f} tiếng.`;
        if (p > 0 && pct > 0) {
            text += ` Hoàn lại ${pct}% nếu hủy trước ${p} tiếng.`;
        }
        return text;
    };

    const handleBookNow = () => {
        if (!hotel || !checkIn) {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu thông tin',
                text: 'Hệ thống đang tải dữ liệu đặt phòng, vui lòng thử lại sau giây lát!'
            });
            return;
        }

        if (hotel?.is_blocked) {
            Swal.fire({
                icon: 'error',
                title: 'Từ Chối Dịch Vụ',
                text: `Rất tiếc, bạn không thể đặt phòng tại khách sạn này do vi phạm quy định trước đó (Lý do: ${hotel.block_reason || 'Không rõ'}). Vui lòng liên hệ trực tiếp khách sạn để biết thêm chi tiết.`,
                confirmButtonText: 'Đã hiểu'
            });
            return;
        }

        const count = selectedRoomCount || 1;
        const bookingUrl = `/checkout?room_id=${room.id}&hotel_id=${hotel.id}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${count}&adults=${adults}&children=${children}`;
        navigate(bookingUrl);
    };

    return (
        <div className="custom-modal-overlay" onClick={onClose} style={{ zIndex: 100000 }}>
            <div className="custom-modal-content" style={{ maxWidth: '1100px', backgroundColor: '#f8fafc', height: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

                <div className="modal-header" style={{ backgroundColor: '#ffffff', padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>{room.name}</h3>
                    <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                    <div className="room-popup-grid">

                        {/* BÊN TRÁI: HÌNH ẢNH */}
                        <div className="room-popup-image-container">
                            <img src={getImage(currentImage)} alt="main pic" className="main-room-image" />
                            {hotelImages.length > 0 && (
                                <div className="thumbnail-images">
                                    {hotelImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getImage(img.file_url)}
                                            alt="thumbnail pic"
                                            onClick={() => setCurrentImage(img.file_url)}
                                            className={currentImage === img.file_url ? 'active' : ''}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BÊN PHẢI: THÔNG TIN */}
                        <div className="room-popup-info-container">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{room.name}</h2>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>Một lựa chọn hoàn hảo từ <strong>{hotel?.name || 'StayHub Partners'}</strong></div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#b45309', background: '#fef3c7', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    {formatPrice(room.base_price)} / đêm
                                </div>
                            </div>

                            <div className="row mb-4" style={{ gap: '20px' }}>
                                <div className="col info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="icon" style={{ flexShrink: 0 }}><Info size={20} /></div>
                                    <span style={{ whiteSpace: 'nowrap' }}>Diện tích: <strong>{room.room_size ? `${room.room_size} m²` : 'Đang cập nhật'}</strong></span>
                                </div>
                                <div className="col info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="icon" style={{ flexShrink: 0 }}><Users size={20} /></div>
                                    <span style={{ whiteSpace: 'nowrap' }}>Sức chứa: <strong>{room.max_adults} Người lớn {room.max_children > 0 ? `, ${room.max_children} Trẻ em` : ''}</strong></span>
                                </div>
                                <div className="col info-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="icon" style={{ flexShrink: 0 }}><BedDouble size={20} /></div>
                                    <span style={{ whiteSpace: 'nowrap' }}>Giường: <strong>{room.bed_type_detail?.name || room.bed_type || 'Đang cập nhật'}</strong></span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                                {room.has_breakfast ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#15803d', background: '#dcfce7', padding: '6px 12px', borderRadius: '20px', fontWeight: '500' }}>
                                        <CheckCircle2 size={16} /> Bao gồm bữa sáng
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ef4444', background: '#fee2e2', padding: '6px 12px', borderRadius: '20px', fontWeight: '500' }}>
                                        <Ban size={16} /> Không gồm bữa sáng
                                    </span>
                                )}

                                {room.smoking_policy ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#15803d', background: '#dcfce7', padding: '6px 12px', borderRadius: '20px', fontWeight: '500' }}>
                                        <CheckCircle2 size={16} /> Cho phép hút thuốc
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ef4444', background: '#fee2e2', padding: '6px 12px', borderRadius: '20px', fontWeight: '500' }}>
                                        <Ban size={16} /> Cấm hút thuốc
                                    </span>
                                )}

                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0369a1', background: '#e0f2fe', padding: '6px 12px', borderRadius: '20px', fontWeight: '500' }}>
                                    <ShieldCheck size={16} /> {getCancelPolicyText(room.free_cancel_hours, room.partial_refund_hours, room.partial_refund_percent)}
                                </span>
                            </div>

                            <div className="mb-4">
                                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>Mô tả hạng phòng:</h4>
                                <p className="room-description">
                                    {room.description || 'Chưa có thông tin mô tả chi tiết cho hạng phòng này.'}
                                </p>
                            </div>

                            <div className="mb-5">
                                <RoomAmenities amenities={room.amenities} />
                            </div>

                            {/* Nút đặt phòng */}
                            <div style={{ textAlign: 'right', marginTop: 'auto' }}>
                                {room.available_rooms !== undefined && (
                                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
                                        Chỉ còn {room.available_rooms} phòng (Bạn đang chọn {selectedRoomCount || 1} phòng)
                                    </div>
                                )}

                                <button
                                    onClick={handleBookNow}
                                    style={{
                                        background: '#0ea5e9', color: '#fff', border: 'none',
                                        padding: '15px 30px', borderRadius: '6px', fontWeight: 'bold',
                                        cursor: 'pointer', transition: 'background 0.2s',
                                        fontSize: '18px', width: '100%'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                                >
                                    ĐẶT NGAY ({formatPrice(room.base_price * (selectedRoomCount || 1))})
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}