import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import customerApi from '../../api/customerApi';
import { MessageSquare, Clock, Hotel as HotelIcon, ChevronRight } from 'lucide-react';
import ContactOrderModal from '../../components/common/ContactOrderModal';

const MyChatsPage = () => {
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(''); // 👉 Thêm để theo dõi lỗi cụ thể
    const navigate = useNavigate();

    // State quản lý Modal
    const [selectedChat, setSelectedChat] = useState(null);

    const fetchChats = useCallback(async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await customerApi.getAllChats();

            if (res && res.data) {
                // 👉 Tối ưu hóa: Nhận diện linh hoạt cả res.data.data và res.data
                const finalData = res.data.data ? res.data.data : res.data;
                setChats(Array.isArray(finalData) ? finalData : []);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách chat:", error);
            setErrorMsg('Không thể kết nối dữ liệu tin nhắn. Vui lòng kiểm tra lại Backend Laravel!');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    const handleOpenChat = (chat) => {
        setSelectedChat(chat);
    };

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '80vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
                    <div style={{ backgroundColor: '#e0f2fe', padding: '12px', borderRadius: '50%', color: '#0ea5e9' }}>
                        <MessageSquare size={28} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Tin nhắn của tôi</h2>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '15px' }}>
                        <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>Đang tải danh sách tin nhắn...</span>
                    </div>
                ) : errorMsg ? (
                    // 👉 HIỂN THỊ NẾU CÓ LỖI KẾT NỐI BACKEND
                    <div style={{ backgroundColor: '#fee2e2', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{errorMsg}</p>
                        <button onClick={fetchChats} style={{ marginTop: '10px', padding: '6px 16px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Thử lại</button>
                    </div>
                ) : chats.length === 0 ? (
                    <div style={{ backgroundColor: '#fff', padding: '50px 20px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '15px' }} />
                        <h3 style={{ color: '#475569', fontSize: '18px', marginBottom: '10px' }}>Bạn chưa có cuộc trò chuyện nào</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Hãy bắt đầu trò chuyện với khách sạn để được tư vấn nhé!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {chats.map(chat => {
                            const hotelName = chat.hotel?.name || 'Khách sạn';
                            const latestMsg = chat.latest_message;
                            const isPreBooking = !chat.booking_id;

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => handleOpenChat(chat)}
                                    style={{
                                        backgroundColor: '#fff', padding: '20px', borderRadius: '12px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s',
                                        border: '1px solid #f1f5f9'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.05)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)'; }}
                                >
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flex: 1 }}>
                                        <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b', flexShrink: 0 }}>
                                            <HotelIcon size={24} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{hotelName}</h4>
                                                {isPreBooking ? (
                                                    <span style={{ fontSize: '11px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Hỏi đáp vãng lai</span>
                                                ) : (
                                                    <span style={{ fontSize: '11px', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Đơn #{chat.booking?.booking_code}</span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <p style={{ margin: 0, fontSize: '14px', color: latestMsg ? '#475569' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>
                                                    {latestMsg ? (latestMsg.sender_type === 'customer' ? `Bạn: ${latestMsg.message}` : `${hotelName}: ${latestMsg.message}`) : 'Chưa có tin nhắn nào...'}
                                                </p>
                                                {latestMsg && (
                                                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                                        <Clock size={12} /> {formatTime(latestMsg.created_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight color="#cbd5e1" style={{ marginLeft: '15px' }} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Render Modal Chat khi click */}
            {selectedChat && (
                <ContactOrderModal
                    isOpen={!!selectedChat}
                    onClose={() => {
                        setSelectedChat(null);
                        fetchChats();
                    }}
                    order={selectedChat.booking_id ? { id: selectedChat.booking_id, booking_code: selectedChat.booking?.booking_code } : null}
                    hotelId={selectedChat.hotel_id}
                    hotelName={selectedChat.hotel?.name}
                />
            )}
        </div>
    );
};

export default MyChatsPage;