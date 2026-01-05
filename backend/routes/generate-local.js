// Локальна версія generate route з тестовими шаблонами
const express = require('express');
const router = express.Router();

// Тестові шаблони для локального тестування
const testTemplates = [
  {
    id: 1,
    name: 'Business Template',
    category: 'business',
    keywords: 'business, company, corporate, professional',
    html_content: `
      <!DOCTYPE html>
      <html lang="uk">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{BRAND_NAME}}</title>
      </head>
      <body>
          <div class="container">
              <header class="hero">
                  <h1>{{BRAND_NAME}}</h1>
                  <p class="hero-subtitle">{{DESCRIPTION}}</p>
                  <button class="cta-button">Почати співпрацю</button>
              </header>
              
              <section class="features">
                  <div class="feature">
                      <h3>Якісні послуги</h3>
                      <p>Ми надаємо найкращі послуги для вашого бізнесу.</p>
                  </div>
                  <div class="feature">
                      <h3>Досвідчена команда</h3>
                      <p>Наші професіонали допоможуть вам досягти успіху.</p>
                  </div>
                  <div class="feature">
                      <h3>Підтримка 24/7</h3>
                      <p>Цілодобова підтримка для вашого комфорту.</p>
                  </div>
              </section>
              
              <footer class="footer">
                  <p>&copy; 2024 {{BRAND_NAME}}. Всі права захищені.</p>
              </footer>
          </div>
      </body>
      </html>
    `,
    css_content: `
      * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
      }
      
      body {
          font-family: "Arial", sans-serif;
          line-height: 1.6;
          color: #333;
      }
      
      .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
      }
      
      .hero {
          text-align: center;
          padding: 100px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
      }
      
      .hero h1 {
          font-size: 3rem;
          margin-bottom: 20px;
          font-weight: bold;
      }
      
      .hero-subtitle {
          font-size: 1.2rem;
          margin-bottom: 30px;
          opacity: 0.9;
      }
      
      .cta-button {
          background: #ff6b6b;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 5px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.3s;
      }
      
      .cta-button:hover {
          background: #ff5252;
      }
      
      .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          padding: 80px 0;
      }
      
      .feature {
          text-align: center;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      }
      
      .feature h3 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #333;
      }
      
      .feature p {
          color: #666;
          line-height: 1.8;
      }
      
      .footer {
          background: #333;
          color: white;
          text-align: center;
          padding: 30px 0;
      }
      
      @media (max-width: 768px) {
          .hero h1 {
              font-size: 2rem;
          }
          
          .features {
              grid-template-columns: 1fr;
              gap: 20px;
              padding: 40px 0;
          }
      }
    `
  },
  {
    id: 2,
    name: 'Coffee Shop Template',
    category: 'restaurant',
    keywords: 'coffee, cafe, restaurant, food, cozy',
    html_content: `
      <!DOCTYPE html>
      <html lang="uk">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{BRAND_NAME}}</title>
      </head>
      <body>
          <div class="container">
              <header class="hero">
                  <h1>{{BRAND_NAME}}</h1>
                  <p class="hero-subtitle">{{DESCRIPTION}}</p>
                  <button class="cta-button">Замовити каву</button>
              </header>
              
              <section class="menu">
                  <h2>Наше меню</h2>
                  <div class="menu-items">
                      <div class="menu-item">
                          <h3>Еспресо</h3>
                          <p>Класичний італійський еспресо</p>
                          <span class="price">45 грн</span>
                      </div>
                      <div class="menu-item">
                          <h3>Капучино</h3>
                          <p>Ніжна кава з молочною піною</p>
                          <span class="price">65 грн</span>
                      </div>
                  </div>
              </section>
              
              <footer class="footer">
                  <p>&copy; 2024 {{BRAND_NAME}}. З любов'ю до кави.</p>
              </footer>
          </div>
      </body>
      </html>
    `,
    css_content: `
      * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
      }
      
      body {
          font-family: "Georgia", serif;
          line-height: 1.6;
          color: #3e2723;
          background: #f5f5dc;
      }
      
      .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
      }
      
      .hero {
          text-align: center;
          padding: 80px 0;
          background: linear-gradient(135deg, #8d6e63 0%, #5d4037 100%);
          color: white;
          border-radius: 10px;
          margin: 20px 0;
      }
      
      .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 15px;
          font-weight: bold;
      }
      
      .hero-subtitle {
          font-size: 1.1rem;
          margin-bottom: 25px;
          opacity: 0.9;
      }
      
      .cta-button {
          background: #ff8f00;
          color: white;
          padding: 12px 25px;
          border: none;
          border-radius: 25px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
      }
      
      .menu {
          padding: 60px 0;
          text-align: center;
      }
      
      .menu h2 {
          font-size: 2rem;
          margin-bottom: 40px;
          color: #5d4037;
      }
      
      .menu-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
      }
      
      .menu-item {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
          border-left: 4px solid #ff8f00;
      }
      
      .menu-item h3 {
          font-size: 1.3rem;
          margin-bottom: 10px;
          color: #5d4037;
      }
      
      .price {
          font-weight: bold;
          color: #ff8f00;
          font-size: 1.2rem;
      }
      
      .footer {
          background: #5d4037;
          color: white;
          text-align: center;
          padding: 25px 0;
          border-radius: 10px;
          margin: 20px 0;
      }
    `
  }
];

