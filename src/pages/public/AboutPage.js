import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Star, Building2, ShieldCheck, Gem, Zap, 
    HeartHandshake, Award, CheckCircle2, ArrowRight, 
    Sparkles, MapPin, PhoneCall, Palmtree, Trees, 
    Search, Luggage, Compass, Clock, Wifi, Check
} from 'lucide-react';
import bannerAboutVideo from './video/bannerAbout.mp4';

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState('resort');

    useEffect(() => {
        // Fallback: đảm bảo nếu scroll observer chưa kích hoạt thì elements vẫn hiển thị
        const timer = setTimeout(() => {
            document.querySelectorAll('.reveal').forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight + 100) {
                    el.classList.add('active');
                }
            });
        }, 150);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        const hiddenElements = document.querySelectorAll('.reveal');
        hiddenElements.forEach((el) => observer.observe(el));

        return () => {
            clearTimeout(timer);
            hiddenElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    const collections = [
        {
            id: 'resort',
            title: 'Resort Ven Biển',
            subtitle: 'Thiên đường nghỉ dưỡng đại dương cao cấp',
            desc: 'Thức giấc cùng tiếng sóng vỗ rì rào, tận hưởng làn nước xanh ngọc từ hồ bơi vô cực và ngắm bình minh tráng lệ từ ban công riêng tại các bãi biển đẹp nhất Đà Nẵng, Phú Quốc, Nha Trang.',
            image: '/img/gallery/gallery-4.jpg',
            icon: Palmtree,
            tag: 'Biển & Nghỉ Dưỡng',
            features: [
                'Hồ bơi vô cực sát biển tầm nhìn 180°',
                'Bữa sáng buffet chuẩn 5 sao quốc tế',
                'Quầy lounge & cocktail hoàng hôn lãng mạn',
                'Dịch vụ xe đưa đón sân bay riêng biệt'
            ]
        },
        {
            id: 'city',
            title: 'City Boutique Hotel',
            subtitle: 'Trái tim phố thị sầm uất & phong cách thời thượng',
            desc: 'Kiến trúc hiện đại tọa lạc tại các vị trí đắc địa kim cương. Chỉ vài bước chân là hòa mình vào không gian ẩm thực, giải trí và văn hóa sôi động của TP. Hồ Chí Minh và Hà Nội.',
            image: '/img/about-1.jpg',
            icon: Building2,
            tag: 'Đô Thị Thời Thượng',
            features: [
                'Vị trí trung tâm kết nối mọi điểm đến',
                'Rooftop Sky Bar ngắm trọn toàn cảnh thành phố',
                'Phòng ốc cách âm tĩnh lặng chuẩn công tác',
                'Hỗ trợ nhận phòng linh hoạt 24/7'
            ]
        },
        {
            id: 'eco',
            title: 'Eco Nature Lodge',
            subtitle: 'Hòa mình giữa thiên nhiên mây ngàn bình yên',
            desc: 'Tận hưởng bầu không khí trong lành nguyên sơ, sớm mai thức giấc giữa biển mây bồng bềnh và lắng nghe tiếng thông reo tĩnh tại giữa núi rừng Đà Lạt, Sa Pa.',
            image: '/img/home/dalat.jpg',
            icon: Trees,
            tag: 'Thiên Nhiên Mây Ngàn',
            features: [
                'View thung lũng & đồi thông săn mây tuyệt tác',
                'Bữa ăn rau củ sạch thu hoạch từ nông trại hữu cơ',
                'Không gian thiền định, trà đạo & yoga ban mai',
                'Tiệc lửa trại và đồ uống ấm cúng về đêm'
            ]
        },
        {
            id: 'work',
            title: 'Business & Workation',
            subtitle: 'Cân bằng hoàn hảo giữa công việc & tái tạo năng lượng',
            desc: 'Không gian làm việc sáng tạo chuẩn mực với đường truyền Wifi tốc độ cao, bàn làm việc công thái học, phòng họp trực tuyến và sự riêng tư tuyệt đối cho các chuyên gia.',
            image: '/img/rooms/room-1.jpg',
            icon: Wifi,
            tag: 'Công Việc & Sáng Tạo',
            features: [
                'Wifi cáp quang băng thông cao 300 Mbps',
                'Bàn làm việc Ergonomic & ánh sáng tự nhiên',
                'Phòng họp hội nghị & thiết bị trình chiếu hiện đại',
                'Quầy cà phê đặc sản & trà phục vụ miễn phí'
            ]
        }
    ];

    const currentCollection = collections.find(c => c.id === activeTab) || collections[0];

    return (
        <div className="about-page-wrapper">
            <style>{`
                html { scroll-behavior: smooth; }

                /* ========================================== */
                /* HERO VIDEO BANNER CAO CẤP                   */
                /* ========================================== */
                .hero-video-section { 
                    position: relative; 
                    min-height: 640px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    overflow: hidden; 
                    background-color: #070c18; 
                    border-bottom-left-radius: 36px;
                    border-bottom-right-radius: 36px;
                    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
                    padding: 85px 24px 145px 24px;
                }
                
                .hero-video-section video { 
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
                
                /* Overlay Gradient sang trọng màu Sapphire trầm ánh vàng */
                .hero-video-overlay { 
                    position: absolute; 
                    top: 0; 
                    left: 0; 
                    width: 100%; 
                    height: 100%; 
                    background: linear-gradient(180deg, rgba(7, 12, 24, 0.76) 0%, rgba(15, 23, 42, 0.55) 45%, rgba(7, 12, 24, 0.94) 100%);
                    z-index: 2; 
                }
                
                .hero-content { 
                    position: relative; 
                    z-index: 3; 
                    text-align: center; 
                    padding: 0 16px; 
                    max-width: 860px;
                    margin: 0 auto;
                }

                .about-badge-gold {
                    background: rgba(223, 169, 116, 0.2);
                    color: #dfa974;
                    border: 1px solid rgba(223, 169, 116, 0.5);
                    padding: 7px 22px;
                    border-radius: 50px;
                    font-size: 13px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.8px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 18px;
                    box-shadow: 0 4px 20px rgba(223, 169, 116, 0.25);
                    backdrop-filter: blur(10px);
                }

                .about-title-bold {
                    color: #ffffff !important;
                    font-weight: 900 !important;
                    font-size: 2.9rem;
                    line-height: 1.25;
                    margin-bottom: 18px;
                    letter-spacing: -0.5px;
                    text-shadow: 0 4px 25px rgba(0, 0, 0, 0.85);
                }
                .about-title-bold span {
                    background: linear-gradient(135deg, #dfa974 20%, #ffd8a8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .about-desc-bright {
                    color: #e2e8f0 !important;
                    font-size: 1.12rem;
                    line-height: 1.75;
                    margin: 0 auto 30px auto;
                    font-weight: 400;
                    max-width: 740px;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
                }

                .hero-cta-btn-gold {
                    background: linear-gradient(135deg, #dfa974 0%, #c8894d 100%);
                    color: #0b1120 !important;
                    font-weight: 800;
                    padding: 13px 30px;
                    border-radius: 50px;
                    font-size: 15px;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 8px 25px rgba(223, 169, 116, 0.4);
                    transition: all 0.3s ease;
                    text-decoration: none;
                    border: none;
                }
                .hero-cta-btn-gold:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(223, 169, 116, 0.55);
                    background: linear-gradient(135deg, #e7b98b 0%, #d6985e 100%);
                    color: #000000 !important;
                }

                .hero-cta-btn-glass {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff !important;
                    font-weight: 700;
                    padding: 13px 26px;
                    border-radius: 50px;
                    font-size: 15px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                    text-decoration: none;
                }
                .hero-cta-btn-glass:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: translateY(-2px);
                }

                /* ========================================== */
                /* FLOATING GLASS STATS BAR                    */
                /* ========================================== */
                .floating-stats-container {
                    position: relative;
                    z-index: 10;
                    margin-top: -65px;
                    margin-bottom: 60px;
                }
                .stats-glass-card {
                    background: rgba(255, 255, 255, 0.96);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(226, 232, 240, 0.9);
                    border-radius: 24px;
                    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
                    padding: 26px 18px;
                    transition: all 0.35s ease;
                }
                .stats-glass-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 22px 50px rgba(223, 169, 116, 0.2);
                    border-color: rgba(223, 169, 116, 0.5);
                }
                .stat-icon-wrapper {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    background: rgba(223, 169, 116, 0.14);
                    color: #dfa974;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 14px;
                    transition: all 0.3s ease;
                }
                .stats-glass-card:hover .stat-icon-wrapper {
                    background: #dfa974;
                    color: #ffffff;
                    transform: scale(1.08);
                }
                .stat-number {
                    font-size: 2.15rem;
                    font-weight: 900;
                    color: #0f172a;
                    line-height: 1;
                    letter-spacing: -0.5px;
                    margin-bottom: 6px;
                }
                .stat-label {
                    font-size: 0.88rem;
                    font-weight: 800;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }
                .stat-subtext {
                    font-size: 0.82rem;
                    color: #94a3b8;
                    margin: 0;
                    line-height: 1.4;
                }

                /* ========================================== */
                /* BRAND STORY SECTION                         */

                /* ========================================== */
                .story-section {
                    padding: 30px 0 80px 0;
                    background: #ffffff;
                }
                .story-badge-eyebrow {
                    color: #dfa974;
                    font-weight: 800;
                    letter-spacing: 1.8px;
                    text-transform: uppercase;
                    font-size: 13px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 12px;
                }
                .story-title-main {
                    font-size: 2.3rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.28;
                    margin-bottom: 22px;
                    letter-spacing: -0.5px;
                }
                .story-text-p {
                    color: #475569;
                    font-size: 1.05rem;
                    line-height: 1.8;
                    margin-bottom: 18px;
                }

                .image-stack-wrapper {
                    position: relative;
                    padding: 10px;
                }
                .image-stack-main {
                    width: 88%;
                    border-radius: 28px;
                    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.14);
                    object-fit: cover;
                    aspect-ratio: 4/3;
                }
                .image-stack-sub {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 52%;
                    border-radius: 22px;
                    border: 5px solid #ffffff;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
                    aspect-ratio: 4/3;
                    object-fit: cover;
                }
                .floating-cert-badge {
                    position: absolute;
                    top: 20px;
                    left: 0;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    padding: 12px 18px;
                    border-radius: 20px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 4;
                }

                .feature-check-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    margin-bottom: 16px;
                }
                .check-icon-gold {
                    color: #dfa974;
                    flex-shrink: 0;
                    margin-top: 3px;
                }

                /* ========================================== */
                /* VALUE PILLARS (4 TRỤ CỘT GIÁ TRỊ)          */
                /* ========================================== */
                .pillars-section {
                    padding: 85px 0;
                    background: #f8fafc;
                    position: relative;
                }
                .pillar-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 32px 26px;
                    height: 100%;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.03);
                }
                .pillar-card:hover {
                    transform: translateY(-6px);
                    border-color: #dfa974;
                    box-shadow: 0 20px 45px rgba(223, 169, 116, 0.18);
                }
                .pillar-icon-box {
                    width: 58px;
                    height: 58px;
                    border-radius: 18px;
                    background: linear-gradient(135deg, rgba(223, 169, 116, 0.16) 0%, rgba(223, 169, 116, 0.06) 100%);
                    color: #dfa974;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    transition: all 0.3s ease;
                }
                .pillar-card:hover .pillar-icon-box {
                    background: #dfa974;
                    color: #ffffff;
                    transform: scale(1.08);
                }
                .pillar-title {
                    font-size: 1.22rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 12px;
                }
                .pillar-desc {
                    color: #64748b;
                    font-size: 0.96rem;
                    line-height: 1.7;
                    margin: 0;
                }

                /* ========================================== */
                /* COLLECTIONS SHOWCASE                       */
                /* ========================================== */
                .collections-section {
                    padding: 85px 0;
                    background: #ffffff;
                }
                .collection-nav-btn {
                    padding: 11px 22px;
                    border-radius: 50px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    color: #475569;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .collection-nav-btn.active, .collection-nav-btn:hover {
                    background: #0f172a;
                    color: #ffffff;
                    border-color: #0f172a;
                    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.16);
                }
                .collection-display-card {
                    background: #f8fafc;
                    border-radius: 32px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.06);
                    transition: all 0.4s ease;
                }
                .collection-img-container {
                    height: 100%;
                    min-height: 420px;
                    overflow: hidden;
                    position: relative;
                }
                .collection-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    min-height: 420px;
                    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .collection-display-card:hover .collection-img {
                    transform: scale(1.04);
                }
                .feature-pill-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    padding: 7px 14px;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                }

                /* ========================================== */
                /* HOW IT WORKS (LUXURY EMBEDDED CARD)        */
                /* ========================================== */
                .how-section-wrapper {
                    padding: 40px 0 80px 0;
                    background: #ffffff;
                }
                .how-master-card {
                    background: linear-gradient(135deg, #0b1120 0%, #172554 60%, #0b1120 100%);
                    border-radius: 36px;
                    padding: 60px 40px;
                    color: #ffffff;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.18);
                    border: 1px solid rgba(223, 169, 116, 0.3);
                }
                .how-glow-circle {
                    position: absolute;
                    width: 350px;
                    height: 350px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(223, 169, 116, 0.2) 0%, rgba(223, 169, 116, 0) 70%);
                    top: -120px;
                    right: -80px;
                    pointer-events: none;
                }
                .step-glass-card {
                    padding: 32px 24px;
                    border-radius: 24px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(12px);
                    transition: all 0.35s ease;
                    height: 100%;
                }
                .step-glass-card:hover {
                    background: rgba(255, 255, 255, 0.09);
                    border-color: rgba(223, 169, 116, 0.6);
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
                }
                .step-number-tag {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #dfa974 0%, #c8894d 100%);
                    color: #0b1120;
                    font-weight: 900;
                    font-size: 1.25rem;
                    margin-bottom: 20px;
                    box-shadow: 0 6px 20px rgba(223, 169, 116, 0.35);
                }

                /* ========================================== */
                /* PROMISES STRIP                              */
                /* ========================================== */
                .promise-pill-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 22px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.03);
                    transition: all 0.3s ease;
                }
                .promise-pill-card:hover {
                    border-color: #dfa974;
                    transform: translateY(-3px);
                    box-shadow: 0 12px 30px rgba(223, 169, 116, 0.15);
                }

                /* ========================================== */
                /* FINAL CTA BANNER                           */
                /* ========================================== */
                .final-cta-section {
                    padding: 20px 0 80px 0;
                    background: #ffffff;
                }
                .cta-gold-banner {
                    background: linear-gradient(135deg, #0b1120 0%, #1e293b 100%);
                    border-radius: 32px;
                    padding: 55px 35px;
                    color: #ffffff;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
                    border: 1px solid rgba(223, 169, 116, 0.3);
                }
                .cta-ambient-glow {
                    position: absolute;
                    top: -100px;
                    right: -100px;
                    width: 340px;
                    height: 340px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(223, 169, 116, 0.25) 0%, rgba(223, 169, 116, 0) 70%);
                    pointer-events: none;
                }

                /* Reveal animations */
                .reveal { 
                    opacity: 0; 
                    transform: translateY(30px); 
                    transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1); 
                }
                .reveal.active { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
                .reveal-left { transform: translateX(-30px); }
                .reveal-right { transform: translateX(30px); }
                .reveal-left.active, .reveal-right.active { transform: translateX(0); }

                @media (max-width: 768px) {
                    .about-title-bold { font-size: 2.1rem; }
                    .hero-video-section { min-height: 540px; padding: 60px 16px 95px 16px; }
                    .floating-stats-container { margin-top: -45px; margin-bottom: 40px; }
                    .story-title-main { font-size: 1.75rem; }
                    .how-master-card { padding: 40px 24px; border-radius: 24px; }
                    .collection-img-container { min-height: 280px; }
                    .collection-img { min-height: 280px; }
                }
            `}</style>

            {/* ========================================== */}
            {/* SECTION 1: HERO CINEMATIC VIDEO BANNER     */}
            {/* ========================================== */}
            <section className="hero-video-section">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    src={bannerAboutVideo}
                ></video>
                <div className="hero-video-overlay"></div>
                <div className="hero-content reveal">
                    <span className="about-badge-gold">
                        <Sparkles size={14} /> Hệ Thống Đặt Phòng Du Lịch StayHub
                    </span>
                    <h1 className="about-title-bold">
                        KHÁM PHÁ STAYHUB <br />
                        <span>Nâng Tầm Trải Nghiệm Lưu Trú</span>
                    </h1>
                    <p className="about-desc-bright">
                        Vượt ra khỏi khái niệm đặt phòng thông thường. StayHub kiến tạo hệ sinh thái hơn 500+ khách sạn & resort tuyển chọn trên khắp Việt Nam, mang đến không gian nghỉ dưỡng chuẩn mực, linh hoạt và đậm dấu ấn riêng cho từng chuyến đi.
                    </p>
                    <div className="d-flex justify-content-center align-items-center flex-wrap gap-3">
                        <Link to="/hotels" className="hero-cta-btn-gold">
                            <Search size={18} /> Khám Phá Khách Sạn Ngay
                        </Link>
                        <Link to="/contact" className="hero-cta-btn-glass">
                            <PhoneCall size={18} /> Hỗ Trợ Tư Vấn 24/7
                        </Link>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* SECTION 2: FLOATING STATS BAR               */}
            {/* ========================================== */}
            <div className="container floating-stats-container">
                <div className="row g-3 g-lg-4">
                    <div className="col-6 col-lg-3 reveal">
                        <div className="stats-glass-card text-center">
                            <div className="stat-icon-wrapper mx-auto">
                                <Building2 size={25} />
                            </div>
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Khách Sạn Tuyển Chọn</div>
                            <p className="stat-subtext">Đã qua 18 tiêu chuẩn thẩm định</p>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3 reveal">
                        <div className="stats-glass-card text-center">
                            <div className="stat-icon-wrapper mx-auto">
                                <MapPin size={25} />
                            </div>
                            <div className="stat-number">63+</div>
                            <div className="stat-label">Tỉnh Thành Phủ Sóng</div>
                            <p className="stat-subtext">Khắp mọi miền đất nước</p>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3 reveal">
                        <div className="stats-glass-card text-center">
                            <div className="stat-icon-wrapper mx-auto">
                                <Luggage size={25} />
                            </div>
                            <div className="stat-number">150K+</div>
                            <div className="stat-label">Đêm Phòng Hoàn Hảo</div>
                            <p className="stat-subtext">Đồng hành cùng hàng ngàn chuyến đi</p>
                        </div>
                    </div>
                    <div className="col-6 col-lg-3 reveal">
                        <div className="stats-glass-card text-center">
                            <div className="stat-icon-wrapper mx-auto">
                                <Star size={25} />
                            </div>
                            <div className="stat-number">4.9 / 5</div>
                            <div className="stat-label">Đánh Giá Hài Lòng</div>
                            <p className="stat-subtext">Từ hơn 10.000+ du khách thật</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* SECTION 3: TRIẾT LÝ & CÂU CHUYỆN THƯƠNG HIỆU */}
            {/* ========================================== */}
            <section className="story-section">
                <div className="container">
                    <div className="row align-items-center g-5">
                        
                        {/* Hình ảnh xếp lớp nghệ thuật */}
                        <div className="col-lg-6 reveal reveal-left">
                            <div className="image-stack-wrapper">
                                <img 
                                    src="/img/about-1.jpg" 
                                    alt="Kiến trúc khách sạn StayHub" 
                                    className="image-stack-main" 
                                />
                                <img 
                                    src="/img/history/history-1.jpg" 
                                    alt="Không gian phòng ngủ sang trọng" 
                                    className="image-stack-sub" 
                                />
                                <div className="floating-cert-badge">
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(223, 169, 116, 0.16)', color: '#dfa974', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>Chuẩn Mực Chất Lượng</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>100% Khách sạn xác minh thực tế</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nội dung câu chuyện & Triết lý */}
                        <div className="col-lg-6 reveal reveal-right">
                            <div className="story-badge-eyebrow">
                                <Compass size={16} /> TRIẾT LÝ & CÂU CHUYỆN STAYHUB
                            </div>
                            <h2 className="story-title-main">
                                Không Gian Sống Sáng Tạo & Kỳ Nghỉ Hoàn Hảo Cho Mọi Hành Trình
                            </h2>
                            <p className="story-text-p">
                                Giống như những gì bạn thấy ở các khách sạn hàng đầu, <strong>StayHub</strong> không chỉ là nơi để ngủ. Chúng tôi mang đến hệ sinh thái tích hợp từ phòng ngủ tiện nghi, không gian làm việc sáng tạo (co-working space) đến các khu vực nghỉ ngơi tái tạo năng lượng.
                            </p>
                            <p className="story-text-p">
                                Ra đời với sứ mệnh xóa bỏ những trải nghiệm thất vọng trong ngành lưu trú — hình ảnh không đúng thực tế, chi phí ẩn mập mờ và thủ tục phức tạp — StayHub cam kết mang đến sự an tâm tuyệt đối và minh bạch trong từng cú chạm đặt phòng.
                            </p>

                            <div className="mt-4 pt-2">
                                <div className="feature-check-item">
                                    <CheckCircle2 size={22} className="check-icon-gold" />
                                    <div>
                                        <strong style={{ color: '#0f172a', fontSize: '1.02rem', display: 'block', marginBottom: '2px' }}>Minh Bạch Chi Phí Tuyệt Đối</strong>
                                        <span style={{ color: '#64748b', fontSize: '0.92rem' }}>Giá hiển thị là giá thanh toán trọn gói cuối cùng. Cam kết không phí ẩn, không thuế mập mờ tại quầy.</span>
                                    </div>
                                </div>
                                <div className="feature-check-item">
                                    <CheckCircle2 size={22} className="check-icon-gold" />
                                    <div>
                                        <strong style={{ color: '#0f172a', fontSize: '1.02rem', display: 'block', marginBottom: '2px' }}>Xác Nhận & Cấp Mã Đặt Phòng Tức Thì</strong>
                                        <span style={{ color: '#64748b', fontSize: '0.92rem' }}>Thanh toán đa kênh qua VNPAY an toàn hoặc QR ngân hàng 24/7, nhận mã phòng điện tử chỉ trong 30 giây.</span>
                                    </div>
                                </div>
                                <div className="feature-check-item">
                                    <CheckCircle2 size={22} className="check-icon-gold" />
                                    <div>
                                        <strong style={{ color: '#0f172a', fontSize: '1.02rem', display: 'block', marginBottom: '2px' }}>Đồng Hành & Hỗ Trợ 24/7 Trong Mọi Tình Huống</strong>
                                        <span style={{ color: '#64748b', fontSize: '0.92rem' }}>Tổng đài hỗ trợ 1900 1234 và đội ngũ chăm sóc khách hàng luôn sẵn sàng xử lý mọi thắc mắc của bạn.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* SECTION 4: 4 TRỤ CỘT GIÁ TRỊ CỐT LÕI       */}
            {/* ========================================== */}
            <section className="pillars-section">
                <div className="container">
                    <div className="text-center mb-5 reveal">
                        <span className="about-badge-gold">
                            <Gem size={14} /> GIÁ TRỊ CỐT LÕI
                        </span>
                        <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '14px' }}>
                            Nền Tảng Vững Chắc Tạo Nên Sự Khác Biệt
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '620px', margin: '0 auto' }}>
                            4 nguyên tắc bất biến định hướng mọi quyết định và nâng tầm chất lượng dịch vụ của StayHub.
                        </p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3 reveal">
                            <div className="pillar-card">
                                <div className="pillar-icon-box">
                                    <ShieldCheck size={28} />
                                </div>
                                <h3 className="pillar-title">Minh Bạch & An Toàn</h3>
                                <p className="pillar-desc">
                                    Mọi chính sách hủy phòng, hoàn tiền và bảo vệ quyền lợi du khách được quy định rõ ràng. Giao dịch luôn được bảo đảm an toàn tuyệt đối.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 reveal">
                            <div className="pillar-card">
                                <div className="pillar-icon-box">
                                    <Gem size={28} />
                                </div>
                                <h3 className="pillar-title">Tiêu Chuẩn Tuyển Chọn</h3>
                                <p className="pillar-desc">
                                    Mỗi khách sạn đều trải qua quy trình kiểm định 18 tiêu chuẩn về độ sạch sẽ, tiện nghi phòng ngủ và tác phong phục vụ trước khi lên sàn.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 reveal">
                            <div className="pillar-card">
                                <div className="pillar-icon-box">
                                    <Zap size={28} />
                                </div>
                                <h3 className="pillar-title">Công Nghệ Tức Thì</h3>
                                <p className="pillar-desc">
                                    Tìm kiếm thông minh theo tiện ích, so sánh giá trực quan, thanh toán trực tuyến bảo mật và quy trình check-in siêu tốc bằng mã QR.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3 reveal">
                            <div className="pillar-card">
                                <div className="pillar-icon-box">
                                    <HeartHandshake size={28} />
                                </div>
                                <h3 className="pillar-title">Đồng Hành Bền Vững</h3>
                                <p className="pillar-desc">
                                    Áp dụng mức phí dịch vụ sàn công bằng chỉ 15%, đồng hành cùng các chủ khách sạn địa phương phát triển kinh doanh và quảng bá thương hiệu.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* SECTION 5: BỘ SƯU TẬP KHÔNG GIAN NGHỈ DƯỠNG */}
            {/* ========================================== */}
            <section className="collections-section">
                <div className="container">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 gap-3 reveal">
                        <div>
                            <span className="about-badge-gold">
                                <Palmtree size={14} /> BỘ SƯU TẬP NGHỈ DƯỠNG
                            </span>
                            <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>
                                Không Gian Hoàn Hảo Cho Mọi Mục Đích
                            </h2>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {collections.map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveTab(item.id)}
                                    className={`collection-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                                >
                                    <item.icon size={16} />
                                    <span>{item.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hiển thị chi tiết Collection đang active */}
                    <div className="collection-display-card reveal">
                        <div className="row g-0 align-items-center">
                            <div className="col-lg-6 p-4 p-md-5">
                                <span style={{ background: 'rgba(223, 169, 116, 0.18)', color: '#dfa974', padding: '6px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {currentCollection.tag}
                                </span>
                                <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginTop: '16px', marginBottom: '8px' }}>
                                    {currentCollection.title}
                                </h3>
                                <h5 style={{ color: '#64748b', fontSize: '1.15rem', fontWeight: 600, marginBottom: '18px' }}>
                                    {currentCollection.subtitle}
                                </h5>
                                <p style={{ color: '#475569', fontSize: '1.02rem', lineHeight: '1.8', marginBottom: '24px' }}>
                                    {currentCollection.desc}
                                </p>

                                {/* Tiện ích nổi bật của bộ sưu tập */}
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {currentCollection.features.map((feat, idx) => (
                                        <span key={idx} className="feature-pill-badge">
                                            <Check size={14} style={{ color: '#dfa974' }} />
                                            {feat}
                                        </span>
                                    ))}
                                </div>

                                <Link to="/hotels" className="hero-cta-btn-gold" style={{ display: 'inline-flex' }}>
                                    Xem Danh Sách Khách Sạn <ArrowRight size={18} />
                                </Link>
                            </div>

                            <div className="col-lg-6">
                                <div className="collection-img-container">
                                    <img 
                                        src={currentCollection.image} 
                                        alt={currentCollection.title} 
                                        className="collection-img" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* SECTION 6: QUY TRÌNH 3 BƯỚC ĐẶT PHÒNG      */}
            {/* ========================================== */}
            <div className="how-section-wrapper">
                <div className="container">
                    <div className="how-master-card reveal">
                        <div className="how-glow-circle"></div>
                        <div className="text-center mb-5">
                            <span className="about-badge-gold">
                                <Clock size={14} /> ĐẶT PHÒNG THÔNG MINH
                            </span>
                            <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '14px' }}>
                                Trải Nghiệm Đặt Phòng Tiện Lợi Trong 3 Bước
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto' }}>
                                Tối ưu thời gian và sự an tâm từ thao tác chọn phòng đến khi nhận chìa khóa.
                            </p>
                        </div>

                        <div className="row g-4">
                            <div className="col-md-4">
                                <div className="step-glass-card">
                                    <div className="step-number-tag">01</div>
                                    <h4 style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.25rem', marginBottom: '12px' }}>
                                        Tìm Kiếm & So Sánh
                                    </h4>
                                    <p style={{ color: '#94a3b8', fontSize: '0.96rem', lineHeight: '1.7', margin: 0 }}>
                                        Nhập điểm đến, lọc tiện ích hồ bơi, bữa sáng, xem ảnh thực tế và các đánh giá minh bạch từ du khách đã lưu trú thật.
                                    </p>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="step-glass-card">
                                    <div className="step-number-tag">02</div>
                                    <h4 style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.25rem', marginBottom: '12px' }}>
                                        Thanh Toán Bảo Mật
                                    </h4>
                                    <p style={{ color: '#94a3b8', fontSize: '0.96rem', lineHeight: '1.7', margin: 0 }}>
                                        Lựa chọn thanh toán qua cổng VNPAY an toàn, Chuyển khoản QR ngân hàng hoặc chọn thanh toán trực tiếp tại quầy lễ tân.
                                    </p>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="step-glass-card">
                                    <div className="step-number-tag">03</div>
                                    <h4 style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.25rem', marginBottom: '12px' }}>
                                        Nhận Phòng & Tận Hưởng
                                    </h4>
                                    <p style={{ color: '#94a3b8', fontSize: '0.96rem', lineHeight: '1.7', margin: 0 }}>
                                        Mã đặt phòng điện tử gửi tức thì qua Email & SMS. Check-in siêu tốc tại lễ tân và tận hưởng kỳ nghỉ hoàn hảo của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* SECTION 7: CAM KẾT DỊCH VỤ CỦA STAYHUB    */}
            {/* ========================================== */}
            <section style={{ padding: '40px 0 60px 0', backgroundColor: '#ffffff' }}>
                <div className="container">
                    <div className="row g-3">
                        <div className="col-sm-6 col-lg-3 reveal">
                            <div className="promise-pill-card">
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>Không Phí Ẩn</div>
                                    <div style={{ color: '#64748b', fontSize: '13px' }}>Giá hiển thị là giá trọn gói</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3 reveal">
                            <div className="promise-pill-card">
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>Không Phòng Ảo</div>
                                    <div style={{ color: '#64748b', fontSize: '13px' }}>100% hình ảnh thực tế</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3 reveal">
                            <div className="promise-pill-card">
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>Check-in Siêu Tốc</div>
                                    <div style={{ color: '#64748b', fontSize: '13px' }}>Mã điện tử trong 1 phút</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-6 col-lg-3 reveal">
                            <div className="promise-pill-card">
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <PhoneCall size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>Hỗ Trợ 1900 1234</div>
                                    <div style={{ color: '#64748b', fontSize: '13px' }}>Túc trực 24/7 đồng hành</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* SECTION 8: FINAL LUXURY CTA BANNER         */}
            {/* ========================================== */}
            <section className="final-cta-section">
                <div className="container reveal">
                    <div className="cta-gold-banner text-center">
                        <div className="cta-ambient-glow"></div>
                        <span className="about-badge-gold">
                            <Sparkles size={14} /> KHỞI HÀNH CÙNG STAYHUB
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '16px', lineHeight: 1.2 }}>
                            Sẵn Sàng Cho Chuyến Nghỉ Dưỡng Hoàn Hảo?
                        </h2>
                        <p style={{ color: '#cbd5e1', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto 36px auto', lineHeight: 1.8 }}>
                            Hơn 500+ không gian khách sạn & resort chất lượng cao đã sẵn sàng chào đón bạn. Khám phá ngay các ưu đãi đặc quyền hôm nay!
                        </p>
                        <div className="d-flex justify-content-center align-items-center flex-wrap gap-3">
                            <Link to="/hotels" className="hero-cta-btn-gold">
                                <Search size={18} /> Tìm Khách Sạn Ngay
                            </Link>
                            <Link to="/contact" className="hero-cta-btn-glass">
                                <PhoneCall size={18} /> Hỗ Trợ Tư Vấn
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}