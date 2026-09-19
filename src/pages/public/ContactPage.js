import React, { useState, useEffect, useContext } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import bannerVideo from './video/bannerAbout.mp4';

export default function ContactPage() {
    // Trang liên hệ với khách sạn và bộ phận hỗ trợ
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: (user.last_name + ' ' + user.first_name).trim() || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }

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
        <div className="contact-page-wrapper">
            <style>{`
                .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
                .reveal.active { opacity: 1; transform: translateY(0); }
                .text-highlight { color: #0ea5e9; }
                
                /* ========================================== */
                /* NÂNG CẤP CSS BANNER: CHỮ SIÊU NỔI BẬT */
                /* ========================================== */
                .contact-video-banner {
                    position: relative;
                    height: 42vh;
                    min-height: 380px;
                    max-height: 480px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background-color: #0f172a;
                    border-bottom-left-radius: 24px;
                    border-bottom-right-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
                    margin-bottom: 60px;
                }
                .contact-video-banner video {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    min-width: 100%;
                    min-height: 100%;
                    width: auto;
                    height: auto;
                    transform: translateX(-50%) translateY(-50%);
                    z-index: 1;
                    object-fit: cover;
                }
                /* Overlay làm tối trung tâm nhiều hơn để làm bệ đỡ cho chữ */
                .contact-video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at center, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.5) 100%);
                    z-index: 2;
                }
                .contact-banner-content {
                    position: relative;
                    z-index: 3;
                    text-align: center;
                    padding: 0 20px;
                    max-width: 750px;
                }
                /* Ép màu trắng tuyệt đối và tạo viền đen chống chìm chữ */
                .contact-title-bold {
                    color: #ffffff !important;
                    font-weight: 800 !important;
                    font-size: 3rem;
                    margin-bottom: 16px;
                    letter-spacing: 1px;
                    text-shadow: 0 4px 15px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 1);
                }
                .contact-desc-bright {
                    color: #f8fafc !important;
                    font-size: 1.15rem;
                    line-height: 1.7;
                    margin: 0 auto;
                    font-weight: 500;
                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
                }
                /* Badge vàng kim tạo điểm nhấn tone-sur-tone với logo STAYHUB */
                .contact-badge-gold {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: #ffffff;
                    padding: 6px 18px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    display: inline-block;
                    margin-bottom: 18px;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
                }

                .map-section {
                    width: 100%;
                    height: 450px;
                    margin-top: 60px;
                    display: block;
                }
                .map-iframe {
                    width: 100%;
                    height: 100%;
                    border: 0;
                }
            `}</style>

            {/* KHỐI VIDEO BANNER ĐÃ ĐƯỢC LÀM NỔI BẬT CHỮ */}
            <div className="contact-video-banner">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    src={bannerVideo}
                ></video>
                <div className="contact-video-overlay"></div>
                <div className="contact-banner-content reveal">
                    <span className="contact-badge-gold">
                        ★ Hỗ Trợ Khách Hàng 24/7 ★
                    </span>
                    <h1 className="contact-title-bold">
                        Liên Hệ Với StayHub
                    </h1>
                    <p className="contact-desc-bright">
                        Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng lắng nghe và giải quyết mọi vấn đề để chuyến đi của bạn được trọn vẹn nhất.
                    </p>
                </div>
            </div>

            {/* PHẦN NỘI DUNG CHÍNH (FORM & THÔNG TIN) */}
            <section style={{ paddingBottom: '60px', backgroundColor: '#f8fafc' }}>
                <div className="container reveal">
                    <div className="row g-5">
                        <div className="col-lg-5">
                            <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', height: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                <h4 style={{ fontWeight: 'bold', marginBottom: '30px', color: '#0f172a' }}>Thông tin liên hệ</h4>

                                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ width: '50px', height: '50px', backgroundColor: '#e0f2fe', color: '#0ea5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h6 style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Trụ sở chính</h6>
                                        <p style={{ color: '#475569', margin: 0, lineHeight: '1.6' }}>180 Cao Lỗ, Chánh Hưng, Hồ Chí Minh, Việt Nam</p>
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
                                        <p style={{ color: '#475569', margin: 0 }}>partner@stayhub.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
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
                                            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
                                    </div>

                                    <button type="submit" disabled={isSubmitting} style={{
                                        background: '#0ea5e9', color: '#fff', border: 'none', padding: '14px 30px',
                                        borderRadius: '8px', fontWeight: 'bold', width: '100%', display: 'flex',
                                        justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.3s',
                                        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)', cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                    }}>
                                        <Send size={18} /> {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="map-section reveal">
                <iframe
                    title="Bản đồ vị trí StayHub"
                    className="map-iframe"
                    src="https://www.google.com/maps?q=180+Cao+Lỗ,+Phường+Chánh+Hưng&output=embed"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </section>
        </div>
    );
}