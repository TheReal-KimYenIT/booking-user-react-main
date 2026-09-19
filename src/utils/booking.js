// Định dạng số tiền theo kiểu tiền Việt Nam để hiển thị trên giao diện
export function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Tính số đêm ở giữa ngày nhận phòng và ngày trả phòng, tối thiểu là 1 đêm
export function countNights(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr) return 1;
  const start = new Date(checkInStr);
  const end = new Date(checkOutStr);
  const ms = end.getTime() - start.getTime();
  if (Number.isNaN(ms) || ms <= 0) return 1;
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

// Lấy ngày hiện tại theo định dạng YYYY-MM-DD để dùng trong form tìm phòng
export function todayISODate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Cộng thêm số ngày vào một ngày đã có để tạo ngày check-out mặc định
export function addDaysISODate(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
