// services/templates.js
const { getEmbedding } = require('./embedding');

async function searchTemplates(pool, userText, limit = 5) {
  try {
    const embedding = await getEmbedding(userText);
    
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
