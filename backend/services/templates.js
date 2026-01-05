// services/templates.js
const { getEmbedding } = require('./embedding');

async function searchTemplates(pool, userText, limit = 5) {
  try {
    // Отримуємо embedding для тексту користувача
    const embedding = await getEmbedding(userText);
    
    // Шукаємо найближчі шаблони за embedding
    const query = `
      SELECT *, (embedding <-> $1::vector) as similarity
      FROM templates
      ORDER BY embedding <-> $1::vector
      LIMIT $2
    `;
    
    const { rows } = await pool.query(query, [JSON.stringify(embedding), limit]);
    return rows;
  } catch (error) {
    console.error('Error in searchTemplates:', error);
    throw error;
  }
}

// Залишаємо стару функцію для зворотної сумісності
async function searchTemplatesByCategory(pool, category, embedding) {
  const q = `
    SELECT html_content, css_content
    FROM templates
    WHERE ($1::text IS NULL OR category = $1)
    ORDER BY embedding <-> $2
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [category, JSON.stringify(embedding)]);
  return rows[0];
}

module.exports = { searchTemplates, searchTemplatesByCategory };
