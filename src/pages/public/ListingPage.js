import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Star, SlidersHorizontal, X, RotateCcw, Check, Coffee, ShieldCheck, BedDouble, Eye, Sparkles } from 'lucide-react';

import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import SearchWidget from '../../components/search/SearchWidget';
import HotelCard from '../../components/hotel/HotelCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatVnd } from '../../utils/booking';

import '../css/ListingPage.css';

export default function ListingPage() {
    // Trang danh sách khách sạn với bộ lọc đa tiêu chí, giá động và tối ưu Responsive
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // --- THAM SỐ CƠ BẢN TỪ URL ---
    const destination = searchParams.get('destination') || '';
    const hotelName = searchParams.get('hotelName') || '';
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';
    const adults = searchParams.get('adults') || '2';
    const children = searchParams.get('children') || '0';
    const rooms = searchParams.get('rooms') || '1';

    // Các tham số lọc phụ
    const rawStars = searchParams.get('stars') || '';
    const rawHotelAmenities = searchParams.get('hotel_amenities') || '';
    const rawRoomAmenities = searchParams.get('room_amenities') || '';
    const rawBedTypes = searchParams.get('bed_types') || '';
    const rawRoomViews = searchParams.get('room_views') || '';
    const rawHasBreakfast = searchParams.get('has_breakfast') || '';
    const rawFreeCancellation = searchParams.get('free_cancellation') || '';
    const rawPriceMin = searchParams.get('price_min') || '';
    const urlPriceMax = searchParams.get('price_max') || '10000000';

    const urlStars = rawStars ? rawStars.split(',').filter(Boolean) : [];
    const urlHotelAmenities = rawHotelAmenities ? rawHotelAmenities.split(',').filter(Boolean) : [];
    const urlRoomAmenities = rawRoomAmenities ? rawRoomAmenities.split(',').filter(Boolean) : [];
    const urlBedTypes = rawBedTypes ? rawBedTypes.split(',').filter(Boolean) : [];
    const urlRoomViews = rawRoomViews ? rawRoomViews.split(',').filter(Boolean) : [];

    const sortBy = searchParams.get('sort_by') || 'popular';
    const currentPage = parseInt(searchParams.get('page'), 10) || 1;

    // --- STATE LƯU TRỮ DỮ LIỆU ---
    const [list, setList] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [filterCategories, setFilterCategories] = useState({
        hotel_amenities: [],
        room_amenities: [],
        bed_types: [],
        room_views: []
    });

    // Local state cho thanh trượt giá nhằm tránh spam API liên tục khi kéo
    const [sliderPriceMax, setSliderPriceMax] = useState(urlPriceMax);

    // State điều khiển mở bộ lọc trên Mobile/Tablet
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const [toastMessage, setToastMessage] = useState('');
    const toastTimeoutRef = useRef(null);

    const destName = destination ? destination : 'Tất cả điểm đến';
    const querySuffix = `?${searchParams.toString()}`;

    // Đồng bộ slider khi URL thay đổi từ ngoài
    useEffect(() => {
        setSliderPriceMax(urlPriceMax);
    }, [urlPriceMax]);

    // 1. Lấy dữ liệu các Danh mục bộ lọc (Tiện ích KS, Tiện ích phòng, Loại giường, Hướng nhìn)
    useEffect(() => {
        axiosClient.get('/hotels/filters-data')
            .then(res => {
                const payload = res.data || res;
                if (payload && payload.data) {
                    setFilterCategories({
                        hotel_amenities: payload.data.hotel_amenities || [],
                        room_amenities: payload.data.room_amenities || [],
                        bed_types: payload.data.bed_types || [],
                        room_views: payload.data.room_views || []
                    });
                }
            })
            .catch(err => console.error("Lỗi lấy danh mục bộ lọc:", err));
    }, []);

    // 2. Lấy danh sách Khách sạn theo đầy đủ các tiêu chí lọc
    useEffect(() => {
        const fetchHotels = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get('/hotels/search', {
                    params: {
                        destination,
                        hotelName,
                        check_in: checkIn,
                        check_out: checkOut,
                        rooms: rooms || 1,
                        adults,
                        children,
                        stars: rawStars,
                        hotel_amenities: rawHotelAmenities,
                        room_amenities: rawRoomAmenities,
                        bed_types: rawBedTypes,
                        room_views: rawRoomViews,
                        has_breakfast: rawHasBreakfast,
                        free_cancellation: rawFreeCancellation,
                        price_min: rawPriceMin,
                        price_max: urlPriceMax === '10000000' ? '' : urlPriceMax,
                        sort_by: sortBy,
                        page: currentPage
                    }
                });
                const hotelData = response.data?.data || response.data || [];
                setList(hotelData);
                if (response.data?.meta) {
                    setMeta(response.data.meta);
                }
            } catch (error) {
                console.error("Lỗi gọi API Tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [
        destination, hotelName, checkIn, checkOut, rooms, adults, children,
        rawStars, rawHotelAmenities, rawRoomAmenities, rawBedTypes, rawRoomViews,
        rawHasBreakfast, rawFreeCancellation, rawPriceMin, urlPriceMax, sortBy, currentPage
    ]);

    // 3. Lấy danh sách yêu thích
    useEffect(() => {
        if (user) {
            axiosClient.get('/customer/favorites')
                .then(res => {
                    const ids = (res.data?.data || []).map(h => h.id);
                    setFavoriteIds(ids);
                })
                .catch(err => console.error("Lỗi lấy wishlist:", err));
        }
    }, [user]);

    // --- HÀM XỬ LÝ KHI THAY ĐỔI BỘ LỌC ---
    const updateFilterURL = useCallback((key, updatedValue) => {
        const newParams = new URLSearchParams(searchParams);
        const valStr = updatedValue !== null && updatedValue !== undefined ? String(updatedValue) : '';

        if (valStr && valStr.length > 0) {
            newParams.set(key, Array.isArray(updatedValue) ? updatedValue.join(',') : valStr);
        } else {
            newParams.delete(key);
        }
        if (key !== 'page') newParams.set('page', '1');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Debounce thanh trượt giá (350ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (sliderPriceMax !== urlPriceMax) {
                updateFilterURL('price_max', sliderPriceMax === '10000000' ? '' : sliderPriceMax);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [sliderPriceMax, urlPriceMax, updateFilterURL]);

    const handleSelectStar = (starNumber) => {
        const starStr = starNumber.toString();
        const nextStars = urlStars.includes(starStr)
            ? urlStars.filter(s => s !== starStr)
            : [...urlStars, starStr];
        updateFilterURL('stars', nextStars);
    };

    const handleSelectAmenity = (type, id) => {
        const idStr = id.toString();
        const currentArray = type === 'hotel' ? urlHotelAmenities : urlRoomAmenities;
        const urlKey = type === 'hotel' ? 'hotel_amenities' : 'room_amenities';

        const nextArray = currentArray.includes(idStr)
            ? currentArray.filter(item => item !== idStr)
            : [...currentArray, idStr];

        updateFilterURL(urlKey, nextArray);
    };

    const handleSelectBedType = (id) => {
        const idStr = id.toString();
        const nextArray = urlBedTypes.includes(idStr)
            ? urlBedTypes.filter(item => item !== idStr)
            : [...urlBedTypes, idStr];
        updateFilterURL('bed_types', nextArray);
    };

    const handleSelectRoomView = (id) => {
        const idStr = id.toString();
        const nextArray = urlRoomViews.includes(idStr)
            ? urlRoomViews.filter(item => item !== idStr)
            : [...urlRoomViews, idStr];
        updateFilterURL('room_views', nextArray);
    };

    const handleTogglePolicy = (key) => {
        const currentVal = searchParams.get(key) === '1';
        updateFilterURL(key, currentVal ? '' : '1');
    };

    // Chọn nhanh khoảng giá (Budget Presets)
    const handleSetPricePreset = (min, max) => {
        const newParams = new URLSearchParams(searchParams);
        if (min) newParams.set('price_min', min);
        else newParams.delete('price_min');

        if (max && max !== '10000000') newParams.set('price_max', max);
        else newParams.delete('price_max');

        newParams.set('page', '1');
        setSliderPriceMax(max || '10000000');
        setSearchParams(newParams);
    };

    // Đặt lại chỉ các bộ lọc phụ, bảo toàn điểm đến, ngày đi và số khách
    const handleResetFilters = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('price_min');
        newParams.delete('price_max');
        newParams.delete('stars');
        newParams.delete('hotel_amenities');
        newParams.delete('room_amenities');
        newParams.delete('bed_types');
        newParams.delete('room_views');
        newParams.delete('has_breakfast');
        newParams.delete('free_cancellation');
        newParams.set('page', '1');
        setSliderPriceMax('10000000');
        setSearchParams(newParams);
    };

    // Cập nhật khi nhấn Tìm từ SearchWidget
    const handleSearchUpdate = (searchData) => {
        const newParams = new URLSearchParams(searchParams);
        if (searchData.destination && searchData.destination.trim()) {
            newParams.set('destination', searchData.destination.trim());
        } else {
            newParams.delete('destination');
        }

        if (searchData.hotelName && searchData.hotelName.trim()) {
            newParams.set('hotelName', searchData.hotelName.trim());
        } else {
            newParams.delete('hotelName');
        }

        if (searchData.checkIn) newParams.set('checkIn', searchData.checkIn);
        if (searchData.checkOut) newParams.set('checkOut', searchData.checkOut);
        if (searchData.adults) newParams.set('adults', searchData.adults);
        if (searchData.children !== undefined) newParams.set('children', searchData.children);
        if (searchData.rooms) newParams.set('rooms', searchData.rooms);

        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const showToast = (message) => {
        setToastMessage(message);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(''), 3000);
    };

    const handleToggleFavorite = async (e, hotelId) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("Vui lòng đăng nhập để lưu khách sạn yêu thích!");
            navigate('/login');
            return;
        }

        try {
            await axiosClient.post(`/customer/favorites/${hotelId}`);
            const isAlreadyFav = favoriteIds.includes(hotelId);
            if (isAlreadyFav) {
                setFavoriteIds(favoriteIds.filter(id => id !== hotelId));
                showToast("Đã xóa khỏi danh sách yêu thích");
            } else {
                setFavoriteIds([...favoriteIds, hotelId]);
                showToast("Đã thêm vào danh sách yêu thích ❤️");
            }
        } catch (error) {
            alert("Có lỗi xảy ra khi lưu khách sạn, vui lòng thử lại!");
        }
    };

    // Đếm tổng số bộ lọc đang được kích hoạt
    const activeFilterCount = (urlStars.length ? 1 : 0) +
        (urlHotelAmenities.length ? 1 : 0) +
        (urlRoomAmenities.length ? 1 : 0) +
        (urlBedTypes.length ? 1 : 0) +
        (urlRoomViews.length ? 1 : 0) +
        (rawHasBreakfast ? 1 : 0) +
        (rawFreeCancellation ? 1 : 0) +
        ((urlPriceMax !== '10000000' || rawPriceMin) ? 1 : 0);

    // Render nội dung bộ lọc dùng chung cho cả Sidebar Desktop và Drawer Mobile
    const renderFilterBlocks = () => (
        <>
            {/* Bộ Lọc khoảng giá & Chọn nhanh ngân sách */}
            <div className="filter-block">
                <div className="filter-block-title">
                    <span>Khoảng giá</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-reset-link" onClick={handleResetFilters}>
                            <RotateCcw size={12} className="me-1" /> Đặt lại tất cả
                        </span>
                    )}
                </div>

                {/* Chọn nhanh ngân sách */}
                <div className="d-flex flex-wrap gap-1 mb-3">
                    <button
                        type="button"
                        className={`filter-preset-btn ${!rawPriceMin && urlPriceMax === '1000000' ? 'active' : ''}`}
                        onClick={() => handleSetPricePreset('', '1000000')}
                    >
                        &lt; 1 triệu
                    </button>
                    <button
                        type="button"
                        className={`filter-preset-btn ${rawPriceMin === '1000000' && urlPriceMax === '2000000' ? 'active' : ''}`}
                        onClick={() => handleSetPricePreset('1000000', '2000000')}
                    >
                        1 - 2 triệu
                    </button>
                    <button
                        type="button"
                        className={`filter-preset-btn ${rawPriceMin === '2000000' && urlPriceMax === '5000000' ? 'active' : ''}`}
                        onClick={() => handleSetPricePreset('2000000', '5000000')}
                    >
                        2 - 5 triệu
                    </button>
                    <button
                        type="button"
                        className={`filter-preset-btn ${rawPriceMin === '5000000' && (!urlPriceMax || urlPriceMax === '10000000') ? 'active' : ''}`}
                        onClick={() => handleSetPricePreset('5000000', '10000000')}
                    >
                        &gt; 5 triệu
                    </button>
                </div>

                <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Thanh trượt giá tối đa mỗi đêm</p>
                <input
                    type="range"
                    className="w-100 mb-2"
                    min="500000"
                    max="10000000"
                    step="100000"
                    value={sliderPriceMax}
                    onChange={(e) => setSliderPriceMax(e.target.value)}
                    style={{ accentColor: '#dfa974', cursor: 'pointer' }}
                />
                <div className="d-flex justify-content-between" style={{ fontSize: '12px', fontWeight: 'bold', color: '#444' }}>
                    <span>{rawPriceMin ? formatVnd(Number(rawPriceMin)) : '500k VND'}</span>
                    <span style={{ color: '#dfa974' }}>{formatVnd(Number(sliderPriceMax))}</span>
                </div>
            </div>

            {/* BỘ LỌC CHÍNH SÁCH ĐẶC BIỆT (BỮA SÁNG & HỦY PHÒNG) */}
            <div className="filter-block">
                <div className="filter-block-title">Ưu đãi &amp; Chính sách <Sparkles size={16} color="#ca8a04" /></div>
                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={rawHasBreakfast === '1'}
                        onChange={() => handleTogglePolicy('has_breakfast')}
                    />
                    <span className="d-flex align-items-center gap-2">
                        <Coffee size={15} color="#16a34a" /> Bao gồm bữa sáng
                    </span>
                </label>
                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={rawFreeCancellation === '1'}
                        onChange={() => handleTogglePolicy('free_cancellation')}
                    />
                    <span className="d-flex align-items-center gap-2">
                        <ShieldCheck size={15} color="#0284c7" /> Miễn phí hủy phòng
                    </span>
                </label>
            </div>

            {/* Bộ Lọc Hạng Sao */}
            <div className="filter-block">
                <div className="filter-block-title">Đánh giá sao <ChevronDown size={16} /></div>
                {[5, 4, 3, 2, 1].map(star => (
                    <label key={star} className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={urlStars.includes(star.toString())}
                            onChange={() => handleSelectStar(star)}
                        />
                        <span style={{ display: 'flex', gap: '3px', alignItems: 'center', color: '#444', fontWeight: '500' }}>
                            {star} <Star size={14} fill="#ca8a04" color="#ca8a04" />
                        </span>
                    </label>
                ))}
            </div>

            {/* BỘ LỌC TIỆN ÍCH KHÁCH SẠN */}
            <div className="filter-block">
                <div className="filter-block-title">Tiện nghi khách sạn <ChevronDown size={16} /></div>
                <div className="filter-scroll-area">
                    {filterCategories.hotel_amenities.map(amenity => (
                        <label key={amenity.id} className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={urlHotelAmenities.includes(amenity.id.toString())}
                                onChange={() => handleSelectAmenity('hotel', amenity.id)}
                            />
                            <span>{amenity.icon ? `${amenity.icon} ` : ''}{amenity.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* BỘ LỌC TIỆN ÍCH PHÒNG */}
            <div className="filter-block">
                <div className="filter-block-title">Tiện nghi trong phòng <ChevronDown size={16} /></div>
                <div className="filter-scroll-area">
                    {filterCategories.room_amenities.map(amenity => (
                        <label key={amenity.id} className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={urlRoomAmenities.includes(amenity.id.toString())}
                                onChange={() => handleSelectAmenity('room', amenity.id)}
                            />
                            <span>{amenity.icon ? `${amenity.icon} ` : ''}{amenity.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* BỘ LỌC LOẠI GIƯỜNG */}
            {filterCategories.bed_types && filterCategories.bed_types.length > 0 && (
                <div className="filter-block">
                    <div className="filter-block-title">Loại giường <BedDouble size={16} /></div>
                    <div className="filter-scroll-area">
                        {filterCategories.bed_types.map(bed => (
                            <label key={bed.id} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={urlBedTypes.includes(bed.id.toString())}
                                    onChange={() => handleSelectBedType(bed.id)}
                                />
                                <span>{bed.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* BỘ LỌC HƯỚNG PHÒNG */}
            {filterCategories.room_views && filterCategories.room_views.length > 0 && (
                <div className="filter-block">
                    <div className="filter-block-title">Hướng nhìn phòng <Eye size={16} /></div>
                    <div className="filter-scroll-area">
                        {filterCategories.room_views.map(view => (
                            <label key={view.id} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={urlRoomViews.includes(view.id.toString())}
                                    onChange={() => handleSelectRoomView(view.id)}
                                />
                                <span>{view.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div style={{ backgroundColor: '#f2f3f3', paddingBottom: '60px', minHeight: '100vh', position: 'relative' }}>
            {/* Widget tìm kiếm đầu trang */}
            <div style={{ background: '#1c2930', padding: '20px 0' }}>
                <div className="container">
                    <SearchWidget variant="mini" onSearch={handleSearchUpdate} />
                </div>
            </div>

            <div className="container mt-4">
                <div className="row">
                    {/* ===================== CỘT TRÁI: SIDEBAR BỘ LỌC ĐỘNG (DESKTOP) ===================== */}
                    <div className="col-lg-3 d-none d-lg-block sticky-top" style={{ top: '20px', height: 'fit-content', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', paddingBottom: '20px' }}>
                        <div className="filter-block text-center" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" style={{ width: '100%', height: '120px', objectFit: 'cover', opacity: '0.85' }} />
                        </div>
                        {renderFilterBlocks()}
                    </div>

                    {/* ===================== CỘT PHẢI: DANH SÁCH KHÁCH SẠN ===================== */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1c2930', margin: 0 }}>
                                    Kết quả tìm kiếm ở {destName}
                                </h2>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                                    {checkIn && checkOut ? (
                                        <>Từ <strong style={{ color: '#1e293b' }}>{checkIn}</strong> đến <strong style={{ color: '#1e293b' }}>{checkOut}</strong> • {rooms} Phòng • {adults} Người lớn{Number(children) > 0 ? `, ${children} Trẻ em` : ''} • </>
                                    ) : null}
                                    <span style={{ color: '#0284c7', fontWeight: '600' }}>Tìm thấy {meta.total} chỗ nghỉ phù hợp</span>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                {/* Nút Bộ Lọc hiển thị trên Mobile / Tablet */}
                                <button
                                    className="btn btn-outline-dark d-lg-none d-inline-flex align-items-center gap-2"
                                    style={{ borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', padding: '7px 12px' }}
                                    onClick={() => setIsMobileFilterOpen(true)}
                                >
                                    <SlidersHorizontal size={15} />
                                    <span>Bộ lọc</span>
                                    {activeFilterCount > 0 && (
                                        <span className="badge bg-warning text-dark rounded-pill ms-1">{activeFilterCount}</span>
                                    )}
                                </button>

                                <div className="d-flex align-items-center gap-2">
                                    <span style={{ fontSize: '13px', color: '#444', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Xếp theo:</span>
                                    <select
                                        className="form-select"
                                        style={{ width: '170px', borderRadius: '6px', fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                        value={sortBy}
                                        onChange={(e) => updateFilterURL('sort_by', e.target.value)}
                                    >
                                        <option value="popular">Độ phổ biến</option>
                                        <option value="price_asc">Giá: Thấp đến cao</option>
                                        <option value="price_desc">Giá: Cao đến thấp</option>
                                        <option value="rating_desc">Đánh giá cao nhất</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* THANH HIỂN THỊ CÁC THẺ BỘ LỌC ĐANG CHỌN (ACTIVE FILTERS CHIPS) */}
                        {activeFilterCount > 0 && (
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-3 p-2 bg-white rounded border">
                                <span className="text-muted small fw-bold me-1">Đang lọc theo:</span>

                                {urlStars.map(star => (
                                    <span key={star} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 py-1 px-2">
                                        {star} <Star size={12} fill="#ca8a04" color="#ca8a04" />
                                        <X size={13} className="cursor-pointer text-muted" onClick={() => handleSelectStar(star)} />
                                    </span>
                                ))}

                                {rawHasBreakfast === '1' && (
                                    <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1 py-1 px-2">
                                        <Coffee size={12} /> Bữa sáng miễn phí
                                        <X size={13} className="cursor-pointer" onClick={() => updateFilterURL('has_breakfast', '')} />
                                    </span>
                                )}

                                {rawFreeCancellation === '1' && (
                                    <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle d-inline-flex align-items-center gap-1 py-1 px-2">
                                        <ShieldCheck size={12} /> Miễn phí hủy phòng
                                        <X size={13} className="cursor-pointer" onClick={() => updateFilterURL('free_cancellation', '')} />
                                    </span>
                                )}

                                {(rawPriceMin || (urlPriceMax && urlPriceMax !== '10000000')) && (
                                    <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 py-1 px-2">
                                        {rawPriceMin ? `${formatVnd(Number(rawPriceMin))} - ` : 'Dưới '}
                                        {urlPriceMax && urlPriceMax !== '10000000' ? formatVnd(Number(urlPriceMax)) : '10.000.000đ'}
                                        <X size={13} className="cursor-pointer text-muted" onClick={() => {
                                            const np = new URLSearchParams(searchParams);
                                            np.delete('price_min');
                                            np.delete('price_max');
                                            setSliderPriceMax('10000000');
                                            setSearchParams(np);
                                        }} />
                                    </span>
                                )}

                                {urlHotelAmenities.map(id => {
                                    const item = filterCategories.hotel_amenities.find(a => a.id.toString() === id);
                                    if (!item) return null;
                                    return (
                                        <span key={`h-${id}`} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 py-1 px-2">
                                            {item.name}
                                            <X size={13} className="cursor-pointer text-muted" onClick={() => handleSelectAmenity('hotel', id)} />
                                        </span>
                                    );
                                })}

                                {urlRoomAmenities.map(id => {
                                    const item = filterCategories.room_amenities.find(a => a.id.toString() === id);
                                    if (!item) return null;
                                    return (
                                        <span key={`r-${id}`} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 py-1 px-2">
                                            {item.name}
                                            <X size={13} className="cursor-pointer text-muted" onClick={() => handleSelectAmenity('room', id)} />
                                        </span>
                                    );
                                })}

                                {urlBedTypes.map(id => {
                                    const item = (filterCategories.bed_types || []).find(b => b.id.toString() === id);
                                    if (!item) return null;
                                    return (
                                        <span key={`b-${id}`} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 py-1 px-2">
                                            {item.name}
                                            <X size={13} className="cursor-pointer text-muted" onClick={() => handleSelectBedType(id)} />
                                        </span>
                                    );
                                })}

                                {urlRoomViews.map(id => {
                                    const item = (filterCategories.room_views || []).find(v => v.id.toString() === id);
                                    if (!item) return null;
                                    return (
                                        <span key={`v-${id}`} className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 py-1 px-2">
                                            {item.name}
                                            <X size={13} className="cursor-pointer text-muted" onClick={() => handleSelectRoomView(id)} />
                                        </span>
                                    );
                                })}

                                <button onClick={handleResetFilters} className="btn btn-link btn-sm text-danger p-0 ms-auto text-decoration-none fw-semibold">
                                    Xóa tất cả
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <LoadingSpinner text="Đang lọc danh sách chỗ nghỉ..." />
                        ) : list.length === 0 ? (
                            <div className="text-center" style={{ padding: '60px 20px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                                <h4 style={{ color: '#1c2930', fontWeight: 'bold' }}>Không có khách sạn nào khớp với bộ lọc</h4>
                                <p style={{ color: '#666' }}>Vui lòng bỏ bớt tiêu chí lọc hoặc chọn ngày khác để tìm thấy nhiều kết quả hơn.</p>
                                {activeFilterCount > 0 && (
                                    <button onClick={handleResetFilters} className="btn btn-outline-primary btn-sm mt-2">
                                        <RotateCcw size={14} className="me-1" /> Đặt lại tất cả bộ lọc
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div>
                                {list.map((hotel) => (
                                    <HotelCard
                                        key={hotel.id}
                                        hotel={hotel}
                                        isFavorite={favoriteIds.includes(hotel.id)}
                                        onToggleFavorite={(e) => handleToggleFavorite(e, hotel.id)}
                                        querySuffix={querySuffix}
                                    />
                                ))}

                                {/* Phân trang */}
                                {meta.last_page > 1 && (
                                    <div className="d-flex justify-content-center mt-5 mb-5">
                                        <ul className="pagination align-items-center" style={{ gap: '10px' }}>
                                            <li className={`page-item ${meta.current_page === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link d-flex align-items-center justify-content-center"
                                                    style={{ borderRadius: '50px', color: '#1c2930', border: '1px solid #e2e8f0', padding: '8px 20px', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s', opacity: meta.current_page === 1 ? 0.5 : 1 }}
                                                    onClick={() => updateFilterURL('page', meta.current_page - 1)}
                                                    disabled={meta.current_page === 1}
                                                >
                                                    Trở về
                                                </button>
                                            </li>
                                            {[...Array(meta.last_page)].map((_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <li key={page} className={`page-item ${meta.current_page === page ? 'active' : ''}`}>
                                                        <button
                                                            className="page-link d-flex align-items-center justify-content-center fw-bold"
                                                            style={{
                                                                borderRadius: '50%',
                                                                width: '40px',
                                                                height: '40px',
                                                                backgroundColor: meta.current_page === page ? '#dfa974' : '#fff',
                                                                borderColor: meta.current_page === page ? '#dfa974' : '#e2e8f0',
                                                                color: meta.current_page === page ? '#fff' : '#1c2930',
                                                                fontSize: '14px',
                                                                padding: 0,
                                                                transition: 'all 0.3s'
                                                            }}
                                                            onClick={() => updateFilterURL('page', page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            <li className={`page-item ${meta.current_page === meta.last_page ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link d-flex align-items-center justify-content-center"
                                                    style={{ borderRadius: '50px', color: '#1c2930', border: '1px solid #e2e8f0', padding: '8px 20px', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s', opacity: meta.current_page === meta.last_page ? 0.5 : 1 }}
                                                    onClick={() => updateFilterURL('page', meta.current_page + 1)}
                                                    disabled={meta.current_page === meta.last_page}
                                                >
                                                    Kế tiếp
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===================== MODAL/DRAWER BỘ LỌC CHO MOBILE ===================== */}
            {isMobileFilterOpen && (
                <div className="mobile-filter-overlay" onClick={() => setIsMobileFilterOpen(false)}>
                    <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-filter-header d-flex justify-content-between align-items-center p-3 border-bottom">
                            <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                                <SlidersHorizontal size={18} /> Bộ lọc tìm kiếm
                            </h5>
                            <button
                                className="btn btn-sm btn-light rounded-circle p-1"
                                onClick={() => setIsMobileFilterOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mobile-filter-body p-3" style={{ maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
                            {renderFilterBlocks()}
                        </div>
                        <div className="mobile-filter-footer p-3 border-top d-flex gap-2 bg-white">
                            {activeFilterCount > 0 && (
                                <button
                                    className="btn btn-outline-secondary flex-fill fw-bold"
                                    onClick={() => {
                                        handleResetFilters();
                                        setIsMobileFilterOpen(false);
                                    }}
                                >
                                    Đặt lại
                                </button>
                            )}
                            <button
                                className="btn btn-warning flex-fill fw-bold text-dark d-flex align-items-center justify-content-center gap-1"
                                onClick={() => setIsMobileFilterOpen(false)}
                            >
                                <Check size={16} /> Áp dụng bộ lọc
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="toast-popup">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}