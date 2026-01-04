// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchHistoryOnce, getUserProfile, setUserProfile, auth } from '../firebase';
import { updateProfile as fbUpdateProfile } from 'firebase/auth';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', role: '' });
  const [count, setCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const items = await fetchHistoryOnce(user.uid);
        if (!mounted) return;
        setCount(items.length);

        // 2) мета-профіль з Firestore
        const p = await getUserProfile(user.uid);
        if (!mounted) return;
        setProfile({
          name: p?.name ?? (user.displayName ?? ''),
          role: p?.role ?? ''
        });
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setUserProfile(user.uid, { name: profile.name, role: profile.role });

      if (auth.currentUser) {
        try {
          await fbUpdateProfile(auth.currentUser, { displayName: profile.name || null });
        } catch (err) {
          console.warn('Cannot update auth displayName:', err);
        }
      }

      setEditing(false);
      alert('Профіль успішно збережено');
    } catch (e) {
      console.error(e);
      alert('Не вдалося зберегти профіль. Спробуйте пізніше.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div style={{ padding: 60 }}>Увійдіть, щоб побачити профіль</div>;

  if (loading) return <div style={{ padding: 60 }}>Завантаження профілю…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 880, margin: '80px auto' }}>
      <div className="glass-card" style={{ padding: 22 }}>
        <h2 style={{ marginTop: 0 }}>Профіль</h2>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#ccc' }}>Email</label>
              <div style={{ fontSize: 16, color: '#fff' }}>{user.email}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#ccc' }}>Ім'я</label>
              {!editing ? (
                <div style={{ fontSize: 16, color: '#fff' }}>{profile.name || '—'}</div>
              ) : (
                <input
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Як вас звати?"
                />
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#ccc' }}>Посада / Роль</label>
              {!editing ? (
                <div style={{ fontSize: 16, color: '#fff' }}>{profile.role || '—'}</div>
              ) : (
                <input
                  value={profile.role}
                  onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                  placeholder="Наприклад: студент, SMM, викладач"
                />
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              {!editing ? (
                <button onClick={() => setEditing(true)} style={{ marginRight: 8 }}>Редагувати</button>
              ) : (
                <>
                  <button onClick={save} disabled={saving} style={{ marginRight: 8 }}>
                    {saving ? 'Зберігаю...' : 'Зберегти'}
                  </button>
                  <button onClick={() => { setEditing(false);  }}>
                    Скасувати
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ width: 240, minWidth: 180 }}>
            <div style={{ fontSize: 13, color: '#999' }}>Шаблонів створено</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{count}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
