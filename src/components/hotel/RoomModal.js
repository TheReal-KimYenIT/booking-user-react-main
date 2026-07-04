import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Info, Users, BedDouble, Wind, Bath, Tv, Coffee, CheckCircle2 } from 'lucide-react';

export default function RoomModal({ selectedRoom, closeModal, getImage, formatPrice, onSelectRoom }) {
    const [modalImageIdx, setModalImageIdx] = useState(0);

    if (!selectedRoom) return null;

    const nextImage = () => {
        if (!selectedRoom?.media) return;
        setModalImageIdx((prev) => (prev === selectedRoom.media.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        if (!selectedRoom?.media) return;
        setModalImageIdx((prev) => (prev === 0 ? selectedRoom.media.length - 1 : prev - 1));
    };

    const renderAmenityIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('lạnh')) return <Wind size={14} />;
        if (lowerName.includes('tắm')) return <Bath size={14} />;
        if (lowerName.includes('tv') || lowerName.includes('tivi')) return <Tv size={14} />;
        if (lowerName.includes('bar') || lowerName.includes('nước')) return <Coffee size={14} />;
        return <CheckCircle2 size={14} color="#16a34a" />;
    };

    return (
        <div className="rm-modal-overlay" onClick={closeModal}>
            <div className="rm-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="rm-modal-header">
                    <h3>{selectedRoom.name}</h3>
                    <button className="rm-close-btn" onClick={closeModal}><X size={24} /></button>
                </div>
                <div className="rm-modal-body">
                    {/* Cột trái: Slider Ảnh */}
                    <div className="rm-col-left">
                        <div className="rm-main-img-wrap">
                            {selectedRoom.media && selectedRoom.media.length > 1 && (
                                <button className="rm-nav-btn rm-nav-left" onClick={prevImage}><ChevronLeft size={24} /></button>
                            )}
                            <img
                                src={selectedRoom.media && selectedRoom.media.length > 0
                                    ? getImage(selectedRoom.media[modalImageIdx])
                                    : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'}
                                alt="Room Main"
                                className="rm-main-img"
                            />
                            {selectedRoom.media && selectedRoom.media.length > 1 && (
                                <button className="rm-nav-btn rm-nav-right" onClick={nextImage}><ChevronRight size={24} /></button>
                            )}
                            {selectedRoom.media && selectedRoom.media.length > 0 && (
                                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                                    {modalImageIdx + 1} / {selectedRoom.media.length}
                                </div>
                            )}
                        </div>
                        {selectedRoom.media && selectedRoom.media.length > 1 && (
                            <div className="rm-thumbnails">
                                {selectedRoom.media.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={getImage(img)}
                                        alt="thumb"
                                        className={`rm-thumb-img ${idx === modalImageIdx ? 'active' : ''}`}
                                        onClick={() => setModalImageIdx(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cột phải: Thông tin phòng */}
                    <div className="rm-col-right">
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Thông tin phòng</h4>

                            {/* 👇 ĐÃ SỬA: Render động Size, Bed Type và Trẻ em 👇 */}
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', color: '#555', fontSize: '14px' }}>
                                {selectedRoom.size && (
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <Info size={16} /> Diện tích: {selectedRoom.size} m²
                                    </li>
                                )}
                                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <Users size={16} /> Số khách: {selectedRoom.max_adults} Người lớn {selectedRoom.max_children > 0 ? `, ${selectedRoom.max_children} Trẻ em` : ''}
                                </li>
                                {selectedRoom.bed_type && (
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <BedDouble size={16} /> Loại giường: {selectedRoom.bed_type}
                                    </li>
                                )}
                            </ul>

                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#111' }}>Tiện nghi phòng</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#555', fontSize: '13px', marginBottom: '20px' }}>
                                {selectedRoom.amenities && selectedRoom.amenities.length > 0 ? (
                                    selectedRoom.amenities.map(amenity => (
                                        <div key={amenity.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {renderAmenityIcon(amenity.name)} {amenity.name}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#888', fontStyle: 'italic' }}>Chưa cập nhật tiện ích.</div>
                                )}
                            </div>

                            {/* 👇 ĐÃ SỬA: Không hiện chuỗi Text giả nữa 👇 */}
                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#111' }}>Mô tả</h4>
                            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                {selectedRoom.description || 'Chưa có thông tin mô tả chi tiết cho loại phòng này.'}
                            </p>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
                            <div style={{ fontSize: '12px', color: '#888' }}>Giá mỗi đêm từ:</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginBottom: '15px' }}>
                                {formatPrice(selectedRoom.base_price)}
                            </div>
                            <button
                                onClick={onSelectRoom}
                                style={{ background: '#dfa974', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '16px' }}
                            >
                                Tiến hành Đặt phòng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}