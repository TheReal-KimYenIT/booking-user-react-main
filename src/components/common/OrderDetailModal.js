import React from 'react';
import { X, Ticket, Building2 } from 'lucide-react';

export default function OrderDetailModal({ isOpen, order, onClose }) {
    // Nếu modal không mở hoặc không có dữ liệu đơn hàng thì không hiển thị gì cả
    if (!isOpen || !order) return null;

    // Các hàm tính toán nội bộ của Modal
    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN') + ' đ';
    };

    const calculateNights = (inDate, outDate) => {
        const start = new Date(inDate);
        const end = new Date(outDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 1;
    };

    // ----------------------------------------------------
    // KHỐI TÍNH TOÁN TIỀN BẠC
    // ----------------------------------------------------
    const nights = calculateNights(order.check_in, order.check_out);
    const roomsCount = order.details?.[0]?.rooms_count || 1;

    // Đơn giá 1 phòng / 1 đêm (Hỗ trợ cả camelCase và snake_case)
    const basePricePerNight = order.details?.[0]?.roomType?.base_price
        || order.details?.[0]?.room_type?.base_price
        || (order.details?.[0]?.subtotal / (nights * roomsCount))
        || 0;

    const roomTotal = Number(order.details?.[0]?.subtotal || 0);
    const servicesTotal = (order.booking_services || order.bookingServices || []).reduce((sum, item) => sum + Number(item.price_at_booking * item.quantity), 0);
    const surchargesTotal = (order.surcharges || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const damagedTotal = (order.supply_incidents || []).reduce((sum, item) => sum + Number(item.actual_price * item.quantity), 0);

    const subTotal = roomTotal + servicesTotal + surchargesTotal + damagedTotal;
    const vatAmount = Number(order.vat_amount || 0);
    const discount = Number(order.discount_amount || 0);
    const finalTotal = subTotal + vatAmount - discount;

    // ----------------------------------------------------
    // TÍNH TOÁN NGƯỢC TIỀN GIẢM CHO TỪNG VOUCHER
    // ----------------------------------------------------
    // 👉 ĐÃ SỬA: Đón bắt định dạng snake_case của Laravel trả về
    const globalPromo = order.promotion;
    const hotelPromo = order.hotel_promotion || order.hotelPromotion;

    let globalDiscountValue = 0;
    let hotelDiscountValue = 0;

    if (globalPromo) {
        // Tính tiền giảm của Sàn
        if (globalPromo.discount_type === 1) { // Tính %
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
        // Tiền giảm của KS chính là Tổng tiền giảm trừ đi Tiền giảm của Sàn
        hotelDiscountValue = discount - globalDiscountValue;
    }

    return (
        <div className="custom-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="custom-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>
                        Chi Tiết Đơn Hàng: <span style={{ color: '#2563eb' }}>{order.booking_code}</span>
                    </h3>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body">
                    <div className="info-grid">
                        <div>
                            <p className="info-row"><span>Khách hàng:</span> <strong>{order.guest_name}</strong></p>
                            <p className="info-row"><span>Điện thoại:</span> <strong>{order.guest_phone}</strong></p>
                            <p className="info-row"><span>Email:</span> <strong>{order.guest_email}</strong></p>
                        </div>
                        <div>
                            <p className="info-row"><span>Nhận phòng:</span> <strong>{order.check_in}</strong></p>
                            <p className="info-row"><span>Trả phòng:</span> <strong>{order.check_out}</strong></p>
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
                            {/* Tiền phòng */}
                            <tr>
                                <td>
                                    <strong>Tiền thuê phòng</strong>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Hạng phòng: {order.details?.[0]?.roomType?.name || order.details?.[0]?.room_type?.name || 'Phòng tiêu chuẩn'}</div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    {roomsCount} phòng <br />
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>x {nights} đêm</span>
                                </td>
                                <td style={{ textAlign: 'right', color: '#64748b' }}>{formatPrice(basePricePerNight)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(roomTotal)}</td>
                            </tr>

                            {/* Dịch vụ */}
                            {(order.booking_services || order.bookingServices || []).map((item, index) => (
                                <tr key={`srv-${index}`}>
                                    <td>✨ {item.service?.name}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>{formatPrice(item.price_at_booking)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(item.price_at_booking * item.quantity)}</td>
                                </tr>
                            ))}

                            {/* Phụ thu */}
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

                            {/* Đền bù */}
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

                    <div className="folio-summary">
                        <div className="summary-row">
                            <span>Tổng tiền phòng, dịch vụ & phụ phí:</span>
                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatPrice(subTotal)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Thuế VAT (10%):</span>
                            <span>+ {formatPrice(vatAmount)}</span>
                        </div>

                        {/* 👉 CHI TIẾT TỪNG LOẠI MÃ KHUYẾN MÃI */}
                        {(globalPromo || hotelPromo) && (
                            <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '8px', margin: '10px 0', border: '1px dashed #cbd5e1' }}>
                                {globalPromo && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 'bold', marginBottom: hotelPromo ? '8px' : '0' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Ticket size={16} /> Hiroto: {globalPromo.code}</span>
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

                        {/* TỔNG TIỀN ĐÃ GIẢM */}
                        {discount > 0 && (
                            <div className="summary-row" style={{ color: '#16a34a', fontWeight: 'bold' }}>
                                <span>Tổng tiền được giảm:</span>
                                <span>- {formatPrice(discount)}</span>
                            </div>
                        )}

                        <div className="summary-row total">
                            <span>TỔNG THANH TOÁN:</span>
                            <span style={{ color: '#dc2626', fontSize: '20px' }}>{formatPrice(finalTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}