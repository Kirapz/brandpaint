// src/components/AuthGate.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthGate({ children, message = 'Щоб використовувати цю функцію, потрібно увійти' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return <>{children}</>;

  return (
    <div style={overlay}>
      <div style={card} className="glass-card">
        <h3 style={{ marginTop: 0 }}>Потрібен акаунт</h3>
        <p style={{ marginBottom: 24 }}>{message}</p>
        <button onClick={() => navigate('/auth')} style={primaryBtn}>Увійти / Зареєструватись</button>
      </div>
    </div>
  );
}

const overlay = { 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  height: '100vh', 
  width: '100vw',
  background: 'rgba(0,0,0,0.4)', 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  zIndex: 1000, 
  padding: 20,
};

const card = { 
  maxWidth: 520, 
  padding: 28, 
  borderRadius: 16, 
  textAlign: 'center', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center',
  gap: 16
};

const primaryBtn = { 
  background: '#20001eff', 
  color: '#fff', 
  border: 'none', 
  padding: '12px 24px', 
  borderRadius: 12, 
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 500,
  transition: 'all 0.2s ease',
};

primaryBtn[':hover'] = { background: '#370279ff' }; 
