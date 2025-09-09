const express = require('express');
const router = express.Router();
const { HTTP_STATUS, RESPONSE_CODES, ERROR_MESSAGES } = require('../constants');
const { pool } = require('../config/config');

// 获取所有标签
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM tags ORDER BY name ASC'
    );


    res.json({
      code: RESPONSE_CODES.SUCCESS,
      message: 'success',
      data: rows
    });
  } catch (error) {
    console.error('获取标签列表失败:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ code: RESPONSE_CODES.ERROR, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
});

// 获取热门标签
router.get('/hot', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    // 直接使用 use_count 字段获取热门标签
    const [rows] = await pool.execute(
      `SELECT * FROM tags
       WHERE use_count > 0
       ORDER BY use_count DESC, name ASC
       LIMIT ?`,
      [String(limit)]
    );


    res.json({
      code: RESPONSE_CODES.SUCCESS,
      message: 'success',
      data: rows
    });
  } catch (error) {
    console.error('获取热门标签失败:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ code: RESPONSE_CODES.ERROR, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
});

module.exports = router;