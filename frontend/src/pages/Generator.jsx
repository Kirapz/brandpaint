import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateLayout } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { saveHistoryForUser } from '../firebase';

const Generator = () => {
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState(''); 
  const [keywords, setKeywords] = useState('');
  const [preset, setPreset] = useState('default');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Відправляємо запит на генерацію:', { 
        brandName,
        description, 
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        preset
      });

      const result = await generateLayout({ 
        brandName,
        description, 
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        preset
      });

      console.log('Отримали результат:', result);

      if (result.success) {
        // save to firebase history if user is logged in
        if (user && user.uid) {
          try {
            await saveHistoryForUser(user.uid, {
              title: brandName || (description || '').slice(0, 50),
              description,
              preset,
              keywords: keywords.split(',').map(k=>k.trim()).filter(Boolean),
              template: result.data,
            });
            console.log('Збережено в історію');
          } catch (historyError) {
            console.error('Помилка збереження в історію:', historyError);
            // Не блокуємо процес, якщо історія не збереглася
          }
        }

        navigate('/editor?' + Date.now(), {
          state: { template: result.data }
        });
      } else {
        throw new Error(result.error || 'Невідома помилка генерації');
      }
      
    } catch (error) {
      console.error('Помилка генерації:', error);
      
      let errorMessage = 'Сталася помилка при генерації';
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Не вдається підключитися до сервера. Перевірте інтернет-з\'єднання.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Шаблон не знайдено. Спробуйте інші ключові слова.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Помилка сервера. Спробуйте пізніше.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <h2>Генератор BrandPaint</h2>
      <form onSubmit={handleGenerate} className="form-grid">
        <div className="form-item">
          <label>Назва вашого бренду:</label>
          <input 
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Наприклад: My Coffee Shop, Beauty Studio..."
            required
          />
        </div>

        <div className="form-item">
          <label>Опишіть ваш бізнес/ідею:</label>
          <textarea 
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Наприклад: Сайт для сучасної кав'ярні... Підказка: Вкажіть кольори, структуру (hero, gallery)."
            required
          />
        </div>
        
        <div className="form-item">
          <label>Ключові слова (через кому):</label>
          <input 
            type="text" 
            name="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="кава, затишок, темний фон, modern"
          />
        </div>

        <div className="form-item">
          <label>Оберіть пресет стилю:</label>
          <select
            name="preset" 
            value={preset} 
            onChange={(e) => setPreset(e.target.value)}
          >
            <option value="default">Default (Стандартний)</option>
            <option value="minimal">Minimal (Чистий, гострі кути)</option>
            <option value="corporate">Corporate (Строгий, системний)</option>
            <option value="creative">Creative (Яскравий, округлий)</option>
          </select>
          <p className="hint">Це вплине на шрифти та форму кнопок.</p>
        </div>
        <button className="glass-btn" type="submit" disabled={loading}>
          {loading ? 'Створюємо ваш дизайн...' : 'Згенерувати'}
        </button>
      </form>
    </div>
  );
};

export default Generator;