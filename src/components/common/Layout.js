import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="app-shell">
            <Header />

            {/* Phần ruột chứa nội dung các trang */}
            <main className="app-main" key={location.pathname}>
                {children}
            </main>

            <Footer />
        </div>
    );
}