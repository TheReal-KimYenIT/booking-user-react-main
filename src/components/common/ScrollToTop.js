import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    // Lấy thông tin đường dẫn (URL) hiện tại
    const { pathname } = useLocation();

    useEffect(() => {
        // Lệnh này ép trình duyệt cuộn lên vị trí trên cùng (trục x: 0, trục y: 0)
        window.scrollTo(0, 0);

    }, [pathname]); // Hook này sẽ tự động kích hoạt mỗi khi 'pathname' thay đổi

    // Component này chỉ xử lý logic ngầm, không hiển thị giao diện nên trả về null
    return null;
}