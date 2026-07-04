import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Users, Building, ChevronDown, Plus, Minus } from 'lucide-react';

const todayISODate = () => new Date().toISOString().split('T')[0];
const addDaysISODate = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

export default function SearchWidget({ variant = 'home', hideDestination = false, onSearch }) {
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

    // 👉 FIX LỖI "QUÊN DỮ LIỆU": Ép Widget luôn cập nhật theo URL hiện tại
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

    useEffect(() => {
        if (!hideDestination) {
            fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
                .then(res => res.json())
                .then(res => { if (res.error === 0) setProvinces(res.data); })
                .catch(err => console.error('Lỗi API Tỉnh thành:', err));
        }
    }, [hideDestination]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!hideDestination && !destination.trim() && !hotelName.trim()) {
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

    const inputStyle = {
        border: 'none', width: '100%', outline: 'none', background: 'transparent',
        fontSize: '14.5px', color: '#1e293b', fontWeight: '500', padding: '5px 0', cursor: 'pointer'
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
        return (
            <div className="position-relative z-index-10 mt-4" style={{ overflow: 'visible' }}>
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-pill shadow-lg p-2 d-flex flex-column flex-lg-row align-items-center mx-auto"
                    style={{ maxWidth: '1150px', border: '4px solid rgba(255,255,255,0.2)', backgroundClip: 'padding-box', overflow: 'visible' }}
                >
                    {!hideDestination && (
                        <>
                            <div className="flex-fill px-3 py-2 border-end-lg w-100">
                                <label style={labelStyle}><MapPin size={14} className="me-1 text-primary" /> Điểm đến</label>
                                <input type="text" style={inputStyle} placeholder="Bạn muốn đi đâu?" list="provinceList" value={destination} onChange={(e) => setDestination(e.target.value)} autoComplete="off" />
                                <datalist id="provinceList">{provinces.map((p) => <option key={p.id} value={p.full_name} />)}</datalist>
                            </div>
                            <div className="flex-fill px-3 py-2 border-end-lg w-100 border-start-0 mt-2 mt-lg-0 border-top border-top-lg-0">
                                <label style={labelStyle}><Building size={14} className="me-1 text-primary" /> Khách sạn</label>
                                <input type="text" style={inputStyle} placeholder="Nhập tên khách sạn..." value={hotelName} onChange={(e) => setHotelName(e.target.value)} autoComplete="off" />
                            </div>
                        </>
                    )}

                    <div className="flex-fill px-3 py-2 border-end-lg w-100 border-start-0 mt-2 mt-lg-0 border-top border-top-lg-0">
                        <label style={labelStyle}><CalendarDays size={14} className="me-1 text-primary" /> Nhận phòng</label>
                        <input type="date" style={inputStyle} value={checkIn} min={todayISODate()} onChange={(e) => setCheckIn(e.target.value)} />
                    </div>

                    <div className="flex-fill px-3 py-2 border-end-lg w-100 border-start-0 mt-2 mt-lg-0 border-top border-top-lg-0">
                        <label style={labelStyle}><CalendarDays size={14} className="me-1 text-primary" /> Trả phòng</label>
                        <input type="date" style={inputStyle} value={checkOut} min={checkIn || todayISODate()} onChange={(e) => setCheckOut(e.target.value)} />
                    </div>

                    <div className="flex-fill px-3 py-2 w-100 border-start-0 mt-2 mt-lg-0 border-top border-top-lg-0 position-relative" ref={popupRef}>
                        <label style={labelStyle}><Users size={14} className="me-1 text-primary" /> Khách & Phòng</label>
                        <div onClick={() => setShowGuestPopup(!showGuestPopup)} style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{guestSummary}</span>
                            <ChevronDown size={16} color="#64748b" />
                        </div>

                        {showGuestPopup && (
                            <div className="position-absolute bg-white shadow-lg rounded p-3" style={{ top: '110%', left: 0, width: '320px', zIndex: 99999, border: '1px solid #e2e8f0' }}>
                                <GuestCounter label="Người lớn" subLabel="Từ 13 tuổi trở lên" count={adults} min={1} onDecrease={() => setAdults(Math.max(1, adults - 1))} onIncrease={() => setAdults(adults + 1)} />
                                <div className="border-bottom my-2"></div>
                                <GuestCounter label="Trẻ em" subLabel="Dưới 13 tuổi" count={children} min={0} onDecrease={() => setChildren(Math.max(0, children - 1))} onIncrease={() => setChildren(children + 1)} />
                                <div className="border-bottom my-2"></div>
                                <GuestCounter label="Phòng" count={rooms} min={1} onDecrease={() => setRooms(Math.max(1, rooms - 1))} onIncrease={() => setRooms(rooms + 1)} />

                                <button type="button" className="btn btn-primary w-100 mt-3 fw-bold" onClick={() => setShowGuestPopup(false)}>Áp dụng</button>
                            </div>
                        )}
                    </div>

                    <div className="px-2 w-100 w-lg-auto mt-3 mt-lg-0">
                        <button type="submit" className="btn btn-warning rounded-pill fw-bold text-dark w-100" style={{ padding: '12px 25px', fontSize: '15px', whiteSpace: 'nowrap' }}>
                            <Search size={18} className="me-2" /> TÌM PHÒNG
                        </button>
                    </div>
                </form>

                {error && <div className="text-center mt-3"><span className="badge bg-danger p-2" style={{ fontSize: '14px' }}>{error}</span></div>}
            </div>
        );
    }

    return (
        <div className="bg-white p-3 rounded shadow-sm border d-flex flex-wrap align-items-end gap-2 mt-n4 position-relative z-index-10" style={{ overflow: 'visible' }}>
            {!hideDestination && (
                <>
                    <div className="flex-grow-1" style={{ minWidth: '130px' }}>
                        <label style={labelStyle}>Điểm đến</label>
                        <input type="text" className="form-control bg-light" list="provinceListMini" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Tỉnh/Thành..." />
                        <datalist id="provinceListMini">{provinces.map((p) => <option key={p.id} value={p.full_name} />)}</datalist>
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: '130px' }}>
                        <label style={labelStyle}>Tên khách sạn</label>
                        <input type="text" className="form-control bg-light" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Tên khách sạn..." />
                    </div>
                </>
            )}
            <div className="flex-grow-1" style={{ minWidth: '130px' }}>
                <label style={labelStyle}>Nhận phòng</label>
                <input type="date" className="form-control bg-light" value={checkIn} min={todayISODate()} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="flex-grow-1" style={{ minWidth: '130px' }}>
                <label style={labelStyle}>Trả phòng</label>
                <input type="date" className="form-control bg-light" value={checkOut} min={checkIn || todayISODate()} onChange={(e) => setCheckOut(e.target.value)} />
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