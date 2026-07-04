import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Ticket, Clock, Building2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function PromotionsPage() {
    const [globalPromos, setGlobalPromos] = useState([]);
    const [hotelPromos, setHotelPromos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await axiosClient.get('/promotions/active');
            if (response.data && response.data.data) {
                setGlobalPromos(response.data.data.global || []);
                setHotelPromos(response.data.data.hotels || []);
            }
        } catch (error) {
            console.error('Lỗi tải khuyến mãi:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 3000); // Tắt chữ "Đã copy" sau 3s
    };

    // Component vẽ Tấm vé Voucher
    const PromoTicket = ({ promo, type }) => {
        const isGlobal = type === 'global';
        const bgColor = isGlobal ? '#0ea5e9' : '#f59e0b'; // Xanh cho sàn, Vàng cho KS

        return (
            <div className="col-lg-6 mb-4">
                <div style={{ display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'relative' }}>

                    {/* Cột trái: Hiển thị mức giảm */}
                    <div style={{ width: '30%', background: bgColor, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', borderRight: '2px dashed #fff', position: 'relative' }}>
                        {/* Hình bán nguyệt tạo hiệu ứng xé vé */}
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', background: '#f8fafc', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '20px', height: '20px', background: '#f8fafc', borderRadius: '50%' }}></div>

                        <Ticket size={32} style={{ marginBottom: '10px' }} />
                        <h3 style={{ fontWeight: 'bold', margin: 0, textAlign: 'center', fontSize: '1.5rem' }}>
                            {promo.discount_type === 1 ? `${promo.discount_value}%` : `${new Intl.NumberFormat('vi-VN').format(promo.discount_value)}đ`}
                        </h3>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', marginTop: '5px', textAlign: 'center' }}>Giảm giá</span>
                    </div>

                    {/* Cột phải: Thông tin & Nút Copy */}
                    <div style={{ width: '70%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h5 style={{ fontWeight: 'bold', color: '#1e293b', margin: '0 0 10px 0' }}>
                                    {isGlobal ? 'Mã ưu đãi toàn sàn' : `Độc quyền từ ${promo.hotel?.name || 'Khách sạn'}`}
                                </h5>
                                <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', letterSpacing: '1px' }}>
                                    {promo.code}
                                </span>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#64748b' }}>
                                <li style={{ marginBottom: '5px' }}>• Đơn tối thiểu: <strong style={{ color: '#0f172a' }}>{new Intl.NumberFormat('vi-VN').format(promo.min_booking_value)}đ</strong></li>
                                {promo.discount_type === 1 && promo.max_discount_amount && (
                                    <li style={{ marginBottom: '5px' }}>• Giảm tối đa: <strong style={{ color: '#0f172a' }}>{new Intl.NumberFormat('vi-VN').format(promo.max_discount_amount)}đ</strong></li>
                                )}
                                <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock size={14} /> HSD: {new Date(promo.end_date).toLocaleDateString('vi-VN')}
                                </li>
                            </ul>
                        </div>

                        <div style={{ marginTop: '15px', textAlign: 'right' }}>
                            <button
                                onClick={() => handleCopy(promo.code)}
                                style={{ background: copiedCode === promo.code ? '#10b981' : bgColor, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', transition: '0.3s', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            >
                                {copiedCode === promo.code ? <><CheckCircle size={16} /> Đã sao chép</> : <><Copy size={16} /> Lưu mã</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '60px 0' }}>
            {/* HERO BANNER */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', padding: '60px 0', marginTop: '-60px', marginBottom: '50px', textAlign: 'center', color: '#fff' }}>
                <h1 style={{ fontWeight: 'bold', fontSize: '2.5rem', marginBottom: '15px' }}>Siêu Ưu Đãi Độc Quyền</h1>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Săn ngay mã giảm giá để chuyến đi của bạn thêm phần trọn vẹn và tiết kiệm.</p>
            </div>

            <div className="container">
                {isLoading ? (
                    <div className="text-center" style={{ padding: '50px 0' }}>Đang tải khuyến mãi...</div>
                ) : (
                    <>
                        {/* DANH MỤC MÃ TOÀN SÀN */}
                        {globalPromos.length > 0 && (
                            <div className="mb-5">
                                <h3 style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Ticket color="#0ea5e9" /> Ưu đãi từ Hiroto
                                </h3>
                                <div className="row">
                                    {globalPromos.map(promo => <PromoTicket key={promo.id} promo={promo} type="global" />)}
                                </div>
                            </div>
                        )}

                        {/* DANH MỤC MÃ KHÁCH SÀN */}
                        {hotelPromos.length > 0 && (
                            <div className="mb-5">
                                <h3 style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Building2 color="#f59e0b" /> Ưu đãi từ Khách sạn Đối tác
                                </h3>
                                <div className="row">
                                    {hotelPromos.map(promo => <PromoTicket key={promo.id} promo={promo} type="hotel" />)}
                                </div>
                            </div>
                        )}

                        {globalPromos.length === 0 && hotelPromos.length === 0 && (
                            <div className="text-center" style={{ padding: '50px 0', color: '#64748b' }}>
                                <h4>Hiện tại chưa có chương trình khuyến mãi nào.</h4>
                                <p>Vui lòng quay lại sau nhé!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}