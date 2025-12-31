import React from 'react';
import { Link } from 'react-router-dom';
import LiquidEther from '../components/LiquidEther'; 

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-bg-wrapper">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      <div className="home-content">
        <h1>Вітаємо в BrandPaint</h1>
        <p>Інтелектуальний сервіс для створення дизайну вашого сайту.</p>
        
        <div className="home-cta">
          <Link to="/generator" className="glass-btn">
            Створити макет зараз
          </Link>
        </div>     
      </div>
    </div>
  );
};

export default Home;