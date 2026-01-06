import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateHistoryForUser } from '../firebase';

// Lazy load Monaco для швидшого першого рендеру
const Monaco = React.lazy(() => import('@monaco-editor/react').then(module => {
  // Конфігуруємо loader після імпорту
  module.loader.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' }
  });
  return { default: module.default };
}));

const STORAGE_KEY = 'brandpaint_editor_v6';
const ORIGINAL_KEY = 'brandpaint_original_v6';
const HISTORY_ID_KEY = 'brandpaint_history_id'; 

const buildDoc = (html, css) => {
  const fixedHtml = (html || '').replace(
    /src="js\/jquery-3\.3\.1\.min\.js"/g,
    'src="https://code.jquery.com/jquery-3.7.1.min.js"'
  );
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>${css || ''}</style>
        <script>
          document.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
          }, true);
        </script>
      </head>
      <body>
        ${fixedHtml}
      </body>
    </html>
  `; 
};

const safeParse = (str) => {
  try { return str ? JSON.parse(str) : null; } 
  catch { return null; }
};

export default function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editorRef = useRef(null);
  const iframeRef = useRef(null);

  const [historyId, setHistoryId] = useState(
    location.state?.historyId || localStorage.getItem(HISTORY_ID_KEY)
  );

  const saved = useMemo(() => safeParse(localStorage.getItem(STORAGE_KEY)), []);
  const [htmlCode, setHtmlCode] = useState(saved?.html || '');
  const [cssCode, setCssCode] = useState(saved?.css || '');
  const [activeTab, setActiveTab] = useState(saved?.activeTab || 'html');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState('code'); // 'code' або 'preview'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (location.state?.template) {
      const { html = '', css = '' } = location.state.template;
      console.log('Saving new template as original:', { html: html.substring(0, 50), css: css.substring(0, 50) });
      localStorage.setItem(ORIGINAL_KEY, JSON.stringify({ html, css }));
      setHtmlCode(html);
      setCssCode(css);
      setActiveTab('html');

      if (location.state.historyId) {
        setHistoryId(location.state.historyId);
        localStorage.setItem(HISTORY_ID_KEY, location.state.historyId);
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const getOriginal = useCallback(() => {
    return safeParse(localStorage.getItem(ORIGINAL_KEY)) || { html: '', css: '' };
  }, []);

  const isDirty = useMemo(() => {
    const o = getOriginal();
    return (o.html || '') !== (htmlCode || '') || (o.css || '') !== (cssCode || '');
  }, [htmlCode, cssCode, getOriginal]);

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ html: htmlCode, css: cssCode, activeTab }));
    }, 700);
    return () => clearTimeout(t);
  }, [htmlCode, cssCode, activeTab]);

  useEffect(() => {
    if (!user || !historyId || !isDirty) return;
    const t = setTimeout(async () => {
      const payload = { template: { html: htmlCode, css: cssCode } };
      await updateHistoryForUser(user.uid, historyId, payload);
      localStorage.setItem(ORIGINAL_KEY, JSON.stringify({ html: htmlCode, css: cssCode }));
    }, 1500);
    return () => clearTimeout(t);
  }, [htmlCode, cssCode, isDirty, user, historyId]);

  const handleReset = () => {
    const original = getOriginal();
    console.log('Reset to original:', original);
    
    if (!original.html && !original.css) {
      console.warn('No original template found, using empty');
      setHtmlCode('');
      setCssCode('');
    } else {
      setHtmlCode(original.html || '');
      setCssCode(original.css || '');
    }
    
    setActiveTab('html');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      html: original.html || '', 
      css: original.css || '', 
      activeTab: 'html' 
    }));
  };

  const srcDoc = useMemo(() => buildDoc(htmlCode, cssCode), [htmlCode, cssCode]);

  // Key для iframe щоб форсувати повний перерендер при зміні контенту
  const iframeKey = useMemo(() => {
    return `iframe-${htmlCode.length}-${cssCode.length}`;
  }, [htmlCode, cssCode]);

  // Форсуємо перерендер iframe при зміні контенту
  useEffect(() => {
    if (iframeRef.current && srcDoc) {
      // Метод 1: Перезавантажуємо iframe
      const iframe = iframeRef.current;
      iframe.style.display = 'none';
      iframe.offsetHeight; // Trigger reflow
      iframe.style.display = 'block';
      
      // Метод 2: Додаємо невидимий символ для форсування оновлення
      setTimeout(() => {
        if (iframe.contentDocument) {
          iframe.contentDocument.body.style.transform = 'translateZ(0)';
        }
      }, 50);
    }
  }, [srcDoc]);

  const handleBack = () => navigate('/generator');

  const downloadFile = (content, fileName, type) => {
    const name = prompt(`Введіть назву файлу:`, fileName);
    if (!name) return;
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.${type.split('/')[1]}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Мобільна версія
  if (isMobile) {
    return (
      <div className="editor-page mobile">
        <div className="editor-topbar mobile">
          <button onClick={handleBack} className="back-link">← Назад</button>
          
          <div className="mobile-view-toggle">
            <button 
              onClick={() => setMobileView('code')} 
              className={`mobile-tab ${mobileView === 'code' ? 'active' : ''}`}
            >
              Код
            </button>
            <button 
              onClick={() => setMobileView('preview')} 
              className={`mobile-tab ${mobileView === 'preview' ? 'active' : ''}`}
            >
              Шаблон
            </button>
          </div>
        </div>

        {mobileView === 'code' && (
          <div className="mobile-code-section">
            <div className="mobile-code-controls">
              <button 
                onClick={() => setActiveTab('html')} 
                className={`editor-tab ${activeTab === 'html' ? 'active' : ''}`}
              >HTML</button>
              <button 
                onClick={() => setActiveTab('css')} 
                className={`editor-tab ${activeTab === 'css' ? 'active' : ''}`}
              >CSS</button>
              
              <button onClick={() => downloadFile(htmlCode, 'index', 'text/html')} className="btn-export">⬇ HTML</button>
              <button onClick={() => downloadFile(cssCode, 'style', 'text/css')} className="btn-export">⬇ CSS</button>
              <button onClick={handleReset} className="btn-reset">⟲</button>
            </div>
            
            <div className="mobile-editor-wrap">
              <Suspense fallback={<div style={{color: '#fff', padding: '20px'}}>Завантаження редактора...</div>}>
                <Monaco
                  height="100%"
                  theme="vs-dark"
                  language={activeTab}
                  value={activeTab === 'html' ? htmlCode : cssCode}
                  onChange={(v) => activeTab === 'html' ? setHtmlCode(v ?? '') : setCssCode(v ?? '')}
                  onMount={(editor) => { editorRef.current = editor; editor.layout(); }}
                  options={{ 
                    minimap: { enabled: false }, 
                    automaticLayout: true, 
                    wordWrap: 'on',
                    fontSize: 14,
                    scrollBeyondLastLine: false
                  }}
                />
              </Suspense>
            </div>
          </div>
        )}

        {mobileView === 'preview' && (
          <div className="mobile-preview-section">
            <iframe
              title="preview"
              srcDoc={srcDoc}
              className="mobile-preview-iframe"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
    );
  }

  // Десктопна версія
  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <button onClick={handleBack} className="back-link">← Назад</button>

        <div className="editor-controls">
          <button 
            onClick={() => setActiveTab('html')} 
            className={`editor-tab ${activeTab === 'html' ? 'active' : ''}`}
          >HTML</button>
          <button 
            onClick={() => setActiveTab('css')} 
            className={`editor-tab ${activeTab === 'css' ? 'active' : ''}`}
          >CSS</button>

          <div style={{ width: '15px' }} />

          <button 
            onClick={() => setPreviewMode('desktop')} 
            className={`mode-btn ${previewMode === 'desktop' ? 'active' : ''}`}
          > Desktop</button>
          <button 
            onClick={() => setPreviewMode('mobile')} 
            className={`mode-btn ${previewMode === 'mobile' ? 'active' : ''}`}
          > Mobile</button>

          <div style={{ width: '15px' }} />

          <button onClick={() => downloadFile(htmlCode, 'index', 'text/html')} className="btn-export">⬇ HTML</button>
          <button onClick={() => downloadFile(cssCode, 'style', 'text/css')} className="btn-export">⬇ CSS</button>
          <button onClick={handleReset} className="btn-reset">⟲ Reset</button>
        </div>
      </div>

      <div className={`editor-workspace ${previewFullscreen ? 'fullscreen' : ''}`}>
        {!previewFullscreen && (
          <div className="editor-wrap">
            <Suspense fallback={<div style={{color: '#fff', padding: '20px'}}>Завантаження редактора...</div>}>
              <Monaco
                height="100%"
                theme="vs-dark"
                language={activeTab}
                value={activeTab === 'html' ? htmlCode : cssCode}
                onChange={(v) => activeTab === 'html' ? setHtmlCode(v ?? '') : setCssCode(v ?? '')}
                onMount={(editor) => { editorRef.current = editor; editor.layout(); }}
                options={{ minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }}
              />
            </Suspense>
          </div>
        )}

        <div className="preview-wrap">
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title="preview"
            srcDoc={srcDoc}
            className={`preview-iframe ${previewMode} ${previewFullscreen ? 'fullscreen-mode' : ''}`}
            sandbox="allow-scripts"
            onLoad={() => {
              // Форсуємо видимість після завантаження
              if (iframeRef.current) {
                iframeRef.current.style.visibility = 'visible';
                iframeRef.current.style.opacity = '1';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}