import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';

// ĐÃ SỬA: Lùi đường dẫn ra 2 cấp để khớp với thư mục auth/
import axiosClient from '../../api/axiosClient';

// Nhúng file CSS vừa tạo (lùi ra 1 cấp vào css/)
import '../css/RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirmation) {
            return setError('Mật khẩu nhập lại không khớp!');
        }

        try {
            await axiosClient.post('/auth/register', formData);
            setSuccess('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-card">
                <h2 className="register-title">Tạo Tài Khoản Mới</h2>

                {error && <div className="register-error">{error}</div>}
                {success && <div className="register-success">{success}</div>}

                <form onSubmit={handleRegister} className="register-form">
                    <div className="form-group">
                        <label>Họ và tên</label>
                        <div className="input-container">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="register-input"
                                placeholder="Nhập họ tên"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-container">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="register-input"
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="register-input"
                                placeholder="Nhập mật khẩu"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nhập lại mật khẩu</label>
                        <div className="input-container">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                required
                                className="register-input"
                                placeholder="Xác nhận mật khẩu"
                            />
                        </div>
                    </div>

                    <button type="submit" className="register-btn">
                        Đăng ký
                    </button>
                </form>

                <p className="register-footer">
                    Đã có tài khoản? <Link to="/login" className="register-link">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;