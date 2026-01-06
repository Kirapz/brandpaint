const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    let result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [uid]
    );
    
    if (result.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO users (firebase_uid, email, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [uid, email, name]
      );
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user profile' 
    });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { name } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET name = $1, updated_at = NOW() WHERE firebase_uid = $2 RETURNING *',
      [name, uid]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update profile' 
    });
  }
});

module.exports = router;