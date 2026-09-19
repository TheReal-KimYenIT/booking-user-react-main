import React from 'react';
import { X, Ticket, Building2, CheckCircle, Banknote, CreditCard } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function OrderDetailModal({ isOpen, order, onClose, onPayNow }) {
    // Modal hiển thị chi tiết hóa đơn và các khoản phí của đơn đặt phòng
    // Nếu modal không được yêu cầu mở, ta ẩn hoàn toàn
    if (!isOpen) return null;

    // Nếu modal đang mở nhưng chưa có dữ liệu order (đang gọi API), hiển thị giao diện Loading
    if (isOpen && !order) {
        return (
            <div className="custom-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
                <div className="custom-modal-content" onClick={e => e.stopPropagation()} style={{ position: 'relative', minHeight: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                    <LoadingSpinner text="Đang tải dữ liệu đơn hàng..." />
                </div>
            </div>
        );
    }

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN') + ' đ';
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
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };

    const nights = calculateNights(order.check_in, order.check_out);
    const roomsCount = order.details?.[0]?.rooms_count || 1;

    const roomTotal = Number(order.details?.[0]?.subtotal || 0);
    const basePricePerNight = roomTotal / (nights * roomsCount) || 0;

    const servicesTotal = (order.booking_services || order.bookingServices || []).reduce((sum, item) => sum + Number(item.price_at_booking * item.quantity), 0);
    const surchargesTotal = (order.surcharges || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const damagedTotal = (order.supply_incidents || []).reduce((sum, item) => sum + Number(item.actual_price * item.quantity), 0);

    const subTotal = roomTotal + servicesTotal + surchargesTotal + damagedTotal;

    const vatAmount = Number(order.vat_amount || 0);
    const discount = Number(order.discount_amount || 0);
    const finalTotal = subTotal + vatAmount - discount;

    const originalPaid = order.payment_status === 1 ? Number(order.deposit_amount || (order.total_amount / 2)) : 0;
    const remainingToPay = Math.max(0, finalTotal - originalPaid);
    const globalPromo = order.promotion;
    const hotelPromo = order.hotel_promotion || order.hotelPromotion;

    let globalDiscountValue = 0;
    let hotelDiscountValue = 0;

    if (globalPromo) {
        if (globalPromo.discount_type === 1) {
            globalDiscountValue = roomTotal * (globalPromo.discount_value / 100);
            if (globalPromo.max_discount_amount) {
                globalDiscountValue = Math.min(globalDiscountValue, globalPromo.max_discount_amount);
            }
        } else {
            globalDiscountValue = globalPromo.discount_value;
        }
        globalDiscountValue = Math.min(globalDiscountValue, roomTotal);
    }

    if (hotelPromo) {
        hotelDiscountValue = discount - globalDiscountValue;
    }

    return (
        <div className="custom-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="custom-modal-content" onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>

                {order.payment_status === 1 && (
                    <div style={{
                        position: 'absolute', top: '35px', right: '50px',
                        transform: 'rotate(12deg)', border: '4px double #ef4444',
                        color: '#ef4444', padding: '6px 22px', borderRadius: '8px',
                        fontSize: '20px', fontWeight: '900', letterSpacing: '3px',
                        opacity: 0.85, pointerEvents: 'none', zIndex: 99
                    }}>
                        ĐÃ THANH TOÁN CỌC
                    </div>
                )}

                <div className="modal-header">
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>
                        Chi Tiết Đơn Hàng: <span style={{ color: '#2563eb' }}>{order.booking_code}</span>
                    </h3>
                    <button className="close-btn" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* HIỂN THỊ TRẠNG THÁI HOÀN TIỀN NẾU LÀ ĐƠN ĐÃ HỦY VÀ CÓ YÊU CẦU HOÀN TIỀN */}
                {order.status === 4 && order.refund_status > 0 && (
                    <div style={{ background: order.refund_status === 2 ? '#dcfce7' : '#fef3c7', padding: '15px', borderRadius: '8px', margin: '15px', border: `1px solid ${order.refund_status === 2 ? '#86efac' : '#fcd34d'}` }}>
                        <h4 style={{ margin: '0 0 10px 0', color: order.refund_status === 2 ? '#16a34a' : '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {order.refund_status === 2 ? <CheckCircle size={18} /> : <Banknote size={18} />}
                            {order.refund_status === 2 ? 'Đã hoàn tiền' : 'Đang chờ Admin hoàn tiền'}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                            <p style={{ margin: 0 }}><strong>Số tiền hoàn:</strong> {formatPrice(order.refund_amount)}</p>
                            <p style={{ margin: 0 }}><strong>Ngân hàng:</strong> {order.refund_bank}</p>
                            <p style={{ margin: 0 }}><strong>Số tài khoản:</strong> {order.refund_account}</p>
                            <p style={{ margin: 0 }}><strong>Tên người nhận:</strong> {order.refund_account_name}</p>
                        </div>
                    </div>
                )}
                <div className="modal-body">
                    {/* THÔNG TIN KHÁCH SẠN */}
                    {(order.hotel || order.details?.[0]?.room_type?.hotel) && (
                        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                                {order.hotel?.name || order.details?.[0]?.room_type?.hotel?.name}
                            </div>
                            {(order.hotel?.address || order.details?.[0]?.room_type?.hotel?.address) && (
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                                    📍 {order.hotel?.address || order.details?.[0]?.room_type?.hotel?.address}{order.hotel?.city ? `, ${order.hotel.city}` : ''}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="info-grid">
                        <div>
                            <p className="info-row"><span>Khách hàng:</span> <strong>{order.guest_name}</strong></p>
                            <p className="info-row"><span>Điện thoại:</span> <strong>{order.guest_phone}</strong></p>
                            <p className="info-row"><span>Email:</span> <strong>{order.guest_email}</strong></p>
                        </div>
                        <div>
                            <p className="info-row"><span>Nhận phòng:</span> <strong>{formatDate(order.check_in)}</strong></p>
                            <p className="info-row"><span>Trả phòng:</span> <strong>{formatDate(order.check_out)}</strong></p>
                            <p className="info-row"><span>Số đêm:</span> <strong>{nights} đêm</strong></p>
                        </div>
                    </div>

                    <h4 style={{ fontSize: '16px', margin: '20px 0 10px 0', color: '#334155' }}>Chi tiết các khoản phí</h4>
                    <table className="folio-table">
                        <thead>
                            <tr>
                                <th>Nội dung phát sinh / Mặt hàng</th>
                                <th style={{ textAlign: 'center' }}>Số lượng</th>
                                <th style={{ textAlign: 'right' }}>Đơn giá</th>
                                <th style={{ textAlign: 'right' }}>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong className="text-dark">Tiền thuê phòng</strong>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Hạng phòng: {order.details?.[0]?.room_type?.name || order.details?.[0]?.roomType?.name || 'Phòng tiêu chuẩn'}</div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {roomsCount} phòng <br />
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>x {nights} đêm</span>
                                </td>
                                <td style={{ textAlign: 'right', color: '#64748b' }}>{formatPrice(basePricePerNight)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(roomTotal)}</td>
                            </tr>

                            {(order.booking_services || order.bookingServices || []).map((item, index) => (
                                <tr key={`srv-${index}`}>
                                    <td>✨ {item.service?.name}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>{formatPrice(item.price_at_booking)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(item.price_at_booking * item.quantity)}</td>
                                </tr>
                            ))}

                            {(order.surcharges || []).map((item, index) => (
                                <tr key={`sur-${index}`} style={{ backgroundColor: '#fffbeb' }}>
                                    <td>
                                        <span style={{ color: '#d97706', fontWeight: 'bold' }}>⚠️ Phụ thu: {item.category?.name || 'Khác'}</span>
                                        {item.note && <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>Lý do: {item.note}</div>}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>1</td>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>{formatPrice(item.amount)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#d97706' }}>{formatPrice(item.amount)}</td>
                                </tr>
                            ))}

                            {(order.supply_incidents || []).map((item, index) => (
                                <tr key={`dmg-${index}`} style={{ backgroundColor: '#fef2f2' }}>
                                    <td>
                                        <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{item.incident_type === 1 ? '🛠️ Hỏng:' : '❓ Mất:'} {item.supply?.name}</span>
                                        {item.reason && <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>Ghi chú: {item.reason}</div>}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>{formatPrice(item.actual_price)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>{formatPrice(item.actual_price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {order.status === 4 && order.refund_status > 0 && (
                        <div style={{
                            background: order.refund_status === 2 ? '#ecfdf5' : '#fffbeb',
                            border: `1px solid ${order.refund_status === 2 ? '#a7f3d0' : '#fde68a'}`,
                            borderRadius: '10px',
                            padding: '16px',
                            margin: '18px 0',
                            fontSize: '13.5px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: order.refund_status === 2 ? '#065f46' : '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle size={16} color={order.refund_status === 2 ? '#059669' : '#d97706'} />
                                    {order.refund_status === 2 ? 'ĐÃ HOÀN TIỀN THÀNH CÔNG' : 'ĐANG CHỜ HOÀN TIỀN'}
                                </span>
                                <span style={{ fontWeight: '900', fontSize: '16px', color: order.refund_status === 2 ? '#059669' : '#d97706' }}>
                                    {formatPrice(order.refund_amount || order.deposit_amount)}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#475569', fontSize: '12.5px', borderTop: `1px solid ${order.refund_status === 2 ? '#d1fae5' : '#fef3c7'}`, paddingTop: '8px' }}>
                                <div>
                                    <span>Ngân hàng nhận: </span>
                                    <strong style={{ color: '#0f172a' }}>{order.refund_bank || '---'}</strong>
                                </div>
                                <div>
                                    <span>Số tài khoản: </span>
                                    <strong style={{ color: '#0284c7' }}>{order.refund_account || '---'}</strong>
                                </div>
                                <div>
                                    <span>Chủ tài khoản: </span>
                                    <strong style={{ color: '#0f172a' }}>{order.refund_account_name || '---'}</strong>
                                </div>
                                {order.cancellation_reason && (
                                    <div>
                                        <span>Lý do hủy: </span>
                                        <strong style={{ color: '#475569' }}>{order.cancellation_reason}</strong>
                                    </div>
                                )}
                            </div>

                            {order.refund_status === 2 && order.refund_receipt_url && (
                                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #a7f3d0', display: 'flex', justifyContent: 'flex-end' }}>
                                    <a
                                        href={resolveImageUrl(order.refund_receipt_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            color: '#059669',
                                            fontWeight: 'bold',
                                            fontSize: '12.5px',
                                            textDecoration: 'none',
                                            background: '#ffffff',
                                            padding: '5px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #a7f3d0',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        Xem ảnh biên lai chuyển khoản ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="folio-summary">
                        <div className="summary-row">
                            <span>Tổng tiền phòng, dịch vụ & phụ phí:</span>
                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatPrice(subTotal)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Thuế VAT ({order.vat_rate || 10}%):</span>
                            <span>+ {formatPrice(vatAmount)}</span>
                        </div>

                        {(globalPromo || hotelPromo) && (
                            <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '8px', margin: '10px 0', border: '1px dashed #cbd5e1' }}>
                                {globalPromo && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 'bold', marginBottom: hotelPromo ? '8px' : '0' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Ticket size={16} /> StayHub: {globalPromo.code}</span>
                                        <span>- {formatPrice(globalDiscountValue)}</span>
                                    </div>
                                )}
                                {hotelPromo && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', fontWeight: 'bold' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building2 size={16} /> KS: {hotelPromo.code}</span>
                                        <span>- {formatPrice(hotelDiscountValue)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="summary-row total">
                            <span>TỔNG HÓA ĐƠN THỰC TẾ:</span>
                            <span style={{ color: '#0f172a', fontSize: '16px' }}>{formatPrice(finalTotal)}</span>
                        </div>

                        {order.payment_status === 1 && (
                            <div className="summary-row" style={{ color: '#16a34a', fontWeight: 'bold', marginTop: '5px' }}>
                                <span>Khấu trừ cọc trực tuyến (VNPAY):</span>
                                <span>- {formatPrice(originalPaid)}</span>
                            </div>
                        )}

                        <div className="summary-row" style={{
                            marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #cbd5e1',
                            fontSize: '18px', fontWeight: 'bold', color: remainingToPay > 0 ? '#dc2626' : '#16a34a'
                        }}>
                            <span>CẦN THANH TOÁN TẠI QUẦY:</span>
                            <span>{formatPrice(remainingToPay)}</span>
                        </div>
                    </div>

                    {order.status === 0 && onPayNow && (
                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => { onClose(); onPayNow(order); }}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <CreditCard size={18} /> Thanh toán cọc ngay qua VNPAY
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}