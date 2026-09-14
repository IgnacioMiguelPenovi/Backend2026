const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/libros');
});

module.exports = router;
