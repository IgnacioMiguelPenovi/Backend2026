const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/login')
  /*res.render('index'); */
});

router.get('/index', (req, res) => {
  res.render('index');
})

module.exports = router;
