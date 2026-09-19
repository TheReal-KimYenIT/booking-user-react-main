import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { UserCircle, CheckCircle2, Tag, PlusCircle, X, Ticket, Minus, Plus, Building2, Users, Info, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

import axiosClient from '../../api/axiosClient';
import customerApi from '../../api/customerApi';
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

    const [paymentMethod, setPaymentMethod] = useState('vnpay');

    const [contactName, setContactName] = useState(user ? `${user.last_name || ''} ${user.first_name || ''}`.trim() : '');
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    const [contactPhone, setContactPhone] = useState(user?.phone || '');
    const [isBookingForSelf, setIsBookingForSelf] = useState(true);

    const [guestName, setGuestName] = useState('');
    const [otherRequest, setOtherRequest] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);

    const [globalPromo, setGlobalPromo] = useState(null);
    const [hotelPromo, setHotelPromo] = useState(null);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [allPromos, setAllPromos] = useState({ global: [], hotels: [] });

    // Biến lưu % VAT từ hệ thống
    const [systemVatRate, setSystemVatRate] = useState(10);

    const checkInDate = searchParams.get('checkIn') || todayISODate();
    const checkOutDate = searchParams.get('checkOut') || addDaysISODate(todayISODate(), 1);
    const urlRooms = Number(searchParams.get('rooms')) || 1;

    useEffect(() => { 
        window.scrollTo(0, 0); 
        const handlePageShow = (e) => {
            if (e.persisted) {
                Swal.close();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    useEffect(() => { 
        if (user) { 
            setContactName(`${user.last_name || ''} ${user.first_name || ''}`.trim()); 
            setContactEmail(user.email || ''); 
            setContactPhone(user.phone || ''); 
        } 
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!hotelId || !roomId) { setLoading(false); return; }
            try {
                // Tải thông tin khách sạn kèm ngày nhận/trả phòng và số phòng để lấy giá động chính xác
                const [hotelRes, servicesRes, promosRes, settingsRes] = await Promise.all([
                    axiosClient.get(`/hotels/${hotelId}?checkIn=${checkInDate}&checkOut=${checkOutDate}&rooms=${urlRooms}`),
                    axiosClient.get(`/hotels/${hotelId}/services`),
                    axiosClient.get('/promotions/active'),
                    axiosClient.get('/system-settings') // Lấy VAT hiện tại
                ]);

                const hotelData = hotelRes.data?.data || hotelRes.data;
                setHotel(hotelData);
                setRoom(hotelData.room_types?.find(r => r.id.toString() === roomId));
                if (servicesRes.data?.data) setAvailableServices(servicesRes.data.data);

                const pData = promosRes.data?.data || promosRes.data;
                if (pData) {
                    setAllPromos({ global: pData.global || [], hotels: pData.hotels || [] });
                }

                // Setup VAT từ Backend trả về
                if (settingsRes.data?.data?.vat_rate !== undefined) {
                    setSystemVatRate(Number(settingsRes.data.data.vat_rate));
                }

            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchData();
    }, [hotelId, roomId, checkInDate, checkOutDate, urlRooms]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000));
    const unitDailyPrice = room ? (room.daily_price || room.base_price) : 0;
    const roomPrice = room ? (room.stay_total ? Number(room.stay_total) * urlRooms : Number(unitDailyPrice) * nights * urlRooms) : 0;
    const servicesTotalCost = selectedServices.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    const roomPriceForGlobal = roomPrice;
    const roomPriceForHotel = roomPrice - (globalPromo ? Number(globalPromo.discount_amount) : 0);

    const discountGlobal = globalPromo ? Number(globalPromo.discount_amount) : 0;
    const discountHotel = hotelPromo ? Number(hotelPromo.discount_amount) : 0;
    const totalDiscountAmount = discountGlobal + discountHotel;

    // Tính toán VAT theo công thức: (Phòng + Dịch vụ - Khuyến mãi) * VAT %
    const taxableAmount = Math.max(0, roomPrice + servicesTotalCost - totalDiscountAmount);
    const taxes = taxableAmount * (systemVatRate / 100);

    const rawTotal = taxableAmount + taxes;
    const totalPrice = Math.max(0, Math.round(rawTotal));

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

    const selectPromo = async (code) => {
        if (!code || code.trim() === '') {
            Swal.fire({ icon: 'warning', text: 'Vui lòng nhập mã khuyến mãi!' });
            return;
        }

        setIsPromoModalOpen(false);
        Swal.fire({ title: 'Đang kiểm tra mã...', didOpen: () => Swal.showLoading() });

        try {
            const response = await axiosClient.post('/customer/promotions/check', { code: code.trim(), hotel_id: hotelId, subtotal: roomPrice });
            const data = response.data;

            if (data.type === 'global') {
                setGlobalPromo({ code: data.promo_data.code, discount_amount: data.discount_amount });
            } else {
                setHotelPromo({ code: data.promo_data.code, discount_amount: data.discount_amount });
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
                const newBookingId = response.data.booking_id || response.data.data?.id;

                if (paymentMethod === 'vnpay') {
                    if (!newBookingId) {
                        Swal.fire('Lỗi', 'Hệ thống không trả về ID đơn hàng, vui lòng kiểm tra Backend', 'error');
                        return;
                    }
                    const paymentRes = await customerApi.createVnpayPayment({ booking_id: newBookingId });
                    Swal.close();
                    window.location.href = paymentRes.data.payment_url;
                } else {
                    Swal.fire({ icon: 'success', title: 'Tuyệt vời!', text: 'Mã đơn của bạn là: ' + response.data.booking_code, allowOutsideClick: false }).then(() => navigate('/customer/my-bookings'));
                }
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Thất bại', text: error.response?.data?.message || 'Có lỗi xảy ra.' });
        }
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

                            <div className="checkout-card">
                                <h3 className="checkout-title" style={{ marginBottom: '15px' }}>
                                    <CreditCard size={22} color="#dfa974" /> Phương thức thanh toán
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', border: paymentMethod === 'vnpay' ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '8px', background: paymentMethod === 'vnpay' ? '#eff6ff' : '#fff' }}>
                                        <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} style={{ width: '18px', height: '18px' }} />
                                        <img src="https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAYQR-update.png" alt="VNPAY" style={{ height: '24px' }} />
                                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>Thanh toán trực tuyến an toàn qua VNPAY</span>
                                    </label>
                                </div>
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

                                {/* Hiển thị % VAT */}
                                <div className="price-row"><span>Thuế ({systemVatRate}%)</span><span className="fw-bold text-dark">{formatPrice(taxes)}</span></div>

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
                                        <span style={{ color: '#1e293b', fontSize: '20px', display: 'block', fontWeight: 'bold' }}>{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                                
                                <div className="price-total" style={{ marginTop: '15px', alignItems: 'flex-end', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
                                    <div>
                                        <span style={{ color: '#e11d48', fontSize: '18px', fontWeight: 'bold', display: 'block' }}>Tiền cọc cần thanh toán</span>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>Bắt buộc cọc 50% để giữ phòng</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ color: '#e11d48', fontSize: '26px', display: 'block', fontWeight: 'bold' }}>{formatPrice(totalPrice / 2)}</span>
                                    </div>
                                </div>
                                <button onClick={handleSubmit} className="primary-btn border-0 w-100 mt-3" style={{ padding: '14px', borderRadius: '8px' }}>
                                    {paymentMethod === 'vnpay' ? 'Thanh toán ngay' : 'Hoàn tất đặt phòng'}
                                </button>
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
                                <button onClick={() => selectPromo(document.getElementById('manualCodeInput').value)}>Áp dụng</button>
                            </div>

                            <div className="promo-list mt-4">
                                {allPromos.global?.length > 0 && <div className="promo-group-title">Mã từ Sàn Hiroto</div>}
                                {allPromos.global?.map(p => {
                                    const isExhausted = p.is_exhausted === true;
                                    const isDisabled = p.min_booking_value > roomPriceForGlobal || isExhausted;
                                    return (
                                        <div key={p.id} className={`promo-ticket-item ${isDisabled ? 'disabled-promo' : ''}`} style={isDisabled ? { cursor: 'not-allowed', opacity: 0.6 } : {}}>
                                            <div className="promo-ticket-left">
                                                <span className="promo-ticket-value">{p.discount_type === 1 ? `${p.discount_value}%` : formatPrice(p.discount_value)}</span>
                                            </div>
                                            <div className="promo-ticket-right">
                                                <b className="d-block text-dark">{p.code}</b>
                                                {isExhausted ? (
                                                    <span className="disabled-reason d-block text-danger" style={{ fontSize: '12px' }}>Đã dùng hết lượt</span>
                                                ) : isDisabled ? (
                                                    <span className="disabled-reason d-block text-danger" style={{ fontSize: '12px' }}>Cần thêm {formatPrice(p.min_booking_value - roomPriceForGlobal)} để dùng</span>
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
                                    const isExhausted = p.is_exhausted === true;
                                    const isDisabled = p.min_booking_value > roomPriceForHotel || isExhausted;
                                    return (
                                        <div key={p.id} className={`promo-ticket-item hotel-promo ${isDisabled ? 'disabled-promo' : ''}`} style={isDisabled ? { cursor: 'not-allowed', opacity: 0.6 } : {}}>
                                            <div className="promo-ticket-left">
                                                <span className="promo-ticket-value">{p.discount_type === 1 ? `${p.discount_value}%` : formatPrice(p.discount_value)}</span>
                                            </div>
                                            <div className="promo-ticket-right">
                                                <b className="d-block text-dark">{p.code}</b>
                                                {isExhausted ? (
                                                    <span className="disabled-reason d-block text-danger" style={{ fontSize: '12px' }}>Đã dùng hết lượt</span>
                                                ) : isDisabled ? (
                                                    <span className="disabled-reason d-block text-danger" style={{ fontSize: '12px' }}>Giá sau mã Sàn không đủ {formatPrice(p.min_booking_value)}</span>
                                                ) : (
                                                    <span className="text-muted d-block" style={{ fontSize: '12px' }}>Đơn tối thiểu {formatPrice(p.min_booking_value)}</span>
                                                )}
                                                <button disabled={isDisabled} onClick={() => selectPromo(p.code)} className="btn-use-promo">Dùng mã</button>
                                            </div>
                                        </div>
                                    )
                                })}

                                {(!allPromos.global?.length && !allPromos.hotels?.length) && (
                                    <div className="text-center text-muted fst-italic mt-3">Hiện không có mã ưu đãi nào đang diễn ra.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;