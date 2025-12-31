import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Monaco, { loader } from '@monaco-editor/react';

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' }
});

const STORAGE_KEY = 'brandpaint_editor_v6';
const ORIGINAL_KEY = 'brandpaint_original_v6';

const buildDoc = (html, css) => {
  const fixedHtml = (html || '').replace(
    /src="js\/jquery-3\.3\.1\.min\.js"/g,
    'src="https://code.jquery.com/jquery-3.7.1.min.js"'
  );
  return `<!doctype html><html><head><meta charset="UTF-8" /><style>${css || ''}</style></head><body>${fixedHtml}</body></html>`;
};

const safeParse = (str) => {
  try { return str ? JSON.parse(str) : null; } 
  catch { return null; }
};

export default function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const saveTimer = useRef(null);

  const [iframeKey, setIframeKey] = useState(0);
  const resizeDebounceRef = useRef(null);

  const saved = useMemo(() => safeParse(localStorage.getItem(STORAGE_KEY)), []);

  const [htmlCode, setHtmlCode] = useState(saved?.html || '');
  const [cssCode, setCssCode] = useState(saved?.css || '');
  const [activeTab, setActiveTab] = useState(saved?.activeTab || 'html');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  // 1. Обробка нового шаблону з генератора
  useEffect(() => {
    if (location.state?.template) {
      const { html = '', css = '' } = location.state.template;
      localStorage.setItem(ORIGINAL_KEY, JSON.stringify({ html, css }));
      setHtmlCode(html);
      setCssCode(css);
      setActiveTab('html');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // 2. Автозбереження
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ html: htmlCode, css: cssCode, activeTab }));
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [htmlCode, cssCode, activeTab]);

  // 3. Reset до оригіналу
  const handleReset = () => {
    const original = safeParse(localStorage.getItem(ORIGINAL_KEY));
    if (!original) { alert('Початковий шаблон не знайдено.'); return; }
    if (!confirm('Скинути всі правки до початкового стану?')) return;
    setHtmlCode(original.html);
    setCssCode(original.css);
    setActiveTab('html');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ html: original.html, css: original.css, activeTab: 'html' }));
  };

  // 4. Експорт
  const handleExport = (type) => {
    const isHtml = type === 'html';
    const content = isHtml ? htmlCode : cssCode;
    const extension = isHtml ? 'html' : 'css';
    const fileName = prompt(`Введіть назву файлу:`, isHtml ? 'index' : 'style');
    if (!fileName) return;
    const blob = new Blob([content], { type: isHtml ? 'text/html' : 'text/css' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName}.${extension}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const srcDoc = useMemo(() => buildDoc(htmlCode, cssCode), [htmlCode, cssCode]);

  // 5. Resize + layout Monaco + refresh iframe
  useEffect(() => {
    let raf = null;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const ed = editorRef.current;
        if (ed && typeof ed.layout === 'function') ed.layout();
        if (ed && typeof ed.focus === 'function') ed.focus();
      });

      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      resizeDebounceRef.current = setTimeout(() => {
        setIframeKey(k => k + 1);
      }, 220);
    };

    const onVisibility = () => {
      const ed = editorRef.current;
      if (ed && typeof ed.layout === 'function') ed.layout();
    };

    const onEsc = (e) => { if (e.key === 'Escape') setPreviewFullscreen(false); };

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('keydown', onEsc);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('keydown', onEsc);
      if (raf) cancelAnimationFrame(raf);
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
    };
  }, []);

  return (
    <div style={page}>

      <style>{`
        .minimap, .decorationsOverviewRuler { display: none !important; pointer-events: none !important; }
        .preview-iframe { transition: all 0.3s ease; }
      `}</style>

      <div style={topBar}>
        <Link to="/generator" style={link}>← Назад</Link>

        <div style={controls}>
          <button onClick={() => setActiveTab('html')} style={tab(activeTab === 'html')}>HTML</button>
          <button onClick={() => setActiveTab('css')} style={tab(activeTab === 'css')}>CSS</button>

          <div style={{ width: '15px' }} />

          <button onClick={() => setPreviewMode('desktop')} style={mode(previewMode === 'desktop')}>🖥 Desktop</button>
          <button onClick={() => setPreviewMode('mobile')} style={mode(previewMode === 'mobile')}>📱 Mobile</button>

          <div style={{ width: '15px' }} />

          <button onClick={() => handleExport('html')} style={exportBtn}>⬇ HTML</button>
          <button onClick={() => handleExport('css')} style={exportBtn}>⬇ CSS</button>

          <button onClick={handleReset} style={resetBtn}>⟲ Reset</button>

          {!previewFullscreen && (
            <button onClick={() => setPreviewFullscreen(true)} style={exportBtn}>⛶ Preview</button>
          )}
          {previewFullscreen && (
            <button onClick={() => setPreviewFullscreen(false)} style={exportBtn}>← Назад</button>
          )}
        </div>
      </div>

      <div style={{...workspace, flexDirection: previewFullscreen ? 'column' : 'row'}}>
        {!previewFullscreen && (
          <div style={editorWrap}>
            <Monaco
              height="100%"
              theme="vs-dark"
              language={activeTab}
              value={activeTab === 'html' ? htmlCode : cssCode}
              onChange={(v) => activeTab === 'html' ? setHtmlCode(v ?? '') : setCssCode(v ?? '')}
              onMount={(editor) => { editorRef.current = editor; editor.layout(); editor.focus(); }}
              options={{ minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }}
            />
          </div>
        )}

        <div style={previewWrap}>
          <iframe
            key={iframeKey}
            title="preview"
            srcDoc={srcDoc}
            className="preview-iframe"
            style={{
              ...iframe(previewMode),
              width: previewFullscreen ? '100%' : iframe(previewMode).width,
              height: previewFullscreen ? '100%' : iframe(previewMode).height,
              margin: previewFullscreen ? '0' : iframe(previewMode).margin,
              border: previewFullscreen ? 'none' : iframe(previewMode).border,
              borderRadius: previewFullscreen ? '0' : iframe(previewMode).borderRadius
            }}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
}

/* 🎨 СТИЛІ */
const page = { height: '100vh', background: '#1e1e1e', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const topBar = { marginTop: '64px', padding: '8px 20px', background: '#252526', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' };
const link = { color: '#aaa', textDecoration: 'none', fontSize: '13px' };
const controls = { display: 'flex', gap: '6px', alignItems: 'center' };
const workspace = { flex: 1, display: 'flex', overflow: 'hidden' };
const editorWrap = { flex: 1, borderRight: '1px solid #333', minWidth: '320px', display: 'flex', flexDirection: 'column' };
const previewWrap = { flex: 1, background: '#f0f0f0', overflow: 'auto', display: 'flex', justifyContent: 'center', minWidth: '320px' };
const tab = (active) => ({ padding: '5px 15px', background: active ? '#007acc' : '#3d3d3d', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '3px', fontSize: '12px' });
const mode = (active) => ({ padding: '5px 10px', background: active ? '#505050' : '#333', color: '#fff', border: '1px solid #444', cursor: 'pointer', borderRadius: '3px', fontSize: '12px' });
const exportBtn = { padding: '5px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' };
const resetBtn = { padding: '5px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' };
const iframe = (mode) => ({ display: 'block', width: mode === 'mobile' ? '375px' : '100%', height: mode === 'mobile' ? '667px' : '100%', margin: mode === 'mobile' ? '20px auto' : '0', border: mode === 'mobile' ? '10px solid #222' : 'none', borderRadius: mode === 'mobile' ? '25px' : '0', background: '#fff' });
