import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Hotel } from 'lucide-react';
import customerApi from '../../api/customerApi';

const ContactOrderModal = ({ isOpen, onClose, order, hotelId, hotelName }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [threadId, setThreadId] = useState(null);
    const scrollRef = useRef(null);

    // Xác định đang là loại chat nào
    const isPreBooking = !order && hotelId;

    const fetchMessages = useCallback(async () => {
        try {
            let res;
            if (isPreBooking) {
                // Gọi API chat vãng lai
                res = await customerApi.getPreBookingChatMessages(hotelId);
            } else if (order) {
                // Gọi API chat đơn hàng
                res = await customerApi.getChatMessages(order.id);
            }

            if (res && res.data) {
                // 👉 FIX LỖI: Chống lỗi dữ liệu bị bọc trong 'data'
                const threadData = res.data.data ? res.data.data : res.data;

                if (threadData && threadData.id) {
                    setThreadId(threadData.id);
                    const sortedMessages = (threadData.messages || []).sort((a, b) =>
                        new Date(a.created_at) - new Date(b.created_at)
                    );
                    setMessages(sortedMessages);
                    setMessages(threadData.messages || []);
                }
            }
        } catch (error) {
            console.error("Lỗi tải tin nhắn:", error);
        }
    }, [order, hotelId, isPreBooking]);

    useEffect(() => {
        if (isOpen && (order || isPreBooking)) {
            fetchMessages();
        }
    }, [isOpen, order, isPreBooking, fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    useEffect(() => {
        let interval;
        // Chỉ chạy lặp khi Modal đang mở và đã có threadId
        if (isOpen && threadId) {
            interval = setInterval(() => {
                fetchMessages();
            }, 3000); // 3000ms = 3 giây
        }

        // Dọn dẹp bộ nhớ khi đóng Modal
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, threadId, fetchMessages]);

    if (!isOpen || (!order && !hotelId)) return null;

    const executeSubmit = async () => {
        if (!message.trim() || isSubmitting) return;

        // 👉 FIX LỖI: Kiểm tra nếu chưa lấy được luồng chat
        if (!threadId) {
            alert('Chưa kết nối được với phòng chat, đang tải lại...');
            fetchMessages();
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await customerApi.sendMessage(threadId, { message: message.trim() });

            // Xử lý dữ liệu trả về
            const newMsg = res.data.data ? res.data.data : res.data;

            // 👉 Tự động gắn giờ hiện tại vào tin nhắn vừa gửi
            if (!newMsg.created_at) {
                newMsg.created_at = new Date().toISOString();
            }

            setMessages(prevMessages => [...prevMessages, newMsg]);
            setMessage('');
        } catch (error) {
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

    // Đổi tiêu đề linh hoạt
    const headerTitle = isPreBooking
        ? `Tư vấn: ${hotelName || 'Khách sạn'}`
        : `Hỗ trợ đơn #${order?.booking_code || order?.id}`;

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', width: '450px', height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px' }}>
                        {headerTitle}
                    </h3>
                    <X size={20} onClick={onClose} style={{ cursor: 'pointer', color: '#64748b' }} />
                </div>

                {/* Khu vực hiển thị tin nhắn */}
                <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px', fontSize: '14px' }}>
                            {isPreBooking ? 'Hãy gửi tin nhắn để được khách sạn tư vấn ngay nhé!' : 'Bắt đầu cuộc trò chuyện với khách sạn.'}
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
                                        <div style={{ padding: '10px 15px', borderRadius: '18px', borderBottomRightRadius: isCustomer ? '4px' : '18px', borderBottomLeftRadius: !isCustomer ? '4px' : '18px', fontSize: '14px', backgroundColor: isCustomer ? '#0ea5e9' : '#ffffff', color: isCustomer ? '#fff' : '#334155', border: !isCustomer ? '1px solid #e2e8f0' : 'none', wordBreak: 'break-word', lineHeight: '1.4' }}>
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

                {/* Khung nhập tin */}
                <form onSubmit={handleSubmit} style={{ padding: '15px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nhập tin nhắn..." rows="2" style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '14px', backgroundColor: '#f8fafc' }} />
                    <button type="submit" disabled={isSubmitting} style={{ background: '#0ea5e9', border: 'none', color: '#fff', borderRadius: '50%', width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', opacity: isSubmitting ? 0.7 : 1 }}>
                        <Send size={18} style={{ marginLeft: '2px' }} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactOrderModal;