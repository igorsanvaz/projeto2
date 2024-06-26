const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

router.get('/:userId', async (req, res) => {
  const results = await Result.findByUserId(req.params.userId);
  res.json(results);
});

module.exports = router;
