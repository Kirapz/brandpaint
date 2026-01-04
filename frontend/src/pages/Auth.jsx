import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { setUserProfile, auth } from '../firebase';
import { updateProfile as fbUpdateProfile } from 'firebase/auth';

export default function AuthPage() {
  const { register, signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/history';

  const [mode, setMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (pass) => {
    if (pass.length < 8) return 'Мінімум 8 символів';
    if (!/[a-zA-Z]/.test(pass)) return 'Пароль повинен містити літери';
    if (!/[0-9]/.test(pass)) return 'Пароль повинен містити цифри';
    if (!/[!@#$%^&*]/.test(pass)) return 'Додайте спецсимвол (!@#$%^&*)';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (mode === 'register') {
      const err = validatePassword(password);
      if (err) {
        setPasswordError(err);
        setSubmitting(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        await signin(email.trim(), password);
        navigate(redirectTo);
      } else {
        await register(email.trim(), password);
        const u = auth.currentUser;
        if (u) {
          await setUserProfile(u.uid, {
            name: name.trim() || '',
            role: role.trim() || ''
          });
          if (name.trim()) {
            try {
              await fbUpdateProfile(u, { displayName: name.trim() });
            } catch (err) {
              console.warn('displayName не оновився', err);
            }
          }
        }
        navigate(redirectTo);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Помилка. Спробуйте ще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="form-grid glass-card auth-form" onSubmit={submit}>
        <h2 className="auth-title">{mode === 'login' ? 'Увійти' : 'Реєстрація'}</h2>

        {mode === 'register' && (
          <>
            <div className="form-item">
              <label>Ім'я (публічне)</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Як будемо вас звати?"
                maxLength={60}
              />
            </div>

            <div className="form-item">
              <label>Посада / Роль (необов'язково)</label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="Наприклад: студент, SMM"
                maxLength={60}
              />
            </div>
          </>
        )}

        <div className="form-item">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="form-item">
          <label>Пароль</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                if (mode === 'register') setPasswordError(validatePassword(val));
              }}
              placeholder="Пароль"
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword ? 'Сховати' : 'Показати'}
            </button>
          </div>
          {mode === 'register' && passwordError && (
            <div className="password-hint">{passwordError}</div>
          )}
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <div className="auth-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting || (mode === 'register' && !!passwordError)}
          >
            {submitting 
              ? (mode === 'login' ? 'Увійти...' : 'Реєструюсь...') 
              : (mode === 'login' ? 'Увійти' : 'Зареєструватись')}
          </button>

          <button
            type="button"
            className="switch-mode-btn"
            onClick={() => {
              setMode(m => (m === 'login' ? 'register' : 'login'));
              setError('');
            }}
          >
            {mode === 'login' ? 'Нема акаунта?' : 'Вже є акаунт?'}
          </button>
        </div>
      </form>
    </div>
  );
}