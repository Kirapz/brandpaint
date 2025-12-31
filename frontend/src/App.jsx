import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Editor from './pages/Editor';
import './styles/App.css'; // Головні стилі
import './styles/nav.css'; // Стилі для навбару

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-link">Головна</Link>
        <Link to="/generator" className="nav-link">Створити макет</Link>
        {/* Додамо посилання на нові сторінки пізніше */}
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;