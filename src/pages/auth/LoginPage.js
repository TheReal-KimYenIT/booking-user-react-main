import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../css/LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                {/* Left Panel - Image (Desktop only) */}
                <div className="auth-image-panel" style={{ backgroundImage: 'url("/img/about-1.jpg")' }}>
                    <div className="auth-image-overlay"></div>
                    <div className="auth-image-content">
                        <Link to="/" style={{ color: '#dfa974', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', fontWeight: 'bold' }}>
                            <ArrowLeft size={20} /> Quay lại trang chủ
                        </Link>
                        <h1 style={{ color: '#ffffff', fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px', letterSpacing: '2px', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                            STAYHUB
                        </h1>
                        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#f8fafc', fontWeight: '500', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            Nền tảng đặt phòng nghỉ dưỡng đẳng cấp, mang đến cho bạn trải nghiệm lưu trú vượt trội và dịch vụ hoàn hảo.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="auth-form-panel">
                    <div className="auth-card">
                        {/* Mobile Back Button */}
                        <Link to="/" className="mobile-back-btn">
                            <ArrowLeft size={20} /> Trang chủ
                        </Link>

                        <div className="auth-header">
                            <h2 className="auth-title">Chào mừng trở lại!</h2>
                            <p className="auth-subtitle">Vui lòng đăng nhập để tiếp tục</p>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="form-group">
                                <label>Địa chỉ Email</label>
                                <div className="input-container">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="auth-input"
                                        placeholder="Nhập email của bạn"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <div className="input-container">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="auth-input password-input"
                                        placeholder="Nhập mật khẩu"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" /> Ghi nhớ đăng nhập
                                </label>
                                <a href="#" className="forgot-password">Quên mật khẩu?</a>
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="btn-content">
                                        <LoadingSpinner variant="button" size="sm" color="#fff" text="Đang xử lý..." />
                                    </span>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </form>

                        <p className="auth-footer">
                            Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;