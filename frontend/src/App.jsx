// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Editor from './pages/Editor';
import History from './pages/History';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import './styles/App.css';
import './styles/nav.css';
import './styles/mobile-menu.css';
import './styles/glass.css';
import './styles/Auth.css';
import './styles/editor.css';
import './styles/Gentr.css';
import './styles/History.css';
import './styles/Footer.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Footer from './components/Footer';

function Nav() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <nav className="navbar mobile-navbar">
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Відкрити меню"
          >
            ☰
          </button>
        </nav>
        
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>
        
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <button 
              className="mobile-menu-close"
              onClick={closeMobileMenu}
              aria-label="Закрити меню"
            >
              ✕
            </button>
          </div>
          
          <div className="mobile-menu-content">
            <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
              Головна
            </Link>
            <Link to="/generator" className="mobile-nav-link" onClick={closeMobileMenu}>
              Створити макет
            </Link>
            <Link to="/history" className="mobile-nav-link" onClick={closeMobileMenu}>
              Історія
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Профіль
                </Link>
                <button 
                  className="mobile-nav-link mobile-nav-button" 
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                >
                  Вийти
                </button>
              </>
            ) : (
              <Link to="/auth" className="mobile-nav-link" onClick={closeMobileMenu}>
                Вхід
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">Головна</Link>
      <Link to="/generator" className="nav-link">Створити макет</Link>
      <Link to="/history" className="nav-link">Історія</Link>
      {user ? (
        <>
          <Link to="/profile" className="nav-link">Профіль</Link>
          <button className="nav-link" onClick={() => logout()}>Вийти</button>
        </>
      ) : (
        <>
          <Link to="/auth" className="nav-link">Вхід</Link>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
            <div className="app-root">
        <Nav />
        <main className="app-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/history" element={<History />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        </main>
        <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
