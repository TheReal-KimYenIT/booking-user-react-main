import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Users, Building, ChevronDown, Plus, Minus } from 'lucide-react';

const todayISODate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const addDaysISODate = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function SearchWidget({ variant = 'home', hideDestination = false, onSearch }) {
    // Widget tìm phòng dùng ở trang chủ và trang danh sách khách sạn
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const [hotelName, setHotelName] = useState(searchParams.get('hotelName') || '');
    const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || todayISODate());
    const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || addDaysISODate(todayISODate(), 1));

    const [adults, setAdults] = useState(Number(searchParams.get('adults')) || 2);
    const [children, setChildren] = useState(Number(searchParams.get('children')) || 0);
    const [rooms, setRooms] = useState(Number(searchParams.get('rooms')) || 1);

    const [showGuestPopup, setShowGuestPopup] = useState(false);
    const popupRef = useRef(null);

    const [provinces, setProvinces] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        setDestination(searchParams.get('destination') || '');
        setHotelName(searchParams.get('hotelName') || '');
        setCheckIn(searchParams.get('checkIn') || todayISODate());
        setCheckOut(searchParams.get('checkOut') || addDaysISODate(todayISODate(), 1));
        setAdults(Number(searchParams.get('adults')) || 2);
        setChildren(Number(searchParams.get('children')) || 0);
        setRooms(Number(searchParams.get('rooms')) || 1);
    }, [searchParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowGuestPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cập nhật API lấy Tỉnh/Thành phố sang nguồn mới
    useEffect(() => {
        if (!hideDestination) {
            fetch('https://provinces.open-api.vn/api/p/')
                .then(res => res.json())
                .then(res => {
                    // API mới trả về mảng trực tiếp, lưu thẳng vào state
                    setProvinces(res);
                })
                .catch(err => console.error('Lỗi API Tỉnh thành:', err));
        }
    }, [hideDestination]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (variant === 'home' && !hideDestination && !destination.trim() && !hotelName.trim()) {
            setError('Vui lòng nhập Điểm đến hoặc Tên khách sạn.');
            return;
        }
        if (new Date(checkOut) <= new Date(checkIn)) {
            setError('Ngày trả phòng phải diễn ra sau ngày nhận phòng.');
            return;
        }

        const searchData = { destination, hotelName, checkIn, checkOut, adults, children, rooms };

        if (!hotelName.trim()) delete searchData.hotelName;
        if (!destination.trim()) delete searchData.destination;

        if (onSearch) {
            onSearch(searchData);
        } else {
            const q = new URLSearchParams(searchData);
            navigate(`/hotels?${q.toString()}`);
        }
    };
    ////-----------------------------------------em thêm cái đây-----------------------------------------------
    // Xử lý thông minh khi người dùng đổi ngày nhận phòng
    const handleCheckInChange = (e) => {
        const newCheckIn = e.target.value;
        setCheckIn(newCheckIn);

        // Nếu ngày nhận phòng mới >= ngày trả phòng hiện tại, tự động đẩy ngày trả phòng lên 1 ngày
        if (new Date(checkOut) <= new Date(newCheckIn)) {
            setCheckOut(addDaysISODate(newCheckIn, 1));
        }
    };

    const labelStyle = { fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '2px', display: 'block' };

    const GuestCounter = ({ label, subLabel, count, onDecrease, onIncrease, min }) => (
        <div className="d-flex justify-content-between align-items-center py-2">
            <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b' }}>{label}</div>
                {subLabel && <div style={{ fontSize: '12px', color: '#64748b' }}>{subLabel}</div>}
            </div>
            <div className="d-flex align-items-center gap-3">
                <button type="button" onClick={onDecrease} disabled={count <= min}
                    className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', padding: 0 }}>
                    <Minus size={16} />
                </button>
                <span style={{ fontWeight: 'bold', fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{count}</span>
                <button type="button" onClick={onIncrease}
                    className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px', padding: 0 }}>
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );

    const guestSummary = `${adults} Người lớn, ${children > 0 ? children + ' Trẻ em, ' : ''}${rooms} Phòng`;

    if (variant === 'home') {
        const calculateNights = (inDate, outDate) => {
            if (!inDate || !outDate) return 1;
            const start = new Date(inDate);
            const end = new Date(outDate);
            const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
            return diff > 0 ? diff : 1;
        };

        const nights = calculateNights(checkIn, checkOut);

        const handleTrendClick = (dest) => {
            setDestination(dest);
            const searchData = { destination: dest, checkIn, checkOut, adults, children, rooms };
            const q = new URLSearchParams(searchData);
            navigate(`/hotels?${q.toString()}`);
        };

        return (
            <div className="home-search-widget-wrapper">
                <form onSubmit={handleSubmit} className="home-search-card">
                    <div className="home-search-fields-grid">
                        {/* 1. Điểm đến */}
                        {!hideDestination && (
                            <div className="home-search-col destination-col">
                                <div className="home-field-icon bg-amber-soft">
                                    <MapPin size={18} color="#d97706" />
                                </div>
                                <div className="home-field-info">
                                    <label className="home-field-label">ĐIỂM ĐẾN</label>
                                    <input
                                        type="text"
                                        className="home-field-input"
                                        placeholder="Tỉnh, thành phố..."
                                        list="homeProvinceList"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        autoComplete="off"
                                    />
                                    <datalist id="homeProvinceList">
                                        {provinces.map((p) => (
                                            <option key={p.code} value={p.name} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                        )}

                        {/* 2. Tên khách sạn */}
                        {!hideDestination && (
                            <div className="home-search-col hotel-col">
                                <div className="home-field-icon bg-blue-soft">
                                    <Building size={18} color="#2563eb" />
                                </div>
                                <div className="home-field-info">
                                    <label className="home-field-label">KHÁCH SẠN</label>
                                    <input
                                        type="text"
                                        className="home-field-input"
                                        placeholder="Tên khách sạn..."
                                        value={hotelName}
                                        onChange={(e) => setHotelName(e.target.value)}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 3. Ngày nhận & trả phòng */}
                        <div className="home-search-col dates-col">
                            <div className="home-field-icon bg-emerald-soft">
                                <CalendarDays size={18} color="#059669" />
                            </div>
                            <div className="home-field-info">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="home-field-label mb-0">NHẬN - TRẢ PHÒNG</label>
                                    <span className="home-nights-chip">{nights} đêm</span>
                                </div>
                                <div className="home-dates-inputs">
                                    <input
                                        type="date"
                                        className="home-date-val"
                                        value={checkIn}
                                        min={todayISODate()}
                                        onChange={handleCheckInChange}
                                        title="Ngày nhận phòng"
                                    />
                                    <span className="home-date-arrow">→</span>
                                    <input
                                        type="date"
                                        className="home-date-val"
                                        value={checkOut}
                                        min={checkIn ? addDaysISODate(checkIn, 1) : addDaysISODate(todayISODate(), 1)}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        title="Ngày trả phòng"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Khách & Phòng */}
                        <div className="home-search-col guests-col position-relative" ref={popupRef}>
                            <div className="home-field-icon bg-purple-soft">
                                <Users size={18} color="#7c3aed" />
                            </div>
                            <div className="home-field-info" onClick={() => setShowGuestPopup(!showGuestPopup)} style={{ cursor: 'pointer' }}>
                                <label className="home-field-label">KHÁCH & PHÒNG</label>
                                <div className="home-guest-trigger">
                                    <span className="home-guest-text">{guestSummary}</span>
                                    <ChevronDown size={14} color="#64748b" />
                                </div>
                            </div>

                            {showGuestPopup && (
                                <div className="home-guest-dropdown">
                                    <GuestCounter label="Người lớn" subLabel="Từ 13 tuổi trở lên" count={adults} min={1} onDecrease={() => setAdults(Math.max(1, adults - 1))} onIncrease={() => setAdults(adults + 1)} />
                                    <div className="border-bottom my-2"></div>
                                    <GuestCounter label="Trẻ em" subLabel="Dưới 13 tuổi" count={children} min={0} onDecrease={() => setChildren(Math.max(0, children - 1))} onIncrease={() => setChildren(children + 1)} />
                                    <div className="border-bottom my-2"></div>
                                    <GuestCounter label="Phòng" count={rooms} min={1} onDecrease={() => setRooms(Math.max(1, rooms - 1))} onIncrease={() => setRooms(rooms + 1)} />
                                    <button type="button" className="btn-apply-guest-count" onClick={() => setShowGuestPopup(false)}>Áp dụng</button>
                                </div>
                            )}
                        </div>

                        {/* 5. Nút Tìm kiếm */}
                        <div className="home-search-btn-wrap">
                            <button type="submit" className="home-btn-submit">
                                <Search size={18} />
                                <span>TÌM PHÒNG</span>
                            </button>
                        </div>
                    </div>
                </form>

                {error && (
                    <div className="home-search-error-badge">
                        ⚠️ {error}
                    </div>
                )}

                {/* Điểm đến xu hướng gợi ý */}
                <div className="home-trending-tags">
                    <span className="home-trending-label">🔥 Xu hướng:</span>
                    {['Đà Nẵng', 'Đà Lạt', 'Nha Trang', 'Vũng Tàu', 'Hồ Chí Minh', 'Hà Nội', 'Phú Quốc'].map((dest) => (
                        <button
                            key={dest}
                            type="button"
                            className="home-trending-btn"
                            onClick={() => handleTrendClick(dest)}
                        >
                            {dest}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-3 rounded shadow-sm border d-flex flex-wrap align-items-end gap-2 position-relative z-index-10" style={{ overflow: 'visible' }}>
            {!hideDestination && (
                <>
                    <div className="flex-grow-1" style={{ minWidth: '130px' }}>
                        <label style={labelStyle}>Điểm đến</label>
                        <input type="text" className="form-control bg-light" list="provinceListMini" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Tỉnh/Thành..." />
                        {/* Thay đổi item.id thành p.code và item.full_name thành p.name */}
                        <datalist id="provinceListMini">{provinces.map((p) => <option key={p.code} value={p.name} />)}</datalist>
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: '130px' }}>
                        <label style={labelStyle}>Tên khách sạn</label>
                        <input type="text" className="form-control bg-light" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Tên khách sạn..." />
                    </div>
                </>
            )}
            <div className="flex-grow-1" style={{ minWidth: '130px' }}>
                <label style={labelStyle}>Nhận phòng</label>
                {/* Gọi hàm handleCheckInChange khi đổi ngày */}
                <input type="date" className="form-control bg-light" value={checkIn} min={todayISODate()} onChange={handleCheckInChange} />
            </div>
            <div className="flex-grow-1" style={{ minWidth: '130px' }}>
                <label style={labelStyle}>Trả phòng</label>
                {/* //-----------------------------------với sửa đây--------------------------- */}
                <input type="date" className="form-control bg-light" value={checkOut} min={checkIn ? addDaysISODate(checkIn, 1) : addDaysISODate(todayISODate(), 1)} onChange={(e) => setCheckOut(e.target.value)} />
            </div>

            <div className="flex-grow-1 position-relative" style={{ minWidth: '220px' }} ref={popupRef}>
                <label style={labelStyle}>Khách & Phòng</label>
                <div onClick={() => setShowGuestPopup(!showGuestPopup)} className="form-control bg-light d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{guestSummary}</span>
                    <ChevronDown size={16} />
                </div>
                {showGuestPopup && (
                    <div className="position-absolute bg-white shadow-lg rounded p-3" style={{ top: '100%', right: 0, width: '320px', zIndex: 99999, border: '1px solid #e2e8f0' }}>
                        <GuestCounter label="Người lớn" count={adults} min={1} onDecrease={() => setAdults(Math.max(1, adults - 1))} onIncrease={() => setAdults(adults + 1)} />
                        <div className="border-bottom my-2"></div>
                        <GuestCounter label="Trẻ em" count={children} min={0} onDecrease={() => setChildren(Math.max(0, children - 1))} onIncrease={() => setChildren(children + 1)} />
                        <div className="border-bottom my-2"></div>
                        <GuestCounter label="Phòng" count={rooms} min={1} onDecrease={() => setRooms(Math.max(1, rooms - 1))} onIncrease={() => setRooms(rooms + 1)} />
                        <button type="button" className="btn btn-primary w-100 mt-3 fw-bold" onClick={() => setShowGuestPopup(false)}>Áp dụng</button>
                    </div>
                )}
            </div>

            <div>
                <button onClick={handleSubmit} className="btn btn-warning fw-bold d-flex align-items-center gap-2 h-100 px-3 py-2">
                    <Search size={18} /> Tìm
                </button>
            </div>
            {error && <div className="w-100 text-danger small mt-1">{error}</div>}
        </div>
    );
}