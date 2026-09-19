import React, { useState, useEffect } from 'react';
import { Star, X, ImagePlus, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';


export default function ReviewModal({ isOpen, onClose, bookingId, hotelId, customerId, onSuccess }) {
    // Form gửi đánh giá sau khi khách đã trả phòng
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);

        if (validFiles.length !== files.length) {
            setError('Một số ảnh vượt quá dung lượng 5MB đã bị loại bỏ.');
        }

        const newPreviews = validFiles.map(file => URL.createObjectURL(file));

        setImages(prev => [...prev, ...validFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[indexToRemove]);
            return prev.filter((_, index) => index !== indexToRemove);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('booking_id', bookingId);
            formData.append('hotel_id', hotelId);
            formData.append('customer_id', customerId);
            formData.append('rating', rating);
            formData.append('comment', comment);

            images.forEach((image) => {
                formData.append('images[]', image);
            });

            const response = await axiosClient.post('/customer/reviews', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'success') {
                onSuccess(response.data.message);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className="custom-modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>

                {/* Phần Header giống y hệt Modal Chi tiết */}
                <div className="modal-header">
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Đánh giá kỳ nghỉ của bạn</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Phần Body chứa Form */}
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {/* Khu vực 1: Đánh giá bằng Sao */}
                        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                            <p style={{ color: '#475569', marginBottom: '10px', fontSize: '15px' }}>Bạn cảm thấy thế nào về khách sạn này?</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={40}
                                        style={{ cursor: 'pointer', transition: 'all 0.2s transform' }}
                                        fill={(hoverRating || rating) >= star ? '#fbbf24' : 'transparent'}
                                        color={(hoverRating || rating) >= star ? '#fbbf24' : '#cbd5e1'}
                                        onMouseEnter={(e) => {
                                            setHoverRating(star);
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            setHoverRating(0);
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                            <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#d97706', fontSize: '16px' }}>
                                {rating === 1 && 'Rất tệ 😞'}
                                {rating === 2 && 'Tệ 😕'}
                                {rating === 3 && 'Bình thường 😐'}
                                {rating === 4 && 'Tốt 🙂'}
                                {rating === 5 && 'Tuyệt vời! 😍'}
                            </div>
                        </div>

                        {/* Khu vực 2: Khung nhập Text */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Chia sẻ trải nghiệm của bạn</label>
                            <textarea
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '8px',
                                    border: '1px solid #cbd5e1', backgroundColor: '#f8fafc',
                                    resize: 'none', outline: 'none', color: '#1e293b'
                                }}
                                rows="4"
                                placeholder="Khách sạn sạch sẽ, nhân viên thân thiện..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            ></textarea>
                        </div>

                        {/* Khu vực 3: Tải Ảnh lên */}
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Thêm ảnh thực tế (Tùy chọn)</label>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {previews.map((preview, index) => (
                                    <div key={index} style={{ position: 'relative', width: '85px', height: '85px' }}>
                                        <img src={preview} alt="preview" style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            style={{
                                                position: 'absolute', top: '-5px', right: '-5px',
                                                backgroundColor: '#ef4444', color: 'white', border: 'none',
                                                borderRadius: '50%', width: '22px', height: '22px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                <label
                                    style={{
                                        width: '85px', height: '85px', cursor: 'pointer',
                                        border: '2px dashed #3b82f6', borderRadius: '8px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        justifyContent: 'center', backgroundColor: '#eff6ff', color: '#3b82f6',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                >
                                    <ImagePlus size={28} style={{ marginBottom: '4px' }} />
                                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Thêm ảnh</span>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <small style={{ color: '#64748b', fontSize: '12px', display: 'block', marginTop: '8px' }}>Có thể chọn nhiều ảnh. Tối đa 5MB/ảnh.</small>
                        </div>

                        {error && (
                            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 15px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
                                {error}
                            </div>
                        )}

                        {/* Nút Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%', padding: '14px', backgroundColor: '#fbbf24',
                                color: '#1e293b', border: 'none', borderRadius: '8px',
                                fontSize: '16px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(251, 191, 36, 0.3)'
                            }}
                            onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#f59e0b'; }}
                            onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = '#fbbf24'; }}
                        >
                            {isSubmitting ? (
                                <><Loader2 size={20} className="spinner-border spinner-border-sm" style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} /> Đang gửi đánh giá...</>
                            ) : (
                                'Gửi đánh giá'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Style inline cho animation spin của Loader */}
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}