const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

router.post('/', async (req, res) => {
  const { userId, shape, dimensions } = req.body;

  let area;
  if (shape === 'circle') {
    area = 3.14 * Math.pow(dimensions.radius, 2);
  } else if (shape === 'rectangle') {
    area = dimensions.length * dimensions.width;
  } else if (shape === 'triangle') {
    area = 0.5 * dimensions.base * dimensions.height;
  } else if (shape === 'square') {
    area = Math.pow(dimensions.side, 2);
  }

  const result = await Result.create(userId, shape, dimensions, area);
  res.json(result);
});

module.exports = router;
