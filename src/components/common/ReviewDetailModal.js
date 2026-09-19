import React from 'react';
import { Star, X, MessageCircle, Calendar, Building } from 'lucide-react';
import { getBackendHost } from '../../utils/imageUrl';

export default function ReviewDetailModal({ isOpen, review, order, onClose }) {
    // Modal xem chi tiết đánh giá và phản hồi từ khách sạn
    if (!isOpen || !review || !order) return null;

    const BACKEND_URL = getBackendHost();

    // Hàm format ngày giờ chuẩn VN (VD: 14:30 - 25/10/2026)
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString('vi-VN')}`;
    };

    // Lấy chữ cái đầu của tên để làm Avatar
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <div className="custom-modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
            <div className="custom-modal-content" style={{ maxWidth: '600px', backgroundColor: '#f8fafc' }} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div className="modal-header" style={{ backgroundColor: '#ffffff' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={24} color="#3b82f6" /> Chi tiết đánh giá
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '25px' }}>

                    {/* KHỐI 1: THÔNG TIN NGƯỜI ĐÁNH GIÁ & SỐ SAO */}
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            {/* User Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '45px', height: '45px', backgroundColor: '#e2e8f0', color: '#3b82f6',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '20px', fontWeight: 'bold'
                                }}>
                                    {getInitial(order.guest_name)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>{order.guest_name}</div>
                                    <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                        <Calendar size={13} /> {formatDateTime(review.created_at)}
                                    </div>
                                </div>
                            </div>

                            {/* Stars */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={18}
                                            fill={review.rating >= star ? '#fbbf24' : 'transparent'}
                                            color={review.rating >= star ? '#fbbf24' : '#cbd5e1'}
                                        />
                                    ))}
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#d97706', fontSize: '13px', marginTop: '4px' }}>
                                    {review.rating}/5 Điểm
                                </div>
                            </div>
                        </div>

                        {/* NỘI DUNG TEXT */}
                        {review.comment ? (
                            <div style={{ color: '#334155', fontSize: '15px', lineHeight: '1.6' }}>
                                {review.comment}
                            </div>
                        ) : (
                            <div style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
                                (Khách hàng không để lại nhận xét)
                            </div>
                        )}

                        {/* HÌNH ẢNH */}
                        {review.images && review.images.length > 0 && (
                            <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {review.images.map((img, index) => (
                                    <div key={index} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <img
                                            src={`${BACKEND_URL}${img.image_url}`}
                                            alt="review pic"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* KHỐI 2: PHẢN HỒI TỪ KHÁCH SẠN (Chỉ hiện nếu có) */}
                    {review.partner_reply && (
                        <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe', marginLeft: '20px', position: 'relative' }}>
                            {/* Mũi tên trỏ lên giả lập chat bubble */}
                            <div style={{ position: 'absolute', top: '-10px', left: '30px', width: '20px', height: '20px', backgroundColor: '#eff6ff', borderTop: '1px solid #bfdbfe', borderLeft: '1px solid #bfdbfe', transform: 'rotate(45deg)' }}></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <Building size={18} color="#1d4ed8" />
                                <strong style={{ color: '#1d4ed8', fontSize: '15px' }}>Phản hồi từ Khách sạn</strong>
                            </div>

                            <p style={{ margin: 0, color: '#1e3a8a', fontSize: '14px', lineHeight: '1.6' }}>
                                {review.partner_reply}
                            </p>

                            <div style={{ color: '#60a5fa', fontSize: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} /> Phản hồi lúc: {formatDateTime(review.replied_at)}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}