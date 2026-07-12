import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, UserCircle, ClipboardList, Star, User, Menu, X, Building, MessageSquare } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);

    const [isSticky, setIsSticky] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/');
    };

    const checkActive = (path) => {
        if (path === '/') return location.pathname === '/' ? 'active' : '';
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            <style>{`
                /* Nền Xanh Navy sang trọng */
                .premium-header {
                    background-color: #0f172a; 
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                /* Hiệu ứng trượt menu dính */
                .header--sticky {
                    position: fixed !important;
                    top: 0; left: 0; width: 100%;
                    z-index: 9999;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    animation: slideDown 0.3s ease-in-out;
                }
                @keyframes slideDown {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }

                /* Tùy chỉnh Menu chính */
                .main-menu li a {
                    color: #cbd5e1; 
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 16px;
                    transition: all 0.3s;
                    white-space: nowrap; 
                    padding: 8px 0;
                }
                .main-menu li a:hover, 
                .main-menu li.active a {
                    color: #fbbf24; /* Màu vàng nổi bật */
                }

                /* Hiệu ứng Dropdown User */
                .account-dropdown:hover .auth-dropdown-menu { 
                    display: block !important; 
                    animation: fadeIn 0.2s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .auth-dropdown-menu li a { transition: background-color 0.2s; color: #333; text-decoration: none;}
                .auth-dropdown-menu li a:hover { background-color: #f1f5f9; color: #0f172a; }

                /* CSS Offcanvas Mobile */
                .offcanvas-menu-wrapper {
                    position: fixed; top: 0; right: 0; width: 300px; height: 100vh;
                    background: #fff; z-index: 10000; padding: 30px 20px;
                    transform: ${isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)'};
                    transition: transform 0.3s ease-in-out;
                    box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                }
                .offcanvas-menu-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.5); z-index: 9999;
                    display: ${isMobileMenuOpen ? 'block' : 'none'};
                }
                .offcanvas__widget ul { list-style: none; padding: 0; }
                .offcanvas__widget ul li a {
                    display: block; padding: 12px 0; color: #1e293b;
                    text-decoration: none; font-weight: 500; border-bottom: 1px solid #eee;
                }
            `}</style>

            {/* ========================================== */}
            {/* MOBILE MENU (Dành cho điện thoại) */}
            {/* ========================================== */}
            <div className="offcanvas-menu-overlay" onClick={toggleMobileMenu}></div>
            <div className="offcanvas-menu-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <Link to="/" onClick={toggleMobileMenu}>
                        <img src="/img/logo.png" alt="StayHub" style={{ maxHeight: '35px' }} />
                    </Link>
                    <button onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={28} color="#333" />
                    </button>
                </div>

                <div className="offcanvas__widget">
                    <ul>
                        <li><Link to="/" onClick={toggleMobileMenu}>Trang chủ</Link></li>
                        <li><Link to="/hotels" onClick={toggleMobileMenu}>Khách sạn</Link></li>
                        <li><Link to="/promotions" onClick={toggleMobileMenu}>Khuyến mãi</Link></li>
                        <li><Link to="/about" onClick={toggleMobileMenu}>Về chúng tôi</Link></li>
                        {/* 👉 SỬA Ở ĐÂY: Thay vì Link, dùng thẻ a để nhảy tới id */}
                        <li><a href="/about#contact-section" onClick={toggleMobileMenu}>Liên hệ</a></li>
                    </ul>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    {user ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserCircle size={20} color="#3b82f6" /> Xin chào, {user.name}
                            </li>
                            <li style={{ marginBottom: '10px' }}><Link to="/profile" onClick={toggleMobileMenu} style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={16} /> Hồ sơ cá nhân</Link></li>
                            <li style={{ marginBottom: '10px' }}><Link to="/messages" onClick={toggleMobileMenu} style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={16} /> Tin nhắn của tôi</Link></li>
                            <li style={{ marginBottom: '10px' }}><Link to="/orders" onClick={toggleMobileMenu} style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={16} /> Lịch sử đặt phòng</Link></li>
                            <li style={{ marginBottom: '10px' }}><Link to="/reviews" onClick={toggleMobileMenu} style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={16} /> Đánh giá của tôi</Link></li>
                            <li><a href="/" onClick={handleLogout} style={{ textDecoration: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}><LogOut size={16} /> Đăng xuất</a></li>
                        </ul>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/login" onClick={toggleMobileMenu} style={{ textAlign: 'center', padding: '10px', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập</Link>
                            <Link to="/register" onClick={toggleMobileMenu} style={{ textAlign: 'center', padding: '10px', background: '#3b82f6', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* DESKTOP HEADER */}
            {/* ========================================== */}
            <header className={`header ${isSticky ? 'header--sticky' : ''}`}>

                {/* THANH TOP BAR */}
                <div style={{ backgroundColor: '#f8f9fa', padding: '8px 0', borderBottom: '1px solid #e9ecef' }} className="d-none d-lg-block">
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                            <div style={{ color: '#6c757d' }}>
                                Hotline hỗ trợ: <strong style={{ color: '#212529' }}>1900 1234</strong>
                            </div>
                            <div>
                                <a href="http://localhost:4200/login" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#212529', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Building size={14} /> Hợp tác với chúng tôi (Dành cho Chủ khách sạn)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THANH MAIN BAR */}
                <div className="premium-header" style={{ padding: '5px 0' }}>
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

                            {/* Logo */}
                            <div>
                                <Link to="/">
                                    <img src="/img/logo.png" alt="StayHub" style={{ maxHeight: '50px' }} />
                                </Link>
                            </div>

                            {/* Menu Chính (Ẩn trên mobile) */}
                            <nav className="d-none d-lg-block">
                                <ul className="main-menu" style={{ display: 'flex', gap: '35px', margin: 0, padding: 0, listStyle: 'none' }}>
                                    <li className={checkActive('/')}><Link to="/">Trang chủ</Link></li>
                                    <li className={checkActive('/hotels')}><Link to="/hotels">Khách sạn</Link></li>
                                    <li className={checkActive('/promotions')}><Link to="/promotions">Khuyến mãi</Link></li>
                                    <li className={checkActive('/about')}><Link to="/about">Về chúng tôi</Link></li>

                                    {/* 👉 SỬA Ở ĐÂY: Dùng thẻ a thuần để anchor id hoạt động */}
                                    <li><a href="/about#contact-section">Liên hệ</a></li>
                                </ul>
                            </nav>

                            {/* Khu vực Auth */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>

                                {/* Nút Hamburger cho Mobile */}
                                <button className="d-lg-none" onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                    <Menu size={32} />
                                </button>

                                {/* Auth Desktop */}
                                <div className="d-none d-lg-block">
                                    {user ? (
                                        <div className="account-dropdown" style={{ position: 'relative', cursor: 'pointer', padding: '10px 0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 'bold' }}>
                                                <UserCircle size={24} color="#fbbf24" />
                                                <span>{user.name}</span>
                                            </div>

                                            <ul className="auth-dropdown-menu" style={{
                                                position: 'absolute', top: '100%', right: 0, minWidth: '220px',
                                                background: '#fff', padding: '10px 0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                                listStyle: 'none', zIndex: 99, display: 'none', borderRadius: '12px', margin: 0
                                            }}>
                                                <li><Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px' }}><User size={16} /> Hồ sơ cá nhân</Link></li>
                                                <li><Link to="/messages" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px' }}><MessageSquare size={16} /> Tin nhắn của tôi</Link></li>
                                                <li><Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px' }}><ClipboardList size={16} /> Lịch sử đặt phòng</Link></li>
                                                <li><Link to="/reviews" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px' }}><Star size={16} /> Đánh giá của tôi</Link></li>
                                                <li style={{ borderTop: '1px solid #eee', marginTop: '5px' }}>
                                                    <a href="/" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#ef4444' }}><LogOut size={16} /> Đăng xuất</a>
                                                </li>
                                            </ul>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <Link to="/login" style={{ padding: '8px 25px', border: '1px solid #fff', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập</Link>
                                            <Link to="/register" style={{ padding: '8px 25px', background: '#fbbf24', color: '#0f172a', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;