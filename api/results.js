const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

router.get('/:userId', async (req, res) => {
  try {
    const results = await Result.findByUserId(req.params.userId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
