import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeHistory, toggleFavorite, deleteHistoryItem } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [queryStr, setQueryStr] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  const [openDesc, setOpenDesc] = useState({});

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeHistory(user.uid, setItems);
    return () => unsub();
  }, [user]);

  if (loading) return <div className="history-page">Завантаження…</div>;
  if (!user) return <div className="history-page">Будь ласка, увійдіть.</div>;

  const processedItems = items
    .filter(i => {
      if (onlyFav && !i.favorite) return false;
      if (!queryStr) return true;
      const s = queryStr.toLowerCase();
      return (
        i.title?.toLowerCase().includes(s) ||
        i.description?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const getTs = (x) => x.updatedAt?.seconds ?? x.createdAt?.seconds ?? 0;
      return sortOrder === 'desc' ? getTs(b) - getTs(a) : getTs(a) - getTs(b);
    });

  const formatDate = (ts) => {
    if (!ts?.toDate) return '—';
    return ts.toDate().toLocaleString('uk-UA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const toggleDesc = (id) => {
    setOpenDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="history-page">
      <h2 className="history-title">Історія шаблонів</h2>

      <div className="history-filters">
        <input
          placeholder="Пошук за назвою або описом…"
          value={queryStr}
          onChange={(e) => setQueryStr(e.target.value)}
          className="filter-input"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="filter-select"
        >
          <option value="desc">Спочатку нові</option>
          <option value="asc">Спочатку старі</option>
        </select>

        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={onlyFav}
            onChange={(e) => setOnlyFav(e.target.checked)}
          />
          Тільки обране
        </label>
      </div>

      <div className="history-list">
        {processedItems.map(item => (
          <div key={item.id} className="history-card">
            <div className="card-top">
              <div style={{ flex: 1 }}>
                <div className="card-title">{item.title || 'Без назви'}</div>
                
                {item.description && (
                  <>
                    <button 
                      className="desc-toggle-btn" 
                      onClick={() => toggleDesc(item.id)}
                    >
                      {openDesc[item.id] ? 'Сховати опис' : 'Показати опис'}
                    </button>
                    {openDesc[item.id] && (
                      <div className="card-description">{item.description}</div>
                    )}
                  </>
                )}

                <div className="card-dates">
                  <div>Створено: {formatDate(item.createdAt)}</div>
                  {item.updatedAt && (
                    <div className="updated-label">
                      Оновлено: {formatDate(item.updatedAt)}
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => toggleFavorite(user.uid, item.id, !item.favorite)}
                  className="btn-icon"
                  title="Додати в обране"
                >
                  {item.favorite ? '★' : '☆'}
                </button>

                <button
                  onClick={() => {
                    if(window.confirm('Видалити цей шаблон з історії?')) {
                      deleteHistoryItem(user.uid, item.id);
                    }
                  }}
                  className="btn-delete"
                >
                  Видалити
                </button>

                <button
                  onClick={() => {
                    console.log('Opening template:', item.template);
                    navigate('/editor', {
                      state: { template: item.template, historyId: item.id }
                    });
                  }}
                  className="btn-open"
                >
                  Відкрити
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {processedItems.length === 0 && (
        <p className="empty-state">Нічого не знайдено за вашим запитом.</p>
      )}
    </div>
  );
}