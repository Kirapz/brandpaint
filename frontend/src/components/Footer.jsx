import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} BrandPaint</span>
        <span className="dot">•</span>
        <span>Курсова робота</span>
        <span className="dot">•</span>
        <span>Піцура Кіра ОІ-31</span>
      </div>
    </footer>
  );
}
