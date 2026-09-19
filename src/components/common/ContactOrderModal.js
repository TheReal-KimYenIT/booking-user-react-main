import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Hotel } from 'lucide-react';
import customerApi from '../../api/customerApi';

const ContactOrderModal = ({ isOpen, onClose, order, hotelId, hotelName }) => {
    // Modal chat giữa khách hàng và khách sạn cho đơn hàng hoặc trước khi đặt phòng
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [threadId, setThreadId] = useState(null);
    const [hasError, setHasError] = useState(false);
    const scrollRef = useRef(null);

    const [hasAttachedOrderCode, setHasAttachedOrderCode] = useState(false);

    const isPreBooking = !order && hotelId;

    const fetchMessages = useCallback(async () => {
        if (hasError) return;

        try {
            let res;
            if (isPreBooking) {
                res = await customerApi.getPreBookingChatMessages(hotelId);
            } else if (order) {
                res = await customerApi.getChatMessages(order.id);
            }

            if (res && (res.data || res.id)) {
                // Đọc dữ liệu an toàn tránh lỗi undefined
                const threadData = res?.data?.data || res?.data || res;

                if (threadData && threadData.id) {
                    setThreadId(threadData.id);
                    setHasError(false);
                    const sortedMessages = (threadData.messages || []).sort((a, b) =>
                        new Date(a.created_at) - new Date(b.created_at)
                    );
                    setMessages(sortedMessages);
                }
            }
        } catch (error) {
            console.error("Lỗi tải tin nhắn:", error);
            setHasError(true);
        }
    }, [order, hotelId, isPreBooking, hasError]);

    useEffect(() => {
        if (isOpen && (order || isPreBooking)) {
            setHasError(false);
            fetchMessages();
            setHasAttachedOrderCode(false);
        }
    }, [isOpen, order, isPreBooking, fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        let interval;
        if (isOpen && threadId && !hasError) {
            interval = setInterval(() => {
                fetchMessages();
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, threadId, fetchMessages, hasError]);

    if (!isOpen || (!order && !hotelId)) return null;

    const executeSubmit = async () => {
        if (!message.trim() || isSubmitting) return;

        if (!threadId) {
            alert('Đang thiết lập kết nối, vui lòng chờ trong giây lát...');
            setHasError(false);
            fetchMessages();
            return;
        }

        setIsSubmitting(true);
        try {
            let finalMessage = message.trim();
            if (order && !hasAttachedOrderCode) {
                finalMessage = `[Hỗ trợ đơn ${order.booking_code}]:\n${finalMessage}`;
                setHasAttachedOrderCode(true);
            }

            const res = await customerApi.sendMessage(threadId, { message: finalMessage });

            const newMsg = res?.data?.data || res?.data || res;

            // Đề phòng trường hợp API trả về lỗi cấu trúc
            if (!newMsg || typeof newMsg !== 'object') {
                throw new Error("Dữ liệu trả về từ máy chủ không hợp lệ");
            }

            if (!newMsg.created_at) {
                newMsg.created_at = new Date().toISOString();
            }

            setMessages(prevMessages => [...prevMessages, newMsg]);
            setMessage('');
        } catch (error) {
            console.error("Lỗi gửi tin nhắn chi tiết:", error); // In ra log để dễ dò lỗi sau này
            alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        executeSubmit();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            executeSubmit();
        }
    };

    const formatMessageTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${hours}:${minutes} ${day}/${month}`;
    };

    const headerTitle = `Trò chuyện với ${hotelName || 'Khách sạn'}`;

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', width: '450px', height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>

                <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>
                        {headerTitle}
                    </h3>
                    <X size={20} onClick={onClose} style={{ cursor: 'pointer', color: '#64748b' }} />
                </div>

                <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {order && !hasAttachedOrderCode && !hasError && (
                        <div style={{ textAlign: 'center', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                            Mã đơn hàng {order.booking_code} sẽ được tự động đính kèm vào tin nhắn đầu tiên của bạn.
                        </div>
                    )}

                    {hasError ? (
                        <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '20px', fontSize: '14px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px' }}>
                            Không thể kết nối đến máy chủ. Vui lòng đóng cửa sổ và thử lại sau.
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px', fontSize: '14px' }}>
                            Bắt đầu cuộc trò chuyện với khách sạn.
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isCustomer = msg.sender_type === 'customer';
                            return (
                                <div key={index} style={{ display: 'flex', justifyContent: isCustomer ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-end' }}>
                                    {!isCustomer && (
                                        <div style={{ width: 28, height: 28, background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Hotel size={14} color="#0ea5e9" />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCustomer ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                        <div style={{ padding: '10px 15px', borderRadius: '18px', borderBottomRightRadius: isCustomer ? '4px' : '18px', borderBottomLeftRadius: !isCustomer ? '4px' : '18px', fontSize: '14px', backgroundColor: isCustomer ? '#0ea5e9' : '#ffffff', color: isCustomer ? '#fff' : '#334155', border: !isCustomer ? '1px solid #e2e8f0' : 'none', wordBreak: 'break-word', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                                            {msg.message}
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                                            {formatMessageTime(msg.created_at)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '15px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nhập tin nhắn..." rows="2" style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '14px', backgroundColor: '#f8fafc' }} disabled={hasError} />
                    <button type="submit" disabled={isSubmitting || hasError} style={{ background: '#0ea5e9', border: 'none', color: '#fff', borderRadius: '50%', width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', opacity: (isSubmitting || hasError) ? 0.7 : 1 }}>
                        <Send size={18} style={{ marginLeft: '2px' }} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactOrderModal;