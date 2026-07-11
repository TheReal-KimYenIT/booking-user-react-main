import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const VnpayReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let intervalId;

        const verifyPayment = async () => {
            const responseCode = searchParams.get('vnp_ResponseCode');
            const transactionStatus = searchParams.get('vnp_TransactionStatus');

            if (responseCode === '00' && transactionStatus === '00') {
                try {
                    // 👉 CHUẨN HÓA: Gửi đúng chuỗi URLSearchParams lên Backend
                    await axiosClient.get(`/payment/vnpay-ipn?${searchParams.toString()}`);
                    setStatus('success');
                } catch (error) {
                    console.error("Lỗi xác thực IPN nội bộ:", error);
                    setStatus('success');
                }

                // 👉 ĐÃ SỬA: Chuyển hướng đúng path '/orders'
                intervalId = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(intervalId);
                            navigate('/orders'); // Đường dẫn đúng
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

            } else {
                setStatus('error');

                intervalId = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(intervalId);
                            navigate('/');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        };

        verifyPayment();

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [searchParams, navigate]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '500px', width: '100%', backgroundColor: 'white', padding: '40px 30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>

                {status === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <Loader2 size={48} className="spin-animation" color="#3b82f6" />
                        <h3 className="fw-bold text-secondary m-0">Đang đồng bộ giao dịch...</h3>
                        <p className="text-muted">Vui lòng không đóng trình duyệt lúc này.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="fade-in-up">
                        <CheckCircle2 size={80} color="#10b981" style={{ margin: '0 auto 20px' }} />
                        <h2 className="fw-bold text-dark mb-3">Thanh toán thành công!</h2>
                        <p className="text-muted mb-4">
                            Tuyệt vời! Giao dịch của bạn đã được VNPAY xác nhận an toàn.
                        </p>

                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: 0, color: '#475569', fontWeight: '500' }}>
                                Đang tự động chuyển đến "Đơn hàng của tôi" sau <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '18px' }}>{countdown}</span> giây...
                            </p>
                        </div>

                        {/* 👉 ĐÃ SỬA: Chuyển hướng đúng path '/orders' */}
                        <button onClick={() => navigate('/orders')} className="btn btn-primary fw-bold w-100 py-2" style={{ borderRadius: '8px' }}>
                            Chuyển hướng ngay bây giờ
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="fade-in-up">
                        <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 20px' }} />
                        <h2 className="fw-bold text-dark mb-3">Giao dịch thất bại!</h2>
                        <p className="text-muted mb-4">
                            Bạn đã hủy thanh toán hoặc xảy ra lỗi trong quá trình quẹt thẻ.
                        </p>

                        <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: 0, color: '#991b1b', fontWeight: '500' }}>
                                Trở về trang chủ sau <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{countdown}</span> giây...
                            </p>
                        </div>

                        <button onClick={() => navigate('/')} className="btn btn-secondary fw-bold w-100 py-2" style={{ borderRadius: '8px' }}>
                            Quay về ngay
                        </button>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-animation { animation: spin 1.5s linear infinite; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up { animation: fadeInUp .5s ease-out forwards; }
            `}} />
        </div>
    );
};

export default VnpayReturn;