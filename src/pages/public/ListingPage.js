import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Map, ChevronDown, Star } from 'lucide-react';

// ĐÃ SỬA: Lùi đường dẫn ra 2 cấp để khớp với thư mục public/
import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import SearchWidget from '../../components/search/SearchWidget';
import HotelCard from '../../components/hotel/HotelCard';
import { formatVnd } from '../../utils/booking';

// ĐÃ SỬA: Lùi đường dẫn import CSS ra ngoài 1 cấp rồi vào thư mục css/
import '../css/ListingPage.css';

export default function ListingPage() {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // --- THAM SỐ CƠ BẢN TỪ URL ---
    const destination = searchParams.get('destination') || '';
    const checkIn = searchParams.get('checkIn') || '';
    const checkOut = searchParams.get('checkOut') || '';
    const guests = searchParams.get('guests') || '';

    // --- THAM SỐ BỘ LỌC TỪ URL ---
    const urlStars = searchParams.get('stars') ? searchParams.get('stars').split(',') : [];
    const urlHotelAmenities = searchParams.get('hotel_amenities') ? searchParams.get('hotel_amenities').split(',') : [];
    const urlRoomAmenities = searchParams.get('room_amenities') ? searchParams.get('room_amenities').split(',') : [];
    const urlPriceMax = searchParams.get('price_max') || '10000000';

    // --- STATE LƯU TRỮ DỮ LIỆU ---
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [filterCategories, setFilterCategories] = useState({ hotel_amenities: [], room_amenities: [] });

    const [toastMessage, setToastMessage] = useState('');
    const toastTimeoutRef = useRef(null);

    const destName = destination ? destination : 'Tất cả điểm đến';

    // Gom toàn bộ tham số hiện tại thành chuỗi hậu tố để truyền qua trang Detail
    const querySuffix = `?${searchParams.toString()}`;

    // 1. Lấy dữ liệu các Danh mục bộ lọc (Tiện ích khách sạn, tiện ích phòng thật từ DB)
    useEffect(() => {
        axiosClient.get('/hotels/filters-data')
            .then(res => {
                // Bao phủ cả 2 trường hợp axios trả về response hay trả về thẳng data
                const payload = res.data || res;
                if (payload && payload.data) {
                    setFilterCategories({
                        hotel_amenities: payload.data.hotel_amenities || [],
                        room_amenities: payload.data.room_amenities || []
                    });
                }
            })
            .catch(err => console.error("Lỗi lấy danh mục bộ lọc:", err));
    }, []);

    // 2. Lấy danh sách Khách sạn (Tự động chạy lại mỗi khi URL thay đổi bộ lọc)
    useEffect(() => {
        const fetchHotels = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get('/hotels/search', {
                    params: {
                        destination,
                        check_in: checkIn,
                        check_out: checkOut,
                        stars: urlStars.join(','),
                        hotel_amenities: urlHotelAmenities.join(','),
                        room_amenities: urlRoomAmenities.join(','),
                        price_max: urlPriceMax === '10000000' ? '' : urlPriceMax
                    }
                });
                const hotelData = response.data?.data || response.data || [];
                setList(hotelData);
            } catch (error) {
                console.error("Lỗi gọi API Tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, [destination, checkIn, checkOut, searchParams]); // Lắng nghe searchParams để kích hoạt lọc động

    // 3. Lấy danh sách yêu thích
    useEffect(() => {
        if (user) {
            axiosClient.get('/customer/favorites')
                .then(res => {
                    const ids = res.data.data.map(h => h.id);
                    setFavoriteIds(ids);
                })
                .catch(err => console.error("Lỗi lấy wishlist:", err));
        }
    }, [user]);

    // --- HÀM XỬ LÝ KHI THAY ĐỔI BỘ LỌC (ĐẨY DATA LÊN URL) ---
    const updateFilterURL = (key, updatedValue) => {
        const newParams = new URLSearchParams(searchParams);
        if (updatedValue && updatedValue.length > 0) {
            newParams.set(key, Array.isArray(updatedValue) ? updatedValue.join(',') : updatedValue);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

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

    const handleResetFilters = () => {
        setSearchParams({ destination, checkIn, checkOut, guests }); // Giữ lại thông tin tìm kiếm, xóa hết bộ lọc
    };

    const handleSearchUpdate = (searchData) => {
        setSearchParams({
            destination: searchData.destination,
            checkIn: searchData.checkIn,
            checkOut: searchData.checkOut,
            guests: searchData.guests
        });
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

    return (
        <div style={{ backgroundColor: '#f2f3f3', paddingBottom: '60px', minHeight: '100vh', position: 'relative' }}>

            <div style={{ background: '#1c2930', padding: '20px 0' }}>
                <div className="container">
                    <SearchWidget variant="mini" onSearch={handleSearchUpdate} />
                </div>
            </div>

            <div className="container mt-4">
                <div className="row">

                    {/* ===================== CỘT TRÁI: SIDEBAR BỘ LỌC ĐỘNG ===================== */}
                    <div className="col-lg-3 d-none d-lg-block">
                        <div className="filter-block text-center" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" style={{ width: '100%', height: '120px', objectFit: 'cover', opacity: '0.8' }} />
                            <button className="primary-btn border-0" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '8px 15px', fontSize: '13px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', background: '#fff' }}>
                                <Map size={14} /> Mở bản đồ
                            </button>
                        </div>

                        {/* Bộ Lọc khoảng giá */}
                        <div className="filter-block">
                            <div className="filter-block-title">Khoảng giá <span onClick={handleResetFilters}>Đặt lại tất cả</span></div>
                            <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>Giá tối đa mỗi đêm</p>
                            <input
                                type="range"
                                className="w-100 mb-2"
                                min="500000"
                                max="10000000"
                                step="100000"
                                value={urlPriceMax}
                                onChange={(e) => updateFilterURL('price_max', e.target.value)}
                                style={{ accentColor: '#dfa974' }}
                            />
                            <div className="d-flex justify-content-between" style={{ fontSize: '12px', fontWeight: 'bold', color: '#444' }}>
                                <span>500k VND</span>
                                <span style={{ color: '#dfa974' }}>{formatVnd(Number(urlPriceMax))}</span>
                            </div>
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
                                    <span style={{ display: 'flex', gap: '2px', alignItems: 'center', color: '#444', fontWeight: '500' }}>
                                        {star} <Star size={14} fill="#ca8a04" color="#ca8a04" />
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* 👇 BỘ LỌC TIỆN ÍCH KHÁCH SẠN ĐỘNG 👇 */}
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
                                        <span>{amenity.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 👇 BỘ LỌC TIỆN ÍCH PHÒNG ĐỘNG 👇 */}
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
                                        <span>{amenity.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* ===================== CỘT PHẢI: DANH SÁCH KHÁCH SẠN ===================== */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1c2930', margin: 0 }}>
                                    Kết quả tìm kiếm ở {destName}
                                </h2>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span style={{ fontSize: '13px', color: '#444', fontWeight: 'bold' }}>Xếp theo:</span>
                                <select className="form-select" style={{ width: '160px', borderRadius: '6px', fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                                    <option value="popular">Độ phổ biến</option>
                                    <option value="price_asc">Giá: Thấp đến cao</option>
                                    <option value="price_desc">Giá: Cao đến thấp</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div className="spinner-border" style={{ color: '#dfa974' }} role="status"></div>
                                <p style={{ marginTop: '15px', color: '#666' }}>Đang lọc danh sách chỗ nghỉ...</p>
                            </div>
                        ) : list.length === 0 ? (
                            <div className="text-center" style={{ padding: '60px 20px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                                <h4 style={{ color: '#1c2930', fontWeight: 'bold' }}>Không có khách sạn nào khớp với bộ lọc</h4>
                                <p style={{ color: '#666' }}>Vui lòng bỏ bớt tiêu chí lọc hoặc tăng khoảng giá để tìm thấy nhiều kết quả hơn.</p>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toastMessage && (
                <div className="toast-popup">
                    {toastMessage}
                </div>
            )}

        </div>
    );
}