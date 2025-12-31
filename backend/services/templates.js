// services/templates.js
async function searchTemplates(pool, category, embedding) {
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

module.exports = { searchTemplates };
