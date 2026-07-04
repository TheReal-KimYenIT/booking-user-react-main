import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

// ĐÃ SỬA: Lùi đường dẫn ra 2 cấp để khớp với thư mục auth/
import { AuthContext } from '../../context/AuthContext';

// Nhúng file CSS vừa tạo (từ auth/ lùi ra ngoài 1 cấp, vào css/)
import '../css/LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);
        if (result.success) {
            navigate('/'); // Đăng nhập thành công thì quay về Trang chủ
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">Đăng Nhập Khách Hàng</h2>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-container">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="login-input"
                                placeholder="Nhập email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <div className="input-container">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="login-input"
                                placeholder="Nhập mật khẩu"
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn">
                        Đăng nhập
                    </button>
                </form>

                <p className="login-footer">
                    Chưa có tài khoản? <Link to="/register" className="login-link">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;