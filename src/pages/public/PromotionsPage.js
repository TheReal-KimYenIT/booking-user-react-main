import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Copy, CheckCircle, Ticket, Clock, Building2, Flame, ChevronLeft, ChevronRight, Search, X, Sparkles, RotateCcw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import bannerPromoVideo from './video/bannerPromotion.mp4';

export default function PromotionsPage() {
    // Trang hiển thị các mã khuyến mãi đang hoạt động
    const [globalPromos, setGlobalPromos] = useState([]);
    const [hotelPromos, setHotelPromos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);

    // State cho tìm kiếm & bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'global' | 'hotel'
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Chuẩn hóa chuỗi tiếng Việt để tìm kiếm không dấu & không phân biệt hoa thường
    const removeVietnameseTones = (str) => {
        if (!str) return '';
        let s = str.toLowerCase();
        s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        s = s.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        s = s.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        s = s.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        s = s.replace(/đ/g, 'd');
        s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return s.trim();
    };

    // Lọc mã toàn sàn StayHub (theo mã hoặc từ khóa toàn sàn)
    const filteredGlobalPromos = useMemo(() => {
        if (activeTab === 'hotel') return [];
        const normalizedKeyword = removeVietnameseTones(searchTerm);
        if (!normalizedKeyword) return globalPromos;

        return globalPromos.filter(promo => {
            const codeMatch = removeVietnameseTones(promo.code || '').includes(normalizedKeyword);
            const globalKeywords = ['toan san', 'stayhub', 'he thong', 'all', 'tong'];
            const generalMatch = globalKeywords.some(kw => kw.includes(normalizedKeyword) || normalizedKeyword.includes(kw));
            return codeMatch || generalMatch;
        });
    }, [globalPromos, searchTerm, activeTab]);

    // Lọc mã khách sạn đối tác theo mã khuyến mãi HOẶC tên khách sạn
    const filteredHotelPromos = useMemo(() => {
        if (activeTab === 'global') return [];
        const normalizedKeyword = removeVietnameseTones(searchTerm);
        if (!normalizedKeyword) return hotelPromos;

        return hotelPromos.filter(promo => {
            const codeMatch = removeVietnameseTones(promo.code || '').includes(normalizedKeyword);
            const hotelNameMatch = removeVietnameseTones(promo.hotel?.name || '').includes(normalizedKeyword);
            const hotelAddressMatch = removeVietnameseTones(promo.hotel?.address || '').includes(normalizedKeyword);
            return codeMatch || hotelNameMatch || hotelAddressMatch;
        });
    }, [hotelPromos, searchTerm, activeTab]);

    // Gộp nhóm mã khuyến mãi KS theo từng khách sạn sau khi lọc
    const groupedHotelPromos = useMemo(() => {
        return filteredHotelPromos.reduce((acc, promo) => {
            const hotelId = promo.hotel_id || 'other';
            if (!acc[hotelId]) {
                acc[hotelId] = {
                    hotelName: promo.hotel?.name || 'Khách sạn đối tác',
                    promos: []
                };
            }
            acc[hotelId].promos.push(promo);
            return acc;
        }, {});
    }, [filteredHotelPromos]);

    const totalMatches = filteredGlobalPromos.length + filteredHotelPromos.length;
    const totalAll = globalPromos.length + hotelPromos.length;


    // State và Ref cho Toast đồng bộ
    const [toastMessage, setToastMessage] = useState('');
    const toastTimeoutRef = useRef(null);

    const showToast = (message) => {
        setToastMessage(message);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
    };

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
        showToast('🎉 Đã sao chép mã khuyến mãi vào khay nhớ tạm!');
        setTimeout(() => setCopiedCode(null), 3000);
    };

    const PromoTicket = ({ promo, type, isHorizontal = false }) => {
        const isGlobal = type === 'global';
        const bgGradient = isGlobal ? 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)' : 'linear-gradient(90deg, #f43f5e 0%, #f59e0b 100%)'; 
        const textColor = isGlobal ? '#0ea5e9' : '#f43f5e';
        
        // Định dạng số tiền giảm cho ngắn gọn (vd: 300.000đ -> 300K)
        const formatShortDiscount = (val) => {
            if (val >= 1000) return `${val / 1000}K`;
            return `${val}đ`;
        };

        return (
            <div className={isHorizontal ? "w-100" : "col-lg-6 mb-4"}>
                <div 
                    className="promo-card"
                    style={{ 
                        display: 'flex', 
                        background: '#fff', 
                        borderRadius: '16px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
                        position: 'relative', 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                        border: '1px solid #f1f5f9',
                        padding: '24px',
                        alignItems: 'center',
                        gap: '20px'
                    }}
                    onMouseEnter={(e) => { 
                        e.currentTarget.style.transform = 'translateY(-5px)'; 
                        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)'; 
                        e.currentTarget.style.borderColor = textColor;
                    }}
                    onMouseLeave={(e) => { 
                        e.currentTarget.style.transform = 'translateY(0)'; 
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'; 
                        e.currentTarget.style.borderColor = '#f1f5f9';
                    }}
                >
                    {/* Cột trái: Icon và Mức giảm (Đậm đà, nổi bật với Gradient) */}
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: bgGradient, 
                        color: '#fff', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        flexShrink: 0,
                        boxShadow: isGlobal ? '0 4px 15px rgba(14, 165, 233, 0.4)' : '0 4px 15px rgba(244, 63, 94, 0.4)'
                    }}>
                        <Ticket size={22} style={{ marginBottom: '4px' }} />
                        <span style={{ fontWeight: '800', fontSize: '1.2rem', lineHeight: '1', color: '#fff' }}>
                            {promo.discount_type === 1 ? `${promo.discount_value}%` : formatShortDiscount(promo.discount_value)}
                        </span>
                    </div>

                    {/* Cột giữa: Thông tin */}
                    <div style={{ flex: 1 }}>
                        <h5 style={{ fontWeight: 'bold', color: '#1c2930', margin: '0 0 8px 0', fontSize: '1.1rem', lineHeight: '1.4' }}>
                            {isGlobal ? 'Mã ưu đãi toàn hệ thống' : `Từ ${promo.hotel?.name || 'Khách sạn'}`}
                        </h5>
                        
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                            <li style={{ marginBottom: '4px' }}>Đơn tối thiểu: <strong style={{ color: '#334155' }}>{new Intl.NumberFormat('vi-VN').format(promo.min_booking_value)}đ</strong></li>
                            {promo.discount_type === 1 && promo.max_discount_amount && (
                                <li style={{ marginBottom: '4px' }}>Giảm tối đa: <strong style={{ color: '#e11d48' }}>{new Intl.NumberFormat('vi-VN').format(promo.max_discount_amount)}đ</strong></li>
                            )}
                            <li style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', marginTop: '8px' }}>
                                <Clock size={13} /> HSD: {new Date(promo.end_date).toLocaleDateString('vi-VN')}
                            </li>
                        </ul>
                    </div>

                    {/* Cột phải: Mã & Copy */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                        <span style={{ 
                            background: '#f8fafc', 
                            border: `1px dashed ${textColor}`, 
                            padding: '6px 14px', 
                            borderRadius: '8px', 
                            fontSize: '13px', 
                            fontWeight: '800', 
                            color: textColor, 
                            letterSpacing: '1px' 
                        }}>
                            {promo.code}
                        </span>
                        <button
                            onClick={() => handleCopy(promo.code)}
                            style={{ 
                                background: copiedCode === promo.code ? '#10b981' : bgGradient, 
                                color: '#fff', 
                                border: 'none', 
                                padding: '8px 18px', 
                                borderRadius: '50px', 
                                fontSize: '13px', 
                                fontWeight: '600', 
                                transition: 'all 0.3s ease', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                cursor: 'pointer',
                                boxShadow: copiedCode === promo.code ? '0 4px 10px rgba(16, 185, 129, 0.4)' : (isGlobal ? '0 4px 10px rgba(14, 165, 233, 0.4)' : '0 4px 10px rgba(244, 63, 94, 0.4)')
                            }}
                        >
                            {copiedCode === promo.code ? <><CheckCircle size={15} /> Đã lưu</> : <><Copy size={15} /> Sao chép</>}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Component Quản lý Slider cho Khách sạn
    const PromoSlider = ({ group }) => {
        const scrollRef = useRef(null);

        const scroll = (direction) => {
            if (scrollRef.current) {
                const scrollAmount = 420; // width of card + gap
                scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
            }
        };

        return (
            <div className="hotel-promo-group" style={{ marginBottom: '40px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, fontWeight: '800', color: '#1c2930', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '5px', height: '22px', background: 'linear-gradient(90deg, #f43f5e 0%, #f59e0b 100%)', borderRadius: '4px' }}></span>
                        {group.hotelName}
                    </h4>
                    <span style={{ fontSize: '13px', background: 'linear-gradient(90deg, #f43f5e 0%, #f59e0b 100%)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(244, 63, 94, 0.4)' }}>
                        {group.promos.length} ưu đãi
                    </span>
                </div>
                
                {/* Nút cuộn Trái/Phải */}
                {group.promos.length > 2 && (
                    <>
                        <button onClick={() => scroll('left')} className="scroll-button" style={{ left: '-22px' }}>
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={() => scroll('right')} className="scroll-button" style={{ right: '-22px' }}>
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Horizontal Scroll Container */}
                <div 
                    ref={scrollRef}
                    className="horizontal-promo-scroll"
                    style={{ 
                        display: 'flex', 
                        overflowX: 'auto', 
                        gap: '20px', 
                        paddingBottom: '20px', 
                        paddingTop: '5px',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollBehavior: 'smooth'
                    }}
                >
                    {group.promos.map(promo => (
                        <div key={promo.id} style={{ minWidth: '400px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                            <PromoTicket promo={promo} type="hotel" isHorizontal={true} />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', position: 'relative' }}>
            {/* CSS TỰ PHỤC VỤ CHO BANNER BÙNG NỔ & TOAST */}
            <style>{`
                @keyframes pulse-flame {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(225, 29, 72, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
                }
                .badge-promo-flame {
                    animation: pulse-flame 2s infinite;
                    background: linear-gradient(90deg, #e11d48 0%, #f59e0b 100%);
                    color: white;
                    font-weight: 800;
                    padding: 8px 20px;
                    border-radius: 50px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 13px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 15px rgba(225, 29, 72, 0.4);
                }
                .promo-video-banner {
                    position: relative;
                    height: 48vh;
                    min-height: 400px;
                    max-height: 520px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background-color: #0f172a;
                    border-bottom-left-radius: 30px;
                    border-bottom-right-radius: 30px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
                    margin-bottom: 60px;
                }
                .promo-video-banner video {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    min-width: 100%;
                    min-height: 100%;
                    width: auto;
                    height: auto;
                    transform: translateX(-50%) translateY(-50%);
                    z-index: 1;
                    object-fit: cover;
                }
                /* Lớp phủ gradient đỏ cam tạo cảm giác Flash Sale bùng nổ nhưng vẫn sang trọng */
                .promo-video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(185, 28, 28, 0.55) 50%, rgba(217, 119, 6, 0.45) 100%);
                    z-index: 2;
                }
                .promo-content {
                    position: relative;
                    z-index: 3;
                    text-align: center;
                    color: white;
                    padding: 0 20px;
                    max-width: 800px;
                }
                .toast-popup {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: #0f172a;
                    color: #fff;
                    padding: 14px 24px;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                    z-index: 9999;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-left: 4px solid #10b981;
                    animation: slideInUp 0.3s ease;
                }
                @keyframes slideInUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .horizontal-promo-scroll::-webkit-scrollbar {
                    display: none;
                }
                .horizontal-promo-scroll {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                .scroll-button {
                    position: absolute;
                    top: 55%;
                    transform: translateY(-50%);
                    z-index: 10;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    cursor: pointer;
                    color: #1c2930;
                    transition: all 0.3s;
                }
                .scroll-button:hover {
                    background: #f8fafc;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                    color: #f43f5e;
                }
                .promo-search-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 24px 28px;
                    box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8);
                    margin-top: -50px;
                    margin-bottom: 40px;
                    position: relative;
                    z-index: 10;
                    transition: all 0.3s ease;
                }
                .search-tab-btn {
                    padding: 8px 18px;
                    border-radius: 12px;
                    border: none;
                    font-size: 13.5px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                @media (max-width: 768px) {
                    .promo-search-card {
                        padding: 18px 16px !important;
                        margin-top: -30px !important;
                    }
                    .search-tabs-wrapper {
                        width: 100%;
                        overflow-x: auto;
                        padding-bottom: 6px;
                    }
                }
            `}</style>

            {/* 2. KHỐI HERO BANNER CÓ VIDEO NỀN - THIẾT KẾ BÙNG NỔ */}
            <div className="promo-video-banner">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    src={bannerPromoVideo}
                ></video>
                <div className="promo-video-overlay"></div>
                <div className="promo-content">
                    <div className="badge-promo-flame">
                        <Flame size={18} fill="#fff" /> Siêu Tiệc Khuyến Mãi - Độc Quyền StayHub
                    </div>
                    <h1 style={{ fontWeight: '900', fontSize: '3.2rem', marginBottom: '15px', letterSpacing: '1px', textShadow: '0 4px 15px rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
                        Bùng Nổ Ưu Đãi
                    </h1>
                    <p style={{ fontSize: '1.15rem', opacity: '0.95', lineHeight: '1.6', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                        Săn ngay mã giảm giá cực sốc cho chuyến nghỉ dưỡng trong mơ. Số lượng mã có hạn, sao chép và áp dụng ngay tại bước thanh toán!
                    </p>
                </div>
            </div>

            <div className="container">
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div className="spinner-border" style={{ color: '#dfa974' }} role="status"></div>
                        <p style={{ marginTop: '15px', color: '#666' }}>Đang săn tìm các mã ưu đãi hot nhất...</p>
                    </div>
                ) : (
                    <>
                        {/* THANH TÌM KIẾM THEO MÃ KHUYẾN MÃI HOẶC TÊN KHÁCH SẠN */}
                        <div className="promo-search-card">
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <Sparkles size={20} color="#f59e0b" />
                                        <h4 style={{ margin: 0, fontWeight: '800', color: '#0f172a', fontSize: '1.25rem' }}>
                                            Tìm kiếm mã khuyến mãi
                                        </h4>
                                    </div>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>
                                        Nhập mã ưu đãi hoặc tên khách sạn để tìm voucher giảm giá phù hợp
                                    </p>
                                </div>

                                {/* Tabs phân loại nhanh */}
                                <div className="search-tabs-wrapper" style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('all')}
                                        className="search-tab-btn"
                                        style={{
                                            fontWeight: activeTab === 'all' ? '700' : '600',
                                            background: activeTab === 'all' ? '#0f172a' : 'transparent',
                                            color: activeTab === 'all' ? '#ffffff' : '#64748b',
                                            boxShadow: activeTab === 'all' ? '0 2px 8px rgba(15, 23, 42, 0.2)' : 'none'
                                        }}
                                    >
                                        Tất cả ({totalAll})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('global')}
                                        className="search-tab-btn"
                                        style={{
                                            fontWeight: activeTab === 'global' ? '700' : '600',
                                            background: activeTab === 'global' ? '#0284c7' : 'transparent',
                                            color: activeTab === 'global' ? '#ffffff' : '#64748b',
                                            boxShadow: activeTab === 'global' ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
                                        }}
                                    >
                                        <Ticket size={14} /> Toàn sàn ({globalPromos.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('hotel')}
                                        className="search-tab-btn"
                                        style={{
                                            fontWeight: activeTab === 'hotel' ? '700' : '600',
                                            background: activeTab === 'hotel' ? '#f43f5e' : 'transparent',
                                            color: activeTab === 'hotel' ? '#ffffff' : '#64748b',
                                            boxShadow: activeTab === 'hotel' ? '0 2px 8px rgba(244, 63, 94, 0.25)' : 'none'
                                        }}
                                    >
                                        <Building2 size={14} /> Khách sạn ({hotelPromos.length})
                                    </button>
                                </div>
                            </div>

                            {/* Ô nhập tìm kiếm */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: '#f8fafc',
                                    border: isSearchFocused ? '2px solid #0ea5e9' : '2px solid #e2e8f0',
                                    borderRadius: '16px',
                                    padding: '4px 10px 4px 18px',
                                    transition: 'all 0.25s ease',
                                    boxShadow: isSearchFocused ? '0 0 0 4px rgba(14, 165, 233, 0.12)' : 'none'
                                }}>
                                    <Search size={22} color={isSearchFocused ? '#0ea5e9' : '#94a3b8'} style={{ flexShrink: 0, marginRight: '12px' }} />
                                    <input 
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setIsSearchFocused(false)}
                                        placeholder="Tìm theo mã (vd: STAYBOOK2026, WELCOME) hoặc tên khách sạn (vd: Ocean View, Vũng Tàu...)"
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            background: 'transparent',
                                            width: '100%',
                                            padding: '12px 0',
                                            fontSize: '15px',
                                            color: '#0f172a',
                                            fontWeight: '500'
                                        }}
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchTerm('')}
                                            title="Xóa nội dung"
                                            style={{
                                                background: '#e2e8f0',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '30px',
                                                height: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: '#64748b',
                                                marginRight: '6px',
                                                transition: 'all 0.2s',
                                                flexShrink: 0
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                                        >
                                            <X size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Trạng thái kết quả lọc & tìm kiếm */}
                            {(searchTerm || activeTab !== 'all') && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '16px',
                                    paddingTop: '14px',
                                    borderTop: '1px dashed #e2e8f0',
                                    fontSize: '14px',
                                    color: '#475569'
                                }}>
                                    <div>
                                        {searchTerm ? (
                                            <>
                                                Kết quả tìm kiếm cho: <strong style={{ color: '#0f172a' }}>"{searchTerm}"</strong>
                                                {' · '}Tìm thấy <strong style={{ color: totalMatches > 0 ? '#0ea5e9' : '#f43f5e' }}>{totalMatches}</strong> ưu đãi
                                            </>
                                        ) : (
                                            <>
                                                Đang hiển thị: <strong style={{ color: '#0f172a' }}>{activeTab === 'global' ? 'Ưu đãi Toàn Sàn' : 'Ưu đãi Khách Sạn Đối Tác'}</strong>
                                                {' · '}Có <strong style={{ color: '#0ea5e9' }}>{totalMatches}</strong> ưu đãi
                                            </>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#f43f5e',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        <RotateCcw size={14} /> Đặt lại bộ lọc
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* HIỂN THỊ KHI TÌM KIẾM HOẶC LỌC KHÔNG CÓ KẾT QUẢ */}
                        {(searchTerm || activeTab !== 'all') && totalMatches === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                background: '#ffffff',
                                borderRadius: '20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                border: '1px solid #f1f5f9',
                                marginBottom: '40px'
                            }}>
                                <div style={{
                                    width: '68px',
                                    height: '68px',
                                    borderRadius: '50%',
                                    background: '#fef2f2',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <Search size={30} />
                                </div>
                                <h4 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                                    Không tìm thấy mã ưu đãi phù hợp
                                </h4>
                                <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 20px', fontSize: '14px', lineHeight: '1.6' }}>
                                    {searchTerm 
                                        ? `Không có mã giảm giá hoặc khách sạn nào khớp với từ khóa "${searchTerm}". Vui lòng thử tìm kiếm mã khác (vd: STAYBOOK2026, WELCOME) hoặc tên khách sạn.`
                                        : 'Không có mã ưu đãi trong danh mục đã chọn.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setSearchTerm(''); setActiveTab('all'); }}
                                    style={{
                                        background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '10px 24px',
                                        borderRadius: '50px',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(14, 165, 233, 0.35)'
                                    }}
                                >
                                    Xem tất cả ưu đãi
                                </button>
                            </div>
                        )}

                        {/* DANH MỤC MÃ TOÀN SÀN */}
                        {filteredGlobalPromos.length > 0 && (
                            <div className="mb-5">
                                <h3 style={{ fontWeight: '800', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
                                    <Ticket color="#0ea5e9" size={28} /> Ưu đãi Toàn Sàn từ StayHub
                                    <span style={{ fontSize: '13px', background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)', color: '#fff', padding: '3px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                                        {filteredGlobalPromos.length} mã
                                    </span>
                                </h3>
                                <div className="row">
                                    {filteredGlobalPromos.map(promo => <PromoTicket key={promo.id} promo={promo} type="global" />)}
                                </div>
                            </div>
                        )}

                        {/* DANH MỤC MÃ KHÁCH SẠN */}
                        {Object.keys(groupedHotelPromos).length > 0 && (
                            <div className="mb-5">
                                <h3 style={{ fontWeight: '900', color: '#1c2930', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.6rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
                                    <Building2 color="#f43f5e" size={32} /> Ưu Đãi Độc Quyền Từ Đối Tác
                                    <span style={{ fontSize: '13px', background: 'linear-gradient(90deg, #f43f5e 0%, #f59e0b 100%)', color: '#fff', padding: '3px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                                        {filteredHotelPromos.length} mã ({Object.keys(groupedHotelPromos).length} khách sạn)
                                    </span>
                                </h3>
                                
                                {Object.entries(groupedHotelPromos).map(([hotelId, group]) => (
                                    <PromoSlider key={hotelId} group={group} />
                                ))}
                            </div>
                        )}

                        {/* TRƯỜNG HỢP HỆ THỐNG HOÀN TOÀN CHƯA CÓ KHUYẾN MÃI NÀO (KHÔNG PHẢI DO TÌM KIẾM) */}
                        {!searchTerm && activeTab === 'all' && globalPromos.length === 0 && hotelPromos.length === 0 && (
                            <div className="text-center" style={{ padding: '60px 0', color: '#64748b', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                <Flame size={48} color="#cbd5e1" style={{ margin: '0 auto 15px' }} />
                                <h4 style={{ fontWeight: 'bold', color: '#334155' }}>Hiện tại chưa có chương trình khuyến mãi nào đang diễn ra.</h4>
                                <p style={{ margin: 0 }}>Hệ thống đang chuẩn bị đợt Flash Sale tiếp theo, bạn vui lòng quay lại sau nhé!</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Hiển thị Toast */}
            {toastMessage && (
                <div className="toast-popup">
                    <CheckCircle size={20} color="#10b981" />
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}