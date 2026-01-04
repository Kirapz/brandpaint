import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Monaco, { loader } from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { updateHistoryForUser } from '../firebase';

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' }
});

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
          // Скрипт для блокування переходів та дій всередині прев'ю
          document.addEventListener('click', function(e) {
            // Зупиняємо дію за замовчуванням (перехід за посиланням, сабміт форми)
            e.preventDefault();
            // Зупиняємо подальше розповсюдження події
            e.stopPropagation();
          }, true); // 'true' вмикає режим перехоплення (capture)
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

  const [historyId, setHistoryId] = useState(
    location.state?.historyId || localStorage.getItem(HISTORY_ID_KEY)
  );

  const saved = useMemo(() => safeParse(localStorage.getItem(STORAGE_KEY)), []);
  const [htmlCode, setHtmlCode] = useState(saved?.html || '');
  const [cssCode, setCssCode] = useState(saved?.css || '');
  const [activeTab, setActiveTab] = useState(saved?.activeTab || 'html');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  useEffect(() => {
    if (location.state?.template) {
      const { html = '', css = '' } = location.state.template;
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
    setHtmlCode(original.html);
    setCssCode(original.css);
    setActiveTab('html');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ html: original.html, css: original.css, activeTab: 'html' }));
  };

  const srcDoc = useMemo(() => buildDoc(htmlCode, cssCode), [htmlCode, cssCode]);

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
            <Monaco
              height="100%"srcDoc
              theme="vs-dark"
              language={activeTab}
              value={activeTab === 'html' ? htmlCode : cssCode}
              onChange={(v) => activeTab === 'html' ? setHtmlCode(v ?? '') : setCssCode(v ?? '')}
              onMount={(editor) => { editorRef.current = editor; editor.layout(); }}
              options={{ minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }}
            />
          </div>
        )}

        <div className="preview-wrap">
          <iframe
            title="preview"
            srcDoc={srcDoc}
            className={`preview-iframe ${previewMode} ${previewFullscreen ? 'fullscreen-mode' : ''}`}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
}