// Простий алгоритм вибору шаблону
function selectTemplate(userText, keywords) {
  const text = userText.toLowerCase();
  
  // Шукаємо по ключовим словам
  for (const template of testTemplates) {
    const templateKeywords = template.keywords.toLowerCase();
    
    // Перевіряємо чи є збіги в ключових словах
    for (const keyword of keywords) {
      if (keyword && templateKeywords.includes(keyword.toLowerCase())) {
        return template;
      }
    }
    
    // Перевіряємо чи є збіги в описі
    const words = text.split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && templateKeywords.includes(word)) {
        return template;
      }
    }
  }
  
  // Повертаємо перший шаблон за замовчуванням
  return testTemplates[0];
}

// Простий парсер кольорів
function extractColors(text) {
  const colors = {};
  
  const colorMap = {
    'червоний': '#e74c3c', 'red': '#e74c3c',
    'синій': '#3498db', 'blue': '#3498db',
    'зелений': '#27ae60', 'green': '#27ae60',
    'жовтий': '#f1c40f', 'yellow': '#f1c40f',
    'фіолетовий': '#9b59b6', 'purple': '#9b59b6',
    'помаранчевий': '#e67e22', 'orange': '#e67e22',
    'рожевий': '#e91e63', 'pink': '#e91e63',
    'коричневий': '#8d6e63', 'brown': '#8d6e63',
    'темний': '#2c3e50', 'dark': '#2c3e50',
    'світлий': '#ecf0f1', 'light': '#ecf0f1'
  };
  
  for (const [name, hex] of Object.entries(colorMap)) {
    if (text.toLowerCase().includes(name)) {
      colors.primary = hex;
      break;
    }
  }
  
  return colors;
}

// Застосування кольорів до CSS
function applyColors(css, colors) {
  if (!colors.primary) return css;
  
  // Замінюємо основні кольори
  return css
    .replace(/background: linear-gradient\([^)]+\);/g, `background: ${colors.primary};`)
    .replace(/#ff6b6b/g, colors.primary)
    .replace(/#ff8f00/g, colors.primary);
}

router.post('/', async (req, res) => {
  try {
    const { description = '', keywords = [], brandName = '', preset = 'default' } = req.body;
    const userText = `${description} ${keywords.join(' ')}`.trim();

    console.log('\n=== LOCAL GENERATE ===');
    console.log('User text:', userText);
    console.log('Brand name:', brandName);
    console.log('Keywords:', keywords);
    console.log('Preset:', preset);

    // Вибираємо шаблон
    const template = selectTemplate(userText, keywords);
    console.log('Selected template:', template.name);

    // Замінюємо плейсхолдери
    const finalBrandName = brandName?.trim() || 'My Brand';
    const html = template.html_content
      .replace(/{{BRAND_NAME}}/g, finalBrandName)
      .replace(/{{DESCRIPTION}}/g, description || 'Професійні послуги для вашого бізнесу');

    // Застосовуємо кольори
    const userColors = extractColors(userText);
    let css = template.css_content;
    
    if (userColors.primary) {
      css = applyColors(css, userColors);
      console.log('Applied color:', userColors.primary);
    }

    return res.json({ 
      success: true, 
      data: { html, css },
      message: 'Generated locally (test mode)'
    });

  } catch (e) {
    console.error('Error in local generate:', e);
    res.status(500).json({ 
      success: false, 
      error: 'Generation failed: ' + e.message
    });
  }
});

module.exports = router;