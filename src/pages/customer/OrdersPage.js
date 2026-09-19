import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerApi from '../../api/customerApi';
import {
    FileText, Star, CheckCircle, MessageSquare, CreditCard, Banknote, X, ShieldAlert,
    Calendar, MapPin, Building, RotateCcw
} from 'lucide-react';
import ReviewModal from '../../components/common/ReviewModal';
import OrderDetailModal from '../../components/common/OrderDetailModal';
import ReviewDetailModal from '../../components/common/ReviewDetailModal';
import ContactOrderModal from '../../components/common/ContactOrderModal';
import Swal from 'sweetalert2';
import { resolveImageUrl } from '../../utils/imageUrl';

import '../css/OrdersPage.css';

const OrdersPage = () => {
    // Trang hiển thị lịch sử đơn đặt phòng của khách hàng
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);
    const [viewReviewData, setViewReviewData] = useState(null);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactBooking, setContactBooking] = useState(null);

    const [cancelModal, setCancelModal] = useState({
        isOpen: false, order: null, needsBankInfo: false, refundText: ''
    });
    const [bankInfo, setBankInfo] = useState({ refund_bank: '', refund_account: '', refund_account_name: '' });
    const [cancellationReason, setCancellationReason] = useState('');

    const [toastMessage, setToastMessage] = useState('');
    const toastTimeoutRef = useRef(null);
    const [processingPaymentId, setProcessingPaymentId] = useState(null);

    const navigate = useNavigate();

    const handlePayNow = async (order) => {
        try {
            setProcessingPaymentId(order.id);
            const res = await customerApi.createVnpayPayment({ booking_id: order.id });
            if (res.data?.payment_url) {
                window.location.href = res.data.payment_url;
            } else {
                Swal.fire('Lỗi', 'Không thể tạo liên kết thanh toán VNPay lúc này.', 'error');
                setProcessingPaymentId(null);
            }
        } catch (error) {
            setProcessingPaymentId(null);
            Swal.fire('Thông báo', error.response?.data?.message || 'Không thể thanh toán đơn hàng này.', 'warning');
            fetchMyOrders();
        }
    };

    const showToast = (message) => {
        setToastMessage(message);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Đang cập nhật...';
        const date = new Date(dateString);
        return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString('vi-VN')}`;
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN') + ' đ';
    };

    const getImage = (imgObj, fallbackUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80') => {
        if (!imgObj) return fallbackUrl;
        if (typeof imgObj === 'string') {
            return resolveImageUrl(imgObj);
        }
        if (imgObj.file_url) {
            return resolveImageUrl(imgObj.file_url);
        }
        return fallbackUrl;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const calculateNights = (inDate, outDate) => {
        const start = new Date(inDate);
        const end = new Date(outDate);
        const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return 'Chờ thanh toán cọc';
            case 1: return 'Đã xác nhận';
            case 2: return 'Đã nhận phòng';
            case 3: return 'Đã trả phòng';
            case 4: return 'Đã hủy';
            case 5: return 'Khách không đến';
            default: return 'Không xác định';
        }
    };

    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case 0:
                return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
            case 1:
                return { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
            case 2:
                return { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' };
            case 3:
                // SỬA LỖI: Đã trả phòng là trạng thái hoàn thành thành công -> màu xanh lá nhẹ thay vì màu đỏ
                return { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
            case 4:
                return { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' };
            case 5:
                return { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
            default:
                return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
        }
    };

    const getCardBorderLeft = (status) => {
        switch (status) {
            case 0: return '4px solid #f59e0b';
            case 1: return '4px solid #10b981';
            case 2: return '4px solid #3b82f6';
            case 3: return '4px solid #10b981';
            case 4: return '4px solid #94a3b8';
            case 5: return '4px solid #ef4444';
            default: return '4px solid #cbd5e1';
        }
    };

    const tabs = [
        { key: 'all', label: 'Tất cả' },
        { key: '0', label: 'Chờ thanh toán cọc' },
        { key: '1', label: 'Đã xác nhận' },
        { key: '2', label: 'Đang ở' },
        { key: '3', label: 'Đã hoàn thành' },
        { key: '4', label: 'Đã hủy' }
    ];

    const getFilteredOrders = () => {
        if (activeTab === 'all') return orders;
        if (activeTab === '4') return orders.filter(o => o.status === 4 || o.status === 5);
        return orders.filter(o => o.status === Number(activeTab));
    };

    const getTabCount = (key) => {
        if (key === 'all') return orders.length;
        if (key === '4') return orders.filter(o => o.status === 4 || o.status === 5).length;
        return orders.filter(o => o.status === Number(key)).length;
    };

    const getCancelPolicyText = (free, partial, percent) => {
        const f = free != null ? free : 48;
        const p = partial != null ? partial : 24;
        const pct = percent != null ? percent : 50;

        if (f === 0) return "Không hoàn tiền khi hủy phòng.";

        let text = `Hủy miễn phí trước ${f}h.`;
        if (p > 0 && pct > 0) {
            text += ` Hoàn ${pct}% nếu hủy trước ${p}h.`;
        }
        return text;
    };

    const fetchMyOrders = useCallback(async () => {
        try {
            const response = await customerApi.getMyBookings();
            setOrders(response.data.data || []);
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
            if (error.response?.status === 401) {
                alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
                localStorage.removeItem('customer_token');
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

    //  XỬ LÝ KHI BẤM NÚT "HỦY PHÒNG" TÍNH TOÁN % VÀ SỐ TIỀN CỤ THỂ
    const handleCancelClick = (order) => {
        // Đơn chưa thanh toán cọc: Cho phép hủy giữ chỗ ngay lập tức để giải phóng phòng cho người khác
        if (order.status === 0) {
            Swal.fire({
                title: 'Hủy giữ chỗ đơn này?',
                html: `Đơn này <b>chưa thanh toán tiền cọc</b>.<br/><br/>Nếu hủy, phòng sẽ được trả về kho ngay lập tức để khách khác có thể đặt và đơn sẽ được xóa khỏi hệ thống.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#64748b',
                cancelButtonText: 'Giữ lại đơn',
                confirmButtonText: 'Đồng ý hủy'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await customerApi.cancelBooking(order.id, {});
                        showToast(response.data?.message || 'Đã hủy giữ chỗ thành công!');
                        fetchMyOrders();
                    } catch (error) {
                        Swal.fire('Lỗi', error.response?.data?.message || 'Không thể hủy lúc này.', 'error');
                    }
                }
            });
            return;
        }

        const checkInDate = new Date(order.check_in);
        checkInDate.setHours(14, 0, 0, 0); // Mặc định giờ check-in là 14:00
        const now = new Date();
        const diffHours = (checkInDate - now) / (1000 * 60 * 60);

        if (diffHours <= 0) {
            Swal.fire('Thất bại', 'Đã qua giờ nhận phòng, bạn không thể thao tác hủy nữa!', 'error');
            return;
        }

        const isPrepaid = order.payment_status === 1;
        const totalPaid = isPrepaid ? Number(order.total_amount || 0) : 0;

        const freeHours = order.free_cancel_hours ?? 48;
        const partialHours = order.partial_refund_hours ?? 24;
        const partialPercent = order.partial_refund_percent ?? 50;

        let refundText = '';

        if (diffHours >= freeHours) {
            if (isPrepaid) {
                refundText = `Hủy miễn phí. Bạn sẽ được hoàn lại 100% số tiền cọc. Vui lòng nhập thông tin ngân hàng để nhận lại tiền.`;
                setCancelModal({ isOpen: true, order: order, refundText: refundText, needsBankInfo: true });
            } else {
                Swal.fire({
                    title: 'Xác nhận hủy phòng',
                    html: `Bạn đang hủy phòng trong thời gian <b>Miễn phí</b>.<br/><br/>Hệ thống sẽ hủy đơn này mà bạn không bị trừ bất kỳ khoản phí nào.`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonText: 'Đóng',
                    confirmButtonText: 'Vâng, Hủy đơn'
                }).then((result) => {
                    if (result.isConfirmed) submitCancel(order.id, {});
                });
            }
        } else if (diffHours >= partialHours && partialPercent > 0) {
            const expectedRefund = totalPaid * (partialPercent / 100);
            const formattedRefund = expectedRefund.toLocaleString('vi-VN') + ' ₫';

            if (isPrepaid) {
                refundText = `Hủy quá hạn. Hệ thống sẽ phạt phí và hoàn lại ${partialPercent}% tiền cọc (${formattedRefund}). Vui lòng nhập thông tin ngân hàng để nhận lại tiền.`;
                setCancelModal({ isOpen: true, order: order, refundText: refundText, needsBankInfo: true });
            } else {
                Swal.fire({
                    title: 'Cảnh báo hủy phòng trễ',
                    html: `Bạn đang hủy phòng <b>quá hạn miễn phí</b>.<br/>Nếu bạn chưa thanh toán, hệ thống sẽ hủy đơn và ghi nhận lịch sử hủy trễ trên tài khoản của bạn.`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonText: 'Đóng',
                    confirmButtonText: 'Vâng, Tôi chấp nhận'
                }).then((result) => {
                    if (result.isConfirmed) submitCancel(order.id, {});
                });
            }
        } else {
            Swal.fire({
                title: 'CẢNH BÁO QUAN TRỌNG',
                html: `Bạn đang hủy phòng <b>RẤT SÁT GIỜ NHẬN PHÒNG</b>.<br/><br/>
                       Bạn sẽ <b style="color:#ef4444;">KHÔNG ĐƯỢC HOÀN TIỀN (0đ)</b> cho đơn hàng này theo đúng chính sách của khách sạn.<br/><br/>
                       Bạn có chắc chắn muốn hủy không?`,
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonText: 'Không hủy nữa',
                confirmButtonText: 'Vâng, Tôi chấp nhận mất phí'
            }).then((result) => {
                if (result.isConfirmed) submitCancel(order.id, {});
            });
        }
    };

    // BƯỚC 2: GỬI LÊN BACKEND
    const submitCancel = async (orderId, data) => {
        try {
            const response = await customerApi.cancelBooking(orderId, {
                cancellation_reason: cancellationReason,
                ...bankInfo
            });
            Swal.fire('Thành công', response.data.message || "Đã hủy đơn phòng thành công!", 'success');
            setCancelModal({ isOpen: false, order: null, needsBankInfo: false, refundText: '' });
            setCancellationReason('');
            fetchMyOrders(); // Tải lại danh sách
        } catch (error) {
            console.error("Lỗi hủy đơn:", error);
            Swal.fire('Lỗi', error.response?.data?.message || "Không thể hủy đơn lúc này.", 'error');
        }
    };

    const handleOpenReview = (order) => {
        setReviewBooking(order);
        setIsReviewOpen(true);
    };

    const handleViewReview = (order) => setViewReviewData(order);

    // SỬA: Dùng showToast thay vì alert
    const handleReviewSuccess = (msg) => {
        showToast(msg);
        fetchMyOrders();
    };

    const handleOpenContact = (order) => { setContactBooking(order); setIsContactOpen(true); };

    const handleViewReceipt = (order) => {
        const receiptPath = order.refund_receipt_url;
        if (!receiptPath) return;
        const fullUrl = resolveImageUrl(receiptPath);
        Swal.fire({
            title: `Biên nhận hoàn tiền: ${order.booking_code || '#' + order.id}`,
            html: `
                <div style="text-align: center; padding: 10px 0;">
                    <p style="margin: 0 0 8px 0; color: #059669; font-weight: bold; font-size: 15px;">
                        Số tiền hoàn trả: ${(Number(order.refund_amount || order.deposit_amount || 0)).toLocaleString('vi-VN')} đ
                    </p>
                    <p style="margin: 0 0 14px 0; color: #64748b; font-size: 13px;">
                        Đến tài khoản: <b>${order.refund_account || ''}</b> (${order.refund_bank || ''} • ${order.refund_account_name || ''})
                    </p>
                    <div style="background: #0f172a; padding: 10px; border-radius: 10px; max-height: 480px; overflow-y: auto;">
                        <img src="${fullUrl}" alt="Biên nhận hoàn tiền" style="max-width: 100%; border-radius: 6px; display: block; margin: 0 auto;" />
                    </div>
                </div>
            `,
            width: '540px',
            confirmButtonText: 'Đóng',
            confirmButtonColor: '#0f172a'
        });
    };

    // Loading đồng bộ
    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div className="spinner-border" style={{ color: '#dfa974' }} role="status"></div>
                <p style={{ marginTop: '15px', color: '#666' }}>Đang tải đơn đặt phòng...</p>
            </div>
        );
    }

    const filteredOrders = getFilteredOrders();

    return (
        <div style={{ position: 'relative' }}>
            <div className="orders-container">
                <div className="orders-wrapper">
                    {/* Header tiêu đề */}
                    <div className="orders-title-block">
                        <h1 className="orders-title">Đơn đặt phòng của tôi</h1>
                        <p className="orders-subtitle">Quản lý và theo dõi thông tin chi tiết các chuyến đi của bạn</p>
                    </div>

                    {/* Thanh Tabs Lọc Trạng Thái */}
                    <div className="order-tabs-bar">
                        {tabs.map((tab) => {
                            const count = getTabCount(tab.key);
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    className={`order-tab-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <span>{tab.label}</span>
                                    <span className="order-tab-count">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Nội dung danh sách đơn */}
                    {(!orders || orders.length === 0) ? (
                        <div className="empty-orders">
                            <p className="empty-msg">Bạn chưa có đơn đặt phòng nào trên hệ thống.</p>
                            <Link to="/" className="btn-find-hotel">Tìm và đặt phòng ngay</Link>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="empty-orders">
                            <p className="empty-msg">Không có đơn đặt phòng nào trong mục này.</p>
                            <button className="btn-find-hotel border-0" onClick={() => setActiveTab('all')} style={{ cursor: 'pointer' }}>
                                Xem tất cả đơn ({orders.length})
                            </button>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {filteredOrders.map((order) => {
                                const hotelName = order.hotel?.name || order.details?.[0]?.room_type?.hotel?.name || 'Khách sạn';
                                const hotelAddress = order.hotel ? `${order.hotel.address}, ${order.hotel.city}` : '';
                                const hotelStars = order.hotel?.star_rating || 0;
                                const roomTypeName = order.details?.[0]?.room_type?.name || 'Đang cập nhật...';
                                const roomsCount = order.details?.[0]?.rooms_count || 1;
                                const nights = calculateNights(order.check_in, order.check_out);

                                const roomMedia = order.details?.[0]?.room_type?.media;
                                const hotelImages = order.hotel?.images;
                                const orderImg = (roomMedia && roomMedia.length > 0)
                                    ? getImage(roomMedia[0])
                                    : (hotelImages && hotelImages.length > 0)
                                        ? getImage(hotelImages[0])
                                        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80';

                                return (
                                    <div key={order.id} className="order-card-v2" style={{ borderLeft: getCardBorderLeft(order.status) }}>
                                        {/* Header Thẻ: Mã đơn, ngày đặt, trạng thái thanh toán & booking */}
                                        <div className="order-card-header">
                                            <div className="order-header-left">
                                                <span className="order-code-label">Mã đơn:</span>
                                                <span className="order-code-val">{order.booking_code || `#${order.id}`}</span>
                                                <span className="order-date-placed">• Đặt lúc: {formatDateTime(order.created_at)}</span>
                                            </div>
                                            <div className="order-header-right">
                                                {order.payment_status === 1 ? (
                                                    <span className="badge-paid-deposit">
                                                        <CreditCard size={13} /> Đã thanh toán cọc
                                                    </span>
                                                ) : (
                                                    <span className="badge-unpaid-deposit">
                                                        <Banknote size={13} /> {order.status === 0 ? 'Chờ thanh toán cọc' : 'Trả tại quầy'}
                                                    </span>
                                                )}

                                                <span className="badge-order-status" style={getStatusBadgeStyle(order.status)}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Thân thẻ: Thumbnail ảnh, thông tin khách sạn/phòng & giá */}
                                        <div className="order-card-body">
                                            {/* Thumbnail ảnh */}
                                            <div className="order-thumbnail" style={{ backgroundImage: `url("${orderImg}")` }}></div>

                                            {/* Cột thông tin chi tiết */}
                                            <div className="order-details-col">
                                                <div className="order-hotel-name-row">
                                                    {order.hotel_id ? (
                                                        <Link to={`/hotels/${order.hotel_id}`} className="order-hotel-title">
                                                            {hotelName}
                                                        </Link>
                                                    ) : (
                                                        <span className="order-hotel-title">{hotelName}</span>
                                                    )}
                                                    {hotelStars > 0 && (
                                                        <div className="order-hotel-stars">
                                                            {[...Array(hotelStars)].map((_, i) => <Star key={i} size={13} fill="#ca8a04" color="#ca8a04" />)}
                                                        </div>
                                                    )}
                                                </div>

                                                {hotelAddress && (
                                                    <div className="order-hotel-address">
                                                        <MapPin size={13} color="#94a3b8" /> {hotelAddress}
                                                    </div>
                                                )}

                                                <div className="order-room-name">
                                                    <strong>Loại phòng:</strong> <span>{roomTypeName}</span>
                                                </div>

                                                <div className="order-tags-row">
                                                    <div className="order-tag">
                                                        <Calendar size={13} color="#0284c7" />
                                                        <span>{formatDate(order.check_in)} → {formatDate(order.check_out)}</span>
                                                        <strong style={{ color: '#0369a1' }}>({nights} đêm)</strong>
                                                    </div>
                                                    <div className="order-tag">
                                                        <Building size={13} color="#0284c7" />
                                                        <span>{roomsCount} phòng</span>
                                                    </div>
                                                </div>

                                                <div className="order-cancel-policy-tag">
                                                    <ShieldAlert size={14} color="#0369a1" />
                                                    <span>{getCancelPolicyText(order.free_cancel_hours, order.partial_refund_hours, order.partial_refund_percent)}</span>
                                                </div>
                                            </div>

                                            {/* Cột giá bên phải */}
                                            <div className="order-price-col">
                                                <span className="order-price-label">Tổng thanh toán</span>
                                                <span className="order-price-val">{formatPrice(order.total_amount)}</span>
                                                {order.payment_status === 1 && (
                                                    <span className="order-deposit-info">
                                                        (Đã cọc: {formatPrice(order.deposit_amount || order.total_amount / 2)})
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer Thẻ: Ghi chú hỗ trợ & Nhóm nút bấm */}
                                        <div className="order-card-footer">
                                            <div className="order-footer-note">
                                                {order.status === 0 && (
                                                    <span className="text-warning-custom">
                                                        ⚠️ Vui lòng hoàn tất thanh toán cọc trong vòng 15 phút kể từ lúc đặt phòng.
                                                    </span>
                                                )}
                                                {order.status === 1 && (
                                                    <span className="text-success-custom">
                                                        ✓ Đơn đã được xác nhận. Vui lòng nhận phòng đúng thời gian quy định.
                                                    </span>
                                                )}
                                                {order.status === 2 && (
                                                    <span className="text-success-custom">
                                                        ✓ Khách đang lưu trú tại khách sạn.
                                                    </span>
                                                )}
                                                {order.status === 3 && (
                                                    <span className="text-success-custom">
                                                        ✓ Kỳ nghỉ đã hoàn tất. Cảm ơn bạn đã đồng hành cùng StayHub!
                                                    </span>
                                                )}
                                                {order.status === 4 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                        <span className="text-muted-custom">
                                                            Đơn đặt phòng này đã được hủy.
                                                        </span>
                                                        {order.refund_status === 1 && (
                                                            <span style={{ color: '#d97706', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                                🕒 Đang chờ hoàn tiền ({formatPrice(order.refund_amount || order.deposit_amount)}) qua {order.refund_bank || 'ngân hàng'}
                                                            </span>
                                                        )}
                                                        {order.refund_status === 2 && (
                                                            <span style={{ color: '#059669', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                                ✓ Đã hoàn tiền ({formatPrice(order.refund_amount || order.deposit_amount)})
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="order-footer-actions">
                                                <button onClick={() => handleOpenContact(order)} className="btn-action-outline">
                                                    <MessageSquare size={15} /> Hỗ trợ
                                                </button>
                                                <button className="btn-action-outline" onClick={() => setSelectedOrder(order)}>
                                                    <FileText size={15} /> Xem chi tiết
                                                </button>

                                                {order.status === 4 && order.refund_status === 2 && order.refund_receipt_url && (
                                                    <button
                                                        onClick={() => handleViewReceipt(order)}
                                                        className="btn-action-outline"
                                                        style={{ borderColor: '#10b981', color: '#059669', background: '#ecfdf5' }}
                                                    >
                                                        <FileText size={15} /> Xem biên nhận
                                                    </button>
                                                )}

                                                {order.status === 0 && (
                                                    <>
                                                        <button
                                                            className="btn-action-danger"
                                                            onClick={() => handleCancelClick(order)}
                                                        >
                                                            Hủy giữ chỗ
                                                        </button>
                                                        <button
                                                            disabled={processingPaymentId === order.id}
                                                            onClick={() => handlePayNow(order)}
                                                            className="btn-action-primary"
                                                        >
                                                            <CreditCard size={15} />
                                                            {processingPaymentId === order.id ? 'Đang tạo link...' : 'Thanh toán cọc ngay'}
                                                        </button>
                                                    </>
                                                )}

                                                {order.status === 1 && (
                                                    <button className="btn-action-danger" onClick={() => handleCancelClick(order)}>
                                                        Hủy phòng
                                                    </button>
                                                )}

                                                {order.status === 3 && (
                                                    <>
                                                        {!order.review ? (
                                                            <button className="btn-action-warning" onClick={(e) => { e.stopPropagation(); handleOpenReview(order); }}>
                                                                <Star size={15} fill="#78350f" /> Đánh giá
                                                            </button>
                                                        ) : (
                                                            <button className="btn-action-reviewed" onClick={(e) => { e.stopPropagation(); handleViewReview(order); }}>
                                                                <CheckCircle size={15} /> Đã đánh giá ({order.review.rating}★)
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                {order.status === 4 && order.hotel_id && (
                                                    <Link to={`/hotels/${order.hotel_id}`} className="btn-action-rebook">
                                                        <RotateCcw size={14} /> Đặt lại phòng
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/*   MODAL NHẬP THÔNG TIN NGÂN HÀNG (DÀNH CHO KHÁCH ĐÃ TRẢ TIỀN) */}
            {cancelModal.isOpen && (
                <div className="custom-modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="custom-modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0, color: '#dc2626' }}>Xác nhận Hủy phòng</h3>
                            <button className="close-btn" onClick={() => setCancelModal({ isOpen: false, order: null, refundText: '', needsBankInfo: false })}><X size={24} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                <p style={{ margin: 0, color: '#16a34a', fontWeight: 'bold' }}>{cancelModal.refundText}</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#047857' }}>
                                    Lễ tân sẽ xác nhận yêu cầu và chuyển khoản lại cho bạn trong vòng 3-5 ngày làm việc.
                                </p>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Lý do hủy phòng <span style={{ color: 'red' }}>*</span></label>
                                <textarea className="form-control" rows="3" value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} placeholder="Nhập lý do hủy phòng của bạn..."></textarea>
                            </div>

                            {cancelModal.needsBankInfo && (
                                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px', marginBottom: '20px' }}>
                                    <h5 style={{ fontWeight: 'bold', marginBottom: '15px' }}>Thông tin ngân hàng nhận tiền hoàn</h5>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Ngân hàng <span style={{ color: 'red' }}>*</span></label>
                                        <input type="text" className="form-control" value={bankInfo.refund_bank} onChange={(e) => setBankInfo({ ...bankInfo, refund_bank: e.target.value })} placeholder="VD: Vietcombank, Techcombank..." />
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Số tài khoản <span style={{ color: 'red' }}>*</span></label>
                                        <input type="text" className="form-control" value={bankInfo.refund_account} onChange={(e) => setBankInfo({ ...bankInfo, refund_account: e.target.value })} placeholder="Nhập số tài khoản..." />
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Tên chủ tài khoản <span style={{ color: 'red' }}>*</span></label>
                                        <input type="text" className="form-control" value={bankInfo.refund_account_name} onChange={(e) => setBankInfo({ ...bankInfo, refund_account_name: e.target.value })} placeholder="Nhập tên không dấu (VD: NGUYEN VAN A)..." />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => submitCancel(cancelModal.order.id, {})}
                                style={{ background: '#dc2626', color: 'white', padding: '12px', width: '100%', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Xác nhận Hủy & Gửi yêu cầu hoàn tiền
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <OrderDetailModal isOpen={!!selectedOrder} order={selectedOrder} onClose={() => setSelectedOrder(null)} onPayNow={handlePayNow} />

            {isReviewOpen && reviewBooking && (
                <ReviewModal isOpen={isReviewOpen} onClose={() => { setIsReviewOpen(false); setReviewBooking(null); }} bookingId={reviewBooking.id} hotelId={reviewBooking.hotel_id || reviewBooking.hotel?.id} customerId={reviewBooking.customer_id || reviewBooking.user_id} onSuccess={handleReviewSuccess} />
            )}

            <ReviewDetailModal isOpen={!!viewReviewData} review={viewReviewData?.review} order={viewReviewData} onClose={() => setViewReviewData(null)} />

            {isContactOpen && contactBooking && (
                <ContactOrderModal
                    isOpen={isContactOpen}
                    order={contactBooking}
                    hotelId={contactBooking.hotel_id || contactBooking.hotel?.id}
                    hotelName={contactBooking.hotel?.name || contactBooking.details?.[0]?.room_type?.hotel?.name || 'Khách sạn'}
                    onClose={() => { setIsContactOpen(false); setContactBooking(null); }}
                />
            )}

            {/* THÊM: Hiển thị Toast */}
            {toastMessage && (
                <div className="toast-popup">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;