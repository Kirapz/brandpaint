const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// Отримати всі проекти користувача
router.get('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    
    const result = await pool.query(
      `SELECT p.*, u.name as user_name 
       FROM projects p 
       JOIN users u ON p.user_id = u.id 
       WHERE u.firebase_uid = $1 
       ORDER BY p.created_at DESC`,
      [uid]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get projects' 
    });
  }
});

// Створити новий проект
router.post('/', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, description, html_content, css_content, brand_name, keywords } = req.body;
    
    // Отримуємо ID користувача з БД
    const userResult = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [uid]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const userId = userResult.rows[0].id;
    
    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description, html_content, css_content, brand_name, keywords, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [userId, name, description, html_content, css_content, brand_name, JSON.stringify(keywords || [])]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create project' 
    });
  }
});

// Отримати конкретний проект
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = `
      SELECT p.*, u.name as user_name 
      FROM projects p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = $1
    `;
    
    // Якщо користувач авторизований, перевіряємо чи це його проект
    if (req.user) {
      query += ` AND (p.is_public = true OR u.firebase_uid = $2)`;
      const result = await pool.query(query, [id, req.user.uid]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Project not found or access denied' 
        });
      }
      
      return res.json({
        success: true,
        data: result.rows[0]
      });
    } else {
      // Неавторизований користувач може бачити тільки публічні проекти
      query += ` AND p.is_public = true`;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Project not found' 
        });
      }
      
      return res.json({
        success: true,
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get project' 
    });
  }
});

// Оновити проект
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { name, description, html_content, css_content, brand_name, keywords, is_public } = req.body;
    
    const result = await pool.query(
      `UPDATE projects p 
       SET name = $1, description = $2, html_content = $3, css_content = $4, 
           brand_name = $5, keywords = $6, is_public = $7, updated_at = NOW()
       FROM users u 
       WHERE p.id = $8 AND p.user_id = u.id AND u.firebase_uid = $9
       RETURNING p.*`,
      [name, description, html_content, css_content, brand_name, JSON.stringify(keywords || []), is_public, id, uid]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update project' 
    });
  }
});

// Видалити проект
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    
    const result = await pool.query(
      `DELETE FROM projects p 
       USING users u 
       WHERE p.id = $1 AND p.user_id = u.id AND u.firebase_uid = $2
       RETURNING p.id`,
      [id, uid]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete project' 
    });
  }
});

module.exports = router;