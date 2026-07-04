import React, { useState, useEffect, useContext, useRef } from 'react';
import { Mail, Phone, MapPin, Send, ShieldCheck, Headset, ThumbsUp, Star, Users, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';

export default function AboutPage() {
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==========================================
    // LOGIC 1: ĐIỀN DATA KHÁCH & HIỆU ỨNG SCROLL
    // ==========================================
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev, name: user.name || '', email: user.email || '', phone: user.phone || ''
            }));
        }

        // Logic Scroll Reveal: Hiện nội dung khi cuộn tới
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.15 });

        const hiddenElements = document.querySelectorAll('.reveal');
        hiddenElements.forEach((el) => observer.observe(el));

        return () => hiddenElements.forEach((el) => observer.unobserve(el));
    }, [user]);

    // ==========================================
    // LOGIC 2: XỬ LÝ GỬI FORM LIÊN HỆ
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        Swal.fire({ title: 'Đang gửi...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            await axiosClient.post('/contacts', formData);
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Tin nhắn của bạn đã được gửi.', confirmButtonColor: '#0ea5e9' });
            setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', subject: '', message: '' });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Thất bại', text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="about-page-wrapper">
            {/* ========================================== */}
            {/* CSS CHO HIỆU ỨNG & LAYOUT */}
            {/* ========================================== */}
            <style>{`
                /* Bật cuộn mượt toàn trang */
                html { scroll-behavior: smooth; }

                /* Style cho Video Background */
                .hero-video-section {
                    position: relative;
                    height: 85vh;
                    min-height: 600px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .hero-video-section video {
                    position: absolute;
                    top: 50%; left: 50%;
                    min-width: 100%; min-height: 100%;
                    width: auto; height: auto;
                    transform: translateX(-50%) translateY(-50%);
                    z-index: 1;
                    object-fit: cover;
                }
                .hero-video-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 42, 0.6); /* Lớp phủ đen mờ */
                    z-index: 2;
                }
                .hero-content {
                    position: relative;
                    z-index: 3;
                    text-align: center;
                    color: white;
                    padding: 0 20px;
                }

                /* Animation Scroll Reveal (Ẩn -> Hiện) */
                .reveal {
                    opacity: 0;
                    transform: translateY(50px);
                    transition: all 0.8s ease-out;
                }
                .reveal.active {
                    opacity: 1;
                    transform: translateY(0);
                }
                .reveal-left { transform: translateX(-50px); }
                .reveal-right { transform: translateX(50px); }
                .reveal-left.active, .reveal-right.active { transform: translateX(0); }

                /* Custom Utilities */
                .text-highlight { color: #0ea5e9; }
                .image-rounded-shadow {
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    width: 100%;
                    height: auto;
                    object-fit: cover;
                }
            `}</style>

            {/* SECTION 1: HERO VIDEO BANNER */}
            <section className="hero-video-section">
                {/* 👉 Gắn link video của bạn vào đây */}
                <video autoPlay loop muted playsInline>
                    <source src="./video/banner.mp4" type="video/mp4" />
                </video>
                <div className="hero-video-overlay"></div>
                <div className="hero-content reveal">
                    <h1 style={{ fontWeight: 'bold', fontSize: '3.5rem', marginBottom: '20px', letterSpacing: '2px' }}>
                        KHÁM PHÁ HIROTO
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#e2e8f0', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                        Vượt ra khỏi khái niệm đặt phòng thông thường. Chúng tôi kiến tạo nên không gian lưu trú hiện đại, linh hoạt và mang đậm cá tính riêng cho mỗi chuyến đi của bạn.
                    </p>
                </div>
            </section>

            {/* SECTION 2: ZIG-ZAG LAYOUT (Ảnh Trái - Chữ Phải) */}
            <section style={{ padding: '100px 0', backgroundColor: '#fff' }}>
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6 reveal reveal-left">
                            <img src="/img/about-1.jpg" alt="Không gian thiết kế" className="image-rounded-shadow" style={{ aspectRatio: '4/3' }} />
                        </div>
                        <div className="col-lg-6 reveal reveal-right">
                            <h6 className="text-highlight" style={{ fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Triết lý của chúng tôi</h6>
                            <h2 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '2.5rem', marginBottom: '20px' }}>Không gian sống sáng tạo & Đa dụng</h2>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px' }}>
                                Giống như những gì bạn thấy ở các khách sạn hàng đầu, Hiroto không chỉ là nơi để ngủ. Chúng tôi mang đến hệ sinh thái tích hợp từ phòng ngủ tiện nghi, không gian làm việc sáng tạo (co-working space), đến các khu vực hội họp hiện đại.
                            </p>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.8' }}>
                                Dù bạn là doanh nhân đang tìm góc làm việc yên tĩnh, hay một nhóm bạn trẻ cần không gian check-in sang trọng, Hiroto đều có lựa chọn hoàn hảo dành cho bạn.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: ZIG-ZAG LAYOUT (Chữ Trái - Ảnh Phải) */}
            <section style={{ padding: '100px 0', backgroundColor: '#f8fafc' }}>
                <div className="container">
                    <div className="row align-items-center g-5 flex-lg-row-reverse">
                        <div className="col-lg-6 reveal reveal-right">
                            <img src="/img/about-2.jpg" alt="Tiện ích hiện đại" className="image-rounded-shadow" style={{ aspectRatio: '4/3' }} />
                        </div>
                        <div className="col-lg-6 reveal reveal-left">
                            <h6 className="text-highlight" style={{ fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Trải nghiệm vượt bậc</h6>
                            <h2 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '2.5rem', marginBottom: '20px' }}>Biến ý tưởng thành hiện thực</h2>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px' }}>
                                Chúng tôi đáp ứng mọi nhu cầu tổ chức sự kiện của bạn. Từ những buổi ra mắt sản phẩm đến những cuộc họp bàn chiến lược.
                            </p>
                            <ul style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.8', paddingLeft: '20px' }}>
                                <li>Phòng họp linh hoạt với công nghệ trình chiếu đỉnh cao.</li>
                                <li>Khu vực F&B tự phục vụ cà phê và đồ ăn nhẹ 24/7.</li>
                                <li>Mạng lưới khách sạn trải dài khắp các thành phố lớn.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: THỐNG KÊ (CON SỐ BIẾT NÓI) */}
            <section style={{ padding: '80px 0', backgroundColor: '#0f172a', color: '#fff' }}>
                <div className="container reveal">
                    <div className="row text-center g-4">
                        <div className="col-md-4">
                            <Building2 size={40} className="text-highlight" style={{ marginBottom: '15px' }} />
                            <h2 style={{ fontWeight: 'bold', fontSize: '3rem', margin: 0 }}>500+</h2>
                            <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Khách sạn đối tác</p>
                        </div>
                        <div className="col-md-4">
                            <Users size={40} className="text-highlight" style={{ marginBottom: '15px' }} />
                            <h2 style={{ fontWeight: 'bold', fontSize: '3rem', margin: 0 }}>10K+</h2>
                            <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Khách hàng tin dùng</p>
                        </div>
                        <div className="col-md-4">
                            <Star size={40} className="text-highlight" style={{ marginBottom: '15px' }} />
                            <h2 style={{ fontWeight: 'bold', fontSize: '3rem', margin: 0 }}>98%</h2>
                            <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Đánh giá hài lòng</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: FORM LIÊN HỆ (ID="contact-section" ĐỂ SCROLL TỚI) */}
            <section id="contact-section" style={{ padding: '100px 0', backgroundColor: '#fff' }}>
                <div className="container reveal">
                    <div className="text-center mb-5">
                        <h6 className="text-highlight" style={{ fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Hỗ trợ 24/7</h6>
                        <h2 style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '2.5rem' }}>Liên hệ với Hiroto</h2>
                        <p style={{ color: '#64748b', fontSize: '16px' }}>Đội ngũ của chúng tôi luôn sẵn sàng lắng nghe và giải quyết mọi vấn đề của bạn.</p>
                    </div>

                    <div className="row g-5">
                        {/* Cột trái: Thông tin */}
                        <div className="col-lg-5">
                            <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%' }}>
                                <h4 style={{ fontWeight: 'bold', marginBottom: '30px', color: '#0f172a' }}>Thông tin liên hệ</h4>

                                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ width: '50px', height: '50px', backgroundColor: '#e0f2fe', color: '#0ea5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h6 style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Trụ sở chính</h6>
                                        <p style={{ color: '#475569', margin: 0, lineHeight: '1.6' }}>Số 1, Đường Trần Phú, Quận 1, TP. Hồ Chí Minh</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ width: '50px', height: '50px', backgroundColor: '#e0f2fe', color: '#0ea5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h6 style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Hotline</h6>
                                        <p style={{ color: '#475569', margin: 0 }}>1900 1234</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ width: '50px', height: '50px', backgroundColor: '#e0f2fe', color: '#0ea5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h6 style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Email hợp tác</h6>
                                        <p style={{ color: '#475569', margin: 0 }}>partner@hiroto.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cột phải: Form */}
                        <div className="col-lg-7">
                            <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <h4 style={{ fontWeight: 'bold', marginBottom: '25px', color: '#0f172a' }}>Gửi lời nhắn</h4>
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-4">
                                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Họ và tên *</label>
                                            <input type="text" className="form-control" placeholder="Tên của bạn" required
                                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Email *</label>
                                            <input type="email" className="form-control" placeholder="Email của bạn" required
                                                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-4">
                                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Số điện thoại</label>
                                            <input type="tel" className="form-control" placeholder="Số điện thoại liên hệ"
                                                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Chủ đề</label>
                                            <input type="text" className="form-control" placeholder="Vấn đề bạn cần hỗ trợ"
                                                value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Nội dung *</label>
                                        <textarea className="form-control" rows="5" placeholder="Chia sẻ chi tiết vấn đề của bạn..." required
                                            value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
                                    </div>

                                    <button type="submit" disabled={isSubmitting} style={{
                                        background: '#0ea5e9', color: '#fff', border: 'none', padding: '14px 30px',
                                        borderRadius: '8px', fontWeight: 'bold', width: '100%', display: 'flex',
                                        justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.3s',
                                        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                                    }}>
                                        <Send size={18} /> {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}