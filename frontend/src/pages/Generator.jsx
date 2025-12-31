import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateLayout } from '../api/api';
import '../styles/Gentr.css';

const Generator = () => {
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState(''); // Нове поле для назви
  const [keywords, setKeywords] = useState('');
  const [preset, setPreset] = useState('minimal');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Тепер відправляємо і brandName, і preset
      const result = await generateLayout({ 
        brandName,
        description, 
        keywords: keywords.split(','),
        preset
      });

      if (result.success) {
        navigate('/editor?' + Date.now(), {
           state: { template: result.data }
        });       
      }
    } catch (error) {
      alert('Сталася помилка при генерації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <h2>Генератор BrandPaint</h2>
      <form onSubmit={handleGenerate} className="form-grid">
        
        {/* НОВЕ ПОЛЕ: Назва бренду */}
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