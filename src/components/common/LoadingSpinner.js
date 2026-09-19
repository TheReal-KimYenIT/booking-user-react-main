import React from 'react';

const LoadingSpinner = ({ 
    fullScreen = false, 
    variant = 'container', // 'container' | 'button' | 'fullScreen'
    size = 'md', // 'sm' | 'md' | 'lg'
    color = '#dfa974' 
}) => {
    
    // Xử lý kích thước
    let spinnerSizeStyle = { width: '2rem', height: '2rem' };
    let borderClass = "spinner-border";
    
    if (size === 'sm') {
        borderClass = "spinner-border spinner-border-sm";
        spinnerSizeStyle = { width: '1rem', height: '1rem' };
    } else if (size === 'lg') {
        spinnerSizeStyle = { width: '3rem', height: '3rem' };
    }

    const spinner = (
        <div className={borderClass} style={{ color: color, ...spinnerSizeStyle, flexShrink: 0 }} role="status">
        </div>
    );

    // Chế độ dành cho Nút bấm (Button)
    if (variant === 'button') {
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {spinner}
            </span>
        );
    }

    // Chế độ toàn màn hình (Full Screen)
    if (fullScreen || variant === 'fullScreen') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
                {spinner}
            </div>
        );
    }

    // Chế độ lồng trong một Container bình thường (Mặc định)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 0', width: '100%' }}>
            {spinner}
        </div>
    );
};

export default LoadingSpinner;
