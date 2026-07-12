import React from 'react';
import { Link } from 'react-router-dom';
// Đã gỡ bỏ Facebook, Instagram, Twitter, Youtube khỏi lucide-react
import { MapPin, Phone, Mail, CreditCard } from 'lucide-react';

const Footer = () => {
    return (
        <>
            <style>{`
                .premium-footer {
                    background-color: #0f172a; 
                    color: #cbd5e1; 
                    font-size: 15px;
                    border-top: 5px solid #fbbf24; 
                }
                .footer-title {
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 18px;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .footer-list { list-style: none; padding: 0; margin: 0; }
                .footer-list li { margin-bottom: 12px; }
                .footer-link {
                    color: #cbd5e1; text-decoration: none; transition: all 0.3s ease; display: inline-block;
                }
                .footer-link:hover { color: #fbbf24; transform: translateX(5px); }
                
                /* Tùy chỉnh Nút mạng xã hội dùng FontAwesome */
                .social-btn {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 36px; height: 36px; border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: #fff; margin-right: 10px; transition: 0.3s; text-decoration: none;
                    font-size: 16px; /* Chỉnh size cho FontAwesome */
                }
                .social-btn:hover { background-color: #fbbf24; color: #0f172a; transform: translateY(-3px); }
                
                .newsletter-input {
                    background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff;
                }
                .newsletter-input:focus { background-color: rgba(255, 255, 255, 0.1); border-color: #fbbf24; color: #fff; box-shadow: none; }
                .newsletter-input::placeholder { color: #94a3b8; }
            `}</style>

            <footer className="premium-footer pt-5 pb-3">
                <div className="container">
                    <div className="row mb-5">

                        <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                            <div className="mb-4">
                                <Link to="/"><img src="/img/logo.png" alt="StayHub Logo" style={{ maxHeight: '45px' }} /></Link>
                            </div>
                            <p style={{ lineHeight: '1.6' }}>
                                StayHub là nền tảng đặt phòng khách sạn hàng đầu, mang đến cho bạn trải nghiệm lưu trú tuyệt vời với mức giá tốt nhất.
                            </p>
                            <ul className="footer-list mt-4">
                                <li className="d-flex align-items-start gap-2">
                                    <MapPin size={18} className="text-warning mt-1 flex-shrink-0" />
                                    <span>Tòa nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Phone size={18} className="text-warning flex-shrink-0" />
                                    <span>1900 1234 (24/7 Hỗ trợ)</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <Mail size={18} className="text-warning flex-shrink-0" />
                                    <span>support@hiroto.com</span>
                                </li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                            <h4 className="footer-title">Về StayHub</h4>
                            <ul className="footer-list">
                                <li><Link to="/about" className="footer-link">Giới thiệu về chúng tôi</Link></li>
                                <li><Link to="/contact" className="footer-link">Tuyển dụng</Link></li>
                                <li><Link to="/contact" className="footer-link">Báo chí & Truyền thông</Link></li>
                                <li><Link to="/contact" className="footer-link">Trở thành đối tác khách sạn</Link></li>
                                <li><Link to="/contact" className="footer-link">Chương trình liên kết</Link></li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                            <h4 className="footer-title">Hỗ trợ khách hàng</h4>
                            <ul className="footer-list">
                                <li><Link to="/faq" className="footer-link">Câu hỏi thường gặp (FAQ)</Link></li>
                                <li><Link to="/terms" className="footer-link">Điều khoản sử dụng</Link></li>
                                <li><Link to="/privacy" className="footer-link">Chính sách bảo mật</Link></li>
                                <li><Link to="/refund" className="footer-link">Quy chế hoàn tiền</Link></li>
                                <li><Link to="/guide" className="footer-link">Hướng dẫn đặt phòng</Link></li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <h4 className="footer-title">Nhận mã khuyến mãi</h4>
                            <p>Nhập email của bạn để không bỏ lỡ các deal khách sạn giảm giá lên đến 50%.</p>

                            <form className="mt-3 mb-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="input-group">
                                    <input type="email" className="form-control newsletter-input" placeholder="Nhập email của bạn..." required />
                                    <button className="btn btn-warning fw-bold text-dark" type="submit">Gửi</button>
                                </div>
                            </form>

                            <h4 className="footer-title" style={{ fontSize: '15px' }}>Kết nối với chúng tôi</h4>
                            <div className="d-flex">
                                {/* Đã thay thế bằng FontAwesome class */}
                                <a href="#" className="social-btn"><i className="fa fa-facebook"></i></a>
                                <a href="#" className="social-btn"><i className="fa fa-instagram"></i></a>
                                <a href="#" className="social-btn"><i className="fa fa-twitter"></i></a>
                                <a href="#" className="social-btn"><i className="fa fa-youtube-play"></i></a>
                            </div>
                        </div>

                    </div>

                    <div className="row align-items-center pt-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                        <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                            <p className="mb-0" style={{ fontSize: '14px' }}>
                                Copyright &copy; {new Date().getFullYear()} <strong>StayHub Travel</strong>. Đã đăng ký bản quyền.
                            </p>
                        </div>
                        <div className="col-md-6 text-center text-md-end">
                            <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-3">
                                <span style={{ fontSize: '14px' }}>Chấp nhận thanh toán:</span>
                                <div className="d-flex gap-2 text-warning">
                                    <CreditCard size={28} />
                                    <span className="fw-bold" style={{ fontSize: '18px' }}>VNPay</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;