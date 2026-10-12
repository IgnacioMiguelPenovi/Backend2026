const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', (req, res) => {
  req.session.usuario = {
    nombre: req.body.user || 'Invitado'
  };
  res.redirect('/index');
})

module.exports = router;