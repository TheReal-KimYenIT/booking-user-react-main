import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerApi from '../../api/customerApi';
import { FileText, Star, CheckCircle, MessageSquare, CreditCard, Banknote } from 'lucide-react';
import ReviewModal from '../../components/common/ReviewModal';
import OrderDetailModal from '../../components/common/OrderDetailModal';
import ReviewDetailModal from '../../components/common/ReviewDetailModal';
import ContactOrderModal from '../../components/common/ContactOrderModal';

import '../css/OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState(null);

    // State cho Modal VIẾT đánh giá
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewBooking, setReviewBooking] = useState(null);

    // State cho Modal XEM LẠI đánh giá
    const [viewReviewData, setViewReviewData] = useState(null);

    // State quản lý Modal LIÊN HỆ / HỖ TRỢ
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactBooking, setContactBooking] = useState(null);

    const navigate = useNavigate();

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Đang cập nhật...';
        const date = new Date(dateString);
        return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString('vi-VN')}`;
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN') + ' đ';
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

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này không?")) return;
        try {
            await customerApi.cancelBooking(orderId);
            alert("Đã hủy đơn phòng thành công!");
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: 4 } : order));
        } catch (error) {
            console.error("Lỗi hủy đơn:", error);
            alert("Không thể hủy đơn lúc này. Đơn hàng có thể đã được duyệt hoặc có lỗi xảy ra!");
        }
    };

    const handleOpenReview = (order) => {
        setReviewBooking(order);
        setIsReviewOpen(true);
    };

    const handleViewReview = (order) => {
        setViewReviewData(order);
    };

    const handleReviewSuccess = (msg) => {
        alert(msg);
        fetchMyOrders();
    };

    const handleOpenContact = (order) => {
        setContactBooking(order);
        setIsContactOpen(true);
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '18px', color: '#666' }}>Đang tải dữ liệu đơn hàng của bạn...</div>;

    return (
        <>
            <div className="orders-container">
                <h2 className="orders-title">Đơn đặt phòng của tôi</h2>

                {(!orders || orders.length === 0) ? (
                    <div className="empty-orders">
                        <p className="empty-msg">Bạn chưa có đơn đặt phòng nào.</p>
                        <Link to="/" className="btn-find-hotel">Tìm khách sạn ngay</Link>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card" style={{ borderLeft: order.status === 3 ? '5px solid #10b981' : order.status === 4 ? '5px solid #94a3b8' : '5px solid #3b82f6' }}>
                                <div className="order-info">
                                    <h3 style={{ fontSize: '18px', margin: '0 0 10px 0' }}>
                                        Mã đơn: <span style={{ color: order.status === 3 ? '#10b981' : order.status === 4 ? '#64748b' : '#2563eb' }}>{order.booking_code || `#${order.id}`}</span>

                                        {/* 👉 HIỂN THỊ TAG THANH TOÁN */}
                                        {order.payment_status === 1 ? (
                                            <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CreditCard size={14} /> Đã thanh toán
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Banknote size={14} /> Trả tại quầy
                                            </span>
                                        )}
                                    </h3>
                                    <p style={{ margin: '5px 0' }}>
                                        <span style={{ fontWeight: 'bold' }}>Loại phòng: </span>
                                        <span style={{ color: '#047857', fontWeight: 'bold' }}>{order.details?.[0]?.room_type?.name || 'Đang cập nhật...'}</span>
                                    </p>
                                    <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>Thời gian đặt: </span> {formatDateTime(order.created_at)}</p>
                                    <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>Nhận phòng:</span> {order.check_in}</p>
                                    <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>Trả phòng:</span> {order.check_out}</p>
                                    <p style={{ margin: '5px 0' }}><span style={{ fontWeight: 'bold' }}>Tên khách:</span> {order.guest_name}</p>

                                    <p style={{ marginTop: '15px' }}>
                                        <span style={{ fontWeight: 'bold' }}>Trạng thái: </span>
                                        <span className="order-status" style={{
                                            backgroundColor: order.status === 0 ? '#fef3c7' : order.status === 1 ? '#d1fae5' : order.status === 2 ? '#dbeafe' : order.status === 4 ? '#f1f5f9' : '#fee2e2',
                                            color: order.status === 0 ? '#b45309' : order.status === 1 ? '#047857' : order.status === 2 ? '#1d4ed8' : order.status === 4 ? '#475569' : '#b91c1c'
                                        }}>
                                            {order.status === 0 ? 'Chờ duyệt' :
                                                order.status === 1 ? 'Đã xác nhận' :
                                                    order.status === 2 ? 'Đã nhận phòng' :
                                                        order.status === 3 ? 'Đã trả phòng' :
                                                            order.status === 4 ? 'Đã hủy' :
                                                                order.status === 5 ? 'Khách không đến' : 'Không xác định'}
                                        </span>
                                    </p>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: '10px' }}>
                                    <div>
                                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>Tổng thanh toán</p>
                                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', margin: '5px 0' }}>
                                            {/* 👉 ĐÃ SỬA: Hiển thị total_price (Giá cuối cùng) thay vì total_amount (Giá gốc) */}
                                            {formatPrice(order.total_price)}
                                        </p>
                                    </div>

                                    {/* Nhóm các nút hành động */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleOpenContact(order)}
                                            style={{
                                                background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1',
                                                padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                fontWeight: 'bold', fontSize: '14px'
                                            }}
                                        >
                                            <MessageSquare size={16} /> Hỗ trợ
                                        </button>

                                        <button className="detail-btn" onClick={() => setSelectedOrder(order)}>
                                            <FileText size={16} /> Xem chi tiết
                                        </button>
                                    </div>

                                    {order.status === 0 && (
                                        <button className="cancel-btn" onClick={() => handleCancelOrder(order.id)}>
                                            Hủy phòng
                                        </button>
                                    )}

                                    {/* LOGIC ĐÁNH GIÁ */}
                                    {order.status === 3 && (
                                        <>
                                            {!order.review ? (
                                                <button
                                                    className="btn btn-warning rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1 shadow-sm mt-2"
                                                    style={{ backgroundColor: '#fbbf24', border: 'none', color: '#1e293b' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenReview(order);
                                                    }}
                                                >
                                                    <Star size={16} fill="#1e293b" /> Đánh giá kỳ nghỉ
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1 shadow-sm mt-2"
                                                    style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#047857' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewReview(order);
                                                    }}
                                                >
                                                    <CheckCircle size={16} /> Đã đánh giá
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <OrderDetailModal
                isOpen={!!selectedOrder}
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />

            {isReviewOpen && reviewBooking && (
                <ReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => {
                        setIsReviewOpen(false);
                        setReviewBooking(null);
                    }}
                    bookingId={reviewBooking.id}
                    hotelId={reviewBooking.hotel_id || reviewBooking.hotel?.id}
                    customerId={reviewBooking.customer_id || reviewBooking.user_id}
                    onSuccess={handleReviewSuccess}
                />
            )}

            <ReviewDetailModal
                isOpen={!!viewReviewData}
                review={viewReviewData?.review}
                order={viewReviewData}
                onClose={() => setViewReviewData(null)}
            />

            {isContactOpen && contactBooking && (
                <ContactOrderModal
                    isOpen={isContactOpen}
                    order={contactBooking}
                    onClose={() => {
                        setIsContactOpen(false);
                        setContactBooking(null);
                    }}
                />
            )}
        </>
    );
};

export default OrdersPage;