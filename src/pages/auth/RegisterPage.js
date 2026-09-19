import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../css/RegisterPage.css';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (password !== passwordConfirmation) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setIsLoading(true);

        const result = await register({
            name,
            email,
            phone,
            password,
            password_confirmation: passwordConfirmation
        });

        if (result.success) {
            setSuccessMsg('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
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
                            Tham gia cộng đồng lưu trú hàng đầu để nhận ưu đãi độc quyền và trải nghiệm dịch vụ đẳng cấp 5 sao.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="auth-form-panel">
                    <div className="auth-card" style={{ maxWidth: '480px' }}>
                        {/* Mobile Back Button */}
                        <Link to="/" className="mobile-back-btn">
                            <ArrowLeft size={20} /> Trang chủ
                        </Link>

                        <div className="auth-header" style={{ marginBottom: '25px' }}>
                            <h2 className="auth-title">Tạo tài khoản mới</h2>
                            <p className="auth-subtitle">Điền thông tin bên dưới để đăng ký</p>
                        </div>

                        {error && <div className="auth-error">{error}</div>}
                        {successMsg && <div className="auth-success" style={{ color: '#047857', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>{successMsg}</div>}

                        <form onSubmit={handleRegister} className="auth-form" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <div className="input-container">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="auth-input"
                                        placeholder="Nhập họ và tên"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

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
                                <label>Số điện thoại</label>
                                <div className="input-container">
                                    <Phone size={18} className="input-icon" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="auth-input"
                                        placeholder="Nhập số điện thoại"
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
                                        placeholder="Tạo mật khẩu"
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

                            <div className="form-group">
                                <label>Xác nhận mật khẩu</label>
                                <div className="input-container">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        required
                                        className="auth-input password-input"
                                        placeholder="Nhập lại mật khẩu"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading} style={{ marginTop: '5px' }}>
                                {isLoading ? (
                                    <span className="btn-content">
                                        <LoadingSpinner variant="button" size="sm" color="#fff" text="Đang xử lý..." />
                                    </span>
                                ) : (
                                    "Đăng ký tài khoản"
                                )}
                            </button>
                        </form>

                        <p className="auth-footer" style={{ marginTop: '20px' }}>
                            Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;