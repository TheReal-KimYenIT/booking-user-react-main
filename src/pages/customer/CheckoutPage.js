import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { UserCircle, CheckCircle2, Tag, PlusCircle, X, Ticket, Minus, Plus, Building2, Users, Info } from 'lucide-react';
import Swal from 'sweetalert2';

import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import { todayISODate, addDaysISODate } from '../../utils/booking';
import '../css/CheckoutPage.css';

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const hotelId = searchParams.get('hotel_id');
    const roomId = searchParams.get('room_id');
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [hotel, setHotel] = useState(null);
    const [room, setRoom] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [contactName, setContactName] = useState(user?.name || '');
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    const [contactPhone, setContactPhone] = useState(user?.phone || '');
    const [isBookingForSelf, setIsBookingForSelf] = useState(true);

    const [guestName, setGuestName] = useState('');
    const [otherRequest, setOtherRequest] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);

    // STATE LƯU 2 LOẠI VOUCHER ĐỘC LẬP
    const [globalPromo, setGlobalPromo] = useState(null);
    const [hotelPromo, setHotelPromo] = useState(null);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [allPromos, setAllPromos] = useState({ global: [], hotels: [] });

    const checkInDate = searchParams.get('checkIn') || todayISODate();
    const checkOutDate = searchParams.get('checkOut') || addDaysISODate(todayISODate(), 1);
    const urlRooms = Number(searchParams.get('rooms')) || 1;

    useEffect(() => { window.scrollTo(0, 0); }, []);
    useEffect(() => { if (user) { setContactName(user.name || ''); setContactEmail(user.email || ''); setContactPhone(user.phone || ''); } }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!hotelId || !roomId) { setLoading(false); return; }
            try {
                const [hotelRes, servicesRes, promosRes] = await Promise.all([
                    axiosClient.get(`/hotels/${hotelId}`),
                    axiosClient.get(`/hotels/${hotelId}/services`),
                    axiosClient.get('/promotions/active')
                ]);
                const hotelData = hotelRes.data.data;
                setHotel(hotelData);
                setRoom(hotelData.room_types.find(r => r.id.toString() === roomId));
                if (servicesRes.data?.data) setAvailableServices(servicesRes.data.data);
                if (promosRes.data?.data) setAllPromos(promosRes.data.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchData();
    }, [hotelId, roomId]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // --------------------------------------------------
    // ĐÃ FIX: TRÌNH TỰ TÍNH TOÁN CHUẨN HOÁ
    // --------------------------------------------------
    const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000));
    const roomPrice = room ? Number(room.base_price) * nights * urlRooms : 0;
    const taxes = roomPrice * 0.1;
    const servicesTotalCost = selectedServices.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    // Tính Giá trị để so sánh mức đơn tối thiểu (Sàn tính trên Giá gốc, KS tính trên Giá sau khi đã trừ Sàn)
    const roomPriceForGlobal = roomPrice;
    const roomPriceForHotel = roomPrice - (globalPromo ? Number(globalPromo.discount_amount) : 0);

    const discountGlobal = globalPromo ? Number(globalPromo.discount_amount) : 0;
    const discountHotel = hotelPromo ? Number(hotelPromo.discount_amount) : 0;
    const totalDiscountAmount = discountGlobal + discountHotel;

    const rawTotal = roomPrice + taxes + servicesTotalCost - totalDiscountAmount;
    const totalPrice = Math.max(0, Math.round(rawTotal));
    // --------------------------------------------------

    const handleToggleService = (service) => {
        const isExist = selectedServices.find(s => s.id === service.id);
        if (isExist) setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        else setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
    };

    const updateServiceQty = (e, serviceId, delta) => {
        e.stopPropagation();
        setSelectedServices(prev => prev.map(s => {
            if (s.id === serviceId) return { ...s, quantity: Math.max(1, s.quantity + delta) };
            return s;
        }));
    };

    const selectPromo = async (code, isManual = false) => {
        setIsPromoModalOpen(false);
        Swal.fire({ title: 'Đang kiểm tra mã...', didOpen: () => Swal.showLoading() });

        try {
            const response = await axiosClient.post('/customer/promotions/check', { code: code, hotel_id: hotelId, subtotal: roomPrice });
            const data = response.data;

            if (data.type === 'global') {
                setGlobalPromo({ code: code, discount_amount: data.discount_amount });
            } else {
                const effectivePrice = roomPrice - (globalPromo ? Number(globalPromo.discount_amount) : 0);
                if (data.promo_data.min_booking_value > effectivePrice) {
                    Swal.fire({ icon: 'warning', title: 'Không đủ điều kiện', text: `Giá phòng tạm tính không đủ ${formatPrice(data.promo_data.min_booking_value)} để áp dụng mã Khách sạn này.` });
                    return;
                }
                setHotelPromo({ code: code, discount_amount: data.discount_amount });
            }
            Swal.fire({ icon: 'success', title: 'Áp dụng mã thành công!', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Rất tiếc...', text: error.response?.data?.message || 'Mã không hợp lệ.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { Swal.fire({ icon: 'warning', title: 'Chưa đăng nhập', text: 'Vui lòng đăng nhập!' }).then(res => { if (res.isConfirmed) navigate('/login'); }); return; }
        if (!contactName || !contactPhone) { Swal.fire({ icon: 'warning', text: 'Vui lòng điền đủ thông tin liên hệ.' }); return; }

        const payload = {
            hotel_id: hotelId, room_type_id: roomId, check_in: checkInDate, check_out: checkOutDate, rooms_count: urlRooms,
            guest_name: isBookingForSelf ? contactName : guestName, guest_phone: contactPhone, guest_email: contactEmail, note: otherRequest,
            services: selectedServices.map(s => ({ id: s.id, quantity: s.quantity })),
            global_promotion_code: globalPromo ? globalPromo.code : null,
            hotel_promotion_code: hotelPromo ? hotelPromo.code : null
        };

        Swal.fire({ title: 'Đang xử lý đơn hàng...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const response = await axiosClient.post('/customer/bookings', payload);
            if (response.data?.booking_code) {
                Swal.fire({ icon: 'success', title: 'Tuyệt vời!', text: 'Mã đơn của bạn là: ' + response.data.booking_code, allowOutsideClick: false }).then(() => navigate('/orders'));
            }
        } catch (error) { Swal.fire({ icon: 'error', title: 'Thất bại', text: error.response?.data?.message || 'Có lỗi xảy ra.' }); }
    };

    if (loading) return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h3>Đang tải...</h3></div>;
    if (!hotel || !room) return <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h3 color="#ef4444">Lỗi thông tin.</h3></div>;

    return (
        <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container">
                <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 'bold' }}>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle2 size={18} /> Chi tiết đặt phòng</span>
                    <span style={{ color: '#cbd5e1' }}>—</span> <span style={{ color: '#cbd5e1' }}>Thanh toán</span>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        {!user && (
                            <div className="login-banner">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e40af', fontSize: '14px', fontWeight: '500' }}><UserCircle size={20} /> Đăng nhập để nhận ưu đãi!</div>
                                <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>Đăng nhập</Link>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="checkout-card">
                                <h3 className="checkout-title"><UserCircle size={22} color="#dfa974" /> Liên hệ đặt chỗ</h3>
                                <div className="row mb-3 mt-3">
                                    <div className="col-md-12 mb-3"><label className="form-label">Họ tên *</label><input type="text" className="form-control-custom" value={contactName} onChange={e => setContactName(e.target.value)} required /></div>
                                    <div className="col-md-6"><label className="form-label">Điện thoại *</label><input type="tel" className="form-control-custom" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required /></div>
                                    <div className="col-md-6"><label className="form-label">Email *</label><input type="email" className="form-control-custom" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required /></div>
                                </div>
                                <hr />
                                <label className="req-checkbox mb-0"><input type="checkbox" checked={isBookingForSelf} onChange={e => setIsBookingForSelf(e.target.checked)} /> Tôi là khách lưu trú</label>
                            </div>

                            {!isBookingForSelf && (
                                <div className="checkout-card">
                                    <h3 className="checkout-title"><Users size={22} color="#dfa974" /> Tên khách nhận phòng</h3>
                                    <input type="text" className="form-control-custom mt-3" value={guestName} onChange={e => setGuestName(e.target.value)} required />
                                </div>
                            )}

                            <div className="checkout-card">
                                <h3 className="checkout-title"><PlusCircle size={22} color="#dfa974" /> Dịch vụ đi kèm</h3>
                                <div className="services-list">
                                    {availableServices.map((service) => {
                                        const srvObj = selectedServices.find(s => s.id === service.id);
                                        const isSelected = !!srvObj;
                                        return (
                                            <div key={service.id} className={`service-item ${isSelected ? 'active' : ''}`} onClick={() => handleToggleService(service)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <input type="checkbox" checked={isSelected} readOnly className="custom-checkbox" />
                                                    <div>
                                                        <div style={{ fontWeight: isSelected ? 'bold' : 'normal', color: '#1e293b' }}>{service.name}</div>
                                                        <div style={{ fontSize: '13px', color: '#ea580c', fontWeight: 'bold' }}>+ {formatPrice(service.price)} / Lượt</div>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="qty-control" onClick={e => e.stopPropagation()}>
                                                        <button type="button" className="btn-qty" onClick={(e) => updateServiceQty(e, service.id, -1)}><Minus size={14} /></button>
                                                        <span className="qty-num">{srvObj.quantity}</span>
                                                        <button type="button" className="btn-qty" onClick={(e) => updateServiceQty(e, service.id, 1)}><Plus size={14} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="checkout-card">
                                <h3 className="checkout-title"><Info size={22} color="#dfa974" /> Yêu cầu đặc biệt</h3>
                                <textarea className="form-control-custom" rows="3" value={otherRequest} onChange={e => setOtherRequest(e.target.value)}></textarea>
                            </div>
                        </form>
                    </div>

                    <div className="col-lg-4">
                        <div className="summary-sticky">
                            <div className="checkout-card" style={{ padding: '20px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>{hotel.name}</h4>

                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', color: '#888' }}>Nhận phòng</div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{checkInDate}</div>
                                    </div>
                                    <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', color: '#888' }}>Trả phòng</div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{checkOutDate}</div>
                                    </div>
                                </div>

                                <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '15px' }}>
                                    <h5 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1e293b' }}>{room.name}</h5>
                                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users size={14} />
                                            {searchParams.get('adults') || room.max_adults || 2} Người lớn
                                            {Number(searchParams.get('children')) > 0 ? `, ${searchParams.get('children')} Trẻ em` : ''}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Tag size={14} /> {urlRooms} Phòng x {nights} Đêm
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-card" style={{ padding: '20px' }}>
                                <h3 className="checkout-title" style={{ marginBottom: '20px' }}>Chi tiết giá</h3>
                                <div className="price-row"><span>Giá phòng</span><span className="fw-bold text-dark">{formatPrice(roomPrice)}</span></div>

                                {selectedServices.map(srv => (
                                    <div key={srv.id} className="price-row text-primary"><span>+ {srv.name} (x{srv.quantity})</span><span>{formatPrice(srv.price * srv.quantity)}</span></div>
                                ))}
                                <div className="price-row"><span>Thuế (10%)</span><span className="fw-bold text-dark">{formatPrice(taxes)}</span></div>

                                <div style={{ marginTop: '20px', borderTop: '1px dashed #e2e8f0', paddingTop: '20px' }}>
                                    {globalPromo && (
                                        <div className="applied-promo-box mb-2">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 'bold', fontSize: '13px' }}>
                                                <Ticket size={16} /> Hiroto: {globalPromo.code}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '13px' }}>- {formatPrice(globalPromo.discount_amount)}</span>
                                                <button type="button" onClick={() => setGlobalPromo(null)} className="btn-remove-promo">Hủy</button>
                                            </div>
                                        </div>
                                    )}

                                    {hotelPromo && (
                                        <div className="applied-promo-box mb-2" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#d97706' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                                                <Building2 size={16} /> KS: {hotelPromo.code}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>- {formatPrice(hotelPromo.discount_amount)}</span>
                                                <button type="button" onClick={() => setHotelPromo(null)} className="btn-remove-promo">Hủy</button>
                                            </div>
                                        </div>
                                    )}

                                    <button type="button" onClick={() => setIsPromoModalOpen(true)} className="btn-open-promo">
                                        <Tag size={18} /> Chọn Voucher Khuyến Mãi
                                    </button>
                                </div>

                                <div className="price-total" style={{ marginTop: '20px', alignItems: 'flex-end' }}>
                                    <span style={{ color: '#1e293b', fontSize: '18px' }}>Tổng cộng</span>
                                    <div style={{ textAlign: 'right' }}>
                                        {totalDiscountAmount > 0 && <div className="old-price-strike">{formatPrice(roomPrice + taxes + servicesTotalCost)}</div>}
                                        <span style={{ color: '#e11d48', fontSize: '24px', display: 'block' }}>{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                                <button onClick={handleSubmit} className="primary-btn border-0 w-100 mt-3" style={{ padding: '14px', borderRadius: '8px' }}>Tiếp tục thanh toán</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isPromoModalOpen && (
                <div className="promo-modal-overlay" onClick={() => setIsPromoModalOpen(false)}>
                    <div className="promo-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="promo-modal-header">
                            <h4 className="m-0 fw-bold">Mã Ưu Đãi</h4>
                            <button className="btn-close-modal" onClick={() => setIsPromoModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="promo-modal-body">
                            <div className="manual-promo-input">
                                <input type="text" placeholder="Nhập mã..." id="manualCodeInput" style={{ textTransform: 'uppercase' }} />
                                <button onClick={() => selectPromo(document.getElementById('manualCodeInput').value, true)}>Áp dụng</button>
                            </div>

                            <div className="promo-list">
                                {allPromos.global?.length > 0 && <div className="promo-group-title">Mã từ Sàn Hiroto</div>}
                                {allPromos.global?.map(p => {
                                    const isDisabled = p.min_booking_value > roomPriceForGlobal;
                                    return (
                                        <div key={p.id} className={`promo-ticket-item ${isDisabled ? 'disabled-promo' : ''}`} style={isDisabled ? { cursor: 'not-allowed' } : {}}>
                                            <div className="promo-ticket-left">
                                                <span className="promo-ticket-value">{p.discount_type === 1 ? `${p.discount_value}%` : formatPrice(p.discount_value)}</span>
                                            </div>
                                            <div className="promo-ticket-right">
                                                <b className="d-block text-dark">{p.code}</b>
                                                {isDisabled ? (
                                                    <span className="disabled-reason d-block">Cần thêm {formatPrice(p.min_booking_value - roomPriceForGlobal)} để dùng</span>
                                                ) : (
                                                    <span className="text-muted d-block" style={{ fontSize: '12px' }}>Đơn tối thiểu {formatPrice(p.min_booking_value)}</span>
                                                )}
                                                <button disabled={isDisabled} onClick={() => selectPromo(p.code)} className="btn-use-promo">Dùng mã</button>
                                            </div>
                                        </div>
                                    )
                                })}

                                {allPromos.hotels?.length > 0 && <div className="promo-group-title mt-4">Mã từ Khách sạn này</div>}
                                {allPromos.hotels?.filter(h => h.hotel_id === Number(hotelId)).map(p => {
                                    const isDisabled = p.min_booking_value > roomPriceForHotel;
                                    return (
                                        <div key={p.id} className={`promo-ticket-item hotel-promo ${isDisabled ? 'disabled-promo' : ''}`} style={isDisabled ? { cursor: 'not-allowed' } : {}}>
                                            <div className="promo-ticket-left">
                                                <span className="promo-ticket-value">{p.discount_type === 1 ? `${p.discount_value}%` : formatPrice(p.discount_value)}</span>
                                            </div>
                                            <div className="promo-ticket-right">
                                                <b className="d-block text-dark">{p.code}</b>
                                                {isDisabled ? (
                                                    <span className="disabled-reason d-block">Giá sau mã Sàn không đủ {formatPrice(p.min_booking_value)}</span>
                                                ) : (
                                                    <span className="text-muted d-block" style={{ fontSize: '12px' }}>Đơn tối thiểu {formatPrice(p.min_booking_value)}</span>
                                                )}
                                                <button disabled={isDisabled} onClick={() => selectPromo(p.code)} className="btn-use-promo">Dùng mã</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